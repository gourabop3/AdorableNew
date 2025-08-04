import { NextResponse } from 'next/server';
import { createClient } from 'mongodb';

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB DNS resolution...');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('📡 MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
    
    if (!MONGODB_URI) {
      return NextResponse.json({ 
        error: 'MONGODB_URI not set',
        env: process.env.NODE_ENV 
      }, { status: 500 });
    }

    // Extract hostname from URI
    const hostname = MONGODB_URI.match(/@([^/]+)/)?.[1];
    console.log('🌐 Hostname:', hostname);

    // Test DNS resolution
    console.log('🔍 Testing DNS resolution...');
    try {
      const dns = require('dns').promises;
      const addresses = await dns.resolve4(hostname);
      console.log('✅ DNS resolution successful:', addresses);
    } catch (dnsError) {
      console.error('❌ DNS resolution failed:', dnsError);
      return NextResponse.json({ 
        error: 'DNS resolution failed',
        hostname,
        details: dnsError.message,
        env: process.env.NODE_ENV
      }, { status: 500 });
    }

    // Test connection with mongodb driver
    console.log('🔗 Testing MongoDB connection...');
    const client = createClient(MONGODB_URI);
    
    await client.connect();
    console.log('✅ MongoDB connected successfully!');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections found:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection test passed',
      hostname,
      collections: collections.map(c => c.name),
      env: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    
    return NextResponse.json({ 
      error: 'MongoDB connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.NODE_ENV
    }, { status: 500 });
  }
}