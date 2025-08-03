"use client";

import { githubSandboxes } from "@/lib/github";

export async function getCodespaceUrl(repoName: string) {
  const codespace = await githubSandboxes.createCodespace(
    repoName,
    'main',
    'basicLinux'
  );
  
  return codespace.web_ide_url;
}
