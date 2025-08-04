import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL?.replace('postgresql://', 'mongodb://') || 'mongodb://localhost:27017/adorable';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      // Vercel serverless optimizations
      maxIdleTimeMS: 30000,
      minPoolSize: 1,
      // Connection pooling for serverless
      maxConnecting: 1,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// MongoDB Schemas
const appSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "Unnamed App" },
  description: { type: String, required: true, default: "No description" },
  gitRepo: { type: String, required: true },
  baseId: { type: String, required: true, default: "nextjs-dkjfgdf" },
  previewDomain: { type: String, unique: true, sparse: true },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

const appUserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  permissions: { type: String, enum: ['read', 'write', 'admin'], default: 'read' },
  freestyleIdentity: { type: String, required: true },
  freestyleAccessToken: { type: String, required: true },
  freestyleAccessTokenId: { type: String, required: true },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

const messageSchema = new mongoose.Schema({
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  message: { type: mongoose.Schema.Types.Mixed, required: true }, // UIMessage
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

const appDeploymentSchema = new mongoose.Schema({
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  deploymentId: { type: String, required: true },
  commit: { type: String, required: true },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: String,
  image: String,
  credits: { type: Number, required: true, default: 50 },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  stripeCustomerId: { type: String, unique: true, sparse: true },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

const subscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  stripeSubscriptionId: { type: String, unique: true, sparse: true },
  stripePriceId: { type: String, required: true },
  status: { type: String, required: true },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

const creditTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  stripePaymentIntentId: String,
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Create indexes
appSchema.index({ previewDomain: 1 });
appUserSchema.index({ userId: 1, appId: 1 }, { unique: true });
messageSchema.index({ appId: 1, createdAt: -1 });
userSchema.index({ email: 1 });
subscriptionSchema.index({ userId: 1 });
creditTransactionSchema.index({ userId: 1, createdAt: -1 });

// Export models
export const App = mongoose.models.App || mongoose.model('App', appSchema);
export const AppUser = mongoose.models.AppUser || mongoose.model('AppUser', appUserSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const AppDeployment = mongoose.models.AppDeployment || mongoose.model('AppDeployment', appDeploymentSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export const CreditTransaction = mongoose.models.CreditTransaction || mongoose.model('CreditTransaction', creditTransactionSchema);

// Database operations wrapper
export const db = {
  // App operations
  apps: {
    create: async (data: any) => {
      const app = new App(data);
      return await app.save();
    },
    findById: async (id: string) => {
      return await App.findById(id);
    },
    findMany: async (filter: any = {}) => {
      return await App.find(filter);
    },
    update: async (id: string, data: any) => {
      return await App.findByIdAndUpdate(id, data, { new: true });
    },
    delete: async (id: string) => {
      return await App.findByIdAndDelete(id);
    }
  },
  
  // AppUser operations
  appUsers: {
    create: async (data: any) => {
      const appUser = new AppUser(data);
      return await appUser.save();
    },
    findMany: async (filter: any = {}) => {
      return await AppUser.find(filter).populate('appId');
    },
    findByUserAndApp: async (userId: string, appId: string) => {
      return await AppUser.findOne({ userId, appId });
    }
  },
  
  // User operations
  users: {
    create: async (data: any) => {
      const user = new User(data);
      return await user.save();
    },
    findById: async (id: string) => {
      return await User.findById(id);
    },
    findByEmail: async (email: string) => {
      return await User.findOne({ email });
    },
    update: async (id: string, data: any) => {
      return await User.findByIdAndUpdate(id, data, { new: true });
    }
  },
  
  // Message operations
  messages: {
    create: async (data: any) => {
      const message = new Message(data);
      return await message.save();
    },
    findMany: async (filter: any = {}) => {
      return await Message.find(filter).sort({ createdAt: -1 });
    }
  }
};