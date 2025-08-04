// Cleanup script to delete failed repositories
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

async function cleanupFailedRepositories() {
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
  
  console.log('🧹 Starting repository cleanup...');
  
  try {
    const octokit = new Octokit({
      auth: token,
    });
    
    // Test authentication
    const user = await octokit.users.getAuthenticated();
    console.log(`✅ Authenticated as: ${user.data.login}`);
    
    // List all repositories
    const repos = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    
    console.log(`📁 Found ${repos.data.length} repositories`);
    
    // Find repositories that match our pattern
    const failedRepos = repos.data.filter(repo => 
      repo.name.includes('adorable-app-') || 
      repo.name.includes('test-repo-') ||
      repo.name.includes('failed-')
    );
    
    if (failedRepos.length === 0) {
      console.log('✅ No failed repositories found to clean up');
      return;
    }
    
    console.log(`🗑️ Found ${failedRepos.length} repositories to delete:`);
    failedRepos.forEach(repo => {
      console.log(`  - ${repo.full_name} (created: ${repo.created_at})`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  Are you sure you want to delete these repositories? (y/N)');
    
    // For automated cleanup, you can set this environment variable
    if (process.env.AUTO_CLEANUP === 'true') {
      console.log('🔄 Auto-cleanup enabled, proceeding...');
    } else {
      console.log('⏸️  Skipping deletion (set AUTO_CLEANUP=true to auto-delete)');
      return;
    }
    
    // Delete repositories
    const deleted = [];
    const errors = [];
    
    for (const repo of failedRepos) {
      try {
        await octokit.repos.delete({
          owner: repo.owner.login,
          repo: repo.name,
        });
        deleted.push(repo.full_name);
        console.log(`✅ Deleted: ${repo.full_name}`);
      } catch (error) {
        const errorMsg = `Failed to delete ${repo.full_name}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`✅ Successfully deleted: ${deleted.length} repositories`);
    console.log(`❌ Errors: ${errors.length} repositories`);
    
    if (deleted.length > 0) {
      console.log('\n🗑️ Deleted repositories:');
      deleted.forEach(repo => console.log(`  - ${repo}`));
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Failed deletions:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupFailedRepositories();
}

module.exports = { cleanupFailedRepositories };