# FreelanceHub Backend — Complete Technical Reference

---

## Environment Variables (`src/config/env.js`)

```env
NODE_ENV=development/production
PORT=3000
APP_URL=http://localhost:3000
MONGODB_URI=mongodb://...
JWT_SECRET=secret
JWT_EXPIRES_IN=7d
PLATFORM_FEE_PERCENT=12
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-reply@freelancehub.local
SMTP_PASS=app_password
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
OPENAI_API_KEY=sk-...
```

`assertRuntimeConfig()` — only `JWT_SECRET` is required in production. Everything else has defaults or is optional.

---

## Server (`src/server.js`)

```javascript
import http from "node:http";

async function start() {
  await connectDatabase();           // try MongoDB, graceful fail
  const app = createApp();           // build Express app
  const server = http.createServer(app);
  server.listen(PORT);
}
```

- Uses `node:http` (not Express listen directly)
- Graceful MongoDB failure — server still starts, frontend loads
- If no DB: features return empty data, no crash

---

## Express App (`src/app.js`) — Full Middleware Pipeline

```
Request
  ↓
Helmet — security headers (CSP allowing unpkg, googleapis, googleusercontent)
  ↓
Compression — gzip responses
  ↓
Morgan — HTTP logging (dev/combined)
  ↓
CORS — credentials: true, origin from env
  ↓
express.json({ limit: "1mb" }) — parse JSON body
  ↓
express.urlencoded({ extended: true }) — parse form data
  ↓
cookieParser() — read cookies into req.cookies
  ↓
rateLimit({ windowMs: 15*60*1000, max: 500 }) — 500 req / 15 min on /api
  ↓
attachUser — read fh_token cookie, verify JWT, set req.user or null
  ↓
Route Handler (auth / services / orders / payments / dashboard / onboarding)
  ↓
Response
```

**Static files:** Express serves `public/` folder with 1-day cache in production.
**Catch-all:** `GET *` serves `index.html` (SPA fallback).
**Error handler:** centralized at the end.

---

## Middleware — Detailed

### `attachUser` (`src/middleware/auth.js`)
```javascript
async function attachUser(req, res, next) {
  const token = req.cookies?.fh_token;
  if (!token) { req.user = null; return next(); }
  try {
    const decoded = verifyAuthToken(token);
    req.user = await User.findById(decoded.sub);
  } catch { req.user = null; }
  next();
}
```
- Runs on EVERY request
- Reads `fh_token` cookie
- Decodes JWT, extracts `sub` (user ID)
- Fetches full user document from MongoDB
- If token missing/expired/invalid → `req.user = null` (no error thrown)

### `requireAuth` (`src/middleware/auth.js`)
```javascript
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  next();
}
```

### `requireRole(...roles)` (`src/middleware/auth.js`)
```javascript
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.some(r => req.user.roles.includes(r)))
      return res.status(403).json({ error: "Insufficient permissions" });
    next();
  };
}
```
Used on freelancer-only routes like service creation.

### `validate(schema)` (`src/middleware/validate.js`)
```javascript
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success)
      return res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    req.validated = result.data;
    next();
  };
}
```
- Uses Zod schemas
- Validates body, query, params
- Returns 400 with specific field-level error messages on failure
- Sets `req.validated` on success

### `asyncHandler` (`src/middleware/asyncHandler.js`)
```javascript
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```
Wraps all route handlers so async errors get passed to the error handler.

### Error Handler (`src/middleware/errorHandler.js`)
```javascript
function errorHandler(err, req, res, next) {
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID" });
  if (err.code === 11000) return res.status(409).json({ error: "Duplicate field" });
  if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Server error" + (isDev ? ": " + err.message : "") });
}
```

---

## Database — All 5 Models

### User (`src/models/User.js`)

| Field | Type | Details |
|-------|------|---------|
| name | String | Required, 2-80 chars |
| email | String | Required, unique, lowercase, indexed |
| passwordHash | String | `select: false` — never returned in queries |
| googleId | String | Unique, sparse (optional) |
| avatar | String | URL from Google or default |
| roles | [String] | Enum: client, freelancer, admin |
| activeRole | String | Current active perspective |
| profile | Object | { headline, bio, skills[], country, specialty, experienceLevel, availability, targetClient } |
| onboarding | Object | { roleChoiceComplete, clientComplete, freelancerComplete } |
| lastLoginAt | Date | Updated on login |

**Method:** `toPublicJSON()` — returns user without passwordHash.

### Service (`src/models/Service.js`)

| Field | Type | Details |
|-------|------|---------|
| seller | ObjectId (ref: User) | Required, indexed |
| title | String | 12-140 chars |
| category | String | Enum: design, tech, marketing, video, writing, business, ai |
| description | String | 40-1600 chars |
| price | Number | 5-50000 |
| deliveryDays | Number | 1-90 |
| revisions | Number | 0-20, default 1 |
| status | String | draft, active, paused, archived |
| ratingAverage | Number | 0-5 |
| ratingCount | Number | |

**Index:** Text index on title, description, tags, category (for search).

### Order (`src/models/Order.js`)

| Field | Type | Details |
|-------|------|---------|
| client | ObjectId (ref: User) | Required, indexed |
| freelancer | ObjectId (ref: User) | Required, indexed |
| service | ObjectId (ref: Service) | Required |
| title | String | Copied from service at checkout |
| status | String | **State machine →** see below |
| amount | Number | Order value |
| platformFee | Number | 12% of amount |
| freelancerAmount | Number | amount - platformFee |
| dueAt | Date | Calculated from delivery days |
| events | [OrderEvent] | Embedded sub-document — { type, message, actor, at } |

**Order Status State Machine:**
```
payment_pending → funded → in_progress → submitted → revision_requested → submitted (loop)
                                                                    ↓
                                                              completed / disputed / cancelled / refunded
```

**Method:** `addEvent(type, message, actor)` — pushes to events array with timestamp.

### Message (`src/models/Message.js`)

| Field | Type | Details |
|-------|------|---------|
| order | ObjectId (ref: Order) | Required, indexed |
| sender | ObjectId (ref: User) | Required |
| recipient | ObjectId (ref: User) | Required |
| body | String | Required, max 5000 |
| readAt | Date | Null until read |

### WalletTransaction (`src/models/WalletTransaction.js`)

| Field | Type | Details |
|-------|------|---------|
| user | ObjectId (ref: User) | Required, indexed |
| type | String | Enum: top_up, purchase, refund, adjustment |
| direction | String | Enum: credit, debit |
| amount | Number | Min 1 |
| status | String | pending, succeeded, failed, cancelled |
| description | String | Max 240 |

---

## API Endpoints — Complete List

### Auth — `/api/auth`

| Method | Path | Auth | Body | Response | What It Does |
|--------|------|------|------|----------|-------------|
| POST | `/signup` | No | `{ name, email, password, role }` | `{ user }` + Set-Cookie | Creates account, hashes password (bcrypt 12 rounds), signs JWT, sets httpOnly cookie |
| POST | `/login` | No | `{ email, password }` | `{ user }` + Set-Cookie | Finds user, compares bcrypt hash, signs JWT, sets cookie |
| POST | `/google` | No | `{ credential }` | `{ user }` + Set-Cookie | Verifies Google token, creates/links user, signs JWT |
| POST | `/logout` | No | — | `{ ok: true }` | Clears fh_token cookie |
| GET | `/me` | Required | — | `{ user }` | Returns full user document using `toPublicJSON()` |
| PATCH | `/role` | Required | `{ role }` | `{ user }` | Switches activeRole |
| PATCH | `/roles` | Required | `{ role }` | `{ user }` | Adds new role to user account |

### Services — `/api/services`

| Method | Path | Auth | Params/Body | Response | What It Does |
|--------|------|------|-------------|----------|-------------|
| GET | `/` | No | `?q=&category=&sort=` | `{ services[] }` | Lists active services. `q` searches text index. `category` filters. `sort` = recommended/24h/budget |
| GET | `/mine` | Freelancer | — | `{ services[] }` | Lists seller's own services (any status) |
| POST | `/` | Freelancer | `{ title, category, description, price, deliveryDays, ... }` | `{ service }` | Creates new service, Zod validates |
| PATCH | `/:id/status` | Freelancer | `{ status }` | `{ service }` | Updates service status (active/paused/archived) |

### Orders — `/api/orders`

| Method | Path | Auth | Body | Response | What It Does |
|--------|------|------|------|----------|-------------|
| GET | `/mine` | Required | — | `{ orders[] }` | Lists orders filtered by activeRole (client sees orders they placed, freelancer sees their orders) |
| GET | `/:id` | Required | — | `{ order, messages[] }` | Single order with all messages |
| POST | `/checkout` | Client | `{ serviceId, requirements }` | `{ order }` | Validates wallet balance, creates Order (status: funded), creates WalletTransaction (debit: amount), calculates 12% fee |
| POST | `/:id/submit` | Freelancer | `{ deliveryNotes }` | `{ order }` | Status → submitted, adds event, sends email |
| POST | `/:id/revision` | Client | `{ message }` | `{ order }` | Status → revision_requested, adds event |
| POST | `/:id/dispute` | Required | `{ reason }` | `{ order }` | Status → disputed, adds event |
| POST | `/:id/release` | Client | — | `{ order }` | Status → completed, adds event, sends email. Freelancer credited via WalletTransaction |
| POST | `/:id/messages` | Required | `{ body }` | `{ message }` | Creates Message document, sends email notification |

### Payments — `/api/payments`

| Method | Path | Auth | Body | Response | What It Does |
|--------|------|------|------|----------|-------------|
| GET | `/wallet` | Required | — | `{ balance, transactions[] }` | Aggregates WalletTransaction: sum(credits) - sum(debits) = balance |
| POST | `/wallet/top-up` | Required | `{ amount }` | `{ transaction }` | Creates WalletTransaction (credit, succeeded). Demo only — no real payment |
| POST | `/connect/onboard` | Freelancer | — | `{ ok }` | Demo payout setup (mock) |
| GET | `/connect/status` | Freelancer | — | `{ connected }` | Demo payout status (mock) |

### Dashboard — `/api/dashboard`

| Method | Path | Auth | Response | What It Does |
|--------|------|------|----------|-------------|
| GET | `/` | Required | `{ stats, orders[], services[], journey[], finance[], emailLog[], activity[] }` | Aggregates everything: wallet balance, order counts, service count, 6-month finance history, recent activity timeline, recent orders, email logs, next-step journey items |

### Onboarding — `/api/onboarding`

| Method | Path | Auth | Body | Response | What It Does |
|--------|------|------|------|----------|-------------|
| POST | `/role` | Required | `{ role, clientFocus? }` | `{ user }` | Saves role choice, marks roleChoiceComplete |
| POST | `/profile-assist` | Freelancer | `{ specialty, skills, experience }` | `{ headline, bio, skills[], source }` | If OpenAI key configured: calls GPT-5.6 for AI-generated profile. Fallback: guided template |
| POST | `/complete` | Required | `{ profileData }` | `{ user }` | Saves full profile, marks onboarding complete |

### Health

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/health` | `{ status: "ok", timestamp, uptime }` |

---

## JWT Token Flow

```javascript
// Signing (tokens.js)
function signAuthToken(user) {
  return jwt.sign(
    { sub: user._id, roles: user.roles },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }  // default 7d
  );
}

// Cookie options (tokens.js)
function authCookieOptions() {
  return {
    httpOnly: true,          // Not accessible via JavaScript
    secure: isProduction,    // HTTPS only in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    path: "/",
  };
}
```

**Why httpOnly?** Prevents XSS attacks. The cookie is automatically sent by the browser with every request, but JavaScript in the browser cannot read or modify it.

---

## Wallet Balance Calculation (`src/services/wallet.js`)

```javascript
async function getWalletSnapshot(userId) {
  const result = await WalletTransaction.aggregate([
    { $match: { user: userId, status: "succeeded" } },
    { $group: {
        _id: null,
        credits: { $sum: { $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0] } },
        debits:  { $sum: { $cond: [{ $eq: ["$direction", "debit"] },  "$amount", 0] } },
    }},
  ]);
  const balance = (result[0]?.credits || 0) - (result[0]?.debits || 0);
  return { balance, credits, debits };
}
```

Uses MongoDB aggregation pipeline — sum all credits minus all debits for succeeded transactions.

---

## Email Service (`src/services/mailer.js`)

```javascript
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});
```

**Emails sent:**
- `sendWelcomeEmail(user)` — on signup
- `sendLoginEmail(user)` — on login
- `sendOrderEmail({ user, subject, title, message })` — on order events (funded, submitted, completed, disputed)

**In-memory email log:** Last 50 emails stored in an array for demo viewing in dashboard. Server gracefully skips email if SMTP not configured.

---

## Profile Assistant (`src/services/profileAssistant.js`)

```javascript
async function createProfileDraft(input) {
  if (OPENAI_API_KEY) {
    // Call GPT-5.6 with prompt engineering
    // Returns: { headline, bio, skills[], serviceTitle, serviceDescription }
  } else {
    // Fallback: guided template-based draft
  }
}
```

---

## CORS Configuration

```javascript
app.use(cors({
  origin: CLIENT_URL || APP_URL,
  credentials: true,
}));
```

Allows cross-origin requests with cookies from the frontend domain.

---

## Helmet CSP

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "https://unpkg.com", "https://accounts.google.com"],
      imgSrc: ["'self'", "https://*.googleusercontent.com"],
      // ... more directives
    },
  },
}));
```

Allows Lucide icons (unpkg), Google OAuth (accounts.google.com), and Google avatars (googleusercontent.com).

---

## Rate Limiting

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 500,                    // 500 requests
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);
```

Applies to all `/api` routes. Returns 429 if exceeded.

---

## Seed Script (`src/seed.js`)

Creates demo data with:
- **18 freelancers** with services across all 7 categories
- **4 client accounts** with wallet credits (₹15k–₹80k)
- **25+ orders** in various statuses
- **2 named accounts:** Ashish Shankar (freelancer), Tony Stark (client) — both with orders, messages, wallet history
- All use password: `FreelanceHub123!`
- 6 months of financial history with realistic transactions

Run with: `node src/seed.js`

---

## Deployment

- **Host:** Railway
- **Start:** `node src/server.js`
- **DB:** MongoDB Atlas (cloud)
- **GitHub:** `github.com/Ashishshankar26/FreelanceHub`
- **URL:** `freelancehub-production-e237.up.railway.app`
