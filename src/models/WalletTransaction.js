import { RealtimeCollection, registry } from "../db/realtimeDb.js";

export class WalletTransaction {
  constructor(data = {}) {
    this._id = data._id ? String(data._id) : undefined;
    this.user = data.user;
    this.type = data.type || "top_up";
    this.direction = data.direction || "credit";
    this.amount = Number(data.amount || 0);
    this.currency = data.currency || "INR";
    this.status = data.status || "pending";
    this.paymentProvider = data.paymentProvider || "demo";
    this.description = data.description || "";
    this.completedAt = data.completedAt ? new Date(data.completedAt) : undefined;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toObject() {
    return {
      _id: this._id,
      user: typeof this.user === "object" && this.user?._id ? this.user._id : this.user,
      type: this.type,
      direction: this.direction,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      paymentProvider: this.paymentProvider,
      description: this.description,
      completedAt: this.completedAt ? this.completedAt.toISOString() : undefined,
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    };
  }

  async save() {
    return walletTransactionCollection.save(this);
  }

  static find(filter = {}) {
    return walletTransactionCollection.find(filter);
  }

  static async findOne(filter = {}) {
    return walletTransactionCollection.findOne(filter);
  }

  static async findById(id) {
    return walletTransactionCollection.findById(id);
  }

  static async create(data) {
    return walletTransactionCollection.create(data);
  }

  static async deleteMany(filter = {}) {
    return walletTransactionCollection.deleteMany(filter);
  }

  static async countDocuments(filter = {}) {
    return walletTransactionCollection.countDocuments(filter);
  }

  static async aggregate(pipeline = []) {
    const all = await walletTransactionCollection.getAll();
    let current = all;

    for (const stage of pipeline) {
      if (stage.$match) {
        current = current.filter((doc) => {
          for (const [k, v] of Object.entries(stage.$match)) {
            const docVal = doc[k] ? String(doc[k]) : "";
            const matchVal = v ? String(v) : "";
            if (docVal !== matchVal) return false;
          }
          return true;
        });
      } else if (stage.$group) {
        const groupField = stage.$group._id.replace(/^\$/, "");
        const groupMap = new Map();
        for (const doc of current) {
          const key = doc[groupField];
          const existing = groupMap.get(key) || 0;
          groupMap.set(key, existing + Number(doc.amount || 0));
        }
        current = Array.from(groupMap.entries()).map(([k, sum]) => ({
          _id: k,
          amount: sum,
        }));
      }
    }

    return current;
  }
}

const walletTransactionCollection = new RealtimeCollection("wallet_transactions", WalletTransaction);
registry.wallet_transactions = WalletTransaction;
