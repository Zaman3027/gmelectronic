# AGENTS.md

Guidance for AI coding agents working in the **Mondal Electronics** monorepo.

## Project overview

Mondal Electronics is an electronic repair shop (TVs, mobiles, washing machines,
and any circuit-based device). This repo hosts the marketing site plus an
inquiry-intake backend.

- **`packages/frontend`** — React + Vite single-page site (hero, services,
  contact, and an inquiry form).
- **`packages/backend`** — Node.js + Express REST API that validates and stores
  customer inquiries in a SQLite database.

This is a plain **npm workspaces** monorepo. It uses **only open-source npm
packages** — no Amazon/Brazil tooling, no internal registries.

## Tech stack

| Area      | Choice                                            |
|-----------|---------------------------------------------------|
| Language  | TypeScript (ESM)                                  |
| Frontend  | React 18, Vite, TypeScript, plain CSS             |
| Backend   | Express 4, node-sqlite3-wasm, zod, cors, morgan (TS) |
| Runtime   | tsx (dev), tsc (build)                            |
| Testing   | Vitest — backend (supertest), frontend (Testing Library + jsdom) |
| Tooling   | npm workspaces, npm-run-all, ESLint (typescript-eslint) |
| Node      | >= 18                                             |

## Setup & common commands

Run all commands from the repo root unless noted.

```bash
npm install              # install every workspace
npm run dev              # run backend + frontend together (dev)
npm run dev:backend      # backend only  (http://localhost:4000)
npm run dev:frontend     # frontend only (http://localhost:5173)
npm run build            # production build (tsc + vite) of all workspaces
npm start                # run the backend in production mode (node dist)
npm run typecheck        # type-check all workspaces (tsc --noEmit)
npm test                 # run all unit + integration tests (Vitest)
npm run lint             # lint all workspaces
```

The frontend dev server proxies `/api/*` to the backend (see
`packages/frontend/vite.config.js`), so no CORS config is needed in dev.

## API contract

- `GET  /api/health` → `{ status: "ok" }`
- `POST /api/inquiries` → create an inquiry.
  Body (JSON):
  ```json
  {
    "name": "string (required)",
    "phone": "string (required)",
    "email": "string (optional, valid email)",
    "deviceType": "Television | Mobile | Washing Machine | Laptop | Other",
    "message": "string (required)"
  }
  ```
  Returns `201` with the created record, or `400` with validation errors.
- `GET  /api/inquiries` → list inquiries (newest first). Intended for an admin
  view; add auth before exposing publicly.

Validation lives in `packages/backend/src/schemas.ts` (zod). Keep the frontend
form fields and the zod schema in sync when either changes.

## Conventions for agents

- **Open-source only.** Do not add Amazon-internal packages, Brazil configs, or
  private registries. Install with `npm i <pkg> --workspace @mondal/<name>`.
- **TypeScript + ESM everywhere.** Use `import`/`export`. In backend relative
  imports use the `.js` extension (NodeNext resolution compiles `.ts` → `.js`).
- **Keep types in sync with the contract.** `InquiryInput` (backend zod infer)
  and `InquiryPayload` (frontend) describe the same shape — update both, the DB
  migration, the React form, and this file together.
- **No secrets in code.** Use `.env` (see `packages/backend/.env.example`).
- **Verify before finishing.** Run `npm run lint` and start the backend
  (`npm run dev:backend`) + hit `/api/health` after changes.

## Deployment notes

- Frontend is a static build (`packages/frontend/dist`) — deploy to Cloudflare
  Pages, Netlify, or any static host.
- Backend compiles to `packages/backend/dist` (`npm run build`); run with
  `node dist/index.js`. Runs anywhere Node 18+ runs (Cloud Run, Oracle Always
  Free VM, Render). SQLite file lives at `packages/backend/data/inquiries.db`;
  mount a persistent volume in production.
