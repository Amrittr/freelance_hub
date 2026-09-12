import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { User } from "../models/User.js";
import { WalletTransaction } from "../models/WalletTransaction.js";
import { env } from "../config/env.js";
import { getWalletSnapshot } from "../services/wallet.js";

import { sendPaymentReceiptEmail } from "../services/mailer.js";

export const paymentsRouter = Router();

const walletTopUpSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(50).max(100000),
    phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/).optional().or(z.literal("")),
  }),
});

paymentsRouter.get(
  "/wallet",
  requireAuth,
  asyncHandler(async (req, res) => {
    const wallet = await getWalletSnapshot(req.user._id);
    res.json({
      wallet: {
        ...wallet,
        currency: "INR",
        provider: "demo",
        phone: req.user.phone || "",
      },
    });
  }),
);

paymentsRouter.post(
  "/wallet/top-up",
  requireAuth,
  validate(walletTopUpSchema),
  asyncHandler(async (req, res) => {
    const amount = Math.round(req.validated.body.amount * 100) / 100;

    const transaction = await WalletTransaction.create({
      user: req.user._id,
      type: "top_up",
      direction: "credit",
      amount,
      currency: "INR",
      status: "succeeded",
      paymentProvider: "demo",
      description: "Demo wallet top-up",
      completedAt: new Date(),
    });

    await sendPaymentReceiptEmail({
      user: req.user,
      amount,
      transactionId: transaction._id,
      type: "Wallet Top-Up",
      description: "Escrow Deposit Ledger Top-Up",
      date: transaction.completedAt,
    });

    const wallet = await getWalletSnapshot(req.user._id);
    return res.status(201).json({
      transactionId: transaction._id,
      paymentProvider: "demo",
      demoConfirmed: true,
      wallet,
    });
  }),
);

paymentsRouter.post(
  "/connect/onboard",
  requireAuth,
  requireRole("freelancer"),
  asyncHandler(async (req, res) => {
    return res.json({ demo: true });
  }),
);

paymentsRouter.get(
  "/connect/status",
  requireAuth,
  requireRole("freelancer"),
  asyncHandler(async (req, res) => {
    return res.json({
      connected: true,
      onboardingComplete: true,
      payoutsEnabled: true,
      chargesEnabled: true,
    });
  }),
);
