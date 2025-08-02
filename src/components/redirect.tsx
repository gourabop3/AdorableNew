"use client";

import { createApp } from "@/actions/create-app";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AppPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    const templateId = urlParams.get("templateId") || "nextjs"; // Default to nextjs if no template specified

    if (message) {
      createApp({
        initialMessage: decodeURIComponent(message),
        templateId: templateId as string,
      }).then((app) => {
        router.push(`/app/${app.id}?respond`);
      }).catch((error) => {
        console.error('Error creating app:', error);
        router.push("/?error=app_creation_failed");
      });
    } else {
      router.push("/");
    }
  });

  return <></>;
}
