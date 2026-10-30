# Sistema de diseño v3 — portar el prototipo a la app

Fecha: 2026-10-28
Fuentes: `docs/design/DESIGN.md` (spec) y `docs/design/referencia/*.html` (prototipos navegables).
Estado: pendiente de ejecución.

## Regla de oro

El prototipo manda en **forma**: layout, jerarquía, estados, copy y proporciones. El código manda en **lógica**: Dexie, sync, auth, Supabase, RLS. No se reescribe lo que ya funciona; se porta la capa visual y se agregan las piezas que faltan.

Antes de cada tarea, abrir el prototipo correspondiente. No inventar layout.

- `docs/design/referencia/index.html` — sistema: tokens, paleta, tipografía, breakpoints, componentes con estados.
- `docs/design/referencia/flujos.html` — mapa de flujos y alcance. Referencia, no se implementa.
- `docs/design/referencia/login.html`, `setup.html`, `instalacion.html` — flujo de acceso real e interactivo.
- `docs/design/referencia/usuarios.html`, `permisos.html` — alta de usuarios y control de acceso (roles, rutas protegidas).
- `docs/design/referencia/vacas.html` — catálogo de vacas, alta/edición/baja y cola offline.
- `docs/design/referencia/milking.html` — planilla de ordeño a una columna, guardado local y turno.
- `docs/design/referencia/despacho.html` — registro de salida de leche y resumen del día.
- `docs/design/referencia/sincronizacion.html` — cola de subida, fallos y reintento.
- `docs/design/referencia/panel.html` — conciliación del dueño: cifras, tendencia, turnos y días.
- `docs/design/FLUJOS.md` — flujo por pantalla, con estados y query de demo.

## Estado de partida (verificado el 28 oct)

Ya existe y no se toca salvo lo indicado:

- Tokens en `app/globals.css` (`:root`, `.dark`, `@theme inline`): background, foreground, card, primary, primary-foreground, secondary, muted, muted-foreground, border, input, ring, clay, clay-soft, destructive, chart 1-5, sidebar.
- Primitivas en `components/ui/`: button, card, input, label, select, dialog, table, toast, badge.
- Dominio en `components/`: SyncIndicator, SyncProvider, CowRow, MilkingSheet, DispatchForm, CowTable, SummaryCards, MermaChart, LastSyncBadge, EmptyState, NavLink, LogoutButton, CowForm.
- Rutas: `/login`, `/setup`, `/register`, `/cows`, `/milking`, `/dispatch`, `/dashboard`, `/offline`.

Difiere o falta:

| # | Hallazgo | Archivo |
|---|---|---|
| 1 | No están definidos `--clay-ink` (#8F4A20) ni `--primary-deep` (#17392B) | `app/globals.css` |
| 2 | Gradiente decorativo en la cabecera de acceso | `app/(auth)/layout.tsx:12` |
| 3 | `/login` es una Card de 384 px centrada; el prototipo pide split con panel de marca desde 1024 | `app/(auth)/login/page.tsx` |
| 4 | Copy con voseo: "Completá", "Revisá", "Intentá" | `app/(auth)/setup/page.tsx:26-29` |
| 5 | `lang="es-AR"` | `app/layout.tsx` |
| 6 | No existe pantalla de instalación PWA | `app/install` (nueva) |
| 7 | No existe aviso global de sin conexión; solo la ruta `/offline` | `components/system` (nuevo) |
| 8 | No existen `RoleGate` ni `InstallPrompt` | `components/system` (nuevo) |
| 9 | Botón con radio de 12 px; la spec pide 8 px | `components/ui/button.tsx` |
| 10 | El header vive inline en el layout, no es reutilizable | `app/(app)/layout.tsx` |

Excepción documentada: `#2C6B4E` (`brand.colors.primaryLight`) es color del SVG del logo, no token de UI, y `lib/brand/brand.test.ts` lo verifica. No cambiar.

## Reglas duras

1. Cero hex sueltos en componentes: `var(--token)` o utilidad Tailwind.
2. `--accent` de shadcn es una superficie neutra, **no** el acento de marca. Acento de marca = `--primary` (verde). Segundo acento = `--clay`. Nunca `bg-accent` para un CTA.
3. Arcilla pura solo en texto ≥24 px o ≥18.66 px negrita. Badges y etiquetas usan `--clay-ink`.
4. Ordeño siempre a una columna; input de litros de 64 px de alto.
5. Targets ≥44 px en móvil. `Button` ya trae `h-11`; conservarlo.
6. Sin gradientes decorativos, sin glow, sin emoji.
7. Copy es-VE con tuteo: "prueba", "toca", "ingresa".
8. La merma nunca se comunica solo por color: signo + texto + color.

## Tareas

### 1. Tokens y tipografía base

- [ ] `app/globals.css`: agregar en `:root`
  ```css
  --clay-ink: #8f4a20;
  --primary-deep: #17392b;
  ```
  y en `@theme inline`
  ```css
  --color-clay-ink: var(--clay-ink);
  --color-primary-deep: var(--primary-deep);
  ```
- [ ] `app/globals.css`: `.dark` recibe los equivalentes (`--clay-ink: #e8b394`, `--primary-deep: #7fd0a6`) para que el tema no rompa cuando se active.
- [ ] `app/layout.tsx`: `lang="es-VE"`.
- [ ] `components/ui/button.tsx`: radio 8 px (`rounded-sm`, que mapea a `--radius-sm`) en todas las tallas. `size="lg"` a 48 px de alto.

### 2. Componentes de sistema

- [ ] `components/system/OfflineBanner.tsx`: cliente, escucha `online`/`offline`, una línea, `aria-live="polite"`. Estados: sin conexión (arcilla suave), sincronizando (verde), pendientes. Montar en `app/(app)/layout.tsx` y en `app/(auth)/layout.tsx`.
- [ ] `components/system/InstallPrompt.tsx`: captura `beforeinstallprompt`, botón "Instalar", hoja inferior en móvil, descarte persistido (`localStorage` con try/catch), instrucciones manuales para iOS.
- [ ] `components/system/RoleGate.tsx`: recibe el rol, usa `canViewDashboard`; renderiza el estado "Sin permiso" del prototipo.
- [ ] `components/nav/AppHeader.tsx`: extraer el header de `app/(app)/layout.tsx` sin cambiar comportamiento. Dos filas por debajo de 640 con tabs en scroll horizontal, sync solo icono por debajo de 768.

### 3. Flujo de acceso

- [ ] `components/auth/AuthSplit.tsx` + `app/(auth)/layout.tsx`: quitar el gradiente. Grid `1.06fr / minmax(430px, .94fr)` desde 1024; una columna debajo. Logo plano en verde. Panel de marca con la planilla de muestra (Vaca 042, 051, 063; total 56,0 L; "3 registros esperan señal").
- [ ] `app/(auth)/login/page.tsx`: card de 420 px, campos de 44 px, toggle de contraseña, error inline con `role="alert"` y `aria-describedby`, estado `?error=1`.
- [ ] `app/(auth)/setup/page.tsx`: token obligatorio validado con `canSetupAdmin`, checklist de 3 pasos y estados link inválido / admin ya existe / completo. Pasar el copy a tuteo.
- [ ] `app/install/page.tsx` (nueva): detección iOS / Android / escritorio, pasos por plataforma, estado instalada vía `display-mode: standalone`, botón "Ahora no".
- [ ] `/register` (Usuarios) queda fuera de v3; solo se alinea el copy.

### 4. Pantallas de producto

- [ ] Ordeño: barra de guardado fija al fondo con `env(safe-area-inset-bottom)`, badge "Ya: X L", total pendiente y validación 0-100 que bloquea el CTA con error inline.
- [ ] Panel: tres tarjetas de resumen, merma en arcilla con signo y porcentaje, cifras tabulares, totales en `aria-live`.
- [ ] Vacas: lista por debajo de 768, tabla desde 768, diálogo de alta/edición con foco atrapado.
- [ ] Despacho: dos columnas desde 640 con resumen del día y aviso de merma 100 %.

### 5. Verificación

- [ ] `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] 360 / 390 / 768 / 1024 / 1440 sin scroll horizontal.
- [ ] Foco visible de 3 px, targets ≥44 px, contraste AA en todo par nuevo.
- [ ] Prueba offline real en DevTools: banner, guardado local, sincronización al volver.
- [ ] `graphify update .`

## Mapa prototipo → código

| Prototipo | Destino |
|---|---|
| `referencia/index.html` | `app/globals.css` + `components/ui` (tokens, primitivas, breakpoints) |
| `referencia/flujos.html` | alcance y mapa de flujos (no se implementa) |
| `referencia/login.html` | `app/(auth)/login/page.tsx` + `components/auth/AuthSplit.tsx` |
| `referencia/setup.html` | `app/(auth)/setup/page.tsx` + `components/auth/AuthSplit.tsx` |
| `referencia/instalacion.html` | `app/install/page.tsx` + `components/system/InstallPrompt.tsx` |
| `referencia/usuarios.html` | `app/(app)/usuarios/page.tsx` + `components/users/*` |
| `referencia/permisos.html` | `components/system/RoleGate.tsx` + guardas de ruta por rol |
| `referencia/vacas.html` | `app/(app)/vacas/page.tsx` + `components/cows/*` |
| `referencia/milking.html` | `app/(app)/milking/page.tsx` + `components/milking/*` |
| `referencia/despacho.html` | `app/(app)/dispatch/page.tsx` + `components/dispatch/DispatchForm.tsx` |
| `referencia/sincronizacion.html` | `components/SyncIndicator.tsx` + `components/SyncProvider.tsx` + `components/system/OfflineBanner.tsx` |
| `referencia/panel.html` | `app/(app)/dashboard/page.tsx` + `components/dashboard/*` |
| `design/DESIGN.md` | fuente de tokens, breakpoints y matriz de componentes |
| `design/FLUJOS.md` | flujo por pantalla: entradas, pasos, estados y destino en el código |

## Criterios de aceptación

- `grep -rE "#[0-9a-fA-F]{6}" app components` devuelve solo `app/globals.css`.
- Cero `bg-gradient` decorativos y cero emoji en JSX.
- Cero `probá|tocá|ingresá|completá|revisá` en el copy.
- `lang="es-VE"` en el layout raíz.
- Build, lint, typecheck y test en verde sobre la rama.

## Prompt para el agente

```
Lee docs/design/DESIGN.md y los prototipos de docs/design/referencia/
(index.html, login.html, setup.html, instalacion.html).

Ejecuta docs/plans/2026-10-28-sistema-diseno-v3.md tarea por tarea, en orden,
en una rama feat/sistema-diseno-v3.

El prototipo manda en forma; el código manda en lógica. No reescribas Dexie,
sync ni auth: porta la capa visual y agrega solo las piezas que faltan.

Antes de cada tarea abre el prototipo correspondiente y respeta sus medidas.
Aplica las 8 reglas duras del plan. Al terminar corre
npm run lint && npm run typecheck && npm test && npm run build
y muestra la salida real, no un resumen.
```
