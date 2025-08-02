import { NextResponse } from 'next/server';
import { stackServerApp } from '@/auth/stack-auth';

export async function POST() {
  try {
    // Always try to sign out, regardless of current user state
    await stackServerApp.signOut();
    console.log('User signed out successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    
    // Even if there's an error, return success since the goal is to clear the session
    // This prevents 500 errors when user is already signed out
    return NextResponse.json({ success: true });
  }
}