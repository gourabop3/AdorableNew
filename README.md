# Adorable GitHub

Open-source version of **Lovable** - an AI agent that can make websites and apps through a chat interface, now powered by GitHub Codespaces.

## Features

- Chat interface for interacting with AI code assistants
- Patch-based code editing with user approval
- GitHub integration for version control and repositories
- GitHub Codespaces for development environments
- Preview capabilities for code changes

## Setup Instructions

### Dependencies

- Node.js
- PostgreSQL database ([Neon](https://neon.tech) is easy and has a good free tier)
- Redis (for caching and session management)
- Anthropic API key
- GitHub Personal Access Token

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/adorable-github
   cd adorable-github
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Get a GitHub Personal Access Token

   Head to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens) to create a new token with the following permissions:
   - `repo` (Full control of private repositories)
   - `codespaces` (Full control of codespaces)
   - `workflow` (Update GitHub Action workflows)

4. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/adorable

   # Anthropic API
   ANTHROPIC_API_KEY=your_anthropic_api_key

   # GitHub API
   GITHUB_PERSONAL_ACCESS_TOKEN=your_github_personal_access_token
   GITHUB_USERNAME=your_github_username
   ```

5. Initialize the database:

   ```bash
   npx drizzle-kit push
   ```

6. Set up Redis

The easiest way to run Redis locally is with Docker:

```bash
docker run --name adorable-redis -p 6379:6379 -d redis
```

This will start a Redis server on port 6379. If you already have Redis running, you can skip this step.

Add the following to your `.env` file (if not already present):

```env
REDIS_URL=redis://localhost:6379
```

7. Set up [Stack Auth](https://stack-auth.com)

Go to the [Stack Auth dashboard](https://app.stack-auth.com) and create a new application. In Configuration > Domains, enable `Allow all localhost callbacks for development` to be able to sign in locally.

You'll need to add the following environment variables to your `.env` file:

```env
NEXT_PUBLIC_STACK_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=<your-publishable-client-key>
STACK_SECRET_SERVER_KEY=<your-secret-server-key>
```

8. Add a Preview Domain (optional)

For production deployment, you can set up a custom domain for your deployed apps. Add the following environment variable to your `.env` file:

```env
PREVIEW_DOMAIN=<your-domain> # formatted like adorable.app
```

9. Run the development server:

   ```bash
   npm run dev
   ```

10. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it Works

1. **Repository Creation**: When you create a new app, it creates a new GitHub repository
2. **Codespace Environment**: Each app gets its own GitHub Codespace for development
3. **AI Chat Interface**: Chat with AI to make code changes and improvements
4. **Version Control**: All changes are committed to the GitHub repository
5. **Deployment**: Apps can be deployed to GitHub Pages or other platforms

## Deployment

For production deployment:

```bash
npm run build
npm run start
```

## GitHub Integration

This application uses GitHub's APIs to:

- Create and manage repositories
- Launch GitHub Codespaces for development
- Handle authentication via GitHub Personal Access Tokens
- Manage code changes and commits

The GitHub integration provides a more familiar development environment for developers who are already using GitHub for their projects.

## Billing system deployed

<!-- Last updated: 2025-01-08 09:40 UTC - Restored to eeb7ecf commit -->
