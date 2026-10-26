# Plan señal freelance: primera semana pública (lun 26 → mié 28 oct 2026)
Fecha: 2026-10-26
Este plan es de marca personal (no de producto). Corre **en paralelo** a `2026-10-26-plan-3-dias-cierre.md` (deploy + E2E + merge) con un presupuesto de **2 h/día**.

## Objetivo
Partimos de cero (todos los perfiles vacíos). Meta de la semana: que un reclutador que entre a los perfiles entienda en 2 minutos qué hacés y con qué stack, y vea un proyecto real en producción (Rodeo). Publicar 3 veces (actividad visible), pedir el primer testimonio al dueño y dejar armada la rutina para la semana 2.

## Decisiones (tomadas hoy)
| Decisión | Qué | Porqué |
|----------|-----|--------|
| **Plataformas** | LinkedIn + GitHub como **núcleo**; Instagram reutiliza material (screenshots y videos cortos). X/Twitter queda para la semana 2 si sobra tiempo. | Reclutadores viven en LinkedIn; GitHub es la prueba real del trabajo. IG con material ya grabado cuesta poco extra. |
| **Posicionamiento** | "Full-stack dev: Next.js · React · TypeScript · Supabase · PWA offline-first". Sin inflar años de experiencia. | Honesto para alguien que arranca; el proyecto en producción da la prueba de nivel. No se vende nada que no se pueda sostener en una charla técnica. |
| **Video** | Screen recordings de la app, sin cara. | Rinde en LinkedIn e IG sin exigir lo que no estás listo para dar esta semana. |
| **Rodeo en público** | Demo + screenshots + URL de producción: **sí**. Repo público: **después** (permiso del dueño + revisar que el historial no tenga secretos). | Máximo efecto, mínimo riesgo. `.env.local` está fuera de git, igual se re-chequea el history antes de exponer el repo. |
| **Idioma** | Español (es-AR). | Público y testimonio locales. |

## Día 1 — Lunes 26 (~2 h): la ficha, antes que la voz
- [ ] **LinkedIn** (~1 h):
  - Headline (a elegir/editar): `Desarrollador full-stack | Next.js · React · Supabase · PWA offline-first` o `Construyo apps web que funcionan sin internet | Next.js · Supabase`.
  - Foto decente + banner simple (capturas de Rodeo o el logo).
  - Sección "Sobre": 3 párrafos — qué construí (Rodeo en 1 línea), qué sorprende (offline-first real, sync sin perder datos), qué busco (proyectos freelance / rol dev). La redacto yo el mismo día.
  - URL del proyecto en "Sitio web".
- [ ] **GitHub** (~30 min): foto + profile README (stack, proyecto actual = Rodeo, contacto). Dejar actividad visible para que el perfil no se vea recién creado.
- [ ] **Post #1, redactar** (~30 min): build in public — "Llevo una app de gestión para tambo que funciona sin señal…". Depende de que el deploy de Vercel esté listo (se publica cuando cierre). Yo redacto 2 versiones y elegís una.

Entrega del día: LinkedIn completo, GitHub con README de perfil, post #1 listo para publicar.

## Día 2 — Martes 27 (~2 h): capturar material (día del E2E en campo)
- [ ] **Grabar 3 videos cortos** (30–60 s) durante el E2E real, con el celular:
  1. Modo avión → cargar ordeño en la planilla → guardado sin señal.
  2. Volver online → contador de pendientes → sync termina → badge "última sync" actualizado.
  3. Panel del dueño: merma del día + gráfico de 30 días.
- [ ] **Capturar 6–10 screenshots** limpios: login con marca, planilla, vacas, despacho, panel (móvil y desktop).
- [ ] **Publicar post #2** (a la noche): "Hoy probé la app en el campo, sin señal. Esto pasó…" + video 1. Redactado por el agente con tu material.
- [ ] **Conectar personas** (~15 min): conectar con ~10 reclutadores IT (Argentina) y 5 perfiles del sector; comentar con aporte 2–3 posts.

Entrega del día: 3 videos + screenshots, post #2 publicado, primeras conexiones.

## Día 3 — Miércoles 28 (~2 h): caso de estudio + testimonio
- [ ] **Post #3 — mini case study**: problema (el dueño no sabía los litros sin llamar al capataz) → qué construí (offline-first + sync + panel) → stack → 2 aprendizajes. Se publica junto al cierre del ciclo (merge).
- [ ] **Fijar destacados**: post #3 en Featured + link de Rodeo.
- [ ] **Pedir el testimonio al dueño** (script abajo; se pide hoy, se publica cuando él quiera).
- [ ] **Instagram** (si sobra tiempo): reutilizar el video 1 como reel de ~20 s + carrusel de screenshots.
- [ ] **Cola para semana 2**: repo público de Rodeo (check de secretos + permiso), rutina sostenida 2 posts/semana, X/Twitter opcional, vigilancia de ofertas.

Entrega del día: case study publicado y fijado, testimonio en camino, IG con material.

## Scripts listos
**Mensaje al dueño (testimonio):**
> Hola [nombre], la app ya quedó en producción y la validamos completa. ¿Me escribirías 2–3 líneas de qué te resuelve y qué cambiaste antes de llamarme? La publico en mi LinkedIn con tu nombre (o como prefieras). ¡Gracias!

**Post #1 (hook):**
> Una app de gestión para tambo que funciona **sin señal**. Capataz carga el ordeño en el campo; al volver la conexión sube todo solo, y el dueño ve la merma del día en el panel. [desarrollar con resultado del deploy].

**Headline alternativo (reclutadores):**
> Full-stack developer · Next.js / React / TypeScript / Supabase · PWA offline-first · abierto a freelance y roles

## Presupuesto y ritmo
| Día | Proyecto | Señal | Total |
|-----|----------|-------|-------|
| Lunes | ~3 h (deploy) | ~2 h | ~5 h |
| Martes | ~5 h (E2E) | ~2 h | ~7 h |
| Miércoles | ~2 h (fixes/merge) | ~2 h | ~4 h |

## Éxito de la semana
- LinkedIn y GitHub con ficha completa y coherente con el stack real.
- 3 publicaciones (incluye un case study) y Rodeo con URL pública en los perfiles.
- Testimonio pedido al dueño.
- ~10–15 conexiones con reclutadores del sector.
