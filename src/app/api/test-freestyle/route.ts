import { NextResponse } from 'next/server';
import { freestyle } from '@/lib/freestyle';

export async function GET() {
  try {
    console.log('🔍 Testing Freestyle API...');
    
    const FREESTYLE_API_KEY = process.env.FREESTYLE_API_KEY;
    console.log('📡 Freestyle API Key:', FREESTYLE_API_KEY ? 'Set' : 'Not set');
    
    if (!FREESTYLE_API_KEY) {
      return NextResponse.json({ 
        error: 'FREESTYLE_API_KEY not set',
        env: process.env.NODE_ENV 
      }, { status: 500 });
    }

    // Test a simple Freestyle API call
    console.log('🔗 Testing Freestyle API connection...');
    
    // Try to list identities (this should work if the API key is valid)
    const identities = await freestyle.listGitIdentities();
    console.log('✅ Freestyle API test successful!');
    console.log('👥 Found identities:', identities.length);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Freestyle API test passed',
      identitiesCount: identities.length,
      env: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('❌ Freestyle API test failed:', error);
    
    return NextResponse.json({ 
      error: 'Freestyle API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.NODE_ENV
    }, { status: 500 });
  }
}