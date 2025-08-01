import { createApp } from "@/actions/create-app";
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
  let user;
  try {
    user = await getUser();
  } catch (error) {
    console.error('Authentication error:', error);
    // Redirect to sign in if user is not authenticated
    const search = await searchParams;
    const newParams = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => newParams.append(key, v));
      } else {
        newParams.set(key, value);
      }
    });

    redirect(
      `/handler/sign-in?after_auth_return_to=${encodeURIComponent(
        "/app/new?" + newParams.toString()
      )}`
    );
  }

  const search = await searchParams;

  if (!user || !user.userId) {
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

  try {
    const { id } = await createApp({
      initialMessage: decodeURIComponent(message || ''),
      templateId: search.template as string,
    });

    redirect(`/app/${id}`);
  } catch (error) {
    console.error('Error creating app:', error);
    // Redirect to home page with error message
    redirect('/?error=app_creation_failed');
  }
}
