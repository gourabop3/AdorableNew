"use client";

import { createApp } from "@/actions/create-app";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getTemplateId } from "@/lib/templates";

export function AppPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    const frameworkKey = urlParams.get("templateId") || "nextjs"; // Default to nextjs if no template specified
    const templateId = getTemplateId(frameworkKey as keyof typeof import("@/lib/templates").templatesMap);

    if (message) {
      createApp({
        initialMessage: decodeURIComponent(message),
        templateId: templateId,
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
