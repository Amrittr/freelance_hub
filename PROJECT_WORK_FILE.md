# FreelanceHub — Project Documentation

## Overview

FreelanceHub is a full-stack escrow-based freelance marketplace web application. It connects **clients** who need work done with **freelancers** who provide services, using an escrow payment model where funds are held securely and released only after work is approved.

The project is built on the **MERN stack** (MongoDB, Express, React-style frontend, Node.js) with a vanilla JavaScript frontend following SPA (Single Page Application) patterns.

---

## 1. Technology Stack

### Core MERN Stack Components

| Component | Technology | Version | What It Does |
|-----------|-----------|---------|--------------|
| **M**ongoDB | MongoDB Atlas + Mongoose | 8.9.2 | Database — stores users, services, orders, messages, wallet transactions |
| **E**xpress | Express.js | 4.21.2 | Backend web framework — handles API routing, middleware, request/response |
| **R**eact-style (Vanilla JS SPA) | Vanilla JavaScript (ES6+) | — | Frontend — renders UI, manages state, handles user interactions (no framework, but follows component-like patterns with template literals) |
| **N**ode.js | Node.js | >=20.0.0 | Runtime — runs the server, connects to DB, serves the app |

### Additional Backend Libraries

| Library | Purpose |
|---------|---------|
| **bcryptjs** | Password hashing (12 rounds salting) |
| **jsonwebtoken** | JWT token generation and verification |
| **cookie-parser** | Read/write httpOnly cookies for auth sessions |
| **helmet** | Security headers (CSP, XSS protection, etc.) |
| **cors** | Cross-Origin Resource Sharing configuration |
| **express-rate-limit** | API rate limiting (500 requests/15 min) |
| **zod** | Request body validation with schemas |
| **google-auth-library** | Verify Google OAuth tokens |
| **nodemailer** | SMTP email sending (welcome, login, order notifications) |
| **compression** | Gzip compression for responses |
| **morgan** | HTTP request logging |
| **dotenv** | Environment variable loading from `.env` |
| **nodemon** (dev) | Auto-restart server on file changes |

### Frontend Technologies

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Page structure (single HTML file with all sections) |
| **CSS3** | Styling with custom properties, light/dark theme, responsive design |
| **Vanilla JavaScript (ES6+)** | All UI logic: rendering, state management, API calls, event handling |
| **Lucide Icons** (CDN) | SVG icon set for all UI icons |
| **Google Identity Services** (CDN) | "Sign in with Google" button |
| **Canvas 2D API** | Drawing finance charts (line chart, pie chart) — no chart library |

### Deployment

- **Railway** (production hosting)
- MongoDB Atlas (database hosting)
- SMTP (Gmail app password) for emails

---

## 2. Project Structure

```
FreelanceHub/
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (gitignored)
├── render.yaml               # Railway deployment config
├── public/                   # FRONTEND (served as static files)
│   ├── index.html            # Single HTML page with all sections
│   ├── styles.css            # Complete styling with themes
│   ├── app.js                # All frontend logic (2227 lines)
│   └── assets/               # SVG images
└── src/                      # BACKEND (Node.js + Express)
    ├── server.js             # Entry point — starts server
    ├── app.js                # Express app setup (middleware, routes)
    ├── seed.js               # Demo data generator
    ├── config/
    │   ├── env.js            # Environment variable loading & validation
    │   └── db.js             # MongoDB connection
    ├── middleware/
    │   ├── auth.js           # attachUser, requireAuth, requireRole
    │   ├── validate.js       # Zod request validation
    │   ├── errorHandler.js   # Centralized error handling
    │   └── asyncHandler.js   # Async error wrapper
    ├── models/
    │   ├── User.js           # User schema
    │   ├── Service.js        # Service listing schema
    │   ├── Order.js          # Order with lifecycle & events
    │   ├── Message.js        # Order messaging schema
    │   └── WalletTransaction.js  # Financial transaction schema
    ├── routes/
    │   ├── auth.js           # /api/auth — signup, login, google, logout, me, role
    │   ├── services.js       # /api/services — CRUD for service listings
    │   ├── orders.js         # /api/orders — checkout, submit, release, dispute, messages
    │   ├── payments.js       # /api/payments — wallet, top-up
    │   ├── dashboard.js      # /api/dashboard — aggregated dashboard data
    │   └── onboarding.js     # /api/onboarding — role choice & profile setup
    └── services/
        ├── tokens.js         # JWT sign/verify/cookie helpers
        ├── mailer.js         # Email sending with demo log
        ├── wallet.js         # Wallet balance calculation
        └── profileAssistant.js  # AI/guided profile draft generator
```

---

## 3. MERN Implementation — How Each Component Works

### M — MongoDB (Database Layer)

**Where:** `src/models/`, `src/config/db.js`

MongoDB is our database. We use **Mongoose** (an ODM — Object Document Mapper) to define schemas and interact with the database.

**What we store:**

| Collection (Model) | Purpose | Key Fields |
|-------------------|---------|-----------|
| **User** | All user accounts | name, email, passwordHash, googleId, roles[], activeRole, profile (headline, bio, skills, etc.), onboarding status |
| **Service** | Freelancer service listings | seller (ref User), title, category, description, price, deliveryDays, revisions, ratingAverage |
| **Order** | Order lifecycle | client + freelancer (ref User), service, status (payment_pending → funded → in_progress → submitted → revision_requested → completed/disputed), amount, platformFee, events[] |
| **Message** | Order messaging | order (ref Order), sender, recipient, body, readAt |
| **WalletTransaction** | Financial ledger | user, type (top_up/purchase/refund), direction (credit/debit), amount, status |

**How we connect:** `src/config/db.js` connects via `mongoose.connect(MONGODB_URI)`. The server starts even if MongoDB is unavailable (graceful fallback) — features degrade but the frontend still loads.

**NoSQL pattern used:** Embedded sub-documents (Order.events[]) and referenced documents (User refs in Order, Service, Message).

---

### E — Express (Backend API Layer)

**Where:** `src/app.js`, `src/routes/`, `src/middleware/`

Express handles all HTTP requests and serves as the API gateway between the frontend and database.

**Request Lifecycle:**

```
Request → Helmet (security) → Compression → Morgan (logging) → CORS → 
JSON Parser → Cookie Parser → Rate Limiter → attachUser (JWT check) → 
Route Handler → Response
```

**API Endpoints (all routes):**

| Route Group | Prefix | Auth Required | Purpose |
|-------------|--------|--------------|---------|
| Auth | `POST /api/auth/signup` | No | Create account with name, email, password |
| Auth | `POST /api/auth/login` | No | Login with email + password → sets JWT cookie |
| Auth | `POST /api/auth/google` | No | Google OAuth → creates/links account → sets JWT cookie |
| Auth | `POST /api/auth/logout` | No | Clear JWT cookie |
| Auth | `GET /api/auth/me` | Yes | Get current user profile |
| Auth | `PATCH /api/auth/role` | Yes | Switch active role (client/freelancer) |
| Services | `GET /api/services` | No | List active services (search, filter, sort) |
| Services | `GET /api/services/mine` | Freelancer | List seller's own services |
| Services | `POST /api/services` | Freelancer | Create new service listing |
| Orders | `GET /api/orders/mine` | Yes | List user's orders (filtered by role) |
| Orders | `POST /api/orders/checkout` | Client | Create order (deducts wallet) |
| Orders | `POST /api/orders/:id/submit` | Freelancer | Submit work for review |
| Orders | `POST /api/orders/:id/revision` | Client | Request revision |
| Orders | `POST /api/orders/:id/release` | Client | Release funds → completes order |
| Orders | `POST /api/orders/:id/dispute` | Either | Open dispute |
| Orders | `POST /api/orders/:id/messages` | Either | Send message on order |
| Payments | `GET /api/payments/wallet` | Yes | Get wallet balance + transactions |
| Payments | `POST /api/payments/wallet/top-up` | Yes | Demo wallet credit |
| Dashboard | `GET /api/dashboard` | Yes | Full dashboard (stats, orders, activity, finance) |
| Onboarding | `POST /api/onboarding/role` | Yes | Set role choice |
| Onboarding | `POST /api/onboarding/complete` | Yes | Save profile & complete onboarding |

**Middleware Chain (in order of execution):**

1. **helmet** — Sets security HTTP headers (CSP allows unpkg.com, accounts.google.com)
2. **compression** — Gzip-compresses responses
3. **morgan** — Logs every request to console
4. **cors** — Allows cross-origin requests with credentials
5. **json body parser** — Parses `req.body` from JSON (1MB limit)
6. **url-encoded parser** — Parses form data
7. **cookie-parser** — Reads cookies into `req.cookies`
8. **rate-limit** — 500 requests per 15 minutes on `/api` routes
9. **attachUser** — Reads `fh_token` cookie, verifies JWT, sets `req.user` (or null)

**Validation:** Every POST/PATCH request is validated using **Zod schemas** in the `validate.js` middleware. Invalid requests return 400 with specific error messages.

---

### R — React-style Frontend (Vanilla JS SPA)

**Where:** `public/app.js`, `public/index.html`, `public/styles.css`

Even though we don't use React, the frontend follows similar **component-based patterns**:

**State Management:**
```javascript
const state = {
  user: null,           // Current logged-in user
  authMode: "signup",   // signup or login
  appPage: null,        // Current page (overview, marketplace, wallet, finance)
  category: "all",      // Service filter category
  query: "",            // Search query
  sort: "recommended",  // Sort order
  saved: new Set(),     // Saved service IDs
  dashboard: null,      // Dashboard data
  wallet: null,         // Wallet data
  notifications: [],    // In-memory notifications
  // ... more
};
```

**Page Routing (SPA-style):**

The app has 5 main pages shown/hidden via CSS classes:

| Page | CSS Class | When Visible |
|------|-----------|-------------|
| Home/Landing | `.home-page` | Not logged in |
| Marketplace | `.marketplace-page` | Always (public browsing) |
| Overview | `.app-page[data-page="overview"]` | Logged in |
| Wallet | `.app-page[data-page="wallet"]` | Logged in |
| Finance | `.app-page[data-page="finance"]` | Logged in |

When the user clicks a nav button (`data-app-page-nav="overview"`), `switchPage(page)` hides all sections and shows the matching one.

**UI Rendering (how HTML is generated):**

The frontend uses **template literal functions** that return HTML strings, which are then inserted into the DOM via `innerHTML`:

```javascript
function renderServiceCard(service) {
  return `
    <article class="service-card" data-service-id="${service.id}">
      <div class="service-body">
        <div class="specialist-card-top">
          <span class="avatar">${getInitials(service.sellerName)}</span>
          ...
        </div>
        ...
        <span class="service-open-action">See details <i data-lucide="arrow-up-right"></i></span>
      </div>
    </article>
  `;
}
```

This is the same pattern React uses (component returns HTML/JSX), just without JSX compilation or virtual DOM.

**Key UI Components (as render functions):**

| Function | What It Renders |
|----------|----------------|
| `renderServiceCard()` | A specialist/service card in the marketplace |
| `renderOrder()` | An order card in the dashboard |
| `renderDashboard()` | Full dashboard page (stats, widgets, orders, activity) |
| `renderFinance()` | Finance page with charts |
| `renderWallet()` | Wallet page with balance and transactions |
| `renderOrderActions()` | Action buttons on orders (submit, release, dispute, etc.) |

---

### N — Node.js (Runtime)

**Where:** `src/server.js`

Node.js is the runtime that:
1. Reads environment variables from `.env`
2. Connects to MongoDB (or gracefully skips if unavailable)
3. Creates an HTTP server
4. Starts Express on the configured port (default 3000)
5. Serves static files from `public/`
6. Handles all API routes

**Server startup logic:**
```javascript
// src/server.js
async function start() {
  await connectDatabase();           // Try MongoDB connection
  const app = createApp();           // Build Express app
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
start().catch(console.error);
```

**Error Handling:** The server wraps all async routes with `asyncHandler` to catch promise rejections. A centralized `errorHandler` middleware catches all errors and returns proper JSON responses.

---

## 4. Frontend — Backend Interaction (Data Flow)

### How the Frontend Talks to the Backend

All communication happens over **HTTP REST API** calls using the `fetch()` function. The frontend has a single `api()` wrapper function:

```javascript
async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",     // Sends httpOnly JWT cookie
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
```

### Authentication Flow (Step by Step)

```
1. User clicks "Join" → Auth dialog opens
2. User fills email/password or clicks "Sign in with Google"
3. Frontend calls:
   → POST /api/auth/signup   OR   POST /api/auth/google
4. Backend validates data, creates/authenticates user
5. Backend responds with:
   - Set-Cookie: fh_token=<JWT> (httpOnly, secure, 7-day expiry)
   - JSON body: { user: { id, name, email, roles, ... } }
6. Frontend stores user in state: state.user = data.user
7. Frontend calls updateAuthUI() which:
   - Hides "Sign in" / "Join" buttons
   - Shows user avatar + name in navbar
   - Shows workspace navigation (Overview, Marketplace, Wallet, Finance)
8. Frontend calls loadDashboard() → GET /api/dashboard
9. Dashboard page renders with user's data
```

### Session Persistence

Every subsequent API request automatically includes the `fh_token` cookie (browser handles this). The `attachUser` middleware on the backend:

```javascript
// src/middleware/auth.js
export async function attachUser(req, res, next) {
  const token = req.cookies?.fh_token;
  if (!token) { req.user = null; return next(); }
  try {
    const decoded = verifyAuthToken(token);
    req.user = await User.findById(decoded.sub);
  } catch {
    req.user = null;
  }
  next();
}
```

If the token is expired or invalid, `req.user = null` and the request continues (no error). Protected routes use `requireAuth` middleware which returns 401 if `req.user` is null.

### Data Flow for a Service Purchase

```
1. User browses marketplace → GET /api/services (no auth needed)
2. User clicks "See details" on a card
3. User clicks "Start order" → Auth check (must be logged in as client)
4. Order dialog opens → user fills requirements → clicks "Place order"
5. Frontend checks wallet balance first → if insufficient, prompts top-up
6. If sufficient: POST /api/orders/checkout
   → Backend:
     a. Validates request with Zod
     b. Creates Order document (status: "funded")
     c. Creates WalletTransaction (debit)
     d. Calculates platformFee (12%)
     e. Returns order data
   → On success:
     a. Frontend shows confirmation
     b. Email notification sent via nodemailer
     c. Navigate to dashboard to see order
```

### Data Flow for Order Completion

```
Freelancer submits work:
1. POST /api/orders/:id/submit
   → Backend: status → "submitted", adds event

Client reviews:
2. Client can "Request revision" → POST /api/orders/:id/revision
   → Backend: status → "revision_requested", freelancer revises
3. Client can "Release funds" → POST /api/orders/:id/release
   → Backend: status → "completed", adds event, sends emails
4. Either can "Open dispute" → POST /api/orders/:id/dispute
   → Backend: status → "disputed"
```

---

## 5. Key Features Explained

### 5.1 Escrow Payment System

The escrow system protects both parties:
- **Client** deposits funds into their FreelanceHub wallet (demo top-up)
- When placing an order, funds are **held** (deducted from wallet, order marked as "funded")
- Freelancer works on the order
- When client is satisfied, they **release** funds — order completes
- If dispute arises, funds stay locked until resolution

**Implementation:**
- Wallet is virtual (in-memory ledger via `WalletTransaction` aggregation)
- No real payment processing — all demo/educational
- Platform takes 12% fee

### 5.2 Marketplace Browsing

- **Categories:** design, tech, marketing, video, writing, business, ai
- **Search:** text search on title, description, tags
- **Sort:** Recommended (highest rated), 24h (fastest delivery), Budget (lowest price)
- **Category tiles:** Visual grid with distinct colors per category
- **Service cards:** Show seller name, rating, category, delivery time, price, with 9-color alternating backgrounds

### 5.3 Dashboard

Role-based dashboard showing:
- **Stats cards:** Protected funds, Active orders, Review queue, Messages
- **Data widgets:** Service Impressions / Response Rate / Delivery Rate (freelancer) or Total Spend / Escrow Security / Avg Project Value (client)
- **Orders panel:** Current orders with status and action buttons
- **Activity timeline:** Recent actions
- **Next steps journey:** Guided suggestions based on user state
- **Email logs:** Demo SMTP log viewer
- **Seller tools:** Quick publish service link

### 5.4 Finance & Charts

- **Inflow/Outflow:** Summary cards showing money movement
- **Line chart:** 6-month trend view (toggled between inflow/outflow/both)
- **Pie chart:** Spending breakdown by category
- **Canvas 2D API:** Charts drawn manually (no library) with proper DPR handling for retina displays

### 5.5 Wallet

- **Balance display:** Current available funds
- **Top-up presets:** ₹500, ₹1000, ₹2500, ₹5000, ₹10000, ₹25000
- **Transaction ledger:** History with type, amount, status, date
- **Floating wallet toggle:** Quick access from any page

### 5.6 Payment Gateway (Demo)

- **Card form:** With live preview card flip animation
- **UPI:** VPA input with QR simulation
- **Processing:** Animated progress
- **Receipt:** Transaction confirmation with ID and print option
- All demo — no real payments

### 5.7 Email Notifications

- **Welcome email** on signup
- **Login notification** on each sign-in
- **Order emails** for events (funded, submitted, completed, disputed)
- Uses SMTP (Gmail app password)
- In-memory log for demo viewing in dashboard

### 5.8 Role System

- Users can have one or both roles: **client** (buys services) and **freelancer** (sells services)
- Active role switches the dashboard perspective
- Onboarding wizard for new users to set up their profile

---

## 6. Authentication Methods

### Email + Password
- Password hashed with **bcryptjs** (12 rounds)
- Stored in MongoDB with `select: false` (never returned in queries by default)
- Login compares hash, signs JWT on match

### Google OAuth
- Uses **Google Identity Services** (GSI) library on frontend
- Backend verifies credential token with `google-auth-library`
- If email exists, links Google ID to existing account
- If new, creates account with Google profile data
- Same JWT cookie flow either way

### Session
- JWT stored in **httpOnly cookie** (not accessible via JavaScript — prevents XSS)
- 7-day expiry, secure in production, sameSite=lax
- Every API request includes the cookie automatically

---

## 7. Theme System

- **Light/Dark mode** toggle persisted in `localStorage`
- CSS custom properties (`--ink`, `--paper`, `--soft`, `--line`, etc.) change with `[data-theme="dark"]`
- 18 service card colors in light mode; same cards keep light mode colors in dark mode
- Dashboard stat cards also keep light mode colors in dark mode
- Smooth transitions between themes
- Detects system preference on first visit

---

## 8. Deployment

- **Platform:** Railway
- **URL:** `https://freelancehub-production-e237.up.railway.app`
- **Database:** MongoDB Atlas (cloud)
- **Email:** Gmail SMTP with app password
- **Environment variables:** JWT_SECRET, MONGODB_URI, SMTP config, GOOGLE_CLIENT_ID
- **Start command:** `node src/server.js`
- **GitHub:** `github.com/Ashishshankar26/FreelanceHub` (main branch)
