import { NextResponse } from 'next/server';
import { connectToDatabase, db } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test connection
    await connectToDatabase();
    console.log('✅ Database connection successful');
    
    // Test creating a user
    const testUser = {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      credits: 50,
      plan: 'free' as const,
    };
    
    console.log('🧪 Creating test user:', testUser.id);
    const createdUser = await db.users.create(testUser);
    console.log('✅ Test user created:', createdUser.id);
    
    // Test finding the user
    console.log('🧪 Finding test user...');
    const foundUser = await db.users.findById(testUser.id);
    console.log('✅ Test user found:', foundUser ? foundUser.id : 'Not found');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and operations working correctly',
      testUser: {
        created: !!createdUser,
        found: !!foundUser,
        id: testUser.id
      }
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}