# Plan: Cierre, rediseño y deploy de la V1 (V2)
Fecha: 2026-10-19
Fuente: `spec-v2.md`
Dependencia de datos: Supabase (proyecto existente `qogrbthjkkfvxmmnlkmy`), Vercel (cuenta + variables de entorno), Dexie local (migración de esquema v1 → v2).

## Objetivo
Dejar la V1 **cerrada, rediseñada y en producción**: URL fija HTTPS en Vercel, marca "Rodeo" aplicada en toda la app, permisos por rol, alta del primer admin sin consola, sync con reintentos y avisos, Panel pulido y checklist E2E corrido. Sin funciones nuevas de negocio (inventario/sanidad quedan para la V3).

## Contexto del problema
Estado real del código revisado:

- **Marca:** `app/globals.css` usa la paleta neutral por defecto de shadcn; `app/layout.tsx` dice "Control de Ordeño y Venta"/"Ganadería"; el manifest usa el mismo nombre genérico. No hay logo propio.
- **Roles:** `middleware.ts` solo valida sesión, no rol. `/dashboard` es accesible para cualquier usuario autenticado y el link "Panel" se muestra siempre en `app/(app)/layout.tsx`.
- **Alta del primer admin:** `lib/auth/actions.ts` (`createUser`) exige que quien invita sea `admin`, pero no existe ningún flujo para crear el primero; hoy depende de la consola de Supabase (`docs/verificacion-manual-v1.md`).
- **Sync:** `lib/db/schema.ts` (`SyncQueueItem`) no guarda intentos ni error; `lib/db/sync.ts` reintenta cada 30 s sin backoff y no distingue fallos transitorios de permanentes. `SyncIndicator` solo muestra el total pendiente.
- **Panel:** `lib/supabase/queries.ts` hace las mismas dos consultas ("hoy") en `getTodaySummary`, `getMermaSeries` y `getShiftTotals`; quedan detalles de caption/leyenda anotados en el ledger de V1.
- **Deploy:** hoy se prueba con un túnel temporal de Cloudflare; no hay URL fija ni variables de entorno documentadas para producción.

## Spec de referencia
`spec-v2.md` (aprobado). Resumen: la V2 **cierra, rediseña y despliega** la V1. Actores: dueño (remoto) y capataz (campo). Éxito: el dueño confía en el Panel, el producto se ve profesional/mostrable, el capataz instala sin ayuda y no se pierden datos offline.

## Decisiones de diseño

| Decisión | Qué | Porqué |
|----------|-----|--------|
| **Marca** | Nombre **Rodeo**; paleta "agro moderno" (verde profundo primario + acento tierra + neutros cálidos), tipografía de títulos propia. | El usuario eligió Rodeo + agro moderno. Escala a V3 (todo el rodeo). |
| **Logo/iconos** | Logo en SVG (wordmark + marca) y PNGs 192/512/maskable/apple generados con un script (`sharp` como devDependency). | Reproducible y versionable; evita depender de un editor gráfico. |
| **Deploy** | Vercel con URL gratis `*.vercel.app`. Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SETUP_TOKEN`. | Next.js nativo, HTTPS fijo y gratis. El service role queda solo server-side. |
| **Roles** | Helper puro `canViewDashboard(role)` → `owner`/`admin` sí, `capataz` no. El layout oculta "Panel"; `/dashboard` redirige a `/cows` si no corresponde. | Cumple "Panel solo dueño" sin sumar un query de rol al middleware en cada request. |
| **Primer admin** | Ruta pública `/setup?token=...` protegida por `SETUP_TOKEN`; el server action valida el token, verifica que no exista ningún admin y crea el primero con el admin client. Se autodeshabilita al existir un admin. | Cumple "sin consola" con una ventana de exposición mínima. |
| **Sync** | Dexie v2: `syncQueue` suma `attempts`, `lastError`, `nextAttemptAt`. Backoff exponencial con techo; tras N intentos queda "fallido" visible con reintento manual. **Nunca** se borra un registro local antes de confirmar la subida. | Evita reintentos infinitos cada 30 s y hace visible el problema sin perder datos. |
| **Panel** | Una sola lectura de ordeños/despachos para el día y otra para la ventana de 30 días; derivar summary/series/shifts en memoria. | Elimina consultas duplicadas y unifica semántica de merma. |
| **Tests** | `node:test` para lógica pura: `canViewDashboard`, backoff, agregación del panel. | No hay runner configurado; se mantiene la regla de TDD del repo. |
| **Ramas** | Implementar en `feat/v2-cierre-rediseno-deploy` (desde `main` con el spec/plan ya mergeados). Integrar con `finishing-a-development-branch`. | Respeta la regla de branching del proyecto. |
| **PWA** | Mantener `start_url: /cows`, fallback `/offline`, iconos nuevos y `theme_color` de Rodeo. | No romper lo que ya funciona offline. |

## Tareas
> Progreso: ✅ #1 (fundación de marca Rodeo). Pendiente: #2–#9.

| # | Tarea | Archivos | Depende de | Verificación |
|---|-------|----------|------------|--------------|
| 1 | **Fundación de marca**: definir tokens (paleta clara/oscura, radios, tipografía de títulos), crear `logo.svg` + `logo-mark.svg`, generar iconos PNG, actualizar manifest y metadata (`Rodeo`, descripción, `theme_color`, `appleWebApp`). | `app/globals.css`, `app/layout.tsx`, `public/manifest.json`, `public/brand/*`, `public/icons/*`, `scripts/generate-icons.mjs`, `package.json` | — | `npm run build` ✅; `/manifest.json` e iconos 200; el nombre "Rodeo" aparece en la pestaña y al instalar. |
| 2 | **Rediseño del shell y auth**: aplicar la marca a layout/nav, `SyncIndicator`, login, register y `/offline`; pulir componentes compartidos (button, card, input, label, select, table, badge, toast) con foco visible y targets táctiles ≥44px. Sin cambios de flujo. | `app/(app)/layout.tsx`, `components/SyncIndicator.tsx`, `app/(auth)/*`, `app/offline/page.tsx`, `components/ui/*` | #1 | `npm run build` ✅; revisión visual en 360px y escritorio; contraste y foco correctos. |
| 3 | **Permisos por rol**: helper `getCurrentProfile()` (server) y `canViewDashboard()` puro; el layout oculta "Panel" a capataz; `/dashboard` redirige a `/cows` con aviso. Mantener `createUser` solo para `admin`. | `lib/auth/profile.ts`, `lib/auth/profile.test.ts`, `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx` | #2 | Tests ✅; login capataz no ve ni entra al Panel; dueño/admin sí. |
| 4 | **Onboarding `/setup`**: página + server action con token (`SETUP_TOKEN`), verificación de "sin admins", alta del primer admin y autodeshabilitado; middleware marca `/setup` como pública; documentar en README. | `app/setup/page.tsx`, `lib/auth/setup.ts`, `middleware.ts`, `README.md`, `.env.example` | #3 | Token inválido rechazado; primer uso crea admin y permite login; segundo uso deshabilitado. |
| 5 | **Rediseño de pantallas de dominio**: vacas (tabla/form), ordeño (planilla/fila), despacho (form/listado) y Panel (cards/charts/badge) con la marca, estados vacíos y colores de gráfico. | `app/(app)/cows/page.tsx`, `app/(app)/milking/page.tsx`, `app/(app)/dispatch/page.tsx`, `components/cows/*`, `components/milking/*`, `components/dispatch/*`, `components/dashboard/*` | #1, #2 | `npm run build` ✅; revisión visual móvil/escritorio; carga de un ordeño real en <2 min. |
| 6 | **Sync robusto**: migrar Dexie a v2 (`attempts`, `lastError`, `nextAttemptAt`), seleccionar tareas vencidas, backoff exponencial con techo, registrar error, reintento manual que resetea el backoff y contador pendientes/fallidos en `SyncIndicator`. | `lib/db/schema.ts`, `lib/db/index.ts`, `lib/db/sync.ts`, `lib/format/backoff.ts`, `lib/format/backoff.test.ts`, `components/SyncIndicator.tsx` | #2 | Tests ✅; simular fallo y verificar que no se borra nada local, que reintenta con espera y que el reintento manual funciona. |
| 7 | **Panel: consultas y pulido**: unificar lecturas de "hoy" y de la ventana de 30 días, derivar summary/shift totals, corregir caption/leyenda y semántica `over`. | `lib/supabase/queries.ts`, `lib/dashboard/merma.ts`, `lib/dashboard/merma.test.ts`, `components/dashboard/MermaChart.tsx`, `components/dashboard/SummaryCards.tsx` | #1 | Tests ✅; números del Panel coinciden con Supabase; caption alineado con el gráfico. |
| 8 | **Deploy a Vercel**: proyecto, variables de entorno, build de producción, URL fija, `/setup` real (crear admin y capataz) y smoke test de PWA. Actualizar README con URL y pasos. | `README.md`, `.env.example`, configuración de Vercel (fuera del repo) | #1–#7 | URL de producción 200 por HTTPS; instalar en el celular; abrir sin señal y navegar las 4 pestañas. |
| 9 | **Verificación final E2E**: correr `docs/verificacion-manual-v1.md` contra producción + aceptación V2 (roles, setup, sync, marca, deploy) y la suite completa. | `docs/verificacion-manual-v1.md`, `docs/plans/2026-10-19-v2-cierre-rediseno-deploy.md` | #8 | `npm run lint` + `npm run typecheck` + `npm test` + `npm run build` ✅; checklist sin pendientes bloqueantes. |

## Migración de datos
- **Dexie:** `version(2)` de la base `ganaderia` agrega los índices de `syncQueue` (`nextAttemptAt`). Los ítems existentes quedan con `attempts = 0` y `nextAttemptAt` indefinido (se consideran vencidos y se procesan normalmente). No se pierde la cola.
- **Supabase:** sin cambios de esquema. `profiles` ya tiene `role`; no se tocan policies.
- **PWA:** el nuevo `sw.js` cambia por revisión; los usuarios pueden necesitar una recarga online para tomar la marca nueva.

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Plan Hobby de Vercel no permite uso comercial | Media | Medio | Revisar ToS; si la finca es comercial, pasar a Pro o evaluar VPS. |
| `/setup` expuesto antes del primer admin | Baja | Alto | Token obligatorio + autodeshabilitado al existir un admin. |
| El gate por rol queda solo en el layout/página y se olvida otro entry point | Baja | Alto | Helper único + test; el Panel solo se renderiza desde `/dashboard`. |
| Migración Dexie con ítems viejos sin `nextAttemptAt` | Baja | Medio | Tratar `undefined` como vencido y testear la migración v1→v2. |
| Fuga del service role key al cliente | Baja | Alto | Solo se usa en server actions (`createAdminClient`); nunca con prefijo `NEXT_PUBLIC_`. |
| Rediseño rompe usabilidad en celular viejo | Media | Medio | Probar a 360px, contraste alto y targets ≥44px; verificar en dispositivo real. |
| Panel offline muestra datos viejos | Alta | Bajo | Es esperado: el Panel lee Supabase. Mostrar estado "sin conexión / datos de la última sync". |
| PWA con cache viejo tras el deploy | Media | Bajo | `sw.js` con `max-age=0`; pedir una recarga online tras actualizar. |

## Siguiente paso
Aprobá este plan (o pedí cambios) y después se implementa. Cuando la implementación termine, usá `/verificar-cambios` para probar los cambios.
