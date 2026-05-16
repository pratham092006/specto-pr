# SpecToPR Backend API

Backend service for SpecToPR - AI-powered specification to pull request generator using IBM Bob API.

## Overview

This backend orchestrates a 4-phase process to generate GitHub pull requests from natural language specifications:

1. **Phase 1**: Clone target repository
2. **Phase 2**: Extract repository DNA (coding patterns, conventions)
3. **Phase 3**: Generate code files matching DNA constraints
4. **Phase 4**: Create GitHub pull request

## Architecture

```
backend/
├── services/           # Core business logic
│   ├── bobApiClient.js        # Bob API integration with retry logic
│   ├── githubApiClient.js     # GitHub API operations
│   ├── dnaExtractor.js        # Phase 2: DNA extraction
│   ├── codeGenerator.js       # Phase 3: Code generation
│   ├── prCreator.js           # Phase 4: PR creation
│   └── specToPR.js            # Main orchestrator
├── routes/            # API endpoints
│   └── pr.js                  # PR generation routes
├── utils/             # Utilities
│   ├── fileSampler.js         # Smart file sampling (6 files, 80 lines)
│   └── promptTemplates.js     # Bob API prompt templates
├── server.js          # Express server entry point
├── package.json       # Dependencies
└── .env.example       # Environment variables template
```

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `BOB_API_URL` - IBM Bob API endpoint
- `BOB_API_KEY` - Your Bob API key
- `GITHUB_TOKEN` - GitHub Personal Access Token with repo permissions
- `PORT` - Server port (default: 3001)

### 3. Start Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### POST /api/generate-pr

Generate a pull request from specification.

**Request:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "specification": "Add a new authentication module with JWT support...",
  "baseBranch": "main",
  "branchPrefix": "spectropr"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prUrl": "https://github.com/owner/repo/pull/123",
    "prNumber": 123,
    "branch": "spectropr-1234567890-abc123",
    "filesGenerated": ["src/auth.js", "src/middleware/jwt.js", "tests/auth.test.js"],
    "filesCount": 3,
    "totalLines": 245,
    "dna": {
      "language": "JavaScript (ES6)",
      "asyncStyle": "async-await",
      "testFramework": "jest"
    },
    "summary": "Added authentication module with JWT support",
    "duration": 45.23,
    "timestamp": "2026-05-16T06:30:00.000Z"
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-16T06:30:00.000Z",
  "configuration": {
    "bob": "configured",
    "github": "configured"
  }
}
```

### GET /api/config

Get configuration status (without exposing secrets).

### POST /api/validate

Validate request parameters without executing.

## Key Features

### Smart File Sampling
- Samples max 6 files from repository
- Limits each file to 80 lines
- Diverse sampling: 3 source, 2 tests, 1 config

### DNA Extraction
- Temperature: 0.1 (deterministic)
- Extracts: naming conventions, file structure, coding patterns, dependencies, testing patterns

### Code Generation
- Temperature: 0.3 (balanced creativity)
- DNA-constrained generation
- Syntax validation
- DNA compliance checking

### PR Creation
- Automatic branch creation
- Multi-file commits
- AI-generated PR descriptions
- Rollback on failure

### Error Handling
- Retry logic with exponential backoff (3 attempts)
- Comprehensive error messages
- Graceful degradation
- Automatic cleanup

## Development

### Project Structure

- **Services**: Core business logic, each service handles one phase
- **Routes**: HTTP endpoint handlers
- **Utils**: Reusable utilities (file sampling, prompt templates)

### Adding New Features

1. Create service in `services/`
2. Add route in `routes/`
3. Update `server.js` if needed
4. Test with health check endpoint

### Testing

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test configuration
curl http://localhost:3001/api/config

# Test PR generation
curl -X POST http://localhost:3001/api/generate-pr \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/owner/repo",
    "specification": "Add a hello world function"
  }'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BOB_API_URL` | Yes | IBM Bob API endpoint |
| `BOB_API_KEY` | Yes | Bob API authentication key |
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (development/production) |
| `CORS_ORIGIN` | No | CORS origin (default: *) |

## Token Usage & Cost

Estimated token usage per PR:
- DNA Extraction: ~2,500-4,000 tokens
- Code Generation: ~4,000-6,000 tokens
- PR Description: ~800-1,000 tokens
- **Total**: ~7,300-11,000 tokens per PR

At $0.002/1K tokens: **~$0.015-0.022 per PR**

## Troubleshooting

### "BOB_API_KEY is not set"
- Ensure `.env` file exists with `BOB_API_KEY`
- Restart server after updating `.env`

### "No write access to repository"
- Check GitHub token has `repo` scope
- Verify token is valid and not expired

### "Failed to clone repository"
- Ensure repository URL is correct
- Check repository is accessible with provided token

### "Rate limit exceeded"
- GitHub API has rate limits
- Wait for rate limit reset or use authenticated requests

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.