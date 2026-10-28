# Rodeo: sistema de diseño (V2)

Documento de referencia para la PWA offline-first de control de ordeño y venta.
Fuente de verdad del producto: `spec.md`, `spec-v2.md`, `app/globals.css`,
`lib/brand/brand.ts` y los componentes en `components/`.

**Postura:** agro moderno, no rural nostálgico. Papel cálido, verde profundo y
arcilla. Fraunces para títulos, Inter para interfaz y cifras tabulares. Sin
sombras dramáticas, sin degradados decorativos, sin iconos emoji.

---

## 1. Principios

1. **El campo manda.** El capataz opera de pie, con una mano, sin señal.
   Controles grandes, una sola columna, guardado local primero.
2. **El panel explica.** El dueño ve la diferencia entre ordeñado y despachado
   sin llamar a nadie. La merma es un dato, no una alarma permanente.
3. **Offline no es un error.** La falta de señal es un estado normal: se muestra
   como pendiente, nunca como pantalla rota.
4. **Una decisión por pantalla.** Un CTA primario como máximo; la arcilla se
   reserva para merma, sobre-despacho y riesgo.

---

## 2. Tokens

Los valores salen de `app/globals.css`. Ningún componente debe declarar hex
sueltos: siempre `var(--token)` o la utilidad de Tailwind equivalente.

| Token | Valor | Rol |
|---|---|---|
| `--background` | `#FAF7F0` | Fondo de página (papel) |
| `--card` | `#FFFFFF` | Superficie de tarjetas y hojas |
| `--secondary` | `#EFE9DA` | Superficie secundaria, controles |
| `--foreground` | `#23211C` | Texto principal |
| `--muted-foreground` | `#6B675C` | Texto secundario y metadatos |
| `--border` | `#E3DCCC` | Bordes de 1 px |
| `--primary` | `#1F4D3A` | Acción principal, marca |
| `--primary-deep` | `#17392B` | Hover/pressed, fondos de marca |
| `--primary-foreground` | `#F7F3E9` | Texto sobre verde |
| `--clay` | `#B5622F` | Merma, sobre-despacho, pendientes |
| `--clay-soft` | `#F3E2D5` | Fondo de badges de arcilla |
| `--clay-ink` | `#8F4A20` | Texto pequeño sobre arcilla suave (derivado, AA) |
| `--destructive` | `#B4341F` | Error y acciones destructivas |
| `--ring` | `#2E6B4E` | Anillo de foco |
| `--chart-1..5` | ver `globals.css` | Series de gráficos |

### Contraste verificado

| Par | Ratio | Uso |
|---|---|---|
| `#23211C` / `#FAF7F0` | 15.03:1 | Texto principal (AAA) |
| `#6B675C` / `#FAF7F0` | 5.28:1 | Texto secundario (AA) |
| `#1F4D3A` / `#FAF7F0` | 9.00:1 | Enlaces y títulos verdes (AAA) |
| `#F7F3E9` / `#1F4D3A` | 8.69:1 | Botón primario (AAA) |
| `#B4341F` / `#FAF7F0` | 5.69:1 | Error (AA) |
| `#B5622F` / `#FAF7F0` | 4.13:1 | **Solo texto ≥24 px o ≥18.66 px negrita** |
| `#8F4A20` / `#F3E2D5` | 5.26:1 | Badge arcilla pequeño (AA) |

Regla: la arcilla pura nunca se usa para texto corrido menor a 18.66 px en
negrita. Para badges y etiquetas se usa `--clay-ink`.

---

## 3. Tipografía

| Rol | Fuente | Tamaño | Peso | Tracking |
|---|---|---|---|---|
| Display | Fraunces | 56-64 px | 500 | `-0.03em` |
| H1 | Fraunces | 36-40 px | 500 | `-0.025em` |
| H2 | Fraunces | 28-32 px | 500 | `-0.02em` |
| H3 | Inter | 20 px | 600 | `-0.01em` |
| Cuerpo | Inter | 16 px | 400 | `0` |
| Pequeño | Inter | 14 px | 400/500 | `0.005em` |
| Etiqueta | Inter | 12 px | 600 | `0.08em` mayúsculas |
| Dato | Inter tabular | 24-48 px | 600 | `-0.01em` |

- Cifras siempre con `font-variant-numeric: tabular-nums`.
- Máximo dos familias. Fraunces jamás en párrafos; Inter jamás en titulares de
  portada.
- Línea de lectura: 62-68 caracteres (`max-width: 65ch`).
- Escala cerrada de 7 pasos: 12, 14, 16, 20, 28, 40, 64.

---

## 4. Espaciado, forma y movimiento

- Base 4 px; ritmo de 8 px. Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Radios: 8 px (botones, inputs), 12 px (controles), 16 px (tarjetas),
  999 px (pills).
- Bordes de 1 px `--border`; en foco, anillo de 3 px `color-mix(--ring 60%)`.
- Elevación: solo `0 1px 2px rgba(35,33,28,.06)` en tarjetas y
  `0 18px 40px -24px rgba(23,57,43,.35)` en diálogos/hojas.
- Movimiento: 120 ms (hover), 180 ms (estado), 240 ms (entrada). Easing
  `cubic-bezier(.2,.7,.3,1)`. Respetar `prefers-reduced-motion`.

---

## 5. Breakpoints

Contenedor máximo de la app: **1024 px** (`max-w-5xl`). No se estira más:
en 1280/1536 se agrega aire, no contenido.

| Token | Desde | Contenedor | Navegación | Ordeño | Panel | Vacas | Despacho | Target |
|---|---|---|---|---|---|---|---|---|
| `base` | 360 | 100% − 32 px | 2 filas, tabs con scroll | 1 columna | 1 columna | lista | 1 columna | 44 px |
| `xs` | 430 | 100% − 32 px | 2 filas | 1 columna | 1 columna | lista | 1 columna | 44 px |
| `sm` | 640 | 100% − 48 px | 1 fila, tabs visibles | 1 columna, máx. 560 | 3 tarjetas | lista con acciones | 2 columnas | 44 px |
| `md` | 768 | 768 px | 1 fila, texto en sync | 1 columna, máx. 640 | gráfico + tabla | tabla | 2 columnas + resumen | 44 px |
| `lg` | 1024 | 1024 px | completa | tarjeta 720 centrada | 2/3 gráfico + 1/3 aside | tabla completa | 2/3 + 1/3 aside | 44 px |
| `xl` | 1280 | 1024 px | completa | igual | igual | igual | igual | 44 / puntero |
| `2xl` | 1536 | 1024 px | completa | igual | igual | igual | igual | 44 / puntero |

Reglas duras:

- **Ordeño nunca se parte en dos columnas**, en ningún breakpoint. La fila es
  etiqueta + input; el input mide 64 px de alto.
- La barra de guardado es fija al fondo (`bottom: 0`) y respeta
  `env(safe-area-inset-bottom)`.
- En `<640` la navegación ocupa una segunda fila y hace scroll horizontal;
  nunca se colapsa en un menú hamburguesa (son 4-5 destinos).
- En `<768` Vacas usa lista, no tabla. La tabla aparece en `md`.
- En `<640` las tarjetas del Panel pasan de 3 columnas a 1.
- `xl` y `2xl` no cambian layout: solo centran el contenedor de 1024.

---

## 6. Matriz por superficie

| Pantalla | Componentes obligatorios | Regla clave |
|---|---|---|
| **Ordeño** (capataz) | Header + nav, selector turno, fecha, fila de ordeño, input de litros, badge “Ya: X L”, total pendiente, CTA guardar, toast, indicador sync, banner offline | Una columna; guardado local; error inline bloquea el CTA |
| **Panel** (dueño) | Header + nav, 3 tarjetas resumen, gráfico de merma, última sync, filtro de fecha, tabla por día, role gate | Solo `owner`; cifras tabulares; merma en arcilla |
| **Vacas** | Lista/tabla, buscador, filtro activa/inactiva, CTA alta, diálogo de alta/edición, confirmación de baja, badge de estado y pendiente, vacío | Lista <768, tabla ≥768; código único; alta, edición y baja se guardan local y quedan “Pendiente” sin señal |
| **Despacho** | Formulario litros, fecha, turno opcional, CTA guardar, toast, banner offline, resumen del día | Permite guardar sin ordeños; avisa merma 100% |
| **Acceso / instalación** | Login, setup primer admin, aviso de rol, prompt de instalación, error inline | Tarjeta máx. 420 px; split con marca ≥1024 |
| **Usuarios** (admin) | Header + nav, buscador, filtro por rol, tabla/lista, badge de rol y estado, diálogo de alta/edición, hoja de credenciales, confirmación de baja, vacío | Solo `admin`; lista <760, tabla ≥760; no se puede desactivar la propia cuenta |
| **Roles y permisos** | Header + nav, sub-tabs, resumen por rol, matriz de capacidades, rutas protegidas, role gate, aviso de solo lectura | Dueño en lectura; capataz recibe role gate; matriz apilada <760 |

---

## 7. Inventario de componentes

| Componente | Grupo | Estados | Dónde aparece | Responsive |
|---|---|---|---|---|
| `AppHeader` + `NavLink` | Navegación | activo, hover, foco, oculto por rol | todas | 2 filas <640 |
| `SyncIndicator` | Sistema | sin pendientes, pendiente, fallido, sincronizando | header | punto + texto, compacto <768 |
| `LogoutButton` | Navegación | normal, foco | header | icono |
| `ShiftSelect` | Captura | mañana, tarde, abierto, foco | Ordeño | ancho completo <640 |
| `DateInput` | Captura | vacío, válido, foco | Ordeño, Panel, Despacho | ancho completo <640 |
| `CowRow` | Captura | vacío, con valor, ya guardado, error | Ordeño | 1 columna siempre |
| `LitersInput` | Captura | normal, foco, inválido, deshabilitado | Ordeño | 64 px alto, 112 px ancho |
| `Badge` | Datos | neutro, arcilla, éxito | Ordeño, Vacas, Panel | - |
| `SaveBar` | Captura | inactivo, válido, inválido, guardando | Ordeño | fija al fondo |
| `SummaryCard` | Datos | normal, sobre-despacho | Panel | 1→3 columnas en 640 |
| `MermaChart` | Datos | con datos, vacío, cargando | Panel | ancho completo |
| `CowTable` / `CowList` | Datos | con datos, vacío, acciones | Vacas | lista <768 |
| `CowForm` | Captura | vacío, válido, código duplicado, error inline, guardando | Vacas | hoja <640 |
| `SyncSheet` | Sistema | sin pendientes, con pendientes, reintentando, sin señal | header | hoja <640 |
| `EmptyState` | Sistema | - | Vacas, Ordeño, Panel | centrado |
| `Dialog` | Sistema | abierto, cerrado, foco atrapado | Vacas, confirmaciones | hoja <640 |
| `Toast` | Sistema | éxito, error, info | global | abajo, ancho completo <640 |
| `OfflineBanner` | Sistema | offline, sincronizando, fallido | global | una línea |
| `RoleGate` | Sistema | sin permiso, cargando | Panel, Usuarios, Roles | tarjeta centrada |
| `InstallPrompt` | Sistema | invitación, instalada, descartada | Acceso | hoja inferior |
| `UserTable` / `UserList` | Datos | con datos, vacío, filtrado, deshabilitado sin señal | Usuarios | lista <760 |
| `UserDialog` | Sistema | alta, edición, admin bloqueado, error inline | Usuarios | hoja <640 |
| `CredentialsSheet` | Sistema | recién creada, copiada | Usuarios | hoja <640 |
| `RoleMatrix` | Datos | tabla, apilada por rol | Roles y permisos | apilada <760 |
| `AccountMenu` | Navegación | cerrado, abierto | header | solo avatar <640 |
| `Button` | Sistema | primario, outline, ghost, destructivo, disabled, foco | global | 44 px mínimo |

---

## 8. Accesibilidad

- Targets táctiles ≥44×44 px; en ordeño el input es de 64 px de alto.
- Foco visible de 3 px con offset 2 px; nunca `outline: none` sin reemplazo.
- Un solo `h1` por pantalla; jerarquía sin saltos.
- Errores inline asociados con `aria-describedby` y `aria-invalid`.
- Totales y estado de sync en regiones `aria-live="polite"`.
- No se transmite información solo por color: la merma lleva signo, texto y
  color.
- Contraste mínimo AA; arcilla pura solo en tamaños grandes.

---

## 9. Implementación

- Tailwind + shadcn (`components/ui`) ya mapea tokens vía `@theme inline`.
- Usar `font-heading` (Fraunces) y `font-sans` (Inter); `tabular-nums` en datos.
- Radios con `--radius` (12 px); no introducir radios nuevos.
- Iconografía: lucide, trazo 1.75, tamaño 16/20/24, `currentColor`.
- Estados de formulario con `aria-invalid` + borde destructivo.
- Copy en español venezolano con tuteo: “prueba”, “toca”, “ingresa”. Nunca
  voseo (“probá”, “tocá”, “ingresá”).
- El logo va en verde plano `#1F4D3A`. Sin gradiente de marca.
- La documentación no numera secciones de forma decorativa ni repite eyebrows;
  los especímenes se agrupan con hairlines y espacio, no con tarjetas.

## 10. Fuera de alcance (V2)

Inventario, sanidad, reproducción, multi-finca, exportación, notificaciones
push y app nativa. El tema oscuro tiene tokens definidos pero no se activa en
V2.
