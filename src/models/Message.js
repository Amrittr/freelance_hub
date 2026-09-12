import { RealtimeCollection, registry } from "../db/realtimeDb.js";

export class Message {
  constructor(data = {}) {
    this._id = data._id ? String(data._id) : undefined;
    this.order = data.order;
    this.sender = data.sender;
    this.recipient = data.recipient;
    this.body = data.body || "";
    this.attachments = Array.isArray(data.attachments) ? data.attachments : [];
    this.readAt = data.readAt ? new Date(data.readAt) : null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toObject() {
    return {
      _id: this._id,
      order: typeof this.order === "object" && this.order?._id ? this.order._id : this.order,
      sender: typeof this.sender === "object" && this.sender?._id ? this.sender._id : this.sender,
      recipient:
        typeof this.recipient === "object" && this.recipient?._id
          ? this.recipient._id
          : this.recipient,
      body: this.body,
      attachments: this.attachments,
      readAt: this.readAt ? this.readAt.toISOString() : null,
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    };
  }

  async save() {
    return messageCollection.save(this);
  }

  static find(filter = {}) {
    return messageCollection.find(filter);
  }

  // Non-async: returns SingleQueryCursor that is thenable and chainable
  static findOne(filter = {}) {
    return messageCollection.findOne(filter);
  }

  static async findById(id) {
    return messageCollection.findById(id);
  }

  static async create(data) {
    return messageCollection.create(data);
  }

  static async updateMany(filter, updates) {
    return messageCollection.updateMany(filter, updates);
  }

  static async deleteMany(filter = {}) {
    return messageCollection.deleteMany(filter);
  }

  static async countDocuments(filter = {}) {
    return messageCollection.countDocuments(filter);
  }
}

const messageCollection = new RealtimeCollection("messages", Message);
registry.messages = Message;
