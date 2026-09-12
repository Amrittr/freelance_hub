import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createProfileDraft } from "../services/profileAssistant.js";

export const onboardingRouter = Router();

function ensureOnboardingState(user) {
  if (!user.onboarding) user.onboarding = {};
  if (!user.profile) user.profile = {};
}

const roleSchema = z.object({
  body: z.object({
    role: z.enum(["client", "freelancer", "both"]),
  }),
});

const profileAssistSchema = z.object({
  body: z.object({
    specialty: z.string().trim().max(80).optional(),
    skills: z.union([z.array(z.string().trim().max(40)).max(6), z.string().trim().max(240)]).optional(),
    targetClient: z.string().trim().max(120).optional(),
    experienceLevel: z.string().trim().max(40).optional(),
    availability: z.string().trim().max(60).optional(),
    summary: z.string().trim().max(500).optional(),
  }),
});

const completeSchema = z.object({
  body: z.object({
    role: z.enum(["client", "freelancer"]),
    clientFocus: z.string().trim().max(240).optional(),
    country: z.string().trim().max(80).optional(),
    specialty: z.string().trim().max(80).optional(),
    experienceLevel: z.string().trim().max(40).optional(),
    availability: z.string().trim().max(60).optional(),
    targetClient: z.string().trim().max(120).optional(),
    headline: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(1200).optional(),
    skills: z.array(z.string().trim().min(1).max(40)).max(6).optional(),
  }),
});

onboardingRouter.post(
  "/role",
  requireAuth,
  validate(roleSchema),
  asyncHandler(async (req, res) => {
    const { role } = req.validated.body;
    const selectedRoles = role === "both" ? ["client", "freelancer"] : [role];
    const adminRoles = req.user.roles.filter((item) => item === "admin");

    ensureOnboardingState(req.user);
    req.user.roles = [...new Set([...selectedRoles, ...adminRoles])];
    req.user.activeRole = role === "client" ? "client" : "freelancer";
    req.user.onboarding.roleChoiceComplete = true;
    await req.user.save();

    res.json({ user: req.user.toPublicJSON() });
  }),
);

onboardingRouter.post(
  "/profile-assist",
  requireAuth,
  validate(profileAssistSchema),
  asyncHandler(async (req, res) => {
    if (!req.user.roles.includes("freelancer")) {
      const error = new Error("Choose a freelancer role before creating a profile draft.");
      error.statusCode = 400;
      throw error;
    }

    const draft = await createProfileDraft(req.validated.body);
    res.json({ draft });
  }),
);

onboardingRouter.post(
  "/complete",
  requireAuth,
  validate(completeSchema),
  asyncHandler(async (req, res) => {
    const details = req.validated.body;
    if (!req.user.roles.includes(details.role)) {
      const error = new Error(`Your account is not set up as a ${details.role}.`);
      error.statusCode = 400;
      throw error;
    }

    ensureOnboardingState(req.user);
    req.user.onboarding.roleChoiceComplete = true;

    if (details.role === "client") {
      req.user.onboarding.clientComplete = true;
      req.user.onboarding.clientFocus = details.clientFocus || "";
      req.user.profile.country = details.country || "";
    } else {
      req.user.profile.country = details.country || "";
      req.user.profile.specialty = details.specialty || "";
      req.user.profile.experienceLevel = details.experienceLevel || "";
      req.user.profile.availability = details.availability || "";
      req.user.profile.targetClient = details.targetClient || "";
      req.user.profile.headline = details.headline || "";
      req.user.profile.bio = details.bio || "";
      req.user.profile.skills = details.skills || [];
      req.user.onboarding.freelancerComplete = true;
    }

    const clientReady = !req.user.roles.includes("client") || req.user.onboarding.clientComplete;
    const freelancerReady = !req.user.roles.includes("freelancer") || req.user.onboarding.freelancerComplete;
    if (clientReady && freelancerReady) {
      req.user.onboarding.completedAt = new Date();
    }

    await req.user.save();
    res.json({ user: req.user.toPublicJSON() });
  }),
);
