# Sprint de cierre 3 días: deploy, E2E y merge (lun 26 → mié 28 oct 2026)
Fecha: 2026-10-26
Fuente: plan V2 `docs/plans/2026-10-19-v2-cierre-rediseno-deploy.md` (tareas #8–#9 pendientes), `spec-v2.md`, checklist `docs/verificacion-manual-v1.md`.
Deploy por **CLI de Vercel desde local** (decisión del 25/10; el repo no tiene remote).

## Estado de partida (verificado dom 25)
- Rama `feat/v2-cierre-rediseno-deploy`, working tree limpio, sin remotes.
- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ (corridos hoy).
- V1 completa; V2 #1–#7 cerradas. Falta **#8 (deploy a Vercel)**, **#9 (verificación final E2E)** y el **merge de la rama a `main`**.

## Día 1 — Lunes 26: Deploy a producción (V2 #8)
Meta: URL fija HTTPS con la app real, usuarios creados y PWA andando.

- [ ] Verificar que `.env.local` tenga las 4 claves: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SETUP_TOKEN`.
- [ ] `npx vercel login` y `npx vercel link` (nombre de proyecto sugerido: `rodeo`).
- [ ] Setear las 4 variables para el entorno **Production** *antes* del primer build: `npx vercel env add <VARIABLE> production` (una por una).
- [ ] `npx vercel --prod` → anotar la URL fija (`https://<proyecto>.vercel.app`).
- [ ] Supabase (Dashboard → Auth → URL Configuration): Site URL = la URL nueva y agregar redirect `https://<proyecto>.vercel.app/auth/callback` (venían del túnel de Cloudflare).
- [ ] Alta de usuarios desde la app: `/setup?token=<SETUP_TOKEN>` → primer admin; `/register` → capataz (y dueño/segundo admin si corresponde).
- [ ] Smoke test PWA en celular real: abrir la URL, instalar, modo avión → navegar las 4 pestañas (cache ✅), cargar un ordeño, volver online → sync sube solo a Supabase.
- [ ] README: completar "URL de producción". Commit.

Verificación (del plan #8): URL 200 por HTTPS, `/manifest.json` e iconos 200, PWA instalable, 4 pestañas offline.
Tiempo estimado: 2–4 h.

## Día 2 — Martes 27: E2E contra producción (V2 #9 + V1 #10)
Meta: checklist A–I completo, sin pendientes bloqueantes.

- [ ] Correr `docs/verificacion-manual-v1.md` sección por sección, en celular real y escritorio:
  - **A** marca/shell (Rodeo, logo, tema) · **B** roles y onboarding (capataz no ve ni entra al Panel, `/setup` deshabilitada tras el admin).
  - **C** vacas offline · **D** ordeño (≈40 vacas en <2 min, reingreso acumula, validación 0–100).
  - **E** despacho offline · **F** sync robusta (corte de red, pendientes visibles, reintento con espera y manual; **nada se borra hasta confirmar subida**).
  - **G** panel dueño (números = Supabase, merma L/%, línea 30 días, barras por turno, badge última sync).
  - **H** validaciones borde · **I** deploy y PWA (instalable, offline, `sw.js` por HTTPS).
- [ ] Marcar las casillas del checklist o a notar las incidencias en ese doc.
- [ ] Suite completa local: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

Todo lo que falle entra a la cola de fixes del día 3 (priorizar bloqueantes del spec).
Tiempo estimado: 3–5 h (hay que pisar el campo con el celular y el capataz).

## Día 3 — Miércoles 28: fixes, doc y merge
Meta: `main` mergeada, verde y con detalle.

- [ ] Fixes de los hallazgos del martes (buffer real del sprint).
- [ ] Actualizar progreso: planes V1 (#10) y V2 (#8/#9, línea "Progreso"), README "Estado" con URL final.
- [ ] `graphify update .` (grafo al día).
- [ ] Merge de la rama a `main` vía `finishing-a-development-branch`: verificación completa sobre `main` (`npm run lint && npm run typecheck && npm test && npm run build`). Sin push directo.
- [ ] (Recomendado) Subir el repo a GitHub como backup: hoy todo el código vive solo en esta máquina y el deploy del día 1 no la requiere pero tampoco la respalda.

Tiempo estimado: 1–3 h.

## Cuidados del sprint
- Las variables `NEXT_PUBLIC_*` se hornean en el build: si cambian en Vercel, redeploy.
- El `SETUP_TOKEN` de Vercel debe ser el mismo secreto local para que `/setup` dé en producción; jamás subirlo al repo.
- La PWA instalada desde el túnel viejo puede quedar con cache: pedir recarga online tras el deploy.
- Vercel Hobby no permite uso comercial (riesgo ya anotado en el plan V2): decisión del dueño — Pro o VPS si aplica.

## Éxito (criterios de spec-v2)
URL fija por HTTPS · el capataz instala solo y carga un ordeño real · el dueño confía en el Panel · cero pérdida de datos offline · checklist E2E sin bloqueantes · `main` verde.
