import path from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { ordersRouter } from "./routes/orders.js";
import { onboardingRouter } from "./routes/onboarding.js";
import { paymentsRouter } from "./routes/payments.js";
import { servicesRouter } from "./routes/services.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "..", "public");

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://accounts.google.com",
            "https://www.gstatic.com",
          ],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: [
            "'self'",
            "https://accounts.google.com",
            "https://*.googleapis.com",
            "https://*.firebaseio.com",
            "wss://*.firebaseio.com",
            "https://firebase.googleapis.com",
            "https://identitytoolkit.googleapis.com",
            "https://securetoken.googleapis.com",
          ],
          frameSrc: ["'self'", "https://accounts.google.com"],
          objectSrc: ["'none'"],
        },
      },
    }),
  );

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(attachUser);

  // Health check
  app.get(["/api/health", "/health"], (_req, res) => {
    res.json({
      ok: true,
      service: "FreelanceHub",
      environment: env.nodeEnv,
      time: new Date().toISOString(),
    });
  });

  // API routes
  app.use(["/api/auth", "/auth"], authRouter);
  app.use(["/api/services", "/services"], servicesRouter);
  app.use(["/api/orders", "/orders"], ordersRouter);
  app.use(["/api/onboarding", "/onboarding"], onboardingRouter);
  app.use(["/api/payments", "/payments"], paymentsRouter);
  app.use(["/api/dashboard", "/dashboard"], dashboardRouter);

  // Serve static files in local dev only (Vercel CDN handles this in production)
  if (!env.isProduction) {
    app.use(express.static(publicDir, { maxAge: 0 }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"), (err) => {
        if (err) res.status(200).send("FreelanceHub OK");
      });
    });
  }

  app.use(["/api", "/api/*"], notFound);
  app.use(errorHandler);

  return app;
}
