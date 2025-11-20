# Journalyst

This README explains the environment variables, run commands, and the project path structure for the Journalyst project.

**Quick summary**
- Runtime: Node.js + TypeScript
- Dev runner: `nodemon` + `ts-node`
- Build: `tsc` -> `dist`
- Main entry (dev): `src/app.ts` (nodemon); production: `dist/app.js`

**Required .env variables**
Create a `.env` file in the project root with at least the following keys:

```
# Kite Connect credentials
API_KEY=your_kite_api_key_here
API_SECRET_KEY=your_kite_api_secret_here
```

Notes:
- Both `API_KEY` and `API_SECRET_KEY` are read by `src/adapter/kiteConnect.ts`.
- Put the `.env` file in the repository root (same level as `package.json`) so `dotenv.config()` in `src/app.ts` and other files will pick it up.
# Journalyst

This document describes the current broker-adapter architecture and how to run and configure the project.

**1) Broker implementations (how many & keys required)**
- Zerodha (Kite Connect)
  - SDK/adapter: `src/adapter/kiteConnect.ts` (uses `kiteconnect` package).
  - Required env variables: `API_KEY`, `API_SECRET_KEY` (place in `.env`).
  - Flow: user is redirected to Kite login, Kite calls back to the redirect URL with `request_token`, server exchanges it for `access_token` and saves the token for the user.

- Fyers
  - SDK/adapter: `src/adapter/fyersConnect.ts` (uses `fyers-api-v3`).
  - Required env variables (recommended): `FYERS_APP_ID`, `FYERS_SECRET_KEY`, `FYERS_REDIRECT_URI`.
  - Note: the repo currently contains hard-coded Fyers values in `src/services/fyers.services.ts` — move them to `.env` for security.

If you add another broker, create an adapter under `src/adapter` and a service under `src/services`, plus a normalizer entry.

**2) Modules / major files**
- `src/app.ts` — Express application entrypoint and server bootstrap.
- `src/adapter/` — Broker adapters (Kite, Fyers). They configure SDKs and export client instances or factories.
- `src/routes/` — Express routers per broker (`ZerodhaRouter.ts`, `FyersRouter.ts`).
- `src/services/` — Business logic for each broker (login, token exchange, sync trades, logout, etc.).
- `src/normalizer/` — Mapper functions that convert broker-specific trade/order payloads into the app's `Trade` shape.
- `src/utility/` — Utilities such as token store (`tokeStore.ts`) and other helpers.
- `src/types/` — TypeScript types and interfaces (e.g., `Trade`).

**3) Environment variable names (recommended)**
Create a `.env` in project root with at least:

```
# Kite (Zerodha)
API_KEY=your_kite_api_key
API_SECRET_KEY=your_kite_api_secret

# Fyers
FYERS_APP_ID=your_fyers_app_id
FYERS_SECRET_KEY=your_fyers_secret
FYERS_REDIRECT_URI=http://yourdomain.com/api/fyers/redirecturl

```

Notes:
- Move any currently hard-coded client ids/secrets into `.env` and add `.env` to `.gitignore`.
- Add a `.env.example` (without secrets) for developer onboarding.

**4) Routes (available endpoints)**
The project exposes a small set of broker-specific endpoints. Depending on whether you run the routers or the inline routes in `src/app.ts`, endpoints include:

- Zerodha (Kite) endpoints (see `src/routes/ZerodhaRouter.ts` / `src/services/zerodha.services.ts`):
  - `GET /api/zerodha/login` or `GET /login` — Redirects to Kite login URL.
  - `GET /api/zerodha/redirecturl` or `GET /redirecturl` — Kite callback; expects `request_token` query param.
  - `GET /api/zerodha/sync` or `GET /sync` — Sync trades. Expects JSON body: `{ "user_id": "<id>", "broker_name": "zerodha" }`.
  - `POST /api/zerodha/logout` or `POST /logout` — Logout a user. Expects `{ "user_id": "<id>" }`.

- Fyers endpoints (see `src/routes/FyersRouter.ts` / `src/services/fyers.services.ts`):
  - `GET /api/fyers/login` — Redirects to Fyers auth URL.
  - `GET /api/fyers/redirecturl` — Fyers callback; expects `auth_code` query param.
  - `GET /api/fyers/orders` — Get daily orders. Expects JSON body: `{ "user_id": "<id>", "broker_name": "fyers" }`.

Adjust the base path according to how you mount routers in `src/app.ts` (current `src/app.ts` may contain direct routes; prefer mounting routers under `/api/<broker>` for clarity).

**5) Folder structure (current)**

```
.
├─ package.json
├─ nodemon.json
├─ .env (should be in .gitignore)
├─ src/
│  ├─ app.ts
  │  ├─ adapter/
  │  │  ├─ kiteConnect.ts
  │  │  └─ fyersConnect.ts
  │  ├─ routes/
  │  │  ├─ ZerodhaRouter.ts
  │  │  └─ FyersRouter.ts
  │  ├─ services/
  │  │  ├─ zerodha.services.ts
  │  │  └─ fyers.services.ts
  │  ├─ normalizer/
  │  │  └─ TradeDataNormalize.ts
  │  ├─ utility/
  │  │  └─ tokeStore.ts
  │  └─ types/
  │     └─ Trade.ts
└─ dist/
```


**6) Available commands**
- `npm install` — install dependencies
- `npm run dev` — development mode using `nodemon` + `ts-node` (reads `nodemon.json`)
- `npm run build` — compile TypeScript to `dist/`
- `npm run start` — run compiled app (`node dist/app.js`)

Example dev run (PowerShell):

```powershell
npm install
# create .env file from .env.example and fill secrets
npm run dev
```

-------------------------------------------------

