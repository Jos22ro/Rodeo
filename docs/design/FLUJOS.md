# Rodeo — flujos de pantalla

Mapa de navegación por pantalla, con entradas, pasos, estados y destino en el código.
Los prototipos viven en `docs/design/referencia/` y el sistema visual en
`docs/design/DESIGN.md`.

**Qué manda cada fuente.** El prototipo manda en forma: layout, jerarquía, medidas,
copy. El código manda en lógica: Dexie, sync, auth, sesión. Si el prototipo y el
código se contradicen en comportamiento, se abre una nota aquí antes de tocar
nada.

## Reglas que cruzan todas las pantallas

- Una decisión por pantalla: un solo CTA primario.
- Targets ≥44 px; en ordeño el input mide 64 px de alto.
- Ordeño nunca se parte en dos columnas, en ningún breakpoint.
- La arcilla (`--clay`) se reserva a merma, sobre-despacho, pendientes y error.
  En texto menor a 24 px se usa `--clay-ink`.
- Offline no es error: se muestra como pendiente, con banner de una línea.
- Copy es-VE con tuteo. Cero voseo, cero emoji, cero gradientes fuera del logo.
- Nav de producto: Vacas, Ordeño, Despacho, Panel (+ Usuarios para admin).
  Debajo de 640 ocupa una segunda fila con scroll horizontal, nunca hamburguesa.

## Resumen

| # | Flujo | Pantalla(s) | Ruta | Rol |
|---|---|---|---|---|
| 01 | Instalación, primer admin y login | `instalacion.html`, `setup.html`, `login.html` | `/install`, `/setup`, `/login` | Todos |
| 02 | Alta de usuarios y control de acceso | `usuarios.html`, `permisos.html` | `/usuarios` + guards | Admin, dueño (lectura) |
| 03 | Vacas: alta, edición y baja lógica | `vacas.html` | `/cows` | Capataz, admin |
| 04 | Ordeño offline | `milking.html` | `/milking` | Capataz, admin |
| 05 | Despacho | `despacho.html` | `/dispatch` | Capataz, dueño, admin |
| 06 | Sincronización | `sincronizacion.html` | header global + `/offline` | Sistema |
| 07 | Panel del dueño | `panel.html` | `/dashboard` | Dueño, admin |

`sincronizacion.html` no tiene ruta propia: es la cola que abres desde el
indicador del header. `/offline` sigue siendo el fallback de navegación del
service worker.

## 01 · Instalación, primer admin y login

**Entrada.** El dueño abre la URL fija por HTTPS; el capataz abre la misma URL
en su celular.

**Pasos.** `instalacion.html` detecta plataforma y ofrece instalar (o los pasos
manuales en iOS y Firefox) → `setup.html?token=<SETUP_TOKEN>` crea el primer
administrador → `login.html` inicia sesión y el rol define el menú.

**Estados.**

| Estado | Cómo verlo |
|---|---|
| Instalada / `display-mode: standalone` | `instalacion.html?instalada=1` |
| Token inválido | `setup.html?token=mal` |
| Ya existe un admin | `setup.html?estado=existe` |
| Credenciales incorrectas | `login.html?error=1` |
| Sin conexión (bloquea instalar, crear admin y entrar) | `?offline=1` en las tres |

**Datos.** El setup exige token y contraseña de 6 caracteres o más. El rol
`admin` no se asigna desde la UI: solo nace en `/setup`.

**Código.** `app/(auth)/login/page.tsx`, `app/(auth)/setup/page.tsx`,
`app/install/page.tsx`, `components/auth/AuthSplit.tsx`,
`components/system/InstallPrompt.tsx`.

## 02 · Alta de usuarios y control de acceso

**Entrada.** El administrador abre Usuarios desde el nav. El dueño entra en
modo lectura; el capataz no ve el destino.

**Pasos.** `usuarios.html` lista y busca cuentas, crea una con rol capataz o
dueño, muestra las credenciales una sola vez, permite editar y desactivar con
confirmación. `permisos.html` explica los tres roles, la matriz de capacidades y
las rutas protegidas.

**Estados.**

| Estado | Cómo verlo |
|---|---|
| Sin permiso (gate de capataz) | `usuarios.html?sinpermiso=1`, `permisos.html?rol=capataz` |
| Solo lectura (dueño) | `usuarios.html?rol=owner` |
| Sin conexión | `?offline=1` |
| Email duplicado / campos vacíos | alta con datos repetidos o en blanco |

**Guardas.** No puedes desactivar tu propia cuenta. No se reenvía acceso a una
cuenta desactivada. El rol de un `admin` no se cambia desde la UI.

**Código.** `app/(app)/usuarios/page.tsx`, `components/users/*`,
`components/system/RoleGate.tsx`, `lib/auth/roles.ts`.

## 03 · Vacas: alta, edición y baja lógica

**Entrada.** Nav → Vacas. El catálogo alimenta la planilla de ordeño.

**Pasos.** Lista en móvil y tabla desde 768 px, con orden numérico real
(9 → 10 → 11). Alta con código único y nombre; edición en hoja; baja lógica con
confirmación y aviso de que el historial se conserva. Desactivar saca a la vaca
de `/milking` sin borrar registros.

**Estados.**

| Estado | Cómo verlo |
|---|---|
| Alta/edición/código duplicado/campos en blanco | flujo normal en la hoja |
| Sin conexión: alta, edición y baja quedan pendientes | `vacas.html?offline=1` |
| Catálogo vacío | `vacas.html?vacio=1` |
| Limpiar la demo | `vacas.html?reset=1` |

**Código.** `app/(app)/cows/page.tsx`, `components/cows/*`, `CowForm`.

## 04 · Ordeño offline

**Entrada.** Nav → Ordeño. Es el flujo central: de pie, con sol y sin señal.

**Pasos.** Elige turno (mañana/tarde) y fecha → ve solo vacas activas con el
badge “Ya: X L” cuando hay litros guardados → teclea litros por vaca con coma
decimal → la barra fija cuenta vacas y litros pendientes → “Guardar ordeño”
escribe local, muestra toast y deja el registro en la cola.

**Estados.**

| Estado | Cómo verlo |
|---|---|
| Guardar sin señal | `milking.html?offline=1` |
| Sin vacas activas | `milking.html?vacio=1` |
| Valor inválido (<0, >100 L, texto o vacío) | error inline, CTA deshabilitado |
| Mismo turno del día | los litros se suman: un registro por vaca, fecha y turno |
| Limpiar la demo | `milking.html?reset=1` |

**Datos.** Prototipo: `localStorage` `rodeo.milking.v1`. Producto: IndexedDB.
Fecha y turno por query (`?fecha=`, `?turno=tarde`).

**Código.** `app/(app)/milking/page.tsx`, `components/milking/MilkingSheet.tsx`,
`components/milking/CowRow.tsx`.

## 05 · Despacho

**Entrada.** Nav → Despacho. Lo carga el capataz o el dueño; es la otra mitad de
la resta.

**Pasos.** Formulario con fecha, litros totales y turno opcional (Mañana, Tarde o
“Sin turno”) → guardar online u offline → toast y resumen del día con el listado
de despachos.

**Estados.**

| Estado | Cómo verlo |
|---|---|
| Despachar sin señal | `despacho.html?offline=1` |
| Despacho sin ordeño ese día | `despacho.html?sinorden=1` |
| Sin despachos en la fecha | `despacho.html?vacio=1` |
| Litros 0, negativos o texto | bloqueado con error inline |
| Limpiar la demo | `despacho.html?reset=1` |

Guardar sin ordeños está permitido: el panel lo mostrará como merma del 100 %.

**Código.** `app/(app)/dispatch/page.tsx`, `components/dispatch/DispatchForm.tsx`.

## 06 · Sincronización

**Entrada.** Indicador de sync en el header (“N pendientes”, “Subiendo”,
“N fallidos”), que abre la cola.

**Pasos.** Revisar qué falta por subir con su origen (ordeño, despacho, vaca),
reintentar un fallo y ver el vaciado de la cola. Al volver la señal, el evento
`online` más el polling de 30 s sube en lote sin recargar ni perder lo tipeado.

**Estados.**

| Estado | Cómo verlo |
|---|---|
| Cola con pendientes | `sincronizacion.html` |
| Subida fallida con reintento | `sincronizacion.html?fallo=1` |
| Todo sincronizado | `sincronizacion.html?vacio=1` |
| Sin señal 4+ días | banner de datos viejos, “Última sync: hace X días” |

**Regla.** Un fallo de red nunca borra el registro local: lo deja pendiente y
avisa cuántos quedan. La cola sobrevive la recarga.

**Código.** `components/SyncIndicator.tsx`, `components/SyncProvider.tsx`,
`components/system/OfflineBanner.tsx`, `app/offline/page.tsx`.

## 07 · Panel del dueño

**Entrada.** Nav → Panel, visible solo para dueño y admin. El capataz recibe el
gate.

**Pasos.** Tres cifras del día (Ordeñado, Despachado, Merma con litros y
porcentaje) → tendencia de 30 días con línea de 0 % → merma por turno con leyenda
→ últimos 7 días en tabla (≥768) o lista (<768) → hoja del día con el desglose.
La última sync se muestra siempre; en arcilla si pasó más de 24 h.

**Estados.**

| Estado | Cómo verlo |
|---|---|
| Normal (hoy 112,0 L / 96,5 L → +15,5 L · 13,8 %) | `panel.html` |
| Despacho sin ordeño: merma del 100 % | `panel.html?merma=100` |
| Sobre-despacho: salida mayor al ordeñe | `panel.html?sobregiro=1` |
| Gate de capataz | `panel.html?sinpermiso=1` |
| Sin conexión | `panel.html?offline=1` |
| Datos viejos | `panel.html?antiguo=1` |
| Sin datos para graficar | `panel.html?vacio=1` |
| Fecha puntual | `panel.html?fecha=YYYY-MM-DD` |

**Regla.** La merma es un dato, no una alarma permanente: el color va siempre
acompañado de signo y texto (“Leche sin despachar”, “Salida mayor al ordeñe”).

**Código.** `app/(app)/dashboard/page.tsx`, `components/dashboard/SummaryCards.tsx`,
`components/dashboard/MermaChart.tsx`, `components/dashboard/LastSyncBadge.tsx`,
`lib/dashboard/merma.ts`.

## Cómo probar la demo completa

1. `instalacion.html` → instalar.
2. `setup.html?token=RODEO-2026` → crear el administrador.
3. `login.html` → entrar como administrador.
4. `usuarios.html` → crear un capataz y copiar credenciales.
5. `vacas.html?offline=1` → dar de alta una vaca sin señal.
6. `milking.html?offline=1` → cargar el turno.
7. `despacho.html?offline=1` → registrar la salida.
8. `sincronizacion.html` → vaciar la cola.
9. `panel.html` → conciliar el día.
10. `panel.html?sinpermiso=1` → comprobar el gate del capataz.

Para reiniciar cualquier pantalla con estado, añade `?reset=1`.
