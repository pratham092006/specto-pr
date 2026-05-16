/**
 * Integration Tests for SpecToPR Backend API
 * 
 * These tests verify the complete API workflow including:
 * - Health check endpoint
 * - Configuration endpoint
 * - Validation endpoint
 * - PR generation endpoint (with mocked external APIs)
 */

import request from 'supertest';
import app from '../server.js';
import * as bobApiClient from '../services/bobApiClient.js';
import * as githubApiClient from '../services/githubApiClient.js';
import * as dnaExtractor from '../services/dnaExtractor.js';
import * as codeGenerator from '../services/codeGenerator.js';
import * as prCreator from '../services/prCreator.js';

// Load test fixtures
import sampleRepo from './fixtures/sample-repo.json' assert { type: 'json' };
import sampleDNA from './fixtures/sample-dna.json' assert { type: 'json' };
import fs from 'fs/promises';
import path from 'path';

// Mock external services
jest.mock('../services/bobApiClient.js');
jest.mock('../services/githubApiClient.js');
jest.mock('../services/dnaExtractor.js');
jest.mock('../services/codeGenerator.js');
jest.mock('../services/prCreator.js');

describe('SpecToPR Backend API Integration Tests', () => {
  
  // Setup before all tests
  beforeAll(() => {
    // Set required environment variables for testing
    process.env.BOB_API_URL = 'https://api.bob.test';
    process.env.BOB_API_KEY = 'test-bob-api-key';
    process.env.GITHUB_TOKEN = 'test-github-token';
    process.env.NODE_ENV = 'test';
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Cleanup after all tests
  afterAll(() => {
    // Clean up environment variables
    delete process.env.BOB_API_URL;
    delete process.env.BOB_API_KEY;
    delete process.env.GITHUB_TOKEN;
  });

  // ========================================
  // Health Check Endpoint Tests
  // ========================================

  describe('GET /api/health', () => {
    it('should return 200 when all configurations are set', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('configuration');
      expect(response.body.configuration.bob).toBe('configured');
      expect(response.body.configuration.github).toBe('configured');
    });

    it('should return 503 when Bob API is not configured', async () => {
      delete process.env.BOB_API_KEY;

      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(503);

      expect(response.body.status).toBe('ok');
      expect(response.body.configuration.bob).toBe('missing');

      // Restore for other tests
      process.env.BOB_API_KEY = 'test-bob-api-key';
    });

    it('should return 503 when GitHub token is not configured', async () => {
      delete process.env.GITHUB_TOKEN;

      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(503);

      expect(response.body.status).toBe('ok');
      expect(response.body.configuration.github).toBe('missing');

      // Restore for other tests
      process.env.GITHUB_TOKEN = 'test-github-token';
    });
  });

  // ========================================
  // Configuration Endpoint Tests
  // ========================================

  describe('GET /api/config', () => {
    it('should return configuration status without exposing secrets', async () => {
      const response = await request(app)
        .get('/api/config')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('bob');
      expect(response.body).toHaveProperty('github');
      expect(response.body).toHaveProperty('server');
      
      // Should not expose actual secrets
      expect(response.body.bob.apiKey).toBe('configured');
      expect(response.body.github.token).toBe('configured');
      
      // Should not contain actual API key or token
      expect(JSON.stringify(response.body)).not.toContain('test-bob-api-key');
      expect(JSON.stringify(response.body)).not.toContain('test-github-token');
    });
  });

  // ========================================
  // Validation Endpoint Tests
  // ========================================

  describe('POST /api/validate', () => {
    it('should validate correct parameters', async () => {
      const validParams = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature to calculate statistics'
      };

      const response = await request(app)
        .post('/api/validate')
        .send(validParams)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.message).toBe('Parameters are valid');
    });

    it('should reject missing repository URL', async () => {
      const invalidParams = {
        specification: 'Add a new feature'
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidParams)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.valid).toBe(false);
      expect(response.body.errors).toContain('Repository URL is required');
    });

    it('should reject missing specification', async () => {
      const invalidParams = {
        repoUrl: 'https://github.com/user/repo'
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidParams)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.valid).toBe(false);
      expect(response.body.errors).toContain('Specification is required');
    });

    it('should reject invalid repository URL format', async () => {
      const invalidParams = {
        repoUrl: 'not-a-valid-url',
        specification: 'Add a new feature'
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidParams)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.valid).toBe(false);
      expect(response.body.errors).toContain('Invalid GitHub repository URL');
    });

    it('should reject specification that is too short', async () => {
      const invalidParams = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add'
      };

      const response = await request(app)
        .post('/api/validate')
        .send(invalidParams)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.valid).toBe(false);
      expect(response.body.errors).toContain('Specification must be at least 10 characters');
    });
  });

  // ========================================
  // PR Generation Endpoint Tests
  // ========================================

  describe('POST /api/generate-pr', () => {
    
    // Setup mock responses for successful PR generation
    beforeEach(() => {
      // Mock Bob API client validation
      bobApiClient.validateBobConfig.mockImplementation(() => {
        // No error means valid
      });

      // Mock GitHub API client validation
      githubApiClient.validateGitHubConfig.mockImplementation(() => {
        // No error means valid
      });

      // Mock DNA extraction
      dnaExtractor.extractDNA.mockResolvedValue({
        success: true,
        data: sampleDNA
      });

      // Mock code generation
      codeGenerator.generateCode.mockResolvedValue({
        success: true,
        data: {
          files: [
            {
              path: 'src/features/statistics.js',
              content: '// Generated statistics feature\nexport function calculateStats() {\n  return {};\n}'
            },
            {
              path: 'src/features/statistics.test.js',
              content: '// Generated test file\nimport { calculateStats } from "./statistics";\n\ntest("calculates stats", () => {\n  expect(calculateStats()).toBeDefined();\n});'
            }
          ],
          summary: 'Generated 2 files for statistics feature'
        }
      });

      // Mock PR creation
      prCreator.createPR.mockResolvedValue({
        success: true,
        data: {
          prUrl: 'https://github.com/user/repo/pull/42',
          prNumber: 42,
          branchName: 'spectropr-statistics-feature',
          filesCreated: ['src/features/statistics.js', 'src/features/statistics.test.js']
        }
      });
    });

    it('should generate PR successfully with valid input', async () => {
      const validRequest = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature to calculate user statistics including total count and growth rate'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('prUrl');
      expect(response.body.data).toHaveProperty('prNumber');
      expect(response.body.data.prNumber).toBe(42);
      expect(response.body.data.prUrl).toContain('/pull/42');

      // Verify mocks were called
      expect(bobApiClient.validateBobConfig).toHaveBeenCalled();
      expect(githubApiClient.validateGitHubConfig).toHaveBeenCalled();
      expect(dnaExtractor.extractDNA).toHaveBeenCalled();
      expect(codeGenerator.generateCode).toHaveBeenCalled();
      expect(prCreator.createPR).toHaveBeenCalled();
    });

    it('should handle missing repository URL', async () => {
      const invalidRequest = {
        specification: 'Add a new feature'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid request parameters');
      expect(response.body.error.details).toContain('Repository URL is required');
    });

    it('should handle missing specification', async () => {
      const invalidRequest = {
        repoUrl: 'https://github.com/user/repo'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid request parameters');
      expect(response.body.error.details).toContain('Specification is required');
    });

    it('should handle invalid repository URL format', async () => {
      const invalidRequest = {
        repoUrl: 'not-a-valid-url',
        specification: 'Add a new feature to calculate statistics'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid request parameters');
    });

    it('should handle Bob API configuration errors', async () => {
      bobApiClient.validateBobConfig.mockImplementation(() => {
        throw new Error('Bob API key is not configured');
      });

      const validRequest = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature to calculate statistics'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Server configuration error');
      expect(response.body.error.details).toContain('Bob API key');
    });

    it('should handle GitHub API configuration errors', async () => {
      githubApiClient.validateGitHubConfig.mockImplementation(() => {
        throw new Error('GitHub token is not configured');
      });

      const validRequest = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature to calculate statistics'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Server configuration error');
      expect(response.body.error.details).toContain('GitHub token');
    });

    it('should handle DNA extraction errors', async () => {
      dnaExtractor.extractDNA.mockResolvedValue({
        success: false,
        error: {
          message: 'Failed to clone repository',
          details: 'Repository not found or access denied'
        }
      });

      const validRequest = {
        repoUrl: 'https://github.com/user/nonexistent-repo',
        specification: 'Add a new feature'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle code generation errors', async () => {
      codeGenerator.generateCode.mockResolvedValue({
        success: false,
        error: {
          message: 'Bob API request failed',
          details: 'Rate limit exceeded'
        }
      });

      const validRequest = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle PR creation errors', async () => {
      prCreator.createPR.mockResolvedValue({
        success: false,
        error: {
          message: 'Failed to create pull request',
          details: 'Branch already exists'
        }
      });

      const validRequest = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should accept optional baseBranch parameter', async () => {
      const requestWithBranch = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature',
        baseBranch: 'develop'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(requestWithBranch)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should accept optional branchPrefix parameter', async () => {
      const requestWithPrefix = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature',
        branchPrefix: 'feature'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(requestWithPrefix)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle network timeout errors', async () => {
      dnaExtractor.extractDNA.mockRejectedValue(
        new Error('Network timeout')
      );

      const validRequest = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Internal server error');
    });
  });

  // ========================================
  // Root Endpoint Tests
  // ========================================

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'SpecToPR Backend API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('generatePR');
    });
  });

  // ========================================
  // 404 Error Tests
  // ========================================

  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('availableRoutes');
    });

    it('should return 404 for POST to unknown routes', async () => {
      const response = await request(app)
        .post('/api/unknown-endpoint')
        .send({ data: 'test' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });

  // ========================================
  // Response Format Tests
  // ========================================

  describe('Response Format Validation', () => {
    it('should return consistent error format', async () => {
      const invalidRequest = {
        repoUrl: 'invalid-url'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(invalidRequest)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('details');
    });

    it('should return consistent success format', async () => {
      const validRequest = {
        repoUrl: 'https://github.com/user/repo',
        specification: 'Add a new feature to calculate statistics'
      };

      const response = await request(app)
        .post('/api/generate-pr')
        .send(validRequest)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('prUrl');
      expect(response.body.data).toHaveProperty('prNumber');
    });
  });
});

// Made with Bob