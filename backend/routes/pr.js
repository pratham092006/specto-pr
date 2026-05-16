/**
 * PR Generation API Routes
 * Handles HTTP endpoints for PR generation
 */

import express from 'express';
import { generatePR, validateGeneratePRParams } from '../services/specToPR.js';
import { validateBobConfig } from '../services/bobApiClient.js';
import { validateGitHubConfig } from '../services/githubApiClient.js';

const router = express.Router();

/**
 * POST /api/generate-pr
 * Main endpoint to generate a pull request from specification
 * 
 * Request body:
 * {
 *   "repoUrl": "https://github.com/owner/repo",
 *   "specification": "Add a new feature...",
 *   "baseBranch": "main" (optional),
 *   "branchPrefix": "spectropr" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "prUrl": "https://github.com/owner/repo/pull/123",
 *     "prNumber": 123,
 *     "filesGenerated": ["file1.js", "file2.js"],
 *     ...
 *   }
 * }
 */
router.post('/generate-pr', async (req, res) => {
  try {
    console.log('[API] POST /api/generate-pr - Request received');
    
    const { repoUrl, specification, baseBranch, branchPrefix } = req.body;

    // Validate request parameters
    const validation = validateGeneratePRParams({
      repoUrl,
      specification,
      baseBranch,
      branchPrefix
    });

    if (!validation.valid) {
      console.error('[API] Validation failed:', validation.errors);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request parameters',
          details: validation.errors
        }
      });
    }

    // Validate API configurations
    try {
      validateBobConfig();
      validateGitHubConfig();
    } catch (configError) {
      console.error('[API] Configuration error:', configError.message);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Server configuration error',
          details: configError.message
        }
      });
    }

    // Log request details
    console.log('[API] Repository:', repoUrl);
    console.log('[API] Specification length:', specification.length);
    if (baseBranch) console.log('[API] Base branch:', baseBranch);

    // Generate PR (this is a long-running operation)
    const result = await generatePR({
      repoUrl,
      specification,
      baseBranch,
      branchPrefix
    });

    // Return result
    if (result.success) {
      console.log('[API] ✓ PR generated successfully');
      return res.status(200).json(result);
    } else {
      console.error('[API] ✗ PR generation failed:', result.error.message);
      return res.status(500).json(result);
    }

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  try {
    // Check if required environment variables are set
    const bobConfigured = !!process.env.BOB_API_URL && !!process.env.BOB_API_KEY;
    const githubConfigured = !!process.env.GITHUB_TOKEN;

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      configuration: {
        bob: bobConfigured ? 'configured' : 'missing',
        github: githubConfigured ? 'configured' : 'missing'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    const allConfigured = bobConfigured && githubConfigured;
    const statusCode = allConfigured ? 200 : 503;

    return res.status(statusCode).json(health);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/config
 * Get configuration status (without exposing secrets)
 */
router.get('/config', (req, res) => {
  try {
    const config = {
      bob: {
        url: process.env.BOB_API_URL ? 'configured' : 'not set',
        apiKey: process.env.BOB_API_KEY ? 'configured' : 'not set'
      },
      github: {
        token: process.env.GITHUB_TOKEN ? 'configured' : 'not set'
      },
      server: {
        port: process.env.PORT || 3001,
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    };

    return res.status(200).json(config);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

/**
 * POST /api/validate
 * Validate request parameters without executing
 */
router.post('/validate', (req, res) => {
  try {
    const { repoUrl, specification, baseBranch, branchPrefix } = req.body;

    const validation = validateGeneratePRParams({
      repoUrl,
      specification,
      baseBranch,
      branchPrefix
    });

    if (validation.valid) {
      return res.status(200).json({
        valid: true,
        message: 'Parameters are valid'
      });
    } else {
      return res.status(400).json({
        valid: false,
        errors: validation.errors
      });
    }
  } catch (error) {
    return res.status(500).json({
      valid: false,
      error: error.message
    });
  }
});

/**
 * Error handling middleware for this router
 */
router.use((error, req, res, next) => {
  console.error('[API] Route error:', error);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: error.message
    }
  });
});

export default router;

// Made with Bob
