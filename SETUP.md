# GitHub Integration Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# GitHub API Configuration
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/adorable

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Redis
REDIS_URL=redis://localhost:6379

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_client_key
STACK_SECRET_SERVER_KEY=your_secret_server_key

# Preview Domain (optional)
PREVIEW_DOMAIN=your-domain.com
```

## GitHub Personal Access Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Adorable GitHub Integration"
4. Set expiration (recommend 90 days for security)
5. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `codespaces` (Full control of codespaces)
   - ✅ `workflow` (Update GitHub Action workflows) - optional
6. Click "Generate token"
7. Copy the token and add it to your `.env` file

## Testing the Integration

Run the GitHub integration test:

```bash
npm run test:github
```

This will:
1. Test GitHub authentication
2. Create a test repository
3. Create a test codespace
4. Clean up the test repository

## Troubleshooting

### "Must have admin rights to Repository" Error

This error occurs when:
1. **Token permissions are insufficient** - Make sure your PAT has `codespaces` scope
2. **Repository access issues** - Ensure you have admin access to the repository
3. **Organization settings** - Check if codespaces are enabled in your organization

### "Repository not found" Error

This usually means:
1. The repository doesn't exist
2. You don't have access to the repository
3. The repository name format is incorrect (should be `owner/repo`)

### Rate Limiting

GitHub has rate limits for API calls:
- Authenticated requests: 5,000 requests per hour
- Codespace creation: Limited by your GitHub plan

The improved integration now reuses existing codespaces to reduce API calls.

## Codespace Management

The system now:
- ✅ Checks for existing codespaces before creating new ones
- ✅ Reuses existing codespaces when available
- ✅ Provides better error handling and logging
- ✅ Reduces GitHub API usage

## Security Notes

- Never commit your `.env` file to version control
- Rotate your GitHub PAT regularly
- Use the minimum required permissions for your PAT
- Consider using GitHub Apps for production deployments