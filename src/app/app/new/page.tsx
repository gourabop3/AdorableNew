import { createApp } from "@/actions/create-app";
import { createAppWithBilling } from "@/actions/create-app-with-billing";
import { InsufficientCreditsError } from "@/lib/errors";
import { redirect } from "next/navigation";
import { getUser } from "@/auth/stack-auth";
import { redisPublisher } from "@/lib/redis";

// This page is never rendered. It is used to:
// - Force user login without losing the user's initial message and template selection.
// - Force a loading page to be rendered (loading.tsx) while the app is being created.
// - Handle insufficient credits by redirecting to upgrade page.
export default async function NewAppRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
  params: Promise<{ id: string }>;
}) {
  const user = await getUser().catch(() => undefined);
  const search = await searchParams;

  if (!user) {
    // reconstruct the search params
    const newParams = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => newParams.append(key, v));
      } else {
        newParams.set(key, value);
      }
    });

    // After sign in, redirect back to this page with the initial search params
    redirect(
      `/handler/sign-in?after_auth_return_to=${encodeURIComponent(
        "/app/new?" + newParams.toString()
      )}`
    );
  }

  let message: string | undefined;
  if (Array.isArray(search.message)) {
    message = search.message[0];
  } else {
    message = search.message;
  }

  // Create a unique key for this app creation request (without timestamp to allow deduplication)
  const appCreationKey = `app-creation:${user.userId}:${message}:${search.template}`;
  
  // Check if we're already processing this request
  const existingRequest = await redisPublisher.get(appCreationKey);
  if (existingRequest && existingRequest !== "processing") {
    console.log('Duplicate app creation request detected, redirecting to existing app');
    redirect(`/app/${existingRequest}`);
  }

  // Try billing-aware app creation first, fallback to basic creation
  let result;
  
  // Set a temporary key to prevent duplicates
  await redisPublisher.set(appCreationKey, "processing", { EX: 60 }); // 1 minute timeout
  
  try {
    result = await createAppWithBilling({
      initialMessage: message ? decodeURIComponent(message) : '',
      templateId: search.template as string,
    });
    
    // Store the successful app ID to prevent duplicates
    await redisPublisher.set(appCreationKey, result.id, { EX: 300 }); // 5 minutes
    
    // If there's a warning, we could show it to the user later
    if (result.warning) {
      console.warn('App created with warning:', result.warning);
    }
    
    redirect(`/app/${result.id}`);
  } catch (error) {
    // Clean up the processing key
    await redisPublisher.del(appCreationKey);
    
    // Handle insufficient credits error
    if (error instanceof InsufficientCreditsError) {
      console.log('Insufficient credits detected, redirecting to upgrade page');
      
      // Redirect to upgrade page with original parameters
      const upgradeParams = new URLSearchParams();
      if (message) upgradeParams.set('message', message);
      if (search.template) upgradeParams.set('template', search.template as string);
      
      redirect(`/app/upgrade?${upgradeParams.toString()}`);
    }
    
    console.warn('Billing-aware app creation failed, trying fallback:', error);
    
    // Use the original createApp function to avoid duplicate creation
    result = await createApp({
      initialMessage: message ? decodeURIComponent(message) : '',
      templateId: search.template as string,
    });
    
    // Store the successful app ID
    await redisPublisher.set(appCreationKey, result.id, { EX: 300 });
    
    redirect(`/app/${result.id}`);
  }
}
