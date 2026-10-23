# Verificación manual — Rodeo (V1 + cierre V2)

Checklist de aceptación del plan V2 (`docs/plans/2026-10-19-v2-cierre-rediseno-deploy.md`).
Es E2E manual: necesita navegador/dispositivo. Se puede correr contra producción (URL de Vercel)
o contra el build local (`npm run build && npm run start`, el Service Worker solo existe en build).

## Prerrequisitos

1. `npm install` y variables en `.env.local` (o las mismas en Vercel):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `SETUP_TOKEN`.
2. Aplicar `supabase/schema.sql` (solo en una base nueva).
3. Primer admin **desde la app**: abrir `/setup?token=<SETUP_TOKEN>` y crear la cuenta. El link se
   autodeshabilita cuando ya existe un admin (si la base ya tiene uno, se saltea este paso).
4. Abrir la app (producción por HTTPS o `http://localhost:3000`).

## A. Marca y shell (V2)

- [ ] La pestaña, el header y la PWA muestran **Rodeo** (nombre, logo y paleta verde/tierra).
- [ ] `/login`, `/register`, `/offline` y las 4 pantallas usan la misma marca y tipografía.
- [ ] `/manifest.json` responde 200 con `name`/`short_name` "Rodeo" y `theme_color` de la marca.
- [ ] Los iconos 192/512 y el maskable responden 200.
- [ ] En 360 px no hay overflow horizontal y los controles se tocan cómodos (≥44 px).

## B. Roles y onboarding (V2)

- [ ] `/setup?token=invalido` → "Este link no es válido."
- [ ] `/setup?token=<correcto>` con un admin ya creado → "Configuración completa".
- [ ] Login con admin: ve **Panel** y puede crear usuarios en `/register`.
- [ ] Login con capataz: no ve **Panel**; si entra a `/dashboard` se redirige a `/cows` con aviso
      "El panel es solo para el dueño."
- [ ] El capataz no puede crear usuarios (aunque intente `/register`).
- [ ] Cerrar sesión y volver a entrar mantiene el rol correcto.

## C. CRUD vacas (offline)

- [ ] `/cows` → "Nueva vaca": crear 40 vacas con códigos numéricos (`1`…`40`).
- [ ] Verificar el **orden numérico** (1, 2, …, 10, 11 — no 1, 10, 11, 2).
- [ ] Código duplicado → rechazo con aviso.
- [ ] Código/nombre solo con espacios → rechazo (queda vacío, no debe guardar).
- [ ] Desactivar una vaca → desaparece de la planilla de ordeño (`/milking`).
- [ ] Sin vacas: se ve el estado vacío "Todavía no hay vacas", no una tabla rota.
- [ ] IndexedDB → `ganaderia` → `cows`: los registros están y `syncedAt = null` antes del sync.

## D. Planilla de ordeño offline (spec: <2 min / 40 vacas)

- [ ] DevTools → Network → Offline.
- [ ] `/milking`, turno **Mañana**, fecha de hoy: cargar litros en las 40 vacas (decimales con
      **coma**: `12,5`).
- [ ] La barra fija muestra cuántas vacas y los litros pendientes.
- [ ] "Guardar ordeño" en **<2 s**; toast visible (no tapado por la barra).
- [ ] Re-ingresar el mismo turno el mismo día y cargar más litros → **suman** (no sobrescriben).
- [ ] `>100` L en una vaca o acumulado → error inline y botón deshabilitado.
- [ ] `-5` / `abc` / vacío → error inline.
- [ ] Sin vacas activas → estado vacío "No hay vacas activas".
- [ ] IndexedDB → `milkings`: un registro por `(vaca, fecha, turno)`.

## E. Despacho (offline)

- [ ] `/dispatch`: fecha, turno (probar **Sin turno**), litros totales. Guardar offline → toast.
- [ ] Litros `0` / negativos / no numéricos → bloqueado.
- [ ] La fecha sin registros muestra el estado vacío "Sin despachos".
- [ ] Cerrar del todo la PWA instalada, reabrirla **offline** y navegar a `/dispatch`: la pantalla
      carga y permite guardar un despacho.

## F. Sync automática y robusta (V2)

- [ ] Offline con datos cargados: el header muestra "N pendientes" (móvil: punto clay).
- [ ] Volver a **Online** → los registros suben solos; la cola queda vacía y `synced_at` seteado.
- [ ] Con la planilla a medio cargar, pasar Offline/Online: la página no se recarga ni pierde lo
      tipeado (la sync corre en segundo plano).
- [ ] Editar una vaca offline y volver online: el cambio llega a Supabase sin duplicar.
- [ ] Simular una subida fallida (ej. bloquear `rest/v1` en DevTools): el registro **no se borra
      local**, queda "1 pendiente" y se reintenta con espera.
- [ ] Tras agotar los reintentos, el header muestra "N fallidos", el botón dice **Reintentar** y
      aparece el contador rojo. Al liberar la red y tocar **Reintentar**, sube y la cola queda vacía.
- [ ] 30 s sin tocar nada: el polling no rompe nada ni duplica filas.

## G. Panel dueño (V2)

- [ ] `/dashboard` con datos de hoy: cards "Ordeñado hoy", "Despachado hoy", "Merma hoy" (L y %).
- [ ] Los números coinciden con Supabase (misma fecha y turnos).
- [ ] Merma a mano: ordeñó 100 y despachó 90 → 10 L · 10 %, caption "Leche sin despachar".
- [ ] Día con despacho y **sin** ordeño → 100 % en **rojo**.
- [ ] Día con despacho **>** ordeñado → **rojo** y caption "Salida mayor al ordeñe".
- [ ] Línea de los últimos 30 días: diferencia (ordeñado − despachado) con referencia en 0; el
      caption aclara que debajo de cero se despachó más de lo ordeñado.
- [ ] Barras por turno (Mañana/Tarde/**Sin turno**) con leyenda "Ordeñado (L)"/"Despachado (L)".
- [ ] Badge "Última sync": "hace X"; en clay si pasó **>24 h**.
- [ ] Zona horaria: pasadas las **21:00** hora Argentina, el panel sigue mostrando el día de HOY.
- [ ] Sin conexión, el panel muestra los datos de la última lectura o el error controlado, sin
      romper la navegación.

## H. Validaciones borde

- [ ] Litros inválidos (`<0`, `>100`, texto) → bloqueados con error inline.
- [ ] Vaca duplicada (mismo código) → aviso.
- [ ] Despacho sin ordeños ese día → se permite guardar; el panel muestra merma 100 % rojo.

## I. Deploy y PWA (V2)

- [ ] La URL de producción responde **200 por HTTPS** y las variables están cargadas en Vercel.
- [ ] Las 4 pestañas navegan en producción y el login funciona.
- [ ] La PWA es instalable desde el celular (manifest + iconos + HTTPS).
- [ ] Abrir sin señal: las pantallas ya visitadas cargan y se pueden guardar ordeños/despachos.
- [ ] Al volver la señal, lo cargado offline sincroniza.
- [ ] `/setup` en producción exige token y está deshabilitado si ya existe un admin.

## Criterios de éxito (spec)

- [ ] Merma promedio diaria < 5 % tras 30 días de uso.
- [ ] Cero días sin registro de ordeño.
- [ ] Sin errores en consola en ningún paso.
