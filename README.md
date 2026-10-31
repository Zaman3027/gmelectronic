# Mondal Electronics

Monorepo for the **Mondal Electronics** repair-shop website — an electronic
repair business handling TVs, mobiles, washing machines, and any circuit-based
device.

Plain **npm workspaces** monorepo, **open-source packages only** (no Amazon /
Brazil tooling).

```
mondal-electronics/
├── AGENTS.md                 # guidance for AI coding agents
├── package.json              # workspace root
├── eslint.config.js
└── packages/
    ├── backend/              # Node.js + Express API (TypeScript, SQLite)
    └── frontend/             # React + Vite site (TypeScript)
```

## Prerequisites

- Node.js >= 18
- npm >= 9

## Getting started

```bash
# from the repo root
npm install

# copy backend env
cp packages/backend/.env.example packages/backend/.env

# run backend + frontend together
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:4000 (health check at `/api/health`)

The Vite dev server proxies `/api/*` to the backend, so the inquiry form works
end to end with no CORS setup in development.

## Scripts (root)

| Command                | Description                             |
|------------------------|-----------------------------------------|
| `npm run dev`          | Run backend + frontend in parallel      |
| `npm run dev:backend`  | Backend only                            |
| `npm run dev:frontend` | Frontend only                           |
| `npm run build`        | Production build (tsc + vite)           |
| `npm start`            | Run the backend in production           |
| `npm run typecheck`    | Type-check all workspaces               |
| `npm test`             | Run all unit + integration tests        |
| `npm run lint`         | Lint all workspaces                     |

## API

| Method | Path              | Description                       |
|--------|-------------------|-----------------------------------|
| GET    | `/api/health`     | Health check                      |
| POST   | `/api/inquiries`  | Create a repair inquiry           |
| GET    | `/api/inquiries`  | List inquiries (admin — add auth) |

Inquiry payload:

```json
{
  "name": "Jane Doe",
  "phone": "+880 1700-000000",
  "email": "jane@example.com",
  "deviceType": "Television",
  "message": "TV turns on but no picture."
}
```

## Tech stack

- **Frontend:** React 18, Vite, TypeScript, plain CSS
- **Backend:** Express 4, node-sqlite3-wasm, zod, cors, morgan (TypeScript)
- **Tooling:** npm workspaces, npm-run-all, tsx, ESLint (typescript-eslint)
- **Testing:** Vitest — backend via supertest, frontend via Testing Library + jsdom

## Testing

```bash
npm test                              # all packages
npm test --workspace @mondal/backend  # backend only
npm test --workspace @mondal/frontend # frontend only
```

- **Backend** (`packages/backend/test`): `schemas.test.ts` (zod unit),
  `db.test.ts` (data-layer unit, in-memory DB), `api.test.ts` (API integration
  via supertest).
- **Frontend** (`packages/frontend/test`): `api.test.ts` (fetch helper unit),
  `App.test.tsx` (component/integration — render, submit success, error state).

## Deployment

- **Frontend** — static build (`npm run build` → `packages/frontend/dist`);
  deploy to Cloudflare Pages, Netlify, or any static host.
- **Backend** — compiles to `packages/backend/dist` (`npm run build`), run with
  `node dist/index.js`. Runs on any Node 18+ host (Cloud Run, Oracle Always Free
  VM, Render). Mount a persistent volume for `packages/backend/data/`.

## License

MIT

## GitHub Pages

The `.github/workflows/deploy-pages.yml` workflow builds and publishes only the
frontend when changes are pushed to `main`. In the GitHub repository, select
Settings > Pages > Source > GitHub Actions. Relative asset URLs support both
repository Pages URLs and custom domains.

GitHub Pages cannot run the Express/SQLite backend. To enable online inquiries,
host the backend separately over HTTPS, set its CORS_ORIGIN to your Pages origin,
and add the GitHub Actions repository variable VITE_API_BASE_URL with the full
API base URL (for example https://api.example.com/api). Run the deployment again
after changing the variable. Without it, the production form explains that
online inquiries are unavailable; local development still uses the Vite proxy.
