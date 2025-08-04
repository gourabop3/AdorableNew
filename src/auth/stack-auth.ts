import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { freestyle } from "@/lib/freestyle";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
});

// Get user without git identity creation (for billing API)
export async function getUserBasic() {
  const user = await stackServerApp.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  return {
    userId: user.id,
    email: user.email || '',
    name: user.name || '',
    image: user.image || '',
    freestyleIdentity: user.serverMetadata?.freestyleIdentity || null,
  };
}

export async function getUser() {
  const user = await stackServerApp.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  if (!user?.serverMetadata?.freestyleIdentity) {
    try {
      const gitIdentity = await freestyle.createGitIdentity();

      await user.update({
        serverMetadata: {
          freestyleIdentity: gitIdentity.id,
        },
      });

      user.serverMetadata.freestyleIdentity = gitIdentity.id;
    } catch (error) {
      console.warn('Failed to create git identity:', error);
      // Continue without git identity for now
    }
  }

  return {
    userId: user.id,
    email: user.email || '',
    name: user.name || '',
    image: user.image || '',
    freestyleIdentity: user.serverMetadata?.freestyleIdentity || null,
  };
}
