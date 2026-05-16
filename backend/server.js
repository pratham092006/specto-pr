/**
 * SpecToPR Backend Server
 * Express server entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prRoutes from './routes/pr.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========================================
// Middleware
// ========================================

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ========================================
// Routes
// ========================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SpecToPR Backend API',
    version: '1.0.0',
    description: 'AI-powered specification to pull request generator',
    endpoints: {
      health: 'GET /api/health',
      config: 'GET /api/config',
      validate: 'POST /api/validate',
      generatePR: 'POST /api/generate-pr'
    },
    documentation: 'https://github.com/pratham092006/ibm-bob-hackathon'
  });
});

// API routes
app.use('/api', prRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/config',
      'POST /api/validate',
      'POST /api/generate-pr'
    ]
  });
});

// ========================================
// Error Handling
// ========================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      stack: NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ========================================
// Server Startup
// ========================================

// Validate required environment variables
function validateEnvironment() {
  // Check for API configuration (Bob or OpenAI)
  const hasApiConfig = (process.env.BOB_API_URL && process.env.BOB_API_KEY) ||
                       (process.env.OPENAI_API_URL && process.env.OPENAI_API_KEY);
  
  const hasGithubToken = process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'mock_token_for_testing';
  
  // Check if running in mock mode
  const mockMode = !hasApiConfig || !hasGithubToken;
  
  if (mockMode) {
    console.log('🧪 Running in MOCK MODE');
    console.log('   - No real API calls will be made');
    console.log('   - Example/demo code will be generated');
    console.log('   - PRs will not be created on GitHub');
    console.log('   - Perfect for testing the UI and workflow');
    console.log('');
    console.log('💡 To use real APIs:');
    console.log('   1. Get free Groq API key: https://console.groq.com');
    console.log('   2. Get GitHub token: https://github.com/settings/tokens');
    console.log('   3. Update backend/.env with real credentials');
    console.log('');
    return true;
  }
  
  // Log which API is being used
  if (process.env.USE_OPENAI === 'true' || process.env.OPENAI_API_KEY) {
    console.log('✓ Using OpenAI-compatible API');
  } else {
    console.log('✓ Using Bob API');
  }
  
  if (hasGithubToken) {
    console.log('✓ GitHub integration enabled');
  }
  
  return true;
}

// Start server
function startServer() {
  const server = app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 SpecToPR Backend Server');
    console.log('='.repeat(60));
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log('='.repeat(60));
    
    const envValid = validateEnvironment();
    if (envValid) {
      console.log('✓ All environment variables configured');
    }
    
    console.log('\nAvailable endpoints:');
    console.log('  GET  /                    - API information');
    console.log('  GET  /api/health          - Health check');
    console.log('  GET  /api/config          - Configuration status');
    console.log('  POST /api/validate        - Validate parameters');
    console.log('  POST /api/generate-pr     - Generate pull request');
    console.log('='.repeat(60));
    console.log('Server is ready to accept requests\n');
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}

// Start the server
startServer();

export default app;

// Made with Bob
