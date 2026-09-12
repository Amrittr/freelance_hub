# FreelanceHub

[![Live Demo](https://img.shields.io/badge/Live-Demo-2ea44f?style=for-the-badge)](https://freelancehub-production-9df2.up.railway.app)

**🌐 Visit the live site: [https://freelancehub-production-9df2.up.railway.app](https://freelancehub-production-9df2.up.railway.app)**

Escrow-style freelance marketplace with MongoDB Atlas, email notifications, Cashfree UPI checkout, client/freelancer dashboards, order messaging, disputes, revisions, and protected fund release.

## What Is Implemented

- MongoDB Atlas persistence through Mongoose models for users, services, orders, and messages.
- Signup, login, logout, httpOnly JWT cookie sessions, and role switching.
- Client dashboard with protected funds, active orders, review queue, and order actions.
- Freelancer dashboard with service publishing, delivery submission, messages, disputes, and payout readiness.
- Cashfree Hosted Checkout for sandbox or live client payments.
- Cashfree signed webhooks for payment confirmation.
- Cashfree Easy Split is the production payout path for bank or UPI vendor settlement.
- SMTP email notifications for signup, login, payment, delivery, revisions, disputes, release, and messages.
- Seed script for demo sellers and services.

## Important Payment Note

This app implements marketplace payment protection: client pays the platform, the order is marked funded after Cashfree confirms payment, and the freelancer is paid through an approved marketplace settlement product after release.

Do not market this as regulated legal escrow without legal review and the required licenses for your operating countries. If you need literal escrow, integrate a licensed escrow provider.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example:

```bash
copy .env.example .env
```

3. Fill in `.env`:

```bash
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/freelancehub?retryWrites=true&w=majority
JWT_SECRET=generate-a-long-random-secret
PAYMENT_PROVIDER=cashfree
CASHFREE_CLIENT_ID=TEST_...
CASHFREE_CLIENT_SECRET=...
CASHFREE_WEBHOOK_SECRET=...
CASHFREE_ENV=sandbox
CASHFREE_CURRENCY=INR
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
MAIL_FROM="FreelanceHub <no-reply@yourdomain.com>"
APP_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

Generate `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. Seed your Atlas database:

```bash
npm run seed
```

5. Start locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Cashfree Webhook

Configure a Cashfree webhook in the sandbox dashboard with:

```bash
https://your-public-test-domain/api/webhooks/cashfree
```

For local testing, use an HTTPS tunnel such as ngrok and register the public URL in Cashfree. Keep the raw request body intact so the signed webhook can be verified.

Required webhook events:

- Cashfree payment success
- Cashfree payment failed
- Cashfree payment user dropped

## Demo Accounts

After `npm run seed`, demo users use:

```text
Password: FreelanceHub123!
```

Examples:

```text
client@freelancehub.local
maya@freelancehub.local
jon@freelancehub.local
```

## Production Checklist

- Use HTTPS and set `NODE_ENV=production`.
- Set real `APP_URL` and `CLIENT_URL`.
- Use Cashfree Sandbox first, then switch to production keys after webhook testing and merchant approval.
- Activate Cashfree Easy Split before enabling seller bank/UPI settlements.
- Verify payout timing and marketplace legal requirements.
- Use a real transactional email provider.
- Add domain-level email authentication: SPF, DKIM, and DMARC.
- Restrict MongoDB Atlas network access to your deployment environment.
- Add automated tests before handling real customer funds.
