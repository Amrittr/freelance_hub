# FreelanceHub 🚀

Escrow-backed freelance marketplace built with **Node.js, Express, Firebase Realtime Database, and Firebase Auth**.

Clients hire freelancers, fund milestones into a simulated escrow ledger, review work deliveries, and release payouts with built-in revisions and dispute protection.

---

## ✨ Features

- **Authentication**: Firebase Authentication with Google Sign-In popup and email/password accounts, backed by httpOnly JWT cookies (`fh_token`).
- **Dual Role Accounts**: Seamless switching between **Client** and **Freelancer** dashboards.
- **Marketplace & Services**: Searchable service gigs with categories, filters, tag searching, and reviews.
- **Escrow Order Lifecycle**:
  - `payment_pending` ➔ `funded` (debited from simulated wallet) ➔ `submitted` ➔ `completed` (freelancer credited) / `revision_requested` / `disputed`.
- **Append-Only Wallet Ledger**: Dynamic balance calculations (`Σ credits - Σ debits`) with platform fee deductions (12%).
- **Order Messaging**: Real-time per-order discussion threads.
- **Email Notifications**: Transactional emails (welcome, order updates, milestone releases) via Nodemailer with graceful fallback.
- **Modern Bento UI**: Vanilla JS Single Page Application (SPA), dark/light mode themes, and custom canvas interactive charts.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime & Server** | Node.js (≥ 20, ES Modules), Express 4.21 |
| **Database** | Firebase Realtime Database (`freelancer-hub-1edff`) |
| **Authentication** | Firebase Auth (Google Popup & Password) + JWT (`jsonwebtoken`) |
| **Validation & Security** | Zod 3, Helmet (CSP configured for Firebase), CORS, Express Rate Limit |
| **Frontend** | Vanilla JavaScript, Vanilla CSS, Lucide Icons (no bundler/framework build steps needed) |
| **Deployment** | Vercel Serverless Function & CDN |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. (Optional) Seed Demo Data
To seed 18 demo sellers, services, and transactions:
```bash
npm run seed
```
*Demo user password:* `FreelanceHub123!`

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Set Environment Variables in Vercel:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Any random secure string
4. In [Firebase Console > Authentication > Settings > Authorized Domains](https://console.firebase.google.com/project/freelancer-hub-1edff/authentication/settings), add your live Vercel domain.
