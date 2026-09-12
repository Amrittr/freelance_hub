import { createServer } from "node:http";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

async function main() {
  try {
    await connectDatabase();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    console.log("Server will start without database. Only static pages will work.");
  }
  console.log("Creating Express app...");
  const app = createApp();
  const server = createServer(app);

  server.listen(env.port, () => {
    console.log(`FreelanceHub running at ${env.appUrl}`);
  });
}

main().catch((error) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
