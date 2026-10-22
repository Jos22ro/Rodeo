# Control de Ordeño y Venta

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

## Verificación

```bash
npm test        # unitarios (node:test)
npm run lint
npm run typecheck
npm run build
```

Pruebas end-to-end manuales (offline, sync, merma, PWA): `docs/verificacion-manual-v1.md`.

## Estado

V1 completa (tareas #1–#9 del plan). La tarea #10 es la verificación E2E manual, que necesita
navegador/dispositivo y el admin creado.

- Spec del producto: `spec.md`
- Plan de implementación: `docs/plans/2026-10-15-control-ordeño-venta.md`
- Checklist manual: `docs/verificacion-manual-v1.md`
