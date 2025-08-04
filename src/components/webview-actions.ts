"use client";

import { githubSandboxes } from "@/lib/github";

export async function getCodespaceUrl(repoName: string) {
  try {
    // First try to get existing codespace
    const existingCodespace = await githubSandboxes.getCodespaceForRepository(repoName);
    
    if (existingCodespace) {
      console.log(`✅ Using existing codespace: ${existingCodespace.name}`);
      return existingCodespace.web_ide_url;
    }
    
    // Create new codespace if none exists
    console.log(`🚀 Creating new codespace for: ${repoName}`);
    const codespace = await githubSandboxes.createCodespace(
      repoName,
      'main',
      'basicLinux'
    );
    
    return codespace.web_ide_url;
  } catch (error) {
    console.error('❌ Error getting codespace URL:', error);
    throw new Error(`Failed to get codespace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
