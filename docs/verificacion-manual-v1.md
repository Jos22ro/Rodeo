# Verificación manual V1 — Control de Ordeño y Venta

Checklist de la Tarea 10 del plan (`docs/plans/2026-10-15-control-ordeño-venta.md`).
Es E2E manual: necesita navegador/dispositivo y un usuario admin creado. No se puede automatizar.

## Prerrequisitos

1. Crear el primer admin en Supabase Dashboard → Authentication → Add user (email + password).
2. En Supabase SQL Editor: `update public.profiles set role = 'admin' where email = '<tu-email>';`
3. `npm run build && npm run start` (o `npm run dev` para iterar; el Service Worker/PWA solo se genera en build).
4. Abrir la app en `http://localhost:3000` (o el móvil por LAN con HTTPS para probar PWA).

## A. Admin crea usuario (spec: roles dueño/capataz)

- [ ] Al iniciar sesión, la app abre en `/cows`; llegar a `/milking` desde la barra de navegación, sin escribir la URL.
- [ ] Login como admin → ir a `/register`.
- [ ] Crear un usuario capataz (email + password + rol). Verificar que aparece en `public.profiles` con el rol correcto.
- [ ] Cerrar sesión, entrar con el usuario capataz. No debe poder crear usuarios.

## B. CRUD vacas (offline)

- [ ] `/cows` → "Nueva vaca": crear 40 vacas con códigos numéricos (`1`…`40`).
- [ ] Verificar el **orden numérico** (1, 2, …, 10, 11 — no 1, 10, 11, 2).
- [ ] Código duplicado → rechazo con aviso.
- [ ] Código/nombre solo con espacios → rechazo (queda vacío, no debe guardar).
- [ ] Desactivar una vaca → desaparece de la planilla de ordeño (`/milking`).
- [ ] DevTools → Application → IndexedDB → `ganaderia` → tabla `cows`: los registros están y `syncedAt = null` (si todavía no hubo sync).

## C. Planilla de ordeño offline (spec: <2 min / 40 vacas)

- [ ] DevTools → Network → Offline.
- [ ] `/milking`, turno **Mañana**, fecha de hoy: cargar litros en las 40 vacas (usar decimales con **coma**: `12,5`). Debe aceptar la coma (target es-AR).
- [ ] "Guardar Ordeño" en **<2 s**; toast de confirmación visible (y no tapado por la barra de guardado).
- [ ] Re-ingresar al mismo turno el mismo día y cargar más litros → **suman** al total (no sobrescriben).
- [ ] Cargar `>100` L en una vaca, o un total acumulado `>100` → error inline y botón deshabilitado.
- [ ] `-5` / `abc` / vacío → error inline.
- [ ] IndexedDB → tabla `milkings`: un registro por `(vaca, fecha, turno)`.

## D. Despacho (offline)

- [ ] `/dispatch`: fecha, turno (probar **Sin turno**), litros totales. Guardar offline → toast.
- [ ] Litros `0` / negativos / no numéricos → bloqueado.
- [ ] IndexedDB → tabla `dispatches`: el registro está.
- [ ] Cerrar del todo la PWA instalada, reabrirla **offline** y navegar a `/dispatch`: la pantalla carga y permite guardar un despacho.

## E. Sync automática (spec: al volver la señal)

- [ ] Seguir en Offline con datos cargados (B/C/D).
- [ ] Volver a **Online** → en **<5 s** los registros suben solos a Supabase (revisar tablas `cows`/`milkings`/`dispatches` en el Dashboard).
- [ ] Con la planilla de ordeño a medio cargar, pasar a Offline y volver a Online: la página **no** se recarga y no se pierde lo tipeado (la sync corre en segundo plano).
- [ ] `synced_at` queda seteado en las filas; la cola `syncQueue` en IndexedDB queda vacía.
- [ ] Editar una vaca offline y volver online: el cambio se refleja en Supabase (no se duplica).
- [ ] Dejar la pestaña abierta 30 s sin tocar nada: el polling no rompe nada (no hay errores en consola).
- [ ] **No** debe haber doble conteo: re-sincronizar la misma planilla no duplica filas ni suma litros de nuevo.

## F. Panel dueño (spec: conciliación y mermas)

- [ ] `/dashboard` con datos de hoy: cards "Total ordeñado hoy", "Total despachado hoy", "Merma" (L y %).
- [ ] Verificar la merma a mano: si ordeñó 100 y despachó 90 → 10 L · 10 %.
- [ ] Día con despacho y **sin** ordeño → merma 100 % en **rojo**.
- [ ] Día con despacho **>** ordeñado → se marca en **rojo** (fuga).
- [ ] Gráfico de línea: **diferencia** (ordeñado − despachado) de los últimos 30 días, con línea de referencia en 0 (los días sin datos aparecen en 0).
- [ ] Gráfico de barras por turno (Mañana/Tarde/**Sin turno**).
- [ ] Badge "Última sync": muestra "hace X" y se pone en alerta si pasó **>24 h**.
- [ ] **Zona horaria:** pasadas las **21:00** hora Argentina, el panel debe seguir mostrando el día de HOY (no mañana/vacío).

## G. Validaciones borde (spec: errores)

- [ ] Litros inválidos (`<0`, `>100`) → bloqueados con error inline.
- [ ] Vaca duplicada (mismo código) → aviso.
- [ ] Despacho sin ordeños ese día → se permite guardar; el panel muestra merma 100 % rojo.

## H. Flujos largos (spec: offline 3–4 días)

- [ ] (a) Simular 3 días de operación offline del capataz; al volver online, todo sincroniza.
- [ ] (d) Con `Date` adelantado o esperando, verificar que tras 4 días offline la sync automática sigue funcionando y no hay pérdida de datos.

## Pendientes conocidos al cerrar el loop (revisar en esta pasada)

- [ ] Bootstrap del admin (prerrequisito 1–2): hoy `/register` requiere un admin existente.

## Criterios de éxito (spec)

- [ ] Merma promedio diaria < 5 % tras 30 días de uso.
- [ ] Cero días sin registro de ordeño.
- [ ] Sin errores en consola en ningún paso.
