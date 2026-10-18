# Spec: Control de Ordeño y Venta (V2)
Fecha: 2026-10-18
Continúa a: `spec.md` (V1)

## Overview
La V2 no suma funciones nuevas del negocio: **cierra la V1, la rediseña y la pone en producción**. El objetivo es que el capataz instale la app desde una URL fija y cargue ordeños sin ayuda, que el dueño confíe en el Panel de merma desde su casa, y que el producto se vea profesional y con identidad propia. Inventario/ficha del animal y sanidad quedan para la V3.

## Usuarios objetivo
- **Dueño (remoto):** ya usa el Panel de conciliación, pero todavía no puede confiar del todo en él (faltan permisos, el deploy es inestable y hay detalles de datos). Quiere ver la merma del día sin llamar al capataz.
- **Capataz/Encargado (en campo):** ya carga ordeños offline, pero hoy necesita ayuda para instalar la app y accede a pantallas que no le corresponden. Necesita instalar solo y ver solo lo suyo.

**Problema de fondo:** el mismo de la V1 (trazabilidad y confianza). La V2 lo hace usable, confiable y presentable de verdad; no agrega funciones nuevas.

## Alcance
### La V2 SÍ hace
1. **Deploy estable:** la app queda accesible en una **URL fija por HTTPS**, instalable como app desde el celular, sin túnel temporal ni reinstalaciones.
2. **Cierre de la V1:** permisos por rol (el Panel es solo del dueño), creación del primer administrador sin depender de la consola, sync con reintentos y avisos (sin perder datos), Panel pulido y corrida del checklist E2E pendiente.
3. **Rediseño de marca:** nombre, logo y paleta propios, aplicados de forma coherente en móvil y escritorio.

### La V2 NO hace
- Inventario/ficha del animal, razas, pesos, genealogía
- Sanidad (vacunas, tratamientos, calendario, alertas)
- Reproducción (montas, partos, gestación, secado, destete)
- Multi-finca y roles extra (veterinario, solo lectura)
- Exportación PDF/Excel y notificaciones push/email
- App nativa en stores
- Integración con balanzas o medidores de tanque
- Cualquier función de negocio nueva distinta de las anteriores

## Comportamiento esperado
**Deploy e instalación:**
1. El dueño abre una **URL fija por HTTPS** y ve la app con su nombre y logo.
2. El capataz abre esa misma URL en su celular y la **instala como app sin ayuda**.
3. La app instalada **abre y funciona sin señal**.

**Permisos:**
1. El capataz ve solo Vacas, Ordeño y Despacho.
2. El dueño ve además el Panel de conciliación.
3. Si un capataz intenta entrar al Panel, no lo ve o recibe un aviso claro de que no tiene permiso.

**Primer administrador:**
1. En una instalación nueva, el dueño crea su cuenta de administrador y luego crea al capataz **desde la app**, sin tocar la consola de Supabase.

**Sync:**
1. Sin señal, el capataz carga ordeños y despachos; el contador de pendientes lo muestra.
2. Al volver la señal, la app sube los pendientes sola.
3. Si una subida falla, se **reintenta con espera** y se avisa cuántos pendientes quedan; **los datos locales no se borran** hasta confirmar la subida.

**Rediseño:**
1. Todas las pantallas (Vacas, Ordeño, Despacho, Panel y login) usan el nombre, logo, colores y tipografía de marca.
2. Se ve bien y es usable tanto en celular como en escritorio.

## Errores y seguridad
| Situación | Comportamiento |
|-----------|----------------|
| Sin señal al navegar | La app abre; las pantallas ya visitadas cargan sin mostrar "sin conexión". |
| Subida fallida | Se reintenta con espera; se muestra cuántos pendientes quedan; no se borra nada local. |
| Se corta la señal justo al guardar | El registro queda local y se sube al reconectar. |
| Capataz intenta ver el Panel | Acceso denegado con mensaje claro (es información de conciliación del dueño). |
| Instalación en un celular viejo | La app sigue siendo usable (buen contraste y controles táctiles grandes). |
| Instalación nueva (primer admin) | Flujo seguro y claro; no queda expuesto a cualquiera. |
| Privacidad | Solo litros, nombres de vacas y usuarios con email; sin datos personales sensibles ni bancarios. |

## Éxito
- **El dueño confía en el Panel:** deja de llamar al capataz para preguntar cuántos litros salieron.
- **Se ve profesional:** tiene nombre propio y se puede mostrar sin que parezca un prototipo.
- **El capataz instala sin ayuda** desde la URL fija y carga un ordeño real solo.
- **Cero pérdida de datos offline** en una semana de uso real.
- Se corre el **checklist E2E pendiente** de la V1 y no quedan pendientes bloqueantes.

## V3 (futuro)
- Inventario y ficha del animal (identificación, razas, pesos, genealogía, historial).
- Sanidad (vacunas, tratamientos, calendario sanitario y alertas de vencimiento).
- Reproducción (montas, partos, control de gestación, secado, destete).
- Multi-finca y roles extra (veterinario, administrador, solo lectura).
- Exportación PDF/Excel de planillas y conciliaciones.
- Notificaciones push/email (ej. "merma > 10% hoy", "falta ordeño tarde").
- App nativa en stores.
- Integración con balanzas electrónicas / medidores de tanque automáticos.
