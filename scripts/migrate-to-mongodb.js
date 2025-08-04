const { Pool } = require('pg');
const mongoose = require('mongoose');

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adorable';

// MongoDB Schemas (same as in mongodb.ts)
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

async function migrateData() {
  try {
    console.log('🔄 Starting migration from PostgreSQL to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Migrate apps
    console.log('📦 Migrating apps...');
    const apps = await pgPool.query('SELECT * FROM apps');
    for (const app of apps.rows) {
      const newApp = new App({
        _id: app.id,
        name: app.name,
        description: app.description,
        gitRepo: app.git_repo,
        baseId: app.base_id,
        previewDomain: app.preview_domain,
        createdAt: app.created_at,
        updatedAt: app.updated_at || app.created_at,
      });
      await newApp.save();
    }
    console.log(`✅ Migrated ${apps.rows.length} apps`);
    
    // Migrate app users
    console.log('👥 Migrating app users...');
    const appUsers = await pgPool.query('SELECT * FROM app_users');
    for (const appUser of appUsers.rows) {
      const newAppUser = new AppUser({
        userId: appUser.user_id,
        appId: appUser.app_id,
        permissions: appUser.permissions,
        freestyleIdentity: appUser.freestyle_identity,
        freestyleAccessToken: appUser.freestyle_access_token,
        freestyleAccessTokenId: appUser.freestyle_access_token_id,
        createdAt: appUser.created_at,
        updatedAt: appUser.updated_at || appUser.created_at,
      });
      await newAppUser.save();
    }
    console.log(`✅ Migrated ${appUsers.rows.length} app users`);
    
    // Migrate messages
    console.log('💬 Migrating messages...');
    const messages = await pgPool.query('SELECT * FROM messages');
    for (const message of messages.rows) {
      const newMessage = new Message({
        appId: message.app_id,
        message: message.message,
        createdAt: message.created_at,
        updatedAt: message.updated_at || message.created_at,
      });
      await newMessage.save();
    }
    console.log(`✅ Migrated ${messages.rows.length} messages`);
    
    // Migrate users
    console.log('👤 Migrating users...');
    const users = await pgPool.query('SELECT * FROM users');
    for (const user of users.rows) {
      const newUser = new User({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        credits: user.credits,
        plan: user.plan,
        stripeCustomerId: user.stripe_customer_id,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      });
      await newUser.save();
    }
    console.log(`✅ Migrated ${users.rows.length} users`);
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pgPool.end();
    await mongoose.disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };