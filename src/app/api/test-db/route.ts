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
    
    console.log('🧪 Creating test user:', testUser);
    let createdUser = null;
    let createError = null;
    
    try {
      createdUser = await db.users.create(testUser);
      console.log('✅ Test user created successfully:', createdUser);
    } catch (error) {
      console.error('❌ Error creating test user:', error);
      createError = error.message;
    }
    
    // Test finding the user
    console.log('🧪 Finding test user by ID:', testUser.id);
    let foundUser = null;
    let findError = null;
    
    try {
      foundUser = await db.users.findById(testUser.id);
      console.log('✅ Test user found:', foundUser);
    } catch (error) {
      console.error('❌ Error finding test user:', error);
      findError = error.message;
    }
    
    return NextResponse.json({
      success: !createError && !findError,
      message: 'Database test completed',
      testUser: {
        created: !!createdUser,
        found: !!foundUser,
        id: testUser.id,
        createdUserId: createdUser?.id || 'Not created',
        foundUserId: foundUser?.id || 'Not found',
        createError,
        findError
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