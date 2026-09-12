import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { env } from "../config/env.js";
import { Message } from "../models/Message.js";
import { Order } from "../models/Order.js";
import { Service } from "../models/Service.js";
import { WalletTransaction } from "../models/WalletTransaction.js";
import { sendOrderEmail, sendPaymentReceiptEmail } from "../services/mailer.js";
import { getWalletSnapshot } from "../services/wallet.js";

export const ordersRouter = Router();

const checkoutSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1),
    requirements: z.string().trim().min(20).max(5000),
  }),
});

const orderIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

const submitSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    deliveryNotes: z.string().trim().min(10).max(5000),
  }),
});

const revisionSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    message: z.string().trim().min(10).max(3000),
  }),
});

const disputeSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    reason: z.string().trim().min(10).max(3000),
  }),
});

const messageSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    body: z.string().trim().min(1).max(5000),
  }),
});

ordersRouter.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const filter = req.user.activeRole === "freelancer" ? { freelancer: req.user._id } : { client: req.user._id };
    const orders = await Order.find(filter)
      .sort({ updatedAt: -1 })
      .populate("client", "name email profile")
      .populate("freelancer", "name email profile stripeOnboardingComplete")
      .populate("service", "title category price deliveryDays");

    res.json({ orders });
  }),
);

ordersRouter.get(
  "/:id",
  requireAuth,
  validate(orderIdSchema),
  asyncHandler(async (req, res) => {
    const order = await loadParticipantOrder(req.validated.params.id, req.user._id);
    const messages = await Message.find({ order: order._id })
      .sort({ createdAt: 1 })
      .populate("sender", "name")
      .populate("recipient", "name");
    res.json({ order, messages });
  }),
);

ordersRouter.post(
  "/checkout",
  requireAuth,
  validate(checkoutSchema),
  asyncHandler(async (req, res) => {
    const service = await Service.findOne({ _id: req.validated.body.serviceId, status: "active" }).populate(
      "seller",
      "name email",
    );

    if (!service) {
      const error = new Error("Service not found.");
      error.statusCode = 404;
      throw error;
    }

    if (service.seller._id.equals(req.user._id)) {
      const error = new Error("You cannot buy your own service.");
      error.statusCode = 400;
      throw error;
    }

    const amount = service.price;
    const platformFee = roundMoney(amount * (env.platformFeePercent / 100));
    const freelancerAmount = roundMoney(amount - platformFee);
    const dueAt = new Date(Date.now() + service.deliveryDays * 24 * 60 * 60 * 1000);

    const wallet = await getWalletSnapshot(req.user._id);
    if (wallet.balance < amount) {
      const error = new Error("Insufficient demo wallet balance. Please add funds first.");
      error.statusCode = 400;
      throw error;
    }

    const order = await Order.create({
      client: req.user._id,
      freelancer: service.seller._id,
      service: service._id,
      title: service.title,
      requirements: req.validated.body.requirements,
      amount,
      platformFee,
      freelancerAmount,
      currency: "INR",
      paymentProvider: "demo",
      dueAt,
      events: [
        {
          type: "order_created",
          message: "Client started checkout.",
          actor: req.user._id,
        },
      ],
    });

    await WalletTransaction.create({
      user: req.user._id,
      type: "purchase",
      direction: "debit",
      amount,
      currency: "INR",
      status: "succeeded",
      paymentProvider: "demo",
      description: `Demo payment for: ${order.title}`,
      completedAt: new Date(),
    });

    order.status = "funded";
    order.paymentStatus = "paid";
    order.fundedAt = new Date();
    order.addEvent("payment_confirmed", "Demo payment funded in the FreelanceHub ledger.", req.user._id);
    await order.save();
    await Promise.all([
      sendOrderEmail({
        user: req.user,
        subject: "Demo payment secured",
        title: "Payment secured",
        message: `Your demo payment for "${order.title}" is funded and protected until delivery is approved.`,
      }),
      sendPaymentReceiptEmail({
        user: req.user,
        amount,
        transactionId: order._id,
        type: "Order Escrow Funding",
        description: `Milestone Escrow Funding for: ${order.title}`,
        date: order.fundedAt,
      }),
      sendOrderEmail({
        user: service.seller,
        subject: "New funded demo order",
        title: "New funded order",
        message: `${req.user.name} funded "${order.title}" in the FreelanceHub demo ledger.`,
      }),
    ]);
    return res.status(201).json({ orderId: order._id, paymentProvider: "demo", demoFunded: true });
  }),
);

ordersRouter.post(
  "/:id/submit",
  requireAuth,
  validate(submitSchema),
  asyncHandler(async (req, res) => {
    const order = await loadParticipantOrder(req.validated.params.id, req.user._id);
    assertFreelancer(order, req.user._id);
    assertStatus(order, ["funded", "in_progress", "revision_requested"]);

    order.status = "submitted";
    order.deliveryNotes = req.validated.body.deliveryNotes;
    order.submittedAt = new Date();
    order.addEvent("work_submitted", "Freelancer submitted work for review.", req.user._id);
    await order.save();

    await sendOrderEmail({
      user: order.client,
      subject: "Work submitted for review",
      title: "Work submitted",
      message: `${order.freelancer.name} submitted work for "${order.title}". Review it from your client dashboard.`,
    });

    res.json({ order });
  }),
);

ordersRouter.post(
  "/:id/revision",
  requireAuth,
  validate(revisionSchema),
  asyncHandler(async (req, res) => {
    const order = await loadParticipantOrder(req.validated.params.id, req.user._id);
    assertClient(order, req.user._id);
    assertStatus(order, ["submitted"]);

    order.status = "revision_requested";
    order.addEvent("revision_requested", req.validated.body.message, req.user._id);
    await order.save();

    await sendOrderEmail({
      user: order.freelancer,
      subject: "Revision requested",
      title: "Revision requested",
      message: `${order.client.name} requested revisions on "${order.title}": ${req.validated.body.message}`,
    });

    res.json({ order });
  }),
);

ordersRouter.post(
  "/:id/dispute",
  requireAuth,
  validate(disputeSchema),
  asyncHandler(async (req, res) => {
    const order = await loadParticipantOrder(req.validated.params.id, req.user._id);
    assertStatus(order, ["funded", "in_progress", "submitted", "revision_requested"]);

    order.status = "disputed";
    order.disputedAt = new Date();
    order.disputeReason = req.validated.body.reason;
    order.addEvent("dispute_opened", req.validated.body.reason, req.user._id);
    await order.save();

    const recipient = order.client._id.equals(req.user._id) ? order.freelancer : order.client;
    await sendOrderEmail({
      user: recipient,
      subject: "Dispute opened",
      title: "Dispute opened",
      message: `A dispute was opened on "${order.title}": ${req.validated.body.reason}`,
    });

    res.json({ order });
  }),
);

ordersRouter.post(
  "/:id/release",
  requireAuth,
  validate(orderIdSchema),
  asyncHandler(async (req, res) => {
    const order = await loadParticipantOrder(req.validated.params.id, req.user._id);
    assertClient(order, req.user._id);
    assertStatus(order, ["submitted", "disputed"]);

    await WalletTransaction.create({
      user: order.freelancer._id,
      type: "adjustment",
      direction: "credit",
      amount: order.freelancerAmount,
      currency: "INR",
      status: "succeeded",
      paymentProvider: "demo",
      description: `Demo funds released for: ${order.title}`,
      completedAt: new Date(),
    });

    order.status = "completed";
    order.completedAt = new Date();
    order.addEvent("funds_released", "Demo funds released to the freelancer ledger.", req.user._id);
    await order.save();
    await Promise.all([
      sendOrderEmail({
        user: order.freelancer,
        subject: "Demo funds released",
        title: "Funds released",
        message: `${order.client.name} released demo payment for "${order.title}".`,
      }),
      sendPaymentReceiptEmail({
        user: order.freelancer,
        amount: order.freelancerAmount,
        transactionId: order._id,
        type: "Freelancer Payout Released",
        description: `Escrow Earnings Released for: ${order.title}`,
        date: order.completedAt,
      }),
      sendOrderEmail({
        user: order.client,
        subject: "Order completed",
        title: "Order completed",
        message: `Demo payment was released and "${order.title}" is now complete.`,
      }),
    ]);
    return res.json({ order });
  }),
);

ordersRouter.post(
  "/:id/messages",
  requireAuth,
  validate(messageSchema),
  asyncHandler(async (req, res) => {
    const order = await loadParticipantOrder(req.validated.params.id, req.user._id);
    const recipient = order.client._id.equals(req.user._id) ? order.freelancer : order.client;
    const message = await Message.create({
      order: order._id,
      sender: req.user._id,
      recipient: recipient._id,
      body: req.validated.body.body,
    });

    order.addEvent("message_sent", "A new order message was sent.", req.user._id);
    await order.save();

    await sendOrderEmail({
      user: recipient,
      subject: "New order message",
      title: "New message",
      message: `${req.user.name} sent a message on "${order.title}": ${req.validated.body.body}`,
    });

    res.status(201).json({ message });
  }),
);

async function loadParticipantOrder(orderId, userId) {
  const order = await Order.findOne({
    _id: orderId,
    $or: [{ client: userId }, { freelancer: userId }],
  })
    .populate("client", "name email profile")
    .populate("freelancer", "name email profile")
    .populate("service", "title category price deliveryDays");

  if (!order) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  return order;
}

function assertClient(order, userId) {
  if (!order.client._id.equals(userId)) {
    const error = new Error("Only the client can perform this action.");
    error.statusCode = 403;
    throw error;
  }
}

function assertFreelancer(order, userId) {
  if (!order.freelancer._id.equals(userId)) {
    const error = new Error("Only the freelancer can perform this action.");
    error.statusCode = 403;
    throw error;
  }
}

function assertStatus(order, allowed) {
  if (!allowed.includes(order.status)) {
    const error = new Error(`Order cannot move from ${order.status} using this action.`);
    error.statusCode = 400;
    throw error;
  }
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}
