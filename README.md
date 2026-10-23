# Rodeo

App PWA **offline-first** para tambos. El capataz carga la planilla de ordeño y los despachos
desde el celular, sin señal; al volver la conexión todo se sincroniza solo a Supabase, y el dueño
ve la conciliación del día (merma) en un panel.

## Funcionalidad

- **Vacas** (`/cows`) — alta/edición con código único, orden numérico, activar/desactivar.
- **Ordeño** (`/milking`) — turno (Mañana/Tarde) + fecha, litros por vaca con coma decimal (es-AR),
  validación 0–100 L, guardado offline. Reingresar el mismo turno el mismo día **acumula** litros.
- **Despacho** (`/dispatch`) — fecha, turno (Mañana/Tarde/**Sin turno**) y litros totales.
- **Panel del dueño** (`/dashboard`) — totales del día, merma (L y %, en rojo cuando hay fuga),
  línea de los últimos 30 días (diferencia ordeñado − despachado), barras por turno y badge
  "Última sync".
- **Sync** — cola en IndexedDB; sube al recuperar la conexión (evento `online` + polling cada 30 s).
  El header muestra la cantidad de pendientes y un botón **Sincronizar ahora**.
- **PWA** — instalable y con cache para abrir sin señal.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind v4 + shadcn/ui · Dexie (IndexedDB) como base local ·
Supabase (Postgres + Auth + RLS) como base cloud · next-pwa (Workbox).

## Cómo correrlo

1. Requisitos: Node 20+ y npm.
2. `npm install`
3. `cp .env.local.template .env.local` y completar las claves: las tres de Supabase
   (→ *Project Settings → API*): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`; y `SETUP_TOKEN`, un secreto propio (por ejemplo
   `openssl rand -hex 32`) que habilita el alta del primer admin.
4. Aplicar `supabase/schema.sql` en el SQL Editor del proyecto: crea las tablas, las políticas RLS,
   los índices y el trigger que llena `public.profiles`.
5. Crear el **primer admin** desde `/setup?token=<SETUP_TOKEN>` con la app corriendo. El link se
   deshabilita solo cuando ya existe un admin. Desde ahí se crean los demás usuarios en `/register`
   (solo admin).
6. `npm run dev` → <http://localhost:3000>

Roles: `admin` (crea usuarios y ve el panel), `owner` (dueño, ve el panel), `capataz` (carga ordeño
y despacho).

Para probar el **Service Worker / PWA** hay que usar el build: `npm run build && npm run start`
(el SW se genera solo en build; en `dev` no existe).

## Deploy en Vercel

URL de producción: _pendiente de crear el proyecto en Vercel_.

1. Importar el repo en Vercel. Framework: **Next.js** (build y output por defecto).
2. Cargar estas variables en **Production** (y Preview si se usan previews):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side: nunca con prefijo `NEXT_PUBLIC_`)
   - `SETUP_TOKEN` (el mismo secreto local; `/setup` se autodeshabilita si ya existe un admin)
3. Deploy. La URL queda fija como `https://<proyecto>.vercel.app`.
4. Smoke test: abrir la URL por HTTPS, verificar `/manifest.json` e iconos 200, instalar la PWA
   desde el celular y navegar las 4 pestañas sin señal.
5. Alta de usuarios: con un admin ya existente, crear al capataz desde `/register`. En una base
   nueva, el primer admin se crea en `/setup?token=<SETUP_TOKEN>`.

Notas:
- El plan Hobby de Vercel no permite uso comercial; si el tambo es comercial, pasar a Pro o usar
  un VPS.
- Tras un deploy nuevo, la PWA puede necesitar una recarga online para tomar el `sw.js` actualizado.
- Checklist manual completo: `docs/verificacion-manual-v1.md`.

## Verificación

```bash
npm test        # unitarios (node:test)
npm run lint
npm run typecheck
npm run build
```

Pruebas end-to-end manuales (offline, sync, merma, PWA): `docs/verificacion-manual-v1.md`.

## Estado

V1 completa y V2 en curso (tareas #1–#7 del plan V2 cerradas): marca, roles, `/setup`, rediseño,
sync con backoff y Panel unificado. Pendiente el deploy a Vercel (#8) y la verificación E2E contra
producción (#9).

- Spec del producto: `spec.md`
- Plan de implementación V1: `docs/plans/2026-10-15-control-ordeño-venta.md`
- Plan V2: `docs/plans/2026-10-19-v2-cierre-rediseno-deploy.md`
- Checklist manual: `docs/verificacion-manual-v1.md`
