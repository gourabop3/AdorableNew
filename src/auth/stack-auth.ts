import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { createGitHubIdentity } from "./github-auth";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
});

export async function getUser() {
  const user = await stackServerApp.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  if (!user?.serverMetadata?.githubUsername) {
    const gitIdentity = await createGitHubIdentity();

    await user.update({
      serverMetadata: {
        githubUsername: gitIdentity.username,
        githubAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
        githubInstallationId: 'personal', // For personal access tokens
      },
    });

    user.serverMetadata.githubUsername = gitIdentity.username;
  }

  return {
    userId: user.id,
    email: user.email || '',
    name: user.name || '',
    image: user.image || '',
    githubUsername: user.serverMetadata.githubUsername,
    githubAccessToken: user.serverMetadata.githubAccessToken,
    githubInstallationId: user.serverMetadata.githubInstallationId,
  };
}

export async function getOrCreateGitHubIdentity(user: any) {
  if (!user?.serverMetadata?.githubUsername) {
    const gitIdentity = await createGitHubIdentity();
    
    await user.updateServerMetadata({
      githubUsername: gitIdentity.username,
      githubAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      githubInstallationId: 'personal', // For personal access tokens
    });
    
    user.serverMetadata.githubUsername = gitIdentity.username;
  }
  
  return {
    githubUsername: user.serverMetadata.githubUsername,
    githubAccessToken: user.serverMetadata.githubAccessToken,
    githubInstallationId: user.serverMetadata.githubInstallationId,
  };
}
