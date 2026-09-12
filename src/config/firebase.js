import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { env } from "./env.js";

let app;
if (!getApps().length) {
  app = initializeApp(env.firebase);
} else {
  app = getApp();
}

export const rtdb = getDatabase(app, env.firebase.databaseURL);
export const firebaseApp = app;
