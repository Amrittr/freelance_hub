import { connectDatabase } from "../src/config/db.js";
import { createApp } from "../src/app.js";

let app;

async function getApp() {
  if (!app) {
    try {
      await connectDatabase();
    } catch (err) {
      console.warn("[Vercel] DB init warning:", err.message);
    }
    app = createApp();
  }
  return app;
}

export default async function handler(req, res) {
  const expressApp = await getApp();
  return expressApp(req, res);
}
