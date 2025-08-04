// Simple test script to verify GitHub integration
const { Octokit } = require('@octokit/rest');

async function testGitHubIntegration() {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  const username = process.env.GITHUB_USERNAME;
  
  if (!token) {
    console.error('❌ GITHUB_PERSONAL_ACCESS_TOKEN not set');
    return;
  }
  
  if (!username) {
    console.error('❌ GITHUB_USERNAME not set');
    return;
  }
  
  console.log('🔍 Testing GitHub integration...');
  
  try {
    const octokit = new Octokit({
      auth: token,
    });
    
    // Test authentication
    const user = await octokit.users.getAuthenticated();
    console.log('✅ GitHub authentication successful');
    console.log(`👤 Authenticated as: ${user.data.login}`);
    
    // Test repository creation
    const repoName = `test-repo-${Date.now()}`;
    const repo = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'Test repository for Adorable GitHub integration',
      private: false,
      auto_init: true,
    });
    console.log('✅ Repository creation successful');
    console.log(`📁 Created repo: ${repo.data.full_name}`);
    
    // Test codespace creation (this might take a while)
    console.log('🚀 Creating codespace...');
    const codespace = await octokit.codespaces.createForAuthenticatedUser({
      repository_id: repo.data.id,
      ref: 'main',
      // Let GitHub choose the best available machine type
    });
    console.log('✅ Codespace creation successful');
    console.log(`💻 Codespace URL: ${codespace.data.web_ide_url}`);
    
    // Clean up - delete the test repository
    await octokit.repos.delete({
      owner: username,
      repo: repoName,
    });
    console.log('🧹 Test repository cleaned up');
    
    console.log('🎉 All GitHub integration tests passed!');
    
  } catch (error) {
    console.error('❌ GitHub integration test failed:', error.message);
    if (error.status === 401) {
      console.error('💡 Make sure your GitHub Personal Access Token is valid and has the required permissions');
    } else if (error.status === 403) {
      console.error('💡 Make sure your GitHub Personal Access Token has the required permissions (repo, codespaces)');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  testGitHubIntegration();
}

module.exports = { testGitHubIntegration };