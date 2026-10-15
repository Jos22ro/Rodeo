# PROPUESTA TÉCNICA Y COMERCIAL
## Sistema de Gestión Pecuaria (MVP - Fase 1)

---

### 1. Resumen Ejecutivo

El presente proyecto contempla el diseño y desarrollo de una aplicación web progresiva (**PWA**) para la gestión técnica, productiva y sanitaria de la finca. 

El sistema cuenta con un enfoque **Offline-First**, lo que garantiza que el capataz y el personal de campo puedan registrar la producción diaria de leche y la aplicación de tratamientos sanitarios directamente desde sus dispositivos móviles en áreas sin cobertura de internet. Los datos se almacenan localmente y se sincronizan automáticamente con la nube una vez que el dispositivo detecta conexión.

---

### 2. Alcance del Sistema (MVP - Fase 1)

#### Módulo 1: Ficha y Control de Ganado
* **Identificación del animal:** Registro mediante un **código interno único** (ej. `VAC-001`) complementado con el **nombre** de la vaca.
* **Datos productivos y reproductivos:** Raza, fecha de nacimiento/ingreso, estado actual (*Lactancia, Gestación, Seca*), días/fecha de monta, fecha probable de parto y contador acumulado de partos.

#### Módulo 2: Carga Masiva Diaria de Leche (Offline-First)
* **Vista de Planilla Interactiva:** Listado automático de todas las vacas activas/en lactancia en una sola pantalla.
* **Ingreso Rápido:** Formulario optimizado para capturar los litros diarios por animal y guardar todo el lote con un solo clic.
* **Persistencia Local:** Uso de **Dexie.js (IndexedDB)** para almacenamiento en el navegador del dispositivo, garantizando velocidad y funcionalidad total sin señal de red.
* **Cola de Sincronización:** Detección automática de cobertura para el envío en lote (*Batch Sync*) de los registros pendientes hacia la base de datos central.

#### Módulo 3: Plan Sanitario y Motor de Alertas
* **Catálogo de tratamientos:** Registro predefinido de vacunas y tratamientos comunes (*Aftosa, Rabia, Trivalente, Desparasitantes, Vitaminas*).
* **Historial de aplicaciones:** Registro de fecha de aplicación, dosis y cálculo automático de la próxima fecha límite.
* **Panel de Alertas:** Notificación e indicador visual en el tablero principal con **3 días de anticipación** a la fecha límite de vacunación.

#### Módulo 4: Reportes en PDF y Gestión de Usuarios
* **Generación de Reportes PDF:** Exportación inmediata de la ficha individual del animal (historial productivo y sanitario) y del resumen consolidado mensual del predio.
* **Control de Acceso por Roles:**
  * **Administrador:** Acceso completo a métricas, configuraciones globales y exportación de reportes.
  * **Capataz / Veterinario:** Interfaz simplificada para la captura rápida de ordeño y registro de eventos sanitarios en campo.

---

### 3. Funcionalidades Diferidas (Fase 2)

Para asegurar una entrega rápida y priorizar los procesos operativos críticos, se acuerda postergar para una segunda fase:
* Control detallado de asistencia del personal y asignación de tareas diarias.
* Carga y almacenamiento de archivos adjuntos (documentos escaneados, fotos o facturas).
* Registro de árbol genealógico (Trazabilidad de Padre y Madre).

---

### 4. Arquitectura y Stack Tecnológico

| Capa | Tecnología Seleccionada | Justificación |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (React) + Tailwind CSS** | Interfaz ágil, adaptada a dispositivos móviles y tablets. PWA instalable. |
| **Almacenamiento Local** | **Dexie.js (IndexedDB)** | Manejo sencillo y ligero de base de datos relacional local en el navegador. |
| **Backend / DB Cloud** | **Supabase (PostgreSQL)** | Persistencia en la nube, autenticación por roles y sincronización segura. |
| **Generación de Reportes** | **@react-pdf/renderer** | Renderizado e impresión de reportes PDF del lado del cliente (*Client-Side*). |

---

### 5. Plan de Entregables y Fases de Desarrollo

* **Fase 1: Configuración de Arquitectura y Base de Datos (Semana 1)**
  * Configuración del proyecto Next.js / PWA.
  * Modelado de la base de datos en Supabase y esquema local con Dexie.js.
  * Autenticación y roles de usuario.

* **Fase 2: Ficha Animal y Planilla Masiva Offline (Semana 2)**
  * Módulo de gestión de ganado (código interno + nombre).
  * Desarrollo de la planilla masiva para carga diaria de ordeño con persistencia en IndexedDB.

* **Fase 3: Módulo Sanitario, Alertas y PDF (Semana 3)**
  * Registro de vacunas y tratamientos.
  * Lógica de cálculo de alertas a 3 días.
  * Plantillas y motor de exportación a PDF.

* **Fase 4: Sincronización, Pruebas de Campo y Despliegue (Semana 4)**
  * Implementación del Service Worker y cola de sincronización Offline Cloud.
  * Pruebas interactivas de pérdida y recuperación de señal.
  * Despliegue en entorno de producción e inducción al usuario.

---

### 6. Consideraciones Comerciales y Soporte

* **Garantía y Soporte Post-Entrega:** Se incluyen **30 días de soporte técnico** posterior al despliegue para ajuste de posibles incidencias o calibración de la sincronización offline.
* **Propiedad del Código:** El cliente recibirá la propiedad total del código fuente y acceso a las cuentas configuradas en la nube.