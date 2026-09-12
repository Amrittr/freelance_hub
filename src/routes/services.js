import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Service } from "../models/Service.js";

export const servicesRouter = Router();

const serviceCreateSchema = z.object({
  body: z.object({
    title: z.string().trim().min(12).max(140),
    category: z.enum(["design", "tech", "marketing", "video", "writing", "business", "ai"]),
    description: z.string().trim().min(40).max(1600),
    price: z.coerce.number().min(5).max(50000),
    deliveryDays: z.coerce.number().int().min(1).max(90),
    revisions: z.coerce.number().int().min(0).max(20).default(1),
    tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
    icon: z.string().trim().regex(/^[a-z0-9-]+$/i).min(2).max(40).default("sparkles"),
    coverTheme: z.string().trim().regex(/^[a-z0-9-]+$/i).min(2).max(40).default("theme-design"),
  }),
});

const serviceQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().max(120).optional().default(""),
    category: z
      .enum(["all", "design", "tech", "marketing", "video", "writing", "business", "ai"])
      .optional()
      .default("all"),
    sort: z.enum(["recommended", "price", "fast"]).optional().default("recommended"),
  }),
});

servicesRouter.get(
  "/",
  validate(serviceQuerySchema),
  asyncHandler(async (req, res) => {
    const { q, category, sort } = req.validated.query;
    const filter = { status: "active" };
    if (category !== "all") {
      filter.category = category;
    }
    if (q) {
      filter.$text = { $search: q };
    }

    const mongoSort =
      sort === "fast"
        ? { deliveryDays: 1, ratingAverage: -1 }
        : sort === "price"
          ? { price: 1, ratingAverage: -1 }
          : { ratingAverage: -1, ratingCount: -1, createdAt: -1 };

    const services = await Service.find(filter)
      .sort(mongoSort)
      .limit(48)
      .populate("seller", "name profile stripeOnboardingComplete");

    res.json({ services });
  }),
);

servicesRouter.get(
  "/mine",
  requireAuth,
  requireRole("freelancer"),
  asyncHandler(async (req, res) => {
    const services = await Service.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ services });
  }),
);

servicesRouter.post(
  "/",
  requireAuth,
  requireRole("freelancer"),
  validate(serviceCreateSchema),
  asyncHandler(async (req, res) => {
    const service = await Service.create({
      ...req.validated.body,
      seller: req.user._id,
      status: "active",
    });
    res.status(201).json({ service });
  }),
);

servicesRouter.patch(
  "/:id/status",
  requireAuth,
  requireRole("freelancer"),
  validate(
    z.object({
      params: z.object({ id: z.string().min(1) }),
      body: z.object({
        status: z.enum(["active", "paused", "archived"]),
      }),
    }),
  ),
  asyncHandler(async (req, res) => {
    const service = await Service.findOneAndUpdate(
      { _id: req.validated.params.id, seller: req.user._id },
      { status: req.validated.body.status },
      { new: true },
    );
    if (!service) {
      const error = new Error("Service not found.");
      error.statusCode = 404;
      throw error;
    }
    res.json({ service });
  }),
);
