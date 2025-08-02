import { createApp } from "@/actions/create-app";
import { createAppWithBilling } from "@/actions/create-app-with-billing";
import { redirect } from "next/navigation";
import { getUser } from "@/auth/stack-auth";

// This page is never rendered. It is used to:
// - Force user login without losing the user's initial message and template selection.
// - Force a loading page to be rendered (loading.tsx) while the app is being created.
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

  // Try billing-aware app creation first, fallback to basic creation
  let result;
  try {
    result = await createAppWithBilling({
      initialMessage: message ? decodeURIComponent(message) : '',
      templateId: search.template as string,
    });
    
    // If there's a warning, we could show it to the user later
    if (result.warning) {
      console.warn('App created with warning:', result.warning);
    }
    
    redirect(`/app/${result.id}`);
  } catch (error) {
    console.warn('Billing-aware app creation failed, trying fallback:', error);
    
    // Fallback to basic app creation without billing
    const { id } = await createApp({
      initialMessage: message ? decodeURIComponent(message) : '',
      templateId: search.template as string,
    });
    
    redirect(`/app/${id}`);
  }
}
