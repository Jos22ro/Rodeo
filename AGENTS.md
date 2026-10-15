# AGENDA

## Stack & Commands
- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui (base-nova, lucide icons) + next-pwa.
- Package manager is **npm** (package-lock.json) — do not introduce yarn/pnpm/bun.
- Scripts: `npm run dev|build|start|lint|typecheck`. `lint` = ESLint, `typecheck` = `tsc --noEmit`.
- Full verification before finishing work: `npm run lint && npm run typecheck && npm run build`.
- No test suite exists; verify manually per the plan checklists in `docs/plans/`.
- Path alias `@/*` → repo root (see tsconfig `paths`). Add UI components with `npx shadcn-ui@latest add <name>`.

## Git Hooks
- Husky pre-commit runs lint-staged: `eslint --fix` + `prettier --write` on staged `*.{ts,tsx}` files only. Commits fail if a staged file has unfixable lint errors — fix them, don't bypass.

## Workflow
- This project is spec-driven: `spec.md` (root) defines the product, `docs/plans/*.md` holds the implementation plan. Read both before starting work.
- The pending plan (`docs/plans/2026-10-15-control-ordeño-venta.md`) is the active task list; mark tasks done there as you implement.
- Domain: offline-first dairy (leche) tracking — milking sheet (capataz, offline, Dexie), dispatch, reconciliation dashboard (owner), Supabase + RLS, roles `owner`/`capataz`.
- Supabase credentials live in `.env.local` (URL, anon key, service role key) — needed for any auth/sync/dashboard work.

## Notes
- The repo is currently a create-next-app scaffold; the plan above describes what gets built.
- Spec/plan comments are in Spanish; code and commit messages follow repo conventions (no comments in code).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
