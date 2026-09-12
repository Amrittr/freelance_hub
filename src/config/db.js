import { rtdb } from "./firebase.js";
import { assertRuntimeConfig } from "./env.js";
import { User } from "../models/User.js";
import { Service } from "../models/Service.js";
import { Order } from "../models/Order.js";
import { Message } from "../models/Message.js";
import { WalletTransaction } from "../models/WalletTransaction.js";

export async function connectDatabase() {
  assertRuntimeConfig();

  // Preload and sync collections from Firebase Realtime Database
  console.log("[Firebase RTDB] Connecting & synchronizing collections...");
  await Promise.allSettled([
    User.find().exec(),
    Service.find().exec(),
    Order.find().exec(),
    Message.find().exec(),
    WalletTransaction.find().exec(),
  ]);

  console.log("[Firebase RTDB] Collections synchronized successfully.");
  return rtdb;
}
