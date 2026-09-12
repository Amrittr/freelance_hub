import { RealtimeCollection, registry } from "../db/realtimeDb.js";

export class User {
  constructor(data = {}) {
    this._id = data._id ? String(data._id) : undefined;
    this.name = data.name || "";
    this.email = (data.email || "").toLowerCase().trim();
    this.passwordHash = data.passwordHash;
    this.googleId = data.googleId;
    this.firebaseUid = data.firebaseUid;
    this.avatar = data.avatar;
    this.roles = Array.isArray(data.roles) && data.roles.length ? data.roles : ["client"];
    this.activeRole = data.activeRole || this.roles[0] || "client";
    this.profile = {
      headline: data.profile?.headline || "",
      bio: data.profile?.bio || "",
      skills: Array.isArray(data.profile?.skills) ? data.profile.skills : [],
      country: data.profile?.country || "",
      specialty: data.profile?.specialty || "",
      experienceLevel: data.profile?.experienceLevel || "",
      availability: data.profile?.availability || "",
      targetClient: data.profile?.targetClient || "",
      avatarColor: data.profile?.avatarColor || "#13715F",
    };
    this.onboarding = {
      roleChoiceComplete: Boolean(data.onboarding?.roleChoiceComplete),
      clientComplete: Boolean(data.onboarding?.clientComplete),
      freelancerComplete: Boolean(data.onboarding?.freelancerComplete),
      clientFocus: data.onboarding?.clientFocus || "",
      completedAt: data.onboarding?.completedAt || null,
    };
    this.phone = data.phone || "";
    this.emailVerified = Boolean(data.emailVerified);
    this.lastLoginAt = data.lastLoginAt ? new Date(data.lastLoginAt) : undefined;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toObject() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      passwordHash: this.passwordHash,
      googleId: this.googleId,
      firebaseUid: this.firebaseUid,
      avatar: this.avatar,
      roles: this.roles,
      activeRole: this.activeRole,
      profile: this.profile,
      onboarding: this.onboarding,
      phone: this.phone,
      emailVerified: this.emailVerified,
      lastLoginAt: this.lastLoginAt ? this.lastLoginAt.toISOString() : undefined,
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    };
  }

  toPublicJSON() {
    return {
      id: String(this._id),
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      roles: this.roles,
      activeRole: this.activeRole,
      profile: this.profile,
      onboarding: {
        roleChoiceComplete: Boolean(this.onboarding?.roleChoiceComplete),
        clientComplete: Boolean(this.onboarding?.clientComplete),
        freelancerComplete: Boolean(this.onboarding?.freelancerComplete),
        clientFocus: this.onboarding?.clientFocus || "",
        completedAt: this.onboarding?.completedAt || null,
      },
      createdAt: this.createdAt,
    };
  }

  async save() {
    return userCollection.save(this);
  }

  static find(filter = {}) {
    return userCollection.find(filter);
  }

  // Non-async: returns a SingleQueryCursor that is thenable and chainable (.select, .populate)
  static findOne(filter = {}) {
    return userCollection.findOne(filter);
  }

  static async findById(id) {
    return userCollection.findById(id);
  }

  static async create(data) {
    return userCollection.create(data);
  }

  static async deleteMany(filter = {}) {
    return userCollection.deleteMany(filter);
  }

  static async countDocuments(filter = {}) {
    return userCollection.countDocuments(filter);
  }
}

const userCollection = new RealtimeCollection("users", User);
registry.users = User;
