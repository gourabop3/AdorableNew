import mongoose from 'mongoose';
import { createClient } from 'mongodb';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/adorable';

let cached = global.mongoose;
let cachedClient = global.mongoClient;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

if (!cachedClient) {
  cachedClient = global.mongoClient = { client: null, promise: null };
}

export async function connectToDatabase() {
  // Validate MongoDB URI
  if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb')) {
    console.error('Invalid MongoDB URI:', MONGODB_URI);
    throw new Error('Invalid MongoDB URI. Please set MONGODB_URI environment variable.');
  }

  console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

  try {
    if (cached.conn) {
      console.log('Using cached Mongoose connection');
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        // Vercel serverless optimizations
        maxIdleTimeMS: 30000,
        minPoolSize: 1,
        // Connection pooling for serverless
        maxConnecting: 1,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('✅ Connected to MongoDB via Mongoose');
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (mongooseError) {
    console.warn('Mongoose connection failed:', mongooseError);
    
    // Reset the promise so we can try again
    cached.promise = null;
    
    // Fallback to MongoDB driver
    try {
      if (cachedClient.client) {
        console.log('Using cached MongoDB driver connection');
        return cachedClient.client;
      }

      if (!cachedClient.promise) {
        cachedClient.promise = createClient(MONGODB_URI).connect().then((client) => {
          console.log('✅ Connected to MongoDB via MongoDB driver');
          return client;
        });
      }

      cachedClient.client = await cachedClient.promise;
      return cachedClient.client;
    } catch (driverError) {
      console.error('Both Mongoose and MongoDB driver failed:', driverError);
      // Reset both promises
      cached.promise = null;
      cachedClient.promise = null;
      throw new Error(`Database connection failed: ${driverError.message}`);
    }
  }
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
  freestyleIdentity: { type: String, required: false }, // Made optional for fallback mode
  freestyleAccessToken: { type: String, required: false }, // Made optional for fallback mode
  freestyleAccessTokenId: { type: String, required: false }, // Made optional for fallback mode
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
// Note: previewDomain index is already created by unique: true in schema
appUserSchema.index({ userId: 1, appId: 1 }, { unique: true });
messageSchema.index({ appId: 1, createdAt: -1 });
// Note: email index is already created by unique: true in schema
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

// Database operations wrapper with better error handling
export const db = {
  // App operations
  apps: {
    create: async (data: any) => {
      await connectToDatabase();
      const app = new App(data);
      return await app.save();
    },
    findById: async (id: string) => {
      await connectToDatabase();
      return await App.findById(id);
    },
    findMany: async (filter: any = {}) => {
      await connectToDatabase();
      return await App.find(filter);
    },
    update: async (id: string, data: any) => {
      await connectToDatabase();
      return await App.findByIdAndUpdate(id, data, { new: true });
    },
    delete: async (id: string) => {
      await connectToDatabase();
      return await App.findByIdAndDelete(id);
    }
  },
  
  // AppUser operations
  appUsers: {
    create: async (data: any) => {
      await connectToDatabase();
      const appUser = new AppUser(data);
      return await appUser.save();
    },
    findMany: async (filter: any = {}) => {
      await connectToDatabase();
      return await AppUser.find(filter).populate('appId');
    },
    findByUserAndApp: async (userId: string, appId: string) => {
      await connectToDatabase();
      return await AppUser.findOne({ userId, appId });
    }
  },
  
  // User operations
  users: {
    create: async (data: any) => {
      await connectToDatabase();
      try {
        const user = new User(data);
        return await user.save();
      } catch (error) {
        if (error.code === 11000) {
          // User already exists, find and return existing user
          console.log('User already exists, finding existing user:', data.id);
          return await User.findOne({ id: data.id });
        }
        throw error;
      }
    },
    findById: async (id: string) => {
      await connectToDatabase();
      return await User.findOne({ id: id });
    },
    findByEmail: async (email: string) => {
      await connectToDatabase();
      return await User.findOne({ email });
    },
    update: async (id: string, data: any) => {
      await connectToDatabase();
      return await User.findOneAndUpdate({ id: id }, data, { new: true });
    }
  },
  
  // Message operations
  messages: {
    create: async (data: any) => {
      await connectToDatabase();
      const message = new Message(data);
      return await message.save();
    },
    findMany: async (filter: any = {}) => {
      await connectToDatabase();
      return await Message.find(filter).sort({ createdAt: -1 });
    }
  },

  // Subscription operations
  subscriptions: {
    create: async (data: any) => {
      await connectToDatabase();
      const subscription = new Subscription(data);
      return await subscription.save();
    },
    findMany: async (filter: any = {}) => {
      await connectToDatabase();
      return await Subscription.find(filter);
    },
    findById: async (id: string) => {
      await connectToDatabase();
      return await Subscription.findById(id);
    },
    update: async (id: string, data: any) => {
      await connectToDatabase();
      return await Subscription.findByIdAndUpdate(id, data, { new: true });
    }
  },

  // Credit Transaction operations
  creditTransactions: {
    create: async (data: any) => {
      await connectToDatabase();
      const transaction = new CreditTransaction(data);
      return await transaction.save();
    },
    findMany: async (filter: any = {}) => {
      await connectToDatabase();
      return await CreditTransaction.find(filter).sort({ createdAt: -1 });
    }
  }
};