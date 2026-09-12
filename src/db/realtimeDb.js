import crypto from "crypto";
import { ref, get, set, remove, update } from "firebase/database";
import { rtdb } from "../config/firebase.js";

function generateId() {
  return crypto.randomBytes(12).toString("hex");
}

function cloneDeep(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(cloneDeep);
  const copy = {};
  for (const key of Object.keys(obj)) {
    copy[key] = cloneDeep(obj[key]);
  }
  return copy;
}

function matchFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, condition] of Object.entries(filter)) {
    if (key === "$or") {
      if (Array.isArray(condition)) {
        const matchesOr = condition.some((subFilter) => matchFilter(doc, subFilter));
        if (!matchesOr) return false;
      }
      continue;
    }

    if (key === "$text" && condition && condition.$search) {
      const searchTerms = String(condition.$search).toLowerCase().split(/\s+/).filter(Boolean);
      const textCorpus = [
        doc.title || "",
        doc.description || "",
        doc.category || "",
        Array.isArray(doc.tags) ? doc.tags.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchTerms.some((term) => textCorpus.includes(term));
      if (!matchesSearch) return false;
      continue;
    }

    const docValue = doc[key];
    const docValueStr = docValue ? String(docValue) : "";
    const condStr = condition ? String(condition) : "";

    if (condition && typeof condition === "object" && !Array.isArray(condition)) {
      if ("$in" in condition && Array.isArray(condition.$in)) {
        if (!condition.$in.map(String).includes(docValueStr)) return false;
      } else if ("$ne" in condition) {
        if (docValueStr === String(condition.$ne)) return false;
      } else if ("$exists" in condition) {
        const exists = key in doc && doc[key] !== null && doc[key] !== undefined;
        if (Boolean(condition.$exists) !== exists) return false;
      }
    } else {
      if (docValueStr !== condStr) {
        return false;
      }
    }
  }

  return true;
}

export class QueryCursor {
  constructor(collection, filter = {}) {
    this.collection = collection;
    this.filter = filter;
    this._sort = null;
    this._limit = null;
    this._skip = 0;
    this._populates = [];
    this._selectFields = null;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  skip(num) {
    this._skip = num;
    return this;
  }

  select(fieldsStr) {
    this._selectFields = fieldsStr;
    return this;
  }

  populate(field, select) {
    this._populates.push({ field, select });
    return this;
  }

  async exec() {
    let docs = await this.collection.getAll();
    docs = docs.filter((doc) => matchFilter(doc, this.filter));

    if (this._sort) {
      const entries = Object.entries(this._sort);
      docs.sort((a, b) => {
        for (const [key, dir] of entries) {
          const valA = a[key];
          const valB = b[key];
          if (valA === valB) continue;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          const order = dir === -1 || dir === "desc" ? -1 : 1;
          if (valA > valB) return order;
          if (valA < valB) return -order;
        }
        return 0;
      });
    }

    if (this._skip > 0) {
      docs = docs.slice(this._skip);
    }
    if (this._limit !== null && this._limit !== undefined) {
      docs = docs.slice(0, this._limit);
    }

    const instantiated = docs.map((d) => this.collection.instantiate(d));

    // Handle relations population
    for (const pop of this._populates) {
      const targetFields = pop.field.split(/\s+/).filter(Boolean);
      for (const singleField of targetFields) {
        for (const doc of instantiated) {
          await this.collection.populateDocField(doc, singleField, pop.select);
        }
      }
    }

    return instantiated;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

export class RealtimeCollection {
  constructor(collectionName, ModelClass) {
    this.name = collectionName;
    this.ModelClass = ModelClass;
    this.cache = new Map();
    this.isLoaded = false;
  }

  getDbRef(path = "") {
    return ref(rtdb, path ? `${this.name}/${path}` : this.name);
  }

  async syncFromRemote() {
    try {
      const snapshot = await get(this.getDbRef());
      if (snapshot.exists()) {
        const val = snapshot.val();
        this.cache.clear();
        if (typeof val === "object" && val !== null) {
          for (const [id, data] of Object.entries(val)) {
            if (data && typeof data === "object") {
              const doc = { ...data, _id: id, id };
              this.cache.set(id, doc);
            }
          }
        }
      }
      this.isLoaded = true;
    } catch (err) {
      console.warn(`[Firebase RTDB] Read warning for ${this.name}:`, err.message);
      this.isLoaded = true;
    }
  }

  async getAll() {
    if (!this.isLoaded) {
      await this.syncFromRemote();
    }
    return Array.from(this.cache.values()).map(cloneDeep);
  }

  instantiate(rawDoc) {
    if (!rawDoc) return null;
    const instance = new this.ModelClass(rawDoc);
    instance._id = rawDoc._id || rawDoc.id;
    instance.id = instance._id;
    return instance;
  }

  async populateDocField(doc, fieldName, select) {
    const rawVal = doc[fieldName];
    if (!rawVal) return;

    let targetCollectionName = null;
    if (fieldName === "client" || fieldName === "freelancer" || fieldName === "seller" || fieldName === "user" || fieldName === "actor") {
      targetCollectionName = "users";
    } else if (fieldName === "service") {
      targetCollectionName = "services";
    }

    if (!targetCollectionName) return;

    const targetModel = registry[targetCollectionName];
    if (!targetModel) return;

    const targetId = typeof rawVal === "object" && rawVal._id ? rawVal._id : String(rawVal);
    const populated = await targetModel.findById(targetId);
    if (populated) {
      if (select) {
        const fields = select.split(/\s+/).filter(Boolean);
        const filtered = { _id: populated._id, id: populated.id };
        for (const f of fields) {
          filtered[f] = populated[f];
        }
        doc[fieldName] = filtered;
      } else {
        doc[fieldName] = populated;
      }
    }
  }

  find(filter = {}) {
    return new QueryCursor(this, filter);
  }

  async findOne(filter = {}) {
    const cursor = new QueryCursor(this, filter);
    const results = await cursor.exec();
    return results[0] || null;
  }

  async findById(id) {
    if (!id) return null;
    const strId = String(id);
    if (!this.isLoaded) {
      await this.syncFromRemote();
    }
    const cached = this.cache.get(strId);
    if (cached) {
      return this.instantiate(cloneDeep(cached));
    }
    return null;
  }

  async create(data) {
    const _id = data._id ? String(data._id) : generateId();
    const now = new Date().toISOString();
    const docData = {
      ...cloneDeep(data),
      _id,
      id: _id,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : now,
      updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : now,
    };

    // Save to local cache
    this.cache.set(_id, docData);

    // Persist to Firebase Realtime Database
    try {
      await set(this.getDbRef(_id), docData);
    } catch (err) {
      console.warn(`[Firebase RTDB] Save error for ${this.name}/${_id}:`, err.message);
    }

    return this.instantiate(docData);
  }

  async save(instance) {
    const id = String(instance._id || instance.id);
    const now = new Date().toISOString();
    const rawData = {
      ...instance.toObject(),
      _id: id,
      id,
      updatedAt: now,
    };

    this.cache.set(id, rawData);

    try {
      await set(this.getDbRef(id), rawData);
    } catch (err) {
      console.warn(`[Firebase RTDB] Update error for ${this.name}/${id}:`, err.message);
    }
    return instance;
  }

  async findOneAndUpdate(filter, updates, options = {}) {
    const doc = await this.findOne(filter);
    if (!doc) return null;

    for (const [key, val] of Object.entries(updates)) {
      doc[key] = val;
    }
    await this.save(doc);
    return options.new !== false ? doc : doc;
  }

  async updateMany(filter, updates) {
    const docs = await this.find(filter).exec();
    for (const doc of docs) {
      for (const [key, val] of Object.entries(updates)) {
        doc[key] = val;
      }
      await this.save(doc);
    }
    return { modifiedCount: docs.length };
  }

  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      this.cache.clear();
      try {
        await remove(this.getDbRef());
      } catch (err) {
        console.warn(`[Firebase RTDB] Delete all error for ${this.name}:`, err.message);
      }
      return { deletedCount: 0 };
    }

    const docs = await this.find(filter).exec();
    for (const doc of docs) {
      const id = String(doc._id || doc.id);
      this.cache.delete(id);
      try {
        await remove(this.getDbRef(id));
      } catch (err) {
        console.warn(`[Firebase RTDB] Delete error for ${this.name}/${id}:`, err.message);
      }
    }
    return { deletedCount: docs.length };
  }

  async countDocuments(filter = {}) {
    const docs = await this.find(filter).exec();
    return docs.length;
  }
}

export const registry = {};
