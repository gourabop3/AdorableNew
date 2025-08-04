"use server";

import { githubSandboxes } from "@/lib/github";

export async function getCodeServerUrl(repoName: string) {
  const codespace = await githubSandboxes.createCodespace(
    repoName,
    'main'
    // Let the system choose the best available machine type
  );
  
  return codespace.web_ide_url;
}
