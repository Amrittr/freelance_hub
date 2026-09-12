# FreelanceHub — Agent Context

Escrow-style freelance marketplace (Fiverr-like). A client funds an order from a
simulated wallet, the freelancer delivers, the client releases funds. **All money is a
demo ledger — there is no real payment gateway in this codebase.**

Read this file before editing. It records the conventions the code already follows and
the traps that are easy to trip over.

---

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node ≥ 20, **ES modules** (`"type": "module"` — use `import`, never `require`) |
| Server | Express 4.21 |
| Database | MongoDB + Mongoose 8 |
| Auth | bcryptjs + JSON Web Token in an httpOnly cookie named `fh_token`; Google One Tap via `google-auth-library` |
| Validation | zod 3 |
| Mail | nodemailer (optional — falls back to an in-memory log) |
| Frontend | **Vanilla JS, no framework, no build step.** One 2.8k-line `public/app.js`, one `public/index.html`, one 11.7k-line `public/styles.css`. Icons via bundled `lucide.min.js` |
| Deploy | `render.yaml` present; currently live on Railway |

There is no bundler, no TypeScript, no test framework. Do not introduce React, Vite,
Tailwind or a test runner unless explicitly asked — it would mean rewriting the whole
frontend.

## Run it

```bash
npm install
cp .env.example .env      # then fill MONGODB_URI and JWT_SECRET
npm run seed              # demo users + services (password: FreelanceHub123!)
npm run dev               # nodemon on http://localhost:3000
npm run check             # syntax-only check (node --check) on key files
```

`npm run check` is the only automated verification in the repo — run it after editing
any file it lists. The server deliberately **starts even when Mongo is unreachable**
(`src/server.js` catches the connect error); the UI then serves static pages only, so a
blank dashboard usually means no database, not a broken route.

Only `JWT_SECRET` is enforced, and only when `NODE_ENV=production` (`src/config/env.js`).

## Layout

```
src/
  server.js              boot: connect DB (non-fatal) → createApp → listen
  app.js                 middleware chain + route mounting + SPA catch-all
  config/
    env.js               every env var is read HERE and nowhere else
    db.js                mongoose.connect
  middleware/
    asyncHandler.js      wraps async handlers so rejections reach errorHandler
    auth.js              attachUser (decodes cookie → req.user), requireAuth, requireRole
    validate.js          zod → req.validated
    errorHandler.js      maps CastError / 11000 / ValidationError → status codes
  models/                User, Service, Order, Message, WalletTransaction
  routes/                auth, services, orders, onboarding, payments, dashboard
  services/
    tokens.js            signAuthToken, verifyAuthToken, authCookieOptions
    wallet.js            getWalletSnapshot, roundMoney
    mailer.js            sendWelcomeEmail, sendLoginEmail, sendOrderEmail, sendPaymentReceiptEmail
    profileAssistant.js  optional OpenAI call with a deterministic template fallback
  seed.js                demo sellers, services, orders, wallet history
public/
  index.html             all four app "pages" live in one document
  app.js                 state object + render functions + fake payment gateway
  styles.css             theme variables, light/dark, bento layout
```

## Data models

- **User** — `roles[]` (`client` | `freelancer` | `admin`) *and* a separate `activeRole`
  that drives which dashboard renders. A user can hold both roles and switch.
  `passwordHash` is `select: false` — you must `.select("+passwordHash")` to read it
  (see `routes/auth.js` login). `toPublicJSON()` is the only shape sent to the client;
  add new public fields there or they will silently not reach the frontend.
- **Service** — seller, `category` enum (`design`, `tech`, `marketing`, `video`,
  `writing`, `business`, `ai`), price, `deliveryDays`, `status`
  (`draft`/`active`/`paused`/`archived`). Has a compound **text index** on
  title/description/tags/category — search uses `$text`, so partial words will not match.
- **Order** — the centre of the app. Holds both parties, money split, and an embedded
  `events[]` audit trail appended via `order.addEvent(type, message, actor)`.
- **Message** — per-order chat, `readAt` null means unread.
- **WalletTransaction** — append-only ledger: `direction` `credit`/`debit`,
  `status` `pending`/`succeeded`/`failed`/`cancelled`.

## Order state machine

```
payment_pending ──(checkout, wallet debited)──▶ funded
   funded / in_progress / revision_requested ──(freelancer submits)──▶ submitted
   submitted ──(client requests revision)──▶ revision_requested
   submitted / disputed ──(client releases)──▶ completed   [freelancer credited]
   funded / in_progress / submitted / revision_requested ──(either party)──▶ disputed
   cancelled, refunded  — declared in the enum, no route reaches them yet
```

Every transition route calls, in this order: `loadParticipantOrder(id, userId)` →
`assertClient` / `assertFreelancer` → `assertStatus(order, [allowed])`. **Keep that
pattern for any new transition** — it is what stops a stranger, or the wrong party,
from moving someone else's order. `loadParticipantOrder` filters by
`$or: [{client}, {freelancer}]`, so a non-participant gets a 404, never a leak.

## Money rules

- Balance is **never stored**. It is derived every time by
  `getWalletSnapshot()`, which aggregates `Σ succeeded credits − Σ succeeded debits`.
  Never add a `balance` field to `User`.
- Platform keeps `PLATFORM_FEE_PERCENT` (default 12). At checkout:
  `platformFee = amount × pct/100`, `freelancerAmount = amount − platformFee`.
- Pass every computed amount through `roundMoney()` (2-decimal rounding). Note there
  are currently **two copies** of `roundMoney` — `services/wallet.js` and a private one
  at the bottom of `routes/orders.js`. If you touch them, consolidate to the wallet one.
- Currency is hardcoded `"INR"` throughout; frontend formats with
  `Intl.NumberFormat("en-IN")`.

## Backend conventions — follow these

1. **Every async route handler is wrapped in `asyncHandler`.** Without it a rejected
   promise crashes the process instead of returning JSON.
2. **Validate with zod through `validate(schema)`**, where the schema is an object of
   `{ body, query, params }`. Read the result from `req.validated`, *not* `req.body` —
   `req.validated` carries the coerced and trimmed values.
3. **Errors are plain `Error` objects with a `.statusCode`**, thrown, not
   `res.status(...).json(...)`:
   ```js
   const error = new Error("Service not found.");
   error.statusCode = 404;
   throw error;
   ```
   `errorHandler` turns that into `{ error: { message } }`. It hides 500 messages in
   production, so never rely on a 500 body to explain anything to the user.
4. **New env vars go in `config/env.js` and `.env.example`.** Do not read
   `process.env` anywhere else.
5. **Mail must never break a request.** All senders no-op with a console warning when
   SMTP is unconfigured. Keep `await`ing them inside `Promise.all` as the existing
   routes do, and keep them non-throwing.
6. Response shapes are bare objects the frontend destructures directly —
   `{ user }`, `{ orders }`, `{ services }`, `{ order, messages }`, `{ wallet }`.
   Changing a key breaks `public/app.js` silently.

## API surface

```
GET    /api/health
GET    /api/auth/config            → { googleClientId }
POST   /api/auth/signup | login | google | logout
GET    /api/auth/me
PATCH  /api/auth/role              switch activeRole
PATCH  /api/auth/roles             add a role
GET    /api/services               ?q=&category=&sort=recommended|price|fast
GET    /api/services/mine          freelancer
POST   /api/services               freelancer
PATCH  /api/services/:id/status    freelancer
GET    /api/orders/mine | /api/orders/:id
POST   /api/orders/checkout
POST   /api/orders/:id/submit | revision | dispute | release | messages
POST   /api/onboarding/role | profile-assist | complete
GET    /api/payments/wallet
POST   /api/payments/wallet/top-up
GET    /api/payments/connect/status        stub — always returns connected
POST   /api/payments/connect/onboard       stub — returns { demo: true }
GET    /api/dashboard/             everything the dashboard renders, per activeRole
```

Rate limit is 500 requests / 15 min across all of `/api`.

## Frontend structure

- One global `state` object (user, category, query, sort, dashboard, wallet, appPage,
  notifications…). Mutate `state`, then call the matching `render*` function. There is
  no reactivity — **nothing redraws unless you call the renderer.**
- All DOM lookups are cached once in the `selectors` object at the top. Add new
  elements there rather than calling `querySelector` inline.
- `api(path, options)` wraps fetch with `credentials: "include"` and unwraps
  `error.message`. Use it for every backend call.
- Navigation is not a router: `openAppPage(page)` toggles `[data-app-page]` sections.
  Only four exist — `overview`, `marketplace`, `finance`, `gateway`.
- Interpolating user text into HTML? Use `escapeHtml()` / `safeToken()`, already
  defined. The render functions build HTML strings, so an unescaped field is an XSS.
- After injecting markup containing icons, call `refreshIcons()` or lucide will not
  paint them.
- Charts (`drawInteractiveLineChart`, `drawInteractiveBudgetChart`) are hand-written
  canvas drawing, not a chart library.
- The payment gateway page (Luhn validation, card-network detection, 3D flip, UPI
  timer, saved cards in `localStorage`, jsPDF receipt) is **pure theatre**. It ends by
  calling the real `/api/payments/wallet/top-up` or `/api/orders/checkout`. No card
  data leaves the browser or is meant to be real.

## Known issues / traps

1. **`README.md` is stale and describes software that does not exist here** — Cashfree
   hosted checkout, signed webhooks, Easy Split payouts. The code has a demo ledger
   only; `paymentProvider` is an enum whose single value is `"demo"`. Fix the README
   rather than trusting it.
2. **Unverified Google token in development** — `routes/auth.js` (~line 126): if
   `verifyIdToken` fails and `NODE_ENV !== "production"`, it base64-decodes the JWT
   payload and trusts `sub`/`email` without checking the signature. Anyone could forge
   a login. Harmless locally, critical if a deploy ever runs without `NODE_ENV` set.
3. **Fabricated dashboard metrics** — `routes/dashboard.js`: `deliveryRate: 98.5`,
   `responseRate: 99.2`, `securityIndex: 100`, and `serviceImpressions` uses
   `Math.random()`. `buildFinance()` also injects a hardcoded six-month trend when the
   user has no transactions. Presentation-only; remove or label before claiming these
   are real figures.
4. **Ghost field `stripeOnboardingComplete`** is `.populate()`-ed in `routes/orders.js`
   and `routes/services.js` but does not exist on the `User` schema — a leftover from a
   removed Stripe integration. Always `undefined`.
5. **`buildFinance` has a no-op branch**: both arms of the `outgoing` ternary return
   `wallet.debits`.
6. **Line endings** — the repo is stored LF. Opening on Windows can rewrite everything
   to CRLF and produce a diff touching all 39 files with equal insertions and
   deletions. That is not a real change; `git checkout -- .` clears it. Consider adding
   a `.gitattributes` with `* text=auto eol=lf`.
7. `orderSchema.status` allows `cancelled` and `refunded` but nothing sets them — a
   cancellation flow is genuinely missing, not hidden somewhere.
8. `autoIndex` is off in production, so a newly added index will not build on the live
   database by itself.

## Adding a feature — the path of least surprise

**A new endpoint:** define a zod schema at the top of the route file → add the handler
with `requireAuth` (+ `requireRole` if needed), `validate(schema)`, `asyncHandler` →
throw errors with `.statusCode` → return a bare object → if the frontend needs it, add
an `api()` call and a `render*` function, and register any new element in `selectors`.

**A new order transition:** add the status to the `Order` enum → new route following
`loadParticipantOrder` → `assert*` party → `assertStatus` → set fields → `addEvent` →
`save` → notify by mail → surface it in `renderOrderActions` and
`getOrderStatusBadge` in `public/app.js`.

**A new model field:** add to the schema → if the browser must see it, add it to
`toPublicJSON()` (User) or to the relevant `.populate()` projection string → then to
the renderer.
