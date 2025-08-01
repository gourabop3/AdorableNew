import { NextResponse } from 'next/server';
import { stackServerApp } from '@/auth/stack-auth';

export async function POST() {
  try {
    // Get the current user
    const user = await stackServerApp.getUser();
    
    if (user) {
      // Clear the user session
      await stackServerApp.signOut();
      console.log('User signed out successfully');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}