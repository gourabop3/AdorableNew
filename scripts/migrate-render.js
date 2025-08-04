const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

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
  message: { type: mongoose.Schema.Types.Mixed, required: true },
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

const App = mongoose.model('App', appSchema);
const AppUser = mongoose.model('AppUser', appUserSchema);
const Message = mongoose.model('Message', messageSchema);
const User = mongoose.model('User', userSchema);

async function setupMongoDB() {
  try {
    console.log('🔄 Setting up MongoDB for Render deployment...');
    
    if (!MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not set, skipping MongoDB setup');
      return;
    }
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create indexes
    console.log('📊 Creating database indexes...');
    
    await App.collection.createIndex({ previewDomain: 1 });
    await AppUser.collection.createIndex({ userId: 1, appId: 1 }, { unique: true });
    await Message.collection.createIndex({ appId: 1, createdAt: -1 });
    await User.collection.createIndex({ email: 1 });
    
    console.log('✅ Database indexes created');
    
    // Test connection with a simple query
    const appCount = await App.countDocuments();
    console.log(`📦 Current apps in database: ${appCount}`);
    
    console.log('🎉 MongoDB setup completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    // Don't throw error to prevent build failure
    console.log('⚠️  Continuing with deployment...');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupMongoDB();
}

module.exports = { setupMongoDB };