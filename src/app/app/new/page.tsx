import { createApp } from "@/actions/create-app";
import { redirect } from "next/navigation";
import { getUser } from "@/auth/stack-auth";

// Force dynamic rendering to prevent build errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This page is never rendered. It is used to:
// - Force user login without losing the user's initial message and template selection.
// - Force a loading page to be rendered (loading.tsx) while the app is being created.
export default async function NewAppRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
  params: Promise<{ id: string }>;
}) {
  console.log('🚀 Starting app creation process...');
  
  let user;
  try {
    user = await getUser();
    console.log('✅ User authenticated:', user?.userId);
  } catch (error) {
    console.error('❌ Authentication error:', error);
    redirect('/handler/sign-in');
  }

  if (!user || !user.userId) {
    console.log('❌ User data is invalid:', user);
    redirect('/handler/sign-in');
  }

  try {
    const search = await searchParams;
    console.log('📝 Search params received');

    let message: string | undefined;
    let templateId = 'nextjs';

    // Safely extract message
    if (search && typeof search === 'object') {
      if (search.message) {
        if (Array.isArray(search.message)) {
          message = search.message[0];
        } else {
          message = search.message;
        }
      }

      // Safely extract template
      if (search.template) {
        if (Array.isArray(search.template)) {
          templateId = search.template[0];
        } else {
          templateId = search.template;
        }
      }
    }

    console.log('🎯 Creating app with:', { message, templateId });

    console.log('🚀 Calling createApp...');
    const { id } = await createApp({
      initialMessage: message ? decodeURIComponent(message) : '',
      templateId: templateId,
    });

    console.log('✅ App created successfully with ID:', id);
    
    // Increase delay to ensure all database operations complete
    console.log('⏳ Waiting for database operations to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    
    console.log('🔄 Redirecting to app page...');
    
    // Use a more explicit redirect
    const redirectUrl = `/app/${id}`;
    console.log('📍 Redirect URL:', redirectUrl);
    
    redirect(redirectUrl);
  } catch (error) {
    // Don't treat NEXT_REDIRECT as an error - it's the normal redirect mechanism
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      console.log('✅ Redirect completed successfully');
      return; // Let Next.js handle the redirect
    }
    
    console.error('❌ Error creating app:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Redirect to home page with error message
    redirect('/?error=app_creation_failed');
  }
}
