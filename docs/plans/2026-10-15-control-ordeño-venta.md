# Plan: Control de Ordeño y Venta (V1)
Fecha: 2026-10-15
Fuente: /home/jose/Documentos/proyectos/sistema_ganaderia/spec.md
Dependencia de datos: Supabase (PostgreSQL) — requiere proyecto Supabase creado y credenciales (URL, anon key, service role key).

## Objetivo
Implementar una PWA offline-first (Next.js + Tailwind + Dexie.js + Supabase) que permita al capataz registrar ordeños por vaca/turno sin conexión, al dueño o capataz registrar despachos de leche, y al dueño ver en remoto la conciliación automática (ordeño vs. despacho) con métricas de merma diaria. Incluye CRUD simple de vacas activas y autenticación básica con roles (dueño, capataz) gestionados por admin.

## Contexto del problema
- No hay código base en el repositorio (proyecto nuevo).
- La propuesta técnica previa define stack y arquitectura; este plan implementa solo el subconjunto del spec aprobado (excluye módulo sanitario, PDF, roles complejos, reportes avanzados).
- Debe funcionar en móviles Android/iOS en corrales sin señal; sync automática al recuperar conexión.
- El dueño necesita visibilidad inmediata de descuadres sin llamar al capataz.

## Spec de referencia
Ver `spec.md` en la raíz del proyecto. Resumen del alcance V1:
1. Planilla masiva ordeño offline (2 turnos, guardado local Dexie, validación 0–100 L/vaca, suma en re-ingreso).
2. Módulo despacho/tanque (litros totales salida finca).
3. Panel conciliación online (Σ ordeños – despachos = merma; gráficos serie temporal; badge "última sync").
4. CRUD vacas activas (nombre/código, activar/desactivar).
5. Auth simple: admin crea usuarios + roles (dueño, capataz).
6. Sync: Service Worker + cola Dexie (pending_sync) + batch upload automático al detectar online.

## Decisiones de diseño
| Decisión | Qué | Porqué |
|----------|-----|--------|
| **Framework** | Next.js 14 (App Router) + Tailwind CSS + **shadcn/ui** | PWA nativa, SSR para panel dueño, rendimiento móvil, ecosistema maduro; shadcn/ui da componentes accesibles, copiables y sin dependencia de librería externa. |
| **Calidad de código** | **Husky + lint-staged** (pre-commit: `npm run lint`, `npm run typecheck`) | Evita commits rotos; fuerza lint y typecheck antes de cada commit. |
| **BD Local** | Dexie.js (IndexedDB wrapper) | API relacional simple, transacciones, índices, hooks de cambio; offline-first real. |
| **BD Cloud** | Supabase (PostgreSQL) | Auth integrado, Realtime opcional, SQL estándar, generoso tier gratuito. |
| **Auth** | Supabase Auth (email/password + magic link) + tabla `profiles` con `role` | Admin crea usuarios desde panel; RLS en Supabase filtra por rol; simple y escalable. |
| **Sync** | Service Worker (Workbox) + tabla `sync_queue` en Dexie | Background Sync API + fallback polling; robusto aunque usuario cierre pestaña. |
| **Esquema offline** | Tablas Dexie: `cows`, `milkings`, `dispatches`, `sync_queue` | Espejo mínimo de lo que sube a Supabase; `synced_at` null = pendiente. |
| **Esquema cloud** | Tablas Supabase: `cows`, `milkings`, `dispatches`, `profiles` | RLS por `user_id` y `role`; `milkings` tiene `turno` (morning/afternoon) y `date`. |
| **Validación ordeño** | Cliente (Dexie) + Servidor (RLS/check constraints) | Bloqueo inmediato en UI (<0 o >100 L); defensa en profundidad en BD. |
| **Re-ingreso turno** | Upsert por `(cow_id, date, shift)` sumando litros | Evita duplicados y permite correcciones incrementales. |
| **UI Ordeño** | Lista virtualizada, input numérico grande, sticky header, botón fixed bottom | Optimizado para dedo guanteado, sol, una mano; <2 min / 40 vacas. |
| **Panel Dueño** | Server Components + Recharts (SSR) | Carga rápida, SEO irrelevante, datos frescos sin hydration pesada. |

## Tareas
> Progreso: ✅ #1 (Tailwind migrado a v4), ✅ #2, ✅ #3, ✅ #4, ✅ #5, ✅ #6. Pendientes: #7–#10.
| # | Tarea | Archivos | Depende de | Verificación |
|---|-------|----------|------------|--------------|
| 1 | Inicializar proyecto Next.js 14 + Tailwind + TypeScript + ESLint/Prettier; instalar y configurar **shadcn/ui** (`npx shadcn-ui@latest init` + componentes base: button, input, table, dialog, toast, select, card, badge); configurar **Husky + lint-staged** (pre-commit: `npm run lint && npm run typecheck`); configurar `next-pwa` (Workbox) para Service Worker offline. | `package.json`, `next.config.js`, `tailwind.config.ts`, `public/manifest.json`, `public/sw.js`, `.husky/pre-commit`, `components.json` | — | `npm run lint` ✅; `npm run typecheck` ✅; `npm run build` ✅; PWA instalable; `git commit` falla si hay errores de lint/typecheck; shadcn/ui components renderizan en Storybook o página de prueba. |
| 2 | Configurar Supabase: crear proyecto, habilitar Auth (email/password), crear tablas SQL (`cows`, `milkings`, `dispatches`, `profiles`) con RLS, índices y constraints; guardar credenciales en `.env.local`. | `supabase/schema.sql`, `.env.local`, `lib/supabase/client.ts`, `lib/supabase/server.ts` | #1 | `npm run lint` ✅; `psql` o Dashboard Supabase muestra tablas + RLS activas; `supabase.auth.getUser()` funciona en server component. |
| 3 | Implementar esquema Dexie (`db.ts`) con tablas: `cows`, `milkings`, `dispatches`, `sync_queue`; hooks `on('changes')` para marcar `pending_sync`. | `lib/db/index.ts`, `lib/db/schema.ts` | #1 | `npm run lint` ✅; abre DevTools Application > IndexedDB > tablas creadas; escribe/lee en consola funciona. |
| 4 | Auth UI: páginas `/login`, `/register` (solo admin), `/auth/callback`; middleware `middleware.ts` protege rutas según rol en `profiles.role`; redirección post-login a dashboard correspondiente. | `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `middleware.ts`, `lib/auth/actions.ts` | #2 | `npm run lint` ✅; login/logout funciona; admin crea usuario capataz y dueño; middleware bloquea rutas según rol. |
| 5 | CRUD Vacas (Capataz + Dueño): página `/cows` con tabla/listado, modal crear/editar (nombre, código único, activo), botón activar/desactivar; persistencia Dexie + sync queue. | `app/(app)/cows/page.tsx`, `components/cows/CowTable.tsx`, `components/cows/CowForm.tsx`, `lib/db/cows.ts` | #3, #4 | `npm run lint` ✅; crea/edita/desactiva vaca offline; al ir online aparece en Supabase; RLS impide ver vacas de otra finca. |
| 6 | Planilla Ordeño Offline (Capataz): página `/milking` con selector de turno (Mañana/Tarde) y fecha; lista virtualizada de vacas activas con input numérico grande; validación inline 0–100; botón "Guardar Ordeño" → upsert en Dexie `(cow_id, date, shift)` sumando litros; toast confirmación. | `app/(app)/milking/page.tsx`, `components/milking/MilkingSheet.tsx`, `components/milking/CowRow.tsx`, `lib/db/milkings.ts` | #3, #5 | `npm run lint` ✅; offline: guarda 40 vacas en <2s; re-ingreso suma litros; valor >100 bloquea guardado; DevTools IndexedDB muestra registros. |
| 7 | Módulo Despacho (Capataz + Dueño): página `/dispatch` con form fecha, turno (opcional), litros totales; guarda en Dexie `dispatches` + sync queue; validación >0. | `app/(app)/dispatch/page.tsx`, `components/dispatch/DispatchForm.tsx`, `lib/db/dispatches.ts` | #3, #4 | `npm run lint` ✅; guarda despacho offline; aparece en Supabase tras sync; RLS permite dueño y capataz. |
| 8 | Service Worker Sync: `public/sw.js` (Workbox) registra `sync` event; al detectar `online`, lee `sync_queue` de Dexie (via `clients.claim` + `postMessage`), hace batch `upsert` a Supabase (milkings, dispatches, cows), marca `synced_at`, limpia cola; fallback `setInterval` polling cada 30s si Background Sync no disponible. | `public/sw.js`, `lib/db/sync.ts`, `components/SyncProvider.tsx` | #3, #6, #7 | `npm run lint` ✅; simula offline (DevTools Network > Offline), crea ordeños/despachos, vuelve online → sync automático en <5s; panel dueño actualiza sin refresh. |
| 9 | Panel Dueño (Conciliación): página `/dashboard` (Server Component) con cards: total ordeñado hoy (M+T), total despachado hoy, merma % y L; gráfico línea merma últimos 30 días (Recharts); gráfico barras por turno; badge "Última sync: hace X" (lee `max(synced_at)` de milkings). | `app/(app)/dashboard/page.tsx`, `components/dashboard/SummaryCards.tsx`, `components/dashboard/MermaChart.tsx`, `components/dashboard/LastSyncBadge.tsx`, `lib/supabase/queries.ts` | #2, #8 | `npm run lint` ✅; datos coinciden con Supabase; merma calculada correctamente; badge muestra tiempo real; gráficos renderizan sin errores. |
| 10 | Pruebas de integración manuales end-to-end: (a) flujo capataz offline completo 3 días; (b) flujo dueño ve merma y última sync; (c) admin crea usuario capataz; (d) sync automática tras 4 días offline; (e) validaciones borde (litros inválidos, vaca duplicada, despacho sin ordeño). | — | #1–#9 | Checklist manual ✅; `npm run lint` ✅; `npm run build` ✅; sin errores en consola; métricas de éxito del spec cumplidas (merma <5%, 0 días sin registro). |

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Background Sync API no soportado en iOS Safari (solo SW registration) | Alta | Medio | Fallback polling `setInterval` 30s en `SyncProvider` + botón manual "Sincronizar ahora" en UI capataz. |
| Conflictos de upsert (mismo `(cow_id, date, shift)` editado offline en 2 dispositivos) | Baja | Alto | Clave compuesta única en Supabase; estrategia "last write wins" con `updated_at`; log de conflictos en `sync_queue`. |
| Dexie quota excedida en móviles antiguos (muchos meses offline) | Baja | Medio | Limpieza automática de `synced_at` > 90 días en `sync.ts`; aviso visual si quota > 80%. |
| RLS mal configurado filtra datos legítimos | Media | Alto | Tests de RLS en Supabase Dashboard antes de deploy; policy `USING (auth.uid() = user_id OR role = 'owner')`. |
| Capataz no adopta por UX lenta en móvil viejo | Media | Alto | Perfilado en dispositivo real (Moto G Power / iPhone 8); virtualización lista (`react-window`); input `type="number"` nativo. |

## Siguiente paso
**Aprobar este plan** (responde "Aprobar plan") para comenzar la implementación tarea a tarea. Cuando la implementación termine, usar `/verificar-cambios` para probar los flujos clave contra el spec.
