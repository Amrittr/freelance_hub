import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = [
  "JWT_SECRET",
];

const isProduction = process.env.NODE_ENV === "production";
const missing = requiredInProduction.filter((key) => !process.env[key]);

if (isProduction && missing.length) {
  throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  port: Number(process.env.PORT || 3000),
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  clientUrl: process.env.CLIENT_URL || process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  paymentProvider: "demo",
  platformFeePercent: Number(process.env.PLATFORM_FEE_PERCENT || 12),
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || "FreelanceHub <no-reply@freelancehub.local>",
  },
  googleClientId:
    process.env.GOOGLE_CLIENT_ID ||
    "678943507030-1i0os5s8s3o900jhaq6i9q6vf952jtd7.apps.googleusercontent.com",
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBvodnAScDMvX5AQ8JwNO9IgV1KDUq4r8A",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "freelancer-hub-1edff.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "freelancer-hub-1edff",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "freelancer-hub-1edff.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "856345283751",
    appId: process.env.FIREBASE_APP_ID || "1:856345283751:web:60b1619b837851a5219f82",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-T8E36WG88L",
    databaseURL:
      process.env.FIREBASE_DATABASE_URL ||
      "https://freelancer-hub-1edff-default-rtdb.firebaseio.com",
  },
};

export function assertRuntimeConfig() {
  console.log(`[Database] Using Firebase Realtime Database: ${env.firebase.databaseURL}`);
}
