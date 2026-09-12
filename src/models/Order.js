import { RealtimeCollection, registry } from "../db/realtimeDb.js";

export class Order {
  constructor(data = {}) {
    this._id = data._id ? String(data._id) : undefined;
    this.client = data.client;
    this.freelancer = data.freelancer;
    this.service = data.service;
    this.title = data.title || "";
    this.requirements = data.requirements || "";
    this.deliveryNotes = data.deliveryNotes || "";
    this.status = data.status || "payment_pending";
    this.paymentStatus = data.paymentStatus || "unpaid";
    this.paymentProvider = data.paymentProvider || "demo";
    this.amount = Number(data.amount || 0);
    this.platformFee = Number(data.platformFee || 0);
    this.freelancerAmount = Number(data.freelancerAmount || 0);
    this.currency = data.currency || "INR";
    this.dueAt = data.dueAt ? new Date(data.dueAt) : undefined;
    this.fundedAt = data.fundedAt ? new Date(data.fundedAt) : undefined;
    this.submittedAt = data.submittedAt ? new Date(data.submittedAt) : undefined;
    this.completedAt = data.completedAt ? new Date(data.completedAt) : undefined;
    this.disputedAt = data.disputedAt ? new Date(data.disputedAt) : undefined;
    this.disputeReason = data.disputeReason || "";
    this.events = Array.isArray(data.events)
      ? data.events.map((e) => ({
          type: e.type,
          message: e.message,
          actor: e.actor,
          at: e.at ? new Date(e.at) : new Date(),
        }))
      : [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  addEvent(type, message, actor) {
    this.events.push({
      type,
      message,
      actor: typeof actor === "object" && actor?._id ? actor._id : actor,
      at: new Date(),
    });
  }

  toObject() {
    return {
      _id: this._id,
      client: typeof this.client === "object" && this.client?._id ? this.client._id : this.client,
      freelancer:
        typeof this.freelancer === "object" && this.freelancer?._id
          ? this.freelancer._id
          : this.freelancer,
      service:
        typeof this.service === "object" && this.service?._id
          ? this.service._id
          : this.service,
      title: this.title,
      requirements: this.requirements,
      deliveryNotes: this.deliveryNotes,
      status: this.status,
      paymentStatus: this.paymentStatus,
      paymentProvider: this.paymentProvider,
      amount: this.amount,
      platformFee: this.platformFee,
      freelancerAmount: this.freelancerAmount,
      currency: this.currency,
      dueAt: this.dueAt ? this.dueAt.toISOString() : undefined,
      fundedAt: this.fundedAt ? this.fundedAt.toISOString() : undefined,
      submittedAt: this.submittedAt ? this.submittedAt.toISOString() : undefined,
      completedAt: this.completedAt ? this.completedAt.toISOString() : undefined,
      disputedAt: this.disputedAt ? this.disputedAt.toISOString() : undefined,
      disputeReason: this.disputeReason,
      events: this.events.map((e) => ({
        type: e.type,
        message: e.message,
        actor: typeof e.actor === "object" && e.actor?._id ? e.actor._id : e.actor,
        at: e.at ? e.at.toISOString() : new Date().toISOString(),
      })),
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    };
  }

  async save() {
    return orderCollection.save(this);
  }

  static find(filter = {}) {
    return orderCollection.find(filter);
  }

  // Non-async: returns a SingleQueryCursor that is thenable and chainable (.select, .populate)
  static findOne(filter = {}) {
    return orderCollection.findOne(filter);
  }

  static async findById(id) {
    return orderCollection.findById(id);
  }

  static async create(data) {
    return orderCollection.create(data);
  }

  static async deleteMany(filter = {}) {
    return orderCollection.deleteMany(filter);
  }

  static async countDocuments(filter = {}) {
    return orderCollection.countDocuments(filter);
  }
}

const orderCollection = new RealtimeCollection("orders", Order);
registry.orders = Order;
