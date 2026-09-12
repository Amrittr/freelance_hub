## FreelanceHub Backend — Quick Script (~2 min)

---

"Backend is Node.js + Express + MongoDB. Handles auth, services, orders, payments, dashboards."

**Architecture:** `config/` (DB, env), `middleware/` (auth, validation), `models/` (5 schemas), `routes/` (6 groups), `services/` (logic). Server starts even if MongoDB is down.

**5 Models:**
- **User** — name, email, hashed password, roles (client/freelancer)
- **Service** — seller reference, title, category, price, delivery
- **Order** — client + freelancer, status state machine: funded → in_progress → submitted → revision/completed/disputed. 12% fee. Events array for audit trail.
- **Message** — sender, recipient, body
- **WalletTransaction** — credit/debit ledger

**6 Route Groups:**
- **Auth** — signup/login/logout, Google OAuth, JWT in httpOnly cookie, bcrypt passwords
- **Services** — browse (public), create/manage (freelancer)
- **Orders** — checkout, submit, revise, release, dispute, message
- **Payments** — wallet balance (credit-debit aggregation), demo top-up
- **Dashboard** — single endpoint for stats, orders, finance
- **Onboarding** — role choice, profile setup

**Auth Flow:** Login → verify password → sign JWT (7-day) → httpOnly cookie. Every request: `attachUser` reads cookie, verifies JWT, attaches user. `requireAuth` blocks if missing.

"That's it — Node + Express + MongoDB, JWT auth, escrow order lifecycle, demo wallet. Questions?"
