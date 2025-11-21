# Journalyst

This document describes the current broker-adapter architecture and how to run and configure the project.

**1) Broker implementations (how many & keys required)**
- Zerodha (Kite Connect)
  - adapter: `src/adapter/kiteConnect.ts` (uses `kiteconnect` package).
  - Required env variables: `API_KEY`, `API_SECRET_KEY` (place in `.env`).
  - Flow: user is redirected to Kite login, Kite calls back to the redirect URL with `request_token`, server exchanges it for `access_token` and saves the token for the user.

- Fyers
  - adapter: `src/adapter/fyersConnect.ts` (uses `fyers-api-v3`).
  - Required env variables (recommended): `FYERS_APP_ID`, `FYERS_SECRET_KEY`, `FYERS_REDIRECT_URI`.
  - Note: the repo currently contains hard-coded Fyers values in `src/services/fyers.services.ts` — move them to `.env` for security.

If you add another broker, create an adapter under `src/adapter` and a service under `src/services`, plus a normalizer entry.

**2) major files**
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



- Interactive Brokers (IB) 
  - Base mount (in `src/app.ts`): `app.use("/api/ib", iBrouter);`
  - `POST /api/ib/placeorder` — Place a dummy market order on the connected IB account.
    - Body: `{ "action": "BUY"|"SELL", "symbol": "TICKER", "quantity": 10 }`
    - Behavior: connects to IB gateway, requests a valid order id, places the order, waits for a Filled status, and returns order status.

  - `GET /api/ib/currentorders` — Fetch current open positions/orders for the connected account.
    - Body: none required (but you may include identifying info if you add auth later).
    - Behavior: connects to IB Gateway, requests positions, and returns them normalized to the app `Trade` shape.

  - `GET /api/ib/history` — Fetch historical executions (trade history) from IB.
    - Body: none required (the service uses an execution filter that can be customized).
    - Behavior: connects to IB Gateway, requests executions via `reqExecutions`, and returns normalized executed trades.

Notes on IB integration:
- The IB code uses the `@stoqey/ib` package and an adapter at `src/adapter/ibConnect` (see project for connection and credential handling).
- The IB services currently connect/disconnect per request and use events (`EventName.*`) to collect positions/executions; this is suitable for simple flows but consider connection pooling for production.
- The example uses a demo/dummy account (`account: "DUN983795"` is present in code) — replace with a configurable env var and secure storage before using a real account.


**5) Folder structure (current)**

```
.
├─ package.json
├─ nodemon.json
├─ .env (should be in .gitignore)
├─ src/
│  ├─ app.ts
│  ├─ global.d.ts
│  ├─ adapter/
│  │  ├─ kiteConnect.ts
│  │  ├─ fyersConnect.ts
│  │  └─ ibConnect.ts
│  ├─ routes/
│  │  ├─ ZerodhaRouter.ts
│  │  ├─ FyersRouter.ts
│  │  └─ IBRoutes.ts
│  ├─ services/
│  │  ├─ zerodha.services.ts
│  │  ├─ fyers.services.ts
│  │  └─ ib.services.ts
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

