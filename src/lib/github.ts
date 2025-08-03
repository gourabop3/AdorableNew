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

  async createCodespace(
    repository: string,
    branch?: string,
    machine?: string
  ): Promise<GitHubCodespace> {
    const [owner, repo] = repository.split('/');
    
    const response = await this.octokit.codespaces.createForAuthenticatedUser({
      repository_id: await this.getRepositoryId(owner, repo),
      ref: branch || 'main',
      machine: machine || 'basicLinux',
    });
    
    return response.data;
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