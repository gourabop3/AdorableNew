import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('📡 MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
    
    if (!MONGODB_URI) {
      return NextResponse.json({ 
        error: 'MONGODB_URI not set',
        env: process.env.NODE_ENV 
      }, { status: 500 });
    }

    // Test connection
    console.log('🔗 Attempting to connect...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections found:', collections.map(c => c.name));
    
    // Test a simple query
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Write test successful');
    
    const result = await testCollection.findOne({ test: 'connection' });
    console.log('✅ Read test successful');
    
    // Clean up
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Cleanup successful');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection test passed',
      collections: collections.map(c => c.name),
      env: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    
    return NextResponse.json({ 
      error: 'MongoDB connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: process.env.NODE_ENV
    }, { status: 500 });
  }
}