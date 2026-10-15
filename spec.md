# Spec: Control de Ordeño y Venta (V1)
Fecha: 2026-10-15

## Overview
Aplicación offline-first para auditar la producción de leche diaria en fincas ganaderas donde el dueño no está presente. El capataz registra ordeños por vaca/turno en el corral sin señal; el dueño ve en remoto la conciliación automática entre lo ordeñado y lo despachado, detectando mermas y fugas de dinero desde el primer día.

## Usuarios objetivo
- **Dueño (remoto):** No vive en la finca, visita esporádicamente. Hoy depende de lo que le diga el capataz; no hay registros escritos. Necesita ver producción vs. despacho diario sin llamar por teléfono.
- **Capataz/Encargado (en campo):** Opera en el corral, a menudo sin internet. Hoy no anota nada o lo hace en papel que se pierde. Necesita una forma ultra-rápida de meter litros por vaca en la ordeñadora, sin teclados complejos ni pasos extra.

**Problema actual:** Fuga de leche/dinero por falta de trazabilidad; el dueño no sabe si lo que le cobran al quesero coincide con lo que realmente salió de las vacas.

## Alcance
### La v1 SÍ hace
1. **Planilla Masiva de Ordeño (Offline, Capataz):** Lista de vacas activas con campo numérico grande por fila; dos turnos (Mañana/Tarde) por fecha; botón único "Guardar Ordeño" que persiste localmente (Dexie.js) con timestamp automático.
2. **Módulo de Despacho / Tanque (Capataz o Dueño):** Registro simple del total de litros que salen de la finca (entrega a quesero, camión, tanque).
3. **Panel de Conciliación y Mermas (Online, Dueño):** Cálculo automático Σ ordeños individuales – litros despachados = diferencia/merma por día y turno; gráficos simples de serie temporal para detectar patrones de descuadre.
4. **CRUD simple de vacas activas:** Añadir, editar nombre/código, activar/desactivar vacas en la planilla de ordeño.

### La v1 NO hace
- Gestión sanitaria (vacunas, tratamientos, calendario sanitario)
- Reproducción (montas, partos, secado, destete, genealogía)
- Inventario completo con razas, pesos, historiales individuales extensos
- Compras/ventas de animales, facturación, contabilidad
- Múltiples fincas / multi-usuario con roles complejos
- App móvil nativa (iOS/Android store) — PWA instalable es suficiente
- Notificaciones push / email / WhatsApp
- Reportes PDF / exportación avanzada
- Validaciones biológicas estrictas (ej. bloquear parto sin monta registrada)
- Censo previo obligatorio con aretado físico antes de arrancar

## Comportamiento esperado
**Flujo Capataz (Ordeño):**
1. Abre la PWA en el móvil (funciona sin conexión).
2. Ve la lista de vacas activas para el turno actual (Mañana o Tarde) con su nombre/código.
3. Teclea los litros en el teclado numérico grande de cada fila (solo números).
4. Pulsa "Guardar Ordeño" → se guarda localmente al instante con fecha/hora/turno/user_id.
5. Si vuelve a entrar al mismo turno el mismo día, los nuevos litros se **suman** a lo ya guardado (no sobrescribe).
6. Si mete un valor inválido (< 0 o > 100 L/vaca), la fila muestra error inline y no permite guardar hasta corregir.

**Flujo Despacho (Capataz o Dueño):**
1. En cualquier momento, accede a "Registrar Despacho".
2. Ingresa: fecha, turno (opcional), total de litros entregados/salidos.
3. Guarda (online si hay señal, offline si no; sync automática después).

**Flujo Dueño (Panel):**
1. Abre el dashboard en navegador (online).
2. Ve tarjetas: Total ordeñado hoy (Mañana + Tarde), Total despachado hoy, Merma % y litros.
3. Gráfico de líneas: merma diaria últimos 30 días; barras por turno.
4. Indicador visible: "Última sincronización: hace X horas/días" (alerta visual si > 24h).
5. Al recuperar conexión en la finca, la sync es automática en background; el panel se actualiza solo sin intervención.

## Errores y seguridad
| Situación | Comportamiento |
|-----------|----------------|
| Litros inválidos (negativos, >100 L/vaca) | Error inline en la fila; botón "Guardar" deshabilitado hasta corregir. |
| Re-ingreso a turno ya guardado | Suma los nuevos litros al total existente de ese turno/vaca. |
| Sin conexión 4+ días | Dueño ve datos viejos + badge "Última sync: hace X días"; sync automática al volver la señal. |
| Vaca duplicada en CRUD | Validación de código/nombre único al guardar; aviso al usuario. |
| Despacho sin ordeños ese día | Se permite guardar; panel muestra merma = 100% (rojo) para ese día. |
| Datos sensibles | Solo litros y nombres de vacas; no hay datos personales, bancarios ni de identidad. Acceso por URL única o login simple (fuera de spec técnico). |

## Éxito
- **Merma promedio diaria < 5%** (litros ordeñados vs. despachados) al cabo de 30 días de uso continuo.
- **Cero días sin registro de ordeño** (cobertura 100% de días operativos).
- El dueño deja de llamar al capataz a preguntar "¿cuántos litros hoy?" porque confía en el panel.

## V2 (opcional)
- Alertas sanitarias y calendario de vacunación/desparasitación.
- Módulo de reproducción (montas, partos, controles de gestación).
- Inventario completo con genealogía, razas, pesos, historial por animal.
- Multi-finca y roles (veterinario, administrador, solo lectura).
- Exportación PDF/Excel de planillas y conciliaciones.
- Notificaciones push/email (ej. "merma > 10% hoy", "falta ordeño tarde").
- App nativa en stores.
- Integración con balanzas electrónicas / medidores de tanque automáticos.