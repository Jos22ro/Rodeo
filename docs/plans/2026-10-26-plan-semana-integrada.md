# Semana integrada: cierre del proyecto + señal freelancer (lun 26 → vie 30 oct 2026)
Fecha: 2026-10-26
Más detalle técnico por carril: proyecto → `2026-10-26-plan-3-dias-cierre.md` (y plan V2 #8/#9); reglas de contenido → este doc.
Un foco por día: los dos carriles entrelazados, no en paralelo. Cada día termina con algo publicado.

## Lunes 26 — Deploy + la ficha (~5 h)
Proyecto (V2 #8, detalle en el plan de cierre):
- [ ] Chequear `.env.local` (4 claves), `vercel login/link`, setear variables **Production**, `vercel --prod` → URL fija.
- [ ] Supabase Auth: Site URL + redirect `/auth/callback` con la URL nueva.
- [ ] Alta de usuarios: `/setup?token=…` (admin) y `/register` (capataz).
- [ ] Smoke PWA en celular (instalar, avión, 4 pestañas, ordeño, sync) + README con la URL + commit.

Señal (noche, ~1,5 h):
- [ ] LinkedIn completo: headline, foto/banner, "Sobre" (3 párrafos), URL del proyecto en "Sitio web".
- [ ] GitHub: foto + profile README (stack, proyecto actual = Rodeo).
- [ ] Redactar post #1 (build in public; 2 versiones, elegís una). Se publica cuando el deploy esté verde.

Entrega: app con URL fija y usuarios; ficha al 100%; post #1 publicado o listo.

## Martes 27 — Campo: E2E + cosecha de material (~6–7 h)
Proyecto (V2 #9): correr `docs/verificacion-manual-v1.md` A–I contra producción, celular real + escritorio, y marcar el checklist.
Señal (~2 h, en los turnos reales del capataz):
- [ ] 3 screen recordings (30–60 s): ① avión → ordeño guardado sin señal; ② online → pendientes → sync sube; ③ panel con merma del día + gráfico 30 días.
- [ ] 6–10 screenshots limpios (login, planilla, vacas, despacho, panel; móvil y desktop).
- [ ] Post #2 a la noche: "Hoy probé la app en el campo, sin señal. Esto pasó…" + video ①.
- [ ] Conectar ~10 reclutadores IT + 5 perfiles del sector; comentar 2–3 posts con aporte.

Nota: si el capataz no carga la tarde el martes, replicar la captura con su turno del miércoles a la mañana.
Entrega: checklist marcado; 3 videos + screenshots; post #2 publicado; primeras conexiones.

## Miércoles 28 — Cierre del proyecto (~4 h)
Proyecto (día completo, sin publicar):
- [ ] Fixes de lo que quedó del martes (buffer real del sprint).
- [ ] Actualizar progreso: planes V1 (#10) y V2 (#8/#9, línea "Progreso"), README "Estado", `graphify update .`.
- [ ] Merge de la rama a `main` (finishing-a-development-branch) con verificación completa: `npm run lint && npm run typecheck && npm test && npm run build`.
Señal (~1 h, redacción e inbox):
- [ ] Redactar y dejar listo el post #3 (mini case study: problema → solución → stack → 2 aprendizajes).
- [ ] Pedir el testimonio al dueño (script abajo).
- [ ] Preparar el check del repo para su publicación (escaneo de secretos en el historial).

Entrega: `main` verde; testimonio pedido; post #3 listo.

## Jueves 29 — Lanzamiento (~2–3 h)
- [ ] Publicar post #3 (ciclo ya en `main`, narrativa limpia) y fijarlo en Destacados + link de Rodeo.
- [ ] Instagram: reel de ~20 s (video ①) + carrusel de screenshots.
- [ ] Segunda tanda: 10 conexiones + responder comentarios/mensajes (los mensajes que llegan el lunes tarde los saluda hoy).
- [ ] Repo: si el dueño da permiso y el escaneo sale limpio → repo público `rodeo` (README portafolio, `.env.example`, sin `.env`) + pin en GitHub. Si no, solo backup privado.

Entrega: case study publicado y fijado; IG con material; repo online (público o backup).

## Viernes 30 — Sistema, no content (~2 h)
- [ ] Rutina de semana 2 por escrito: 2 posts/semana (1 técnico + 1 proyecto), 10 contactos/semana, 1 respuesta rápida al día.
- [ ] Métricas de la semana: impresiones, conexiones, respuestas, testimonio (si llegó, publicarlo).
- [ ] Buffer: lo flojo que quedó de la semana (proyecto o señal).
- [ ] Cierre: marcar checklists de ambos planes y `graphify update .` final.

Entrega: semana cerrada con todo publicable y rutina para repetir.

## Presupuesto y ritmo
| Día | Foco | Proyecto | Señal | Total |
|-----|------|----------|-------|-------|
| Lun 26 | Deploy + ficha | ~3 h | ~1,5 h | ~5 h |
| Mar 27 | E2E + material | ~5 h | ~2 h | ~7 h |
| Mié 28 | Cierre + redacción | ~3 h | ~1 h | ~4 h |
| Jue 29 | Lanzamiento | ~0,5 h | ~2,5 h | ~3 h |
| Vie 30 | Sistema | ~0,5 h | ~1,5 h | ~2 h |

## Scripts listos
**Mensaje al dueño (testimonio):**
> Hola [nombre], la app ya quedó en producción y la validamos completa. ¿Me escribirías 2–3 líneas de qué te resuelve y qué cambiaste antes de llamarme? La publico en mi LinkedIn con tu nombre (o como prefieras). ¡Gracias!

**Post #1 (hook):**
> Una app de gestión para tambo que funciona **sin señal**. El capataz carga el ordeño en el campo; al volver la conexión sube todo solo, y el dueño ve la merma del día en el panel. [cerrar con el resultado del deploy].

**Headline alternativo (reclutadores):**
> Full-stack developer · Next.js / React / TypeScript / Supabase · PWA offline-first · abierto a freelance y roles

## Cuidados de la semana
- El testimonio probablemente llegue después del viernes: se pide el miércoles, se publica cuando el dueño lo mande. No frenar la semana por eso.
- Las `NEXT_PUBLIC_*` se hornean en el build: si cambian en Vercel, redeploy. `SETUP_TOKEN` de Vercel = mismo secreto local.
- La PWA instalada desde el túnel viejo puede quedar con cache: pedir recarga online tras el deploy.
- Publicar el repo: **solo** tras permiso del dueño + escaneo de secretos del historial (ni `.env` ni claves en ningún commit).
- Martes es el día pesado (~7 h): salir temprano y no encimarlo con nocturnos largos.

## Éxito de la semana (viernes)
- Proyecto: producción con URL fija, checklist E2E sin bloqueantes, `main` verde, backup/repo en GitHub.
- Señal: LinkedIn + GitHub con ficha completa, 3 publicaciones (deploy, campo, case study) fijado el caso, IG con material, testimonio pedido, rutina de semana 2 escrita.
