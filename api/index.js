import { createApp } from "../src/app.js";
import { assertRuntimeConfig } from "../src/config/env.js";
import "../src/config/firebase.js"; // ensure Firebase initializes

// Validate env vars immediately — crash early with a useful message
try {
  assertRuntimeConfig();
} catch (err) {
  console.error("[Vercel] Missing required environment variable:", err.message);
}

// Create the Express app once (reused across warm invocations)
const app = createApp();

export default async function handler(req, res) {
  return app(req, res);
}
