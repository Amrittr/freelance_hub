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

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Port ${env.port} is already in use.`);
      console.error(`   Run this to free it: lsof -ti:${env.port} | xargs kill -9\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  server.listen(env.port, () => {
    console.log(`FreelanceHub running at ${env.appUrl}`);
  });
}

main().catch((error) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
