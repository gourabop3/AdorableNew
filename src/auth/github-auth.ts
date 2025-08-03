import { github } from "@/lib/github";

export async function getGitHubUser() {
  try {
    const response = await github.users.getAuthenticated();
    return response.data;
  } catch (error) {
    console.error('Failed to get GitHub user:', error);
    return null;
  }
}

export async function createGitHubIdentity() {
  const user = await getGitHubUser();
  if (!user) {
    throw new Error('Failed to authenticate with GitHub');
  }
  
  return {
    id: user.id.toString(),
    username: user.login,
    name: user.name || user.login,
    email: user.email,
    avatar_url: user.avatar_url,
  };
}