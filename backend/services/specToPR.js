/**
 * SpecToPR Main Orchestrator
 * Coordinates all 4 phases of the PR generation process
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { cloneRepository, parseRepoUrl } from './githubApiClient.js';
import { extractDNA, getDNASummary } from './dnaExtractor.js';
import { generateCode, estimateTokenUsage } from './codeGenerator.js';
import { createPRWithRollback, getPRSummary } from './prCreator.js';

/**
 * Create a temporary directory for repository cloning
 * @returns {Promise<string>} Path to temporary directory
 */
async function createTempDir() {
  const tempDir = path.join(os.tmpdir(), `spectropr-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up temporary directory
 * @param {string} dirPath - Directory to remove
 */
async function cleanupTempDir(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    console.log(`[SpecToPR] Cleaned up temporary directory: ${dirPath}`);
  } catch (error) {
    console.error(`[SpecToPR] Failed to cleanup ${dirPath}:`, error.message);
  }
}

/**
 * Main function to generate a PR from specification
 * Orchestrates all 4 phases:
 * 1. Clone repository
 * 2. Extract DNA
 * 3. Generate code
 * 4. Create PR
 * 
 * @param {Object} params - Generation parameters
 * @param {string} params.repoUrl - GitHub repository URL
 * @param {string} params.specification - User's specification
 * @param {string} [params.baseBranch] - Base branch (optional)
 * @param {string} [params.branchPrefix='spectropr'] - Branch name prefix
 * @returns {Promise<Object>} Complete result with PR details
 */
export async function generatePR(params) {
  const {
    repoUrl,
    specification,
    baseBranch,
    branchPrefix = 'spectropr'
  } = params;

  let tempDir = null;
  const startTime = Date.now();

  try {
    console.log('='.repeat(60));
    console.log('[SpecToPR] Starting PR generation process');
    console.log('='.repeat(60));

    // Validate inputs
    if (!repoUrl || !specification) {
      throw new Error('repoUrl and specification are required');
    }

    const { owner, repo } = parseRepoUrl(repoUrl);
    console.log(`[SpecToPR] Repository: ${owner}/${repo}`);
    console.log(`[SpecToPR] Specification length: ${specification.length} characters`);

    // ========================================
    // PHASE 1: Clone Repository
    // ========================================
    console.log('\n[PHASE 1] Cloning repository...');
    tempDir = await createTempDir();
    const repoPath = path.join(tempDir, repo);
    
    await cloneRepository(repoUrl, repoPath, baseBranch || 'main');
    console.log(`[PHASE 1] ✓ Repository cloned to: ${repoPath}`);

    // ========================================
    // PHASE 2: Extract DNA
    // ========================================
    console.log('\n[PHASE 2] Extracting repository DNA...');
    const dnaResult = await extractDNA(repoPath);
    const { dna, sampledFiles, stats } = dnaResult;
    
    console.log('[PHASE 2] ✓ DNA extracted successfully');
    console.log('[PHASE 2] DNA Summary:', getDNASummary(dna));
    console.log('[PHASE 2] Files sampled:', sampledFiles.length);
    console.log('[PHASE 2] Repository stats:', stats);

    // ========================================
    // PHASE 3: Generate Code
    // ========================================
    console.log('\n[PHASE 3] Generating code...');
    
    // Estimate token usage
    const estimatedTokens = estimateTokenUsage(specification, dna);
    console.log(`[PHASE 3] Estimated tokens: ${estimatedTokens}`);

    const codeResult = await generateCode(specification, dna);
    const { files, summary, validationErrors, dnaCompliance, metadata } = codeResult;
    
    console.log('[PHASE 3] ✓ Code generated successfully');
    console.log(`[PHASE 3] Files generated: ${files.length}`);
    console.log(`[PHASE 3] Total lines: ${metadata.totalLines}`);
    console.log('[PHASE 3] Summary:', summary);

    if (validationErrors) {
      console.warn('[PHASE 3] ⚠ Validation warnings:', validationErrors);
    }

    if (!dnaCompliance.compliant) {
      console.warn('[PHASE 3] ⚠ DNA compliance issues:', dnaCompliance.issues);
    }

    // ========================================
    // PHASE 4: Create Pull Request
    // ========================================
    console.log('\n[PHASE 4] Creating pull request...');
    
    const prResult = await createPRWithRollback({
      repoUrl,
      specification,
      files,
      baseBranch,
      branchPrefix
    });

    console.log('[PHASE 4] ✓ Pull request created successfully');
    console.log(`[PHASE 4] PR URL: ${prResult.prUrl}`);
    console.log(`[PHASE 4] PR Number: #${prResult.prNumber}`);

    // ========================================
    // Complete
    // ========================================
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('[SpecToPR] ✓ PR generation completed successfully');
    console.log(`[SpecToPR] Duration: ${duration}s`);
    console.log('='.repeat(60));

    // Cleanup temporary directory
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }

    // Return comprehensive result
    return {
      success: true,
      data: {
        // PR Information
        prUrl: prResult.prUrl,
        prNumber: prResult.prNumber,
        branch: prResult.branch,
        baseBranch: prResult.baseBranch,
        
        // Generated Files
        filesGenerated: files.map(f => f.path),
        filesCount: files.length,
        totalLines: metadata.totalLines,
        
        // DNA Information
        dna: getDNASummary(dna),
        sampledFiles: sampledFiles.length,
        repoStats: stats,
        
        // Code Generation Details
        summary,
        validationErrors,
        dnaCompliance,
        
        // PR Description
        prDescription: prResult.prDescription,
        
        // Metadata
        duration: parseFloat(duration),
        timestamp: new Date().toISOString(),
        estimatedTokens
      }
    };

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('[SpecToPR] ✗ PR generation failed');
    console.error('[SpecToPR] Error:', error.message);
    console.error('='.repeat(60));

    // Cleanup on error
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }

    // Return error response
    return {
      success: false,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Validate generatePR parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result
 */
export function validateGeneratePRParams(params) {
  const errors = [];

  if (!params) {
    errors.push('Parameters object is required');
    return { valid: false, errors };
  }

  if (!params.repoUrl || typeof params.repoUrl !== 'string') {
    errors.push('repoUrl is required and must be a string');
  }

  if (!params.specification || typeof params.specification !== 'string') {
    errors.push('specification is required and must be a string');
  }

  if (params.specification && params.specification.trim().length < 10) {
    errors.push('specification must be at least 10 characters long');
  }

  if (params.baseBranch && typeof params.baseBranch !== 'string') {
    errors.push('baseBranch must be a string if provided');
  }

  if (params.branchPrefix && typeof params.branchPrefix !== 'string') {
    errors.push('branchPrefix must be a string if provided');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get status of a PR generation process
 * (For future implementation with job queues)
 * 
 * @param {string} jobId - Job identifier
 * @returns {Promise<Object>} Job status
 */
export async function getGenerationStatus(jobId) {
  // Placeholder for future implementation
  throw new Error('Status tracking not yet implemented');
}

// Made with Bob
