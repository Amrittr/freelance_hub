import { RealtimeCollection, registry } from "../db/realtimeDb.js";

export class Service {
  constructor(data = {}) {
    this._id = data._id ? String(data._id) : undefined;
    this.seller = data.seller;
    this.title = data.title || "";
    this.category = data.category || "tech";
    this.description = data.description || "";
    this.price = Number(data.price || 0);
    this.deliveryDays = Number(data.deliveryDays || 1);
    this.revisions = Number(data.revisions || 1);
    this.tags = Array.isArray(data.tags) ? data.tags : [];
    this.icon = data.icon || "sparkles";
    this.coverTheme = data.coverTheme || "theme-design";
    this.status = data.status || "active";
    this.ratingAverage = Number(data.ratingAverage || 5.0);
    this.ratingCount = Number(data.ratingCount || 0);
    this.completedOrdersCount = Number(data.completedOrdersCount || 0);
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toObject() {
    return {
      _id: this._id,
      seller: typeof this.seller === "object" && this.seller?._id ? this.seller._id : this.seller,
      title: this.title,
      category: this.category,
      description: this.description,
      price: this.price,
      deliveryDays: this.deliveryDays,
      revisions: this.revisions,
      tags: this.tags,
      icon: this.icon,
      coverTheme: this.coverTheme,
      status: this.status,
      ratingAverage: this.ratingAverage,
      ratingCount: this.ratingCount,
      completedOrdersCount: this.completedOrdersCount,
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    };
  }

  async save() {
    return serviceCollection.save(this);
  }

  static find(filter = {}) {
    return serviceCollection.find(filter);
  }

  // Non-async: returns a SingleQueryCursor that is thenable and chainable (.select, .populate)
  static findOne(filter = {}) {
    return serviceCollection.findOne(filter);
  }

  static async findById(id) {
    return serviceCollection.findById(id);
  }

  static async findOneAndUpdate(filter, updates, options = {}) {
    return serviceCollection.findOneAndUpdate(filter, updates, options);
  }

  static async create(data) {
    return serviceCollection.create(data);
  }

  static async deleteMany(filter = {}) {
    return serviceCollection.deleteMany(filter);
  }

  static async countDocuments(filter = {}) {
    return serviceCollection.countDocuments(filter);
  }
}

const serviceCollection = new RealtimeCollection("services", Service);
registry.services = Service;
