/**
 * GitHub API Client
 * Handles all GitHub operations: cloning, branching, committing, and PR creation
 */

import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MOCK_MODE = !GITHUB_TOKEN || GITHUB_TOKEN === 'mock_token_for_testing';

function createMockPullRequestResult(owner, repo, title, head, base) {
  const mockNumber = 1;
  return {
    url: `https://github.com/${owner}/${repo}/pull/${mockNumber}`,
    number: mockNumber,
    id: `mock-pr-${Date.now()}`,
    title,
    head,
    base
  };
}

/**
 * Initialize Octokit client
 * @returns {Octokit} Configured Octokit instance
 */
function getOctokit() {
  if (MOCK_MODE) {
    console.warn('[GitHub] Running in MOCK MODE - PR will not be created on GitHub');
    return null;
  }
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not set in environment variables');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

/**
 * Parse GitHub repository URL
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Object} Parsed owner and repo
 */
export function parseRepoUrl(repoUrl) {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/,
    /^([^/]+)\/([^/]+)$/
  ];

  for (const pattern of patterns) {
    const match = repoUrl.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }
  }

  throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
}

/**
 * Clone repository to local directory
 * @param {string} repoUrl - GitHub repository URL
 * @param {string} localPath - Local path to clone to
 * @param {string} [branch='main'] - Branch to clone
 * @returns {Promise<void>}
 */
export async function cloneRepository(repoUrl, localPath, branch = 'main') {
  try {
    if (MOCK_MODE) {
      console.warn('[GitHub] Running in MOCK MODE - skipping repository clone');
      await fs.mkdir(localPath, { recursive: true });
      return;
    }

    console.log(`[GitHub] Cloning ${repoUrl} to ${localPath}...`);
    
    const git = simpleGit();
    await git.clone(repoUrl, localPath, ['--depth', '1', '--branch', branch]);
    
    console.log('[GitHub] Repository cloned successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('[GitHub] Repository already exists locally');
      return;
    }
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

/**
 * Check if user has write access to repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<boolean>} True if user has write access
 */
export async function checkWriteAccess(owner, repo) {
  try {
    if (MOCK_MODE) {
      console.warn('[GitHub] Running in MOCK MODE - assuming write access');
      return true;
    }

    const octokit = getOctokit();
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return data.permissions?.push || data.permissions?.admin || false;
  } catch (error) {
    console.error('[GitHub] Error checking write access:', error.message);
    return false;
  }
}

/**
 * Get the default branch of a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<string>} Default branch name
 */
export async function getDefaultBranch(owner, repo) {
  try {
    if (MOCK_MODE) {
      return 'main';
    }

    const octokit = getOctokit();
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return data.default_branch || 'main';
  } catch (error) {
    throw new Error(`Failed to get default branch: ${error.message}`);
  }
}

/**
 * Create a new branch from base branch
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} newBranch - New branch name
 * @param {string} baseBranch - Base branch name
 * @returns {Promise<string>} SHA of the new branch
 */
export async function createBranch(owner, repo, newBranch, baseBranch) {
  try {
    if (MOCK_MODE) {
      console.warn('[GitHub] Running in MOCK MODE - skipping branch creation');
      return `mock-sha-${Date.now()}`;
    }

    const octokit = getOctokit();
    
    console.log(`[GitHub] Creating branch ${newBranch} from ${baseBranch}...`);
    
    // Get the reference of the base branch
    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`
    });

    // Create new branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: ref.object.sha
    });

    console.log(`[GitHub] Branch ${newBranch} created successfully`);
    return ref.object.sha;
  } catch (error) {
    if (error.status === 422) {
      throw new Error(`Branch ${newBranch} already exists`);
    }
    throw new Error(`Failed to create branch: ${error.message}`);
  }
}

/**
 * Commit files to a branch
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch name
 * @param {Array<Object>} files - Array of {path, content} objects
 * @param {string} commitMessage - Commit message
 * @returns {Promise<string>} Commit SHA
 */
export async function commitFiles(owner, repo, branch, files, commitMessage) {
  try {
    if (MOCK_MODE) {
      console.warn('[GitHub] Running in MOCK MODE - skipping commit creation');
      return `mock-commit-${Date.now()}`;
    }

    const octokit = getOctokit();
    
    console.log(`[GitHub] Committing ${files.length} files to ${branch}...`);

    // Get the current commit SHA
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });
    const currentCommitSha = refData.object.sha;

    // Get the tree SHA of the current commit
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha
    });
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for each file
    const fileBlobs = await Promise.all(
      files.map(async (file) => {
        const { data: blob } = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        });

        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        };
      })
    );

    // Create a new tree
    const { data: tree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: fileBlobs
    });

    // Create a new commit
    const { data: commit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: tree.sha,
      parents: [currentCommitSha]
    });

    // Update the branch reference
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: commit.sha
    });

    console.log(`[GitHub] Files committed successfully: ${commit.sha}`);
    return commit.sha;
  } catch (error) {
    throw new Error(`Failed to commit files: ${error.message}`);
  }
}

/**
 * Create a pull request
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} title - PR title
 * @param {string} head - Head branch (source)
 * @param {string} base - Base branch (target)
 * @param {string} body - PR description
 * @returns {Promise<Object>} PR data with url and number
 */
export async function createPullRequest(owner, repo, title, head, base, body) {
  try {
    if (MOCK_MODE) {
      console.warn('[GitHub] Running in MOCK MODE - returning mock PR result');
      const pr = createMockPullRequestResult(owner, repo, title, head, base);
      return {
        url: pr.url,
        number: pr.number,
        id: pr.id
      };
    }

    const octokit = getOctokit();
    
    console.log(`[GitHub] Creating pull request: ${title}`);

    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body
    });

    console.log(`[GitHub] Pull request created: ${pr.html_url}`);
    
    return {
      url: pr.html_url,
      number: pr.number,
      id: pr.id
    };
  } catch (error) {
    throw new Error(`Failed to create pull request: ${error.message}`);
  }
}

/**
 * Check GitHub API rate limit
 * @returns {Promise<Object>} Rate limit information
 */
export async function checkRateLimit() {
  try {
    if (MOCK_MODE) {
      return {
        limit: 0,
        remaining: 0,
        reset: new Date()
      };
    }

    const octokit = getOctokit();
    const { data } = await octokit.rest.rateLimit.get();
    
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000)
    };
  } catch (error) {
    throw new Error(`Failed to check rate limit: ${error.message}`);
  }
}

/**
 * Validate GitHub configuration
 * @returns {boolean} True if configuration is valid
 * @throws {Error} If configuration is invalid
 */
export function validateGitHubConfig() {
  if (!GITHUB_TOKEN && !MOCK_MODE) {
    throw new Error('GITHUB_TOKEN is not set in environment variables');
  }

  if (MOCK_MODE) {
    console.warn('[GitHub] MOCK MODE enabled - GitHub write operations will be simulated');
  }

  return true;
}

// Made with Bob
