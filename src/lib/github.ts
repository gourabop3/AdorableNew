import { Octokit } from "@octokit/rest";

export const github = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  private: boolean;
  created_at: string;
  updated_at: string;
}

export interface GitHubCodespace {
  id: string;
  name: string;
  repository: {
    id: number;
    full_name: string;
  };
  machine: {
    name: string;
    display_name: string;
  };
  state: string;
  web_ide_url: string;
  devcontainer_path?: string;
}

export class GitHubSandboxes {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    });
  }

  async createRepository(name: string, description?: string, isPrivate = true): Promise<GitHubRepository> {
    const response = await this.octokit.repos.createForAuthenticatedUser({
      name,
      description,
      private: isPrivate,
      auto_init: true,
    });
    return response.data;
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    await this.octokit.repos.delete({
      owner,
      repo,
    });
  }

  async getAvailableMachines(repository: string): Promise<any[]> {
    const [owner, repo] = repository.split('/');
    
    try {
      const response = await this.octokit.codespaces.getCodespacesMachinesForAuthenticatedUser({
        repository_id: await this.getRepositoryId(owner, repo),
        ref: 'main',
      });
      
      return response.data.machines || [];
    } catch (error) {
      console.warn('Could not fetch available machines, using default:', error);
      return [];
    }
  }

  async createCodespace(
    repository: string,
    branch?: string,
    machine?: string
  ): Promise<GitHubCodespace> {
    const [owner, repo] = repository.split('/');
    
    // First, check if a codespace already exists for this repository
    const existingCodespaces = await this.getCodespaces();
    const existingCodespace = existingCodespaces.find(
      cs => cs.repository.full_name === repository && cs.state !== 'deleted'
    );
    
    if (existingCodespace) {
      console.log(`✅ Reusing existing codespace: ${existingCodespace.name}`);
      return existingCodespace;
    }
    
    // Get available machine types for this repository
    const availableMachines = await this.getAvailableMachines(repository);
    let machineType = machine;
    
    if (!machineType) {
      if (availableMachines.length > 0) {
        // Use the first available machine (usually the cheapest/smallest)
        machineType = availableMachines[0].name;
        console.log(`🔧 Using available machine type: ${machineType}`);
      } else {
        // Fallback to a common machine type
        machineType = 'linux';
        console.log(`🔧 Using fallback machine type: ${machineType}`);
      }
    }
    
    console.log(`🚀 Creating new codespace for repository: ${repository} with machine: ${machineType}`);
    
    try {
      const response = await this.octokit.codespaces.createForAuthenticatedUser({
        repository_id: await this.getRepositoryId(owner, repo),
        ref: branch || 'main',
        machine: machineType,
      });
      
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create codespace with machine ${machineType}:`, error);
      
      // If the specified machine failed, try with a different one
      if (availableMachines.length > 1) {
        const fallbackMachine = availableMachines[1].name;
        console.log(`🔄 Retrying with fallback machine: ${fallbackMachine}`);
        
        const response = await this.octokit.codespaces.createForAuthenticatedUser({
          repository_id: await this.getRepositoryId(owner, repo),
          ref: branch || 'main',
          machine: fallbackMachine,
        });
        
        return response.data;
      }
      
      throw error;
    }
  }

  async getCodespaceForRepository(repository: string): Promise<GitHubCodespace | null> {
    const codespaces = await this.getCodespaces();
    return codespaces.find(
      cs => cs.repository.full_name === repository && cs.state !== 'deleted'
    ) || null;
  }

  async getCodespaces(): Promise<GitHubCodespace[]> {
    const response = await this.octokit.codespaces.listForAuthenticatedUser();
    return response.data.codespaces;
  }

  async deleteCodespace(codespaceName: string): Promise<void> {
    await this.octokit.codespaces.deleteForAuthenticatedUser({
      codespace_name: codespaceName,
    });
  }

  async getRepositoryId(owner: string, repo: string): Promise<number> {
    const response = await this.octokit.repos.get({
      owner,
      repo,
    });
    return response.data.id;
  }

  async createFile(
    repository: string,
    path: string,
    content: string,
    message: string,
    branch = 'main'
  ): Promise<void> {
    const [owner, repo] = repository.split('/');
    
    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
    });
  }

  async getFile(
    repository: string,
    path: string,
    branch = 'main'
  ): Promise<string> {
    const [owner, repo] = repository.split('/');
    
    const response = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    
    if (Array.isArray(response.data)) {
      throw new Error('Path is a directory, not a file');
    }
    
    return Buffer.from(response.data.content, 'base64').toString();
  }

  async listRepositories(): Promise<GitHubRepository[]> {
    const response = await this.octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    return response.data;
  }
}

export const githubSandboxes = new GitHubSandboxes();