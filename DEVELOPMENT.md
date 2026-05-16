# SpecToPR Development Guide

Comprehensive guide for developers contributing to or extending the SpecToPR system.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Adding New Features](#adding-new-features)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Strategy](#testing-strategy)
- [Debugging Tips](#debugging-tips)
- [Common Issues](#common-issues)
- [Contributing Guidelines](#contributing-guidelines)

## Getting Started

### Development Environment Setup

1. **Install Prerequisites**
   ```bash
   node --version  # Should be 16+
   npm --version   # Should be 8+
   git --version   # Should be 2+
   ```

2. **Clone and Setup**
   ```bash
   git clone https://github.com/yourusername/spectropr.git
   cd spectropr
   
   # Backend
   cd backend
   npm install
   cp .env.example .env
   # Configure .env with your credentials
   
   # Frontend
   cd ../frontend
   npm install
   cp .env.example .env
   ```

3. **Install Development Tools**
   ```bash
   # Optional but recommended
   npm install -g nodemon      # Auto-restart on changes
   npm install -g eslint       # Linting
   npm install -g prettier     # Code formatting
   ```

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd frontend
npm start    # React dev server with hot reload
```

**Both simultaneously:**
```bash
# Use two terminal windows/tabs
# Or use a tool like concurrently
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

## Project Structure

### Backend Structure

```
backend/
├── services/              # Core business logic
│   ├── bobApiClient.js       # Bob API integration
│   ├── githubApiClient.js    # GitHub API integration
│   ├── dnaExtractor.js       # Phase 2: DNA extraction
│   ├── codeGenerator.js      # Phase 3: Code generation
│   ├── prCreator.js          # Phase 4: PR creation
│   └── specToPR.js           # Main orchestrator
├── routes/                # Express route handlers
│   └── pr.js                 # PR generation endpoints
├── utils/                 # Utility functions
│   ├── fileSampler.js        # Smart file sampling
│   └── promptTemplates.js    # Bob API prompts
├── server.js              # Express server entry point
├── package.json           # Dependencies
└── .env.example           # Environment template
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── SpecInput.js         # Specification textarea
│   │   ├── RepoInput.js         # Repository inputs
│   │   ├── GenerateButton.js    # Submit button
│   │   ├── ResultsTabs.js       # Results display
│   │   ├── ErrorDisplay.js      # Error messages
│   │   └── LoadingSpinner.js    # Loading indicator
│   ├── services/
│   │   └── api.js               # API client
│   ├── utils/
│   │   └── formatters.js        # Utility functions
│   ├── App.js                   # Main component
│   ├── App.css                  # Main styles
│   ├── index.js                 # Entry point
│   └── index.css                # Global styles
├── public/
│   └── index.html               # HTML template
└── package.json                 # Dependencies
```

### Key Files Explained

#### Backend

**`services/specToPR.js`** - Main orchestrator
- Coordinates all 4 phases
- Manages state and error handling
- Entry point for PR generation

**`services/dnaExtractor.js`** - DNA extraction
- Samples repository files
- Calls Bob API for pattern analysis
- Returns structured DNA object

**`services/codeGenerator.js`** - Code generation
- Takes specification + DNA
- Generates code via Bob API
- Validates output

**`services/prCreator.js`** - PR creation
- Creates branch
- Commits files
- Generates PR description
- Creates pull request

**`utils/fileSampler.js`** - Smart sampling
- Selects representative files
- Limits file size
- Ensures diversity

**`utils/promptTemplates.js`** - Prompt templates
- DNA extraction prompt
- Code generation prompt
- PR description prompt

#### Frontend

**`App.js`** - Main application
- State management
- API calls
- Component orchestration

**`components/ResultsTabs.js`** - Results display
- Tabbed interface
- Syntax highlighting
- Markdown rendering

**`services/api.js`** - API client
- Axios configuration
- Error handling
- Request/response formatting

## Architecture Overview

### 4-Phase Process

```
┌─────────────────────────────────────────────────────────┐
│ Phase 1: Repository Clone                              │
│ - Clone target repository                              │
│ - Validate repository access                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 2: DNA Extraction                                │
│ - Sample 6 files (3 source, 2 test, 1 config)         │
│ - Call Bob API (temp: 0.1)                            │
│ - Extract patterns, conventions, dependencies          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 3: Code Generation                               │
│ - Combine specification + DNA                          │
│ - Call Bob API (temp: 0.3)                            │
│ - Generate code files                                  │
│ - Validate syntax and DNA compliance                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Phase 4: PR Creation                                   │
│ - Create new branch                                    │
│ - Commit generated files                               │
│ - Generate PR description (Bob API, temp: 0.5)        │
│ - Create pull request on GitHub                        │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```javascript
// User Input
{
  specification: "Add authentication...",
  repoUrl: "https://github.com/user/repo",
  githubToken: "ghp_..."
}
        ↓
// Phase 1: Clone
{
  repoPath: "/tmp/repo-abc123",
  files: ["src/app.js", "src/utils.js", ...]
}
        ↓
// Phase 2: DNA
{
  language: "JavaScript",
  framework: "Express",
  patterns: {
    asyncStyle: "async-await",
    errorHandling: "try-catch",
    ...
  }
}
        ↓
// Phase 3: Generated Code
{
  files: [
    { path: "src/auth.js", content: "..." },
    { path: "tests/auth.test.js", content: "..." }
  ]
}
        ↓
// Phase 4: PR Created
{
  prUrl: "https://github.com/user/repo/pull/42",
  prNumber: 42,
  branch: "spectropr-123456-abc"
}
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow the code style guidelines and test your changes.

### 3. Test Locally

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Manual testing
# Start both servers and test the full flow
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

Use conventional commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Adding New Features

### Adding a New Service

1. **Create service file**
   ```bash
   touch backend/services/myNewService.js
   ```

2. **Implement service**
   ```javascript
   // backend/services/myNewService.js
   const axios = require('axios');
   
   class MyNewService {
     constructor(config) {
       this.config = config;
     }
     
     async doSomething(params) {
       try {
         // Implementation
         return result;
       } catch (error) {
         console.error('Error in MyNewService:', error);
         throw error;
       }
     }
   }
   
   module.exports = MyNewService;
   ```

3. **Add tests**
   ```bash
   touch backend/tests/myNewService.test.js
   ```

4. **Integrate into main flow**
   ```javascript
   // backend/services/specToPR.js
   const MyNewService = require('./myNewService');
   
   // Use in generatePR function
   const myService = new MyNewService(config);
   const result = await myService.doSomething(params);
   ```

### Adding a New API Endpoint

1. **Add route handler**
   ```javascript
   // backend/routes/pr.js
   router.post('/new-endpoint', async (req, res) => {
     try {
       const { param1, param2 } = req.body;
       
       // Validation
       if (!param1) {
         return res.status(400).json({ error: 'param1 is required' });
       }
       
       // Process
       const result = await someService.process(param1, param2);
       
       res.json({ success: true, data: result });
     } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ error: error.message });
     }
   });
   ```

2. **Update frontend API client**
   ```javascript
   // frontend/src/services/api.js
   export const callNewEndpoint = async (param1, param2) => {
     const response = await axios.post('/api/new-endpoint', {
       param1,
       param2
     });
     return response.data;
   };
   ```

### Adding a New React Component

1. **Create component files**
   ```bash
   mkdir frontend/src/components/MyComponent
   touch frontend/src/components/MyComponent/MyComponent.js
   touch frontend/src/components/MyComponent/MyComponent.css
   ```

2. **Implement component**
   ```javascript
   // MyComponent.js
   import React from 'react';
   import PropTypes from 'prop-types';
   import './MyComponent.css';
   
   const MyComponent = ({ prop1, prop2, onAction }) => {
     return (
       <div className="my-component">
         <h2>{prop1}</h2>
         <p>{prop2}</p>
         <button onClick={onAction}>Action</button>
       </div>
     );
   };
   
   MyComponent.propTypes = {
     prop1: PropTypes.string.isRequired,
     prop2: PropTypes.string,
     onAction: PropTypes.func.isRequired,
   };
   
   export default MyComponent;
   ```

3. **Add styles**
   ```css
   /* MyComponent.css */
   .my-component {
     padding: 20px;
     border-radius: 8px;
     background: white;
   }
   ```

4. **Use in parent component**
   ```javascript
   import MyComponent from './components/MyComponent/MyComponent';
   
   <MyComponent 
     prop1="Hello"
     prop2="World"
     onAction={handleAction}
   />
   ```

### Modifying Prompt Templates

Prompt templates are in `backend/utils/promptTemplates.js`.

**Example: Modify DNA extraction prompt**

```javascript
// backend/utils/promptTemplates.js

exports.getDNAExtractionPrompt = (files, repoUrl) => {
  return `You are analyzing a code repository to extract its "DNA" - the coding patterns and conventions.

Repository: ${repoUrl}

Sample Files:
${files.map(f => `
File: ${f.path}
\`\`\`
${f.content}
\`\`\`
`).join('\n')}

Analyze these files and extract:
1. Programming language and version
2. Framework/libraries used
3. Naming conventions (camelCase, snake_case, etc.)
4. File structure patterns
5. Async patterns (callbacks, promises, async-await)
6. Error handling style
7. Testing framework and patterns
8. Code style preferences
9. Common dependencies
10. [ADD YOUR NEW ANALYSIS POINT HERE]

Return ONLY a JSON object with this structure:
{
  "language": "...",
  "framework": "...",
  "namingConventions": {...},
  "fileStructure": {...},
  "asyncStyle": "...",
  "errorHandling": "...",
  "testingFramework": "...",
  "codeStyle": {...},
  "dependencies": [...],
  "yourNewField": "..."
}`;
};
```

**Testing prompt changes:**

```bash
# Create a test script
node backend/scripts/testPrompt.js
```

```javascript
// backend/scripts/testPrompt.js
const { getDNAExtractionPrompt } = require('../utils/promptTemplates');

const testFiles = [
  { path: 'src/app.js', content: 'const express = require("express");' }
];

const prompt = getDNAExtractionPrompt(testFiles, 'https://github.com/test/repo');
console.log(prompt);
```

### Modifying DNA Extraction Logic

**Location:** `backend/services/dnaExtractor.js`

**Example: Add new DNA field**

```javascript
// backend/services/dnaExtractor.js

async extractDNA(repoPath) {
  // ... existing code ...
  
  // Parse Bob API response
  const dna = JSON.parse(response.data.content);
  
  // Add custom processing
  dna.customField = this.analyzeCustomField(files);
  
  return dna;
}

analyzeCustomField(files) {
  // Your custom analysis logic
  return 'custom value';
}
```

## Code Style Guidelines

### JavaScript/Node.js

**General Rules:**
- Use `const` and `let`, never `var`
- Use async/await over promises
- Use arrow functions for callbacks
- Use template literals for strings
- Add JSDoc comments for functions

**Example:**
```javascript
/**
 * Generate a pull request from specification
 * @param {string} specification - Feature description
 * @param {string} repoUrl - GitHub repository URL
 * @param {string} githubToken - GitHub access token
 * @returns {Promise<Object>} PR details
 */
async function generatePR(specification, repoUrl, githubToken) {
  const config = {
    specification,
    repoUrl,
    githubToken
  };
  
  try {
    const result = await processRequest(config);
    return result;
  } catch (error) {
    console.error('Error generating PR:', error);
    throw error;
  }
}
```

**Naming Conventions:**
- Variables/functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_prefixWithUnderscore`

### React/JSX

**Component Structure:**
```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Component.css';

const Component = ({ prop1, prop2, onAction }) => {
  // State
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
};

Component.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func.isRequired,
};

Component.defaultProps = {
  prop2: 0,
};

export default Component;
```

**React Best Practices:**
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use PropTypes for type checking
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback`

### CSS

**Naming:**
- Use kebab-case for class names
- Use BEM methodology for complex components
- Prefix component-specific classes

**Example:**
```css
/* Component-specific styles */
.spec-input {
  padding: 16px;
  border-radius: 8px;
}

.spec-input__textarea {
  width: 100%;
  min-height: 200px;
}

.spec-input__counter {
  text-align: right;
  color: #666;
}

.spec-input--error {
  border-color: red;
}
```

### Error Handling

**Backend:**
```javascript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  
  // Provide context
  throw new Error(`Failed to perform operation: ${error.message}`);
}
```

**Frontend:**
```javascript
try {
  const data = await api.fetchData();
  setData(data);
} catch (error) {
  console.error('Error fetching data:', error);
  setError('Failed to load data. Please try again.');
}
```

## Testing Strategy

### Backend Testing

**Unit Tests:**
```javascript
// backend/tests/dnaExtractor.test.js
const DNAExtractor = require('../services/dnaExtractor');

describe('DNAExtractor', () => {
  let extractor;
  
  beforeEach(() => {
    extractor = new DNAExtractor(mockConfig);
  });
  
  describe('extractDNA', () => {
    it('should extract DNA from repository', async () => {
      const result = await extractor.extractDNA('/path/to/repo');
      
      expect(result).toHaveProperty('language');
      expect(result).toHaveProperty('framework');
      expect(result.language).toBe('JavaScript');
    });
    
    it('should handle errors gracefully', async () => {
      await expect(
        extractor.extractDNA('/invalid/path')
      ).rejects.toThrow();
    });
  });
});
```

**Integration Tests:**
```javascript
// backend/tests/integration/pr.test.js
const request = require('supertest');
const app = require('../server');

describe('PR Generation API', () => {
  it('should generate PR successfully', async () => {
    const response = await request(app)
      .post('/api/generate-pr')
      .send({
        repoUrl: 'https://github.com/test/repo',
        specification: 'Add hello world function',
        githubToken: process.env.TEST_GITHUB_TOKEN
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('prUrl');
  });
});
```

### Frontend Testing

**Component Tests:**
```javascript
// frontend/src/components/SpecInput.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import SpecInput from './SpecInput';

describe('SpecInput', () => {
  it('renders textarea', () => {
    render(<SpecInput value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  
  it('calls onChange when text is entered', () => {
    const handleChange = jest.fn();
    render(<SpecInput value="" onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalledWith('test');
  });
  
  it('shows character count', () => {
    render(<SpecInput value="Hello" onChange={() => {}} />);
    expect(screen.getByText(/5 characters/i)).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Backend
cd backend
npm test                    # Run all tests
npm test -- --coverage      # With coverage
npm test -- --watch         # Watch mode
npm test dnaExtractor       # Specific test

# Frontend
cd frontend
npm test                    # Run all tests
npm test -- --coverage      # With coverage
npm test -- --watchAll      # Watch mode
```

## Debugging Tips

### Backend Debugging

**1. Enable detailed logging:**
```javascript
// Add to server.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

**2. Use Node.js debugger:**
```bash
node --inspect-brk server.js
# Then open chrome://inspect in Chrome
```

**3. Debug Bob API calls:**
```javascript
// In bobApiClient.js
console.log('Bob API Request:', {
  prompt: prompt.substring(0, 200) + '...',
  temperature,
  maxTokens
});

const response = await axios.post(/* ... */);

console.log('Bob API Response:', {
  status: response.status,
  contentLength: response.data.content?.length
});
```

### Frontend Debugging

**1. React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state
- Profile component renders

**2. Console logging:**
```javascript
useEffect(() => {
  console.log('Component mounted');
  console.log('Props:', { prop1, prop2 });
  console.log('State:', state);
}, []);
```

**3. Network debugging:**
- Open browser DevTools (F12)
- Go to Network tab
- Filter by XHR to see API calls
- Check request/response details

**4. Redux DevTools (if using Redux):**
- Install Redux DevTools extension
- Track state changes
- Time-travel debugging

### Common Debugging Scenarios

**Issue: Bob API returns unexpected response**
```javascript
// Add detailed logging
console.log('Prompt sent to Bob:', prompt);
console.log('Bob response:', JSON.stringify(response.data, null, 2));

// Validate response structure
if (!response.data.content) {
  console.error('Missing content in Bob response:', response.data);
}
```

**Issue: GitHub API fails**
```javascript
// Check token and permissions
console.log('GitHub token:', githubToken ? 'Present' : 'Missing');
console.log('Repository URL:', repoUrl);

try {
  const response = await octokit.repos.get({ owner, repo });
  console.log('Repository accessible:', response.data.name);
} catch (error) {
  console.error('GitHub API error:', error.response?.data || error.message);
}
```

**Issue: Frontend not receiving data**
```javascript
// In API client
console.log('Making request to:', url);
console.log('Request data:', data);

try {
  const response = await axios.post(url, data);
  console.log('Response received:', response.data);
  return response.data;
} catch (error) {
  console.error('API error:', error.response?.data || error.message);
  throw error;
}
```

## Common Issues

### Backend Issues

**Issue: "BOB_API_KEY is not set"**
- Check `.env` file exists
- Verify variable name is correct
- Restart server after changing `.env`

**Issue: "Cannot clone repository"**
- Verify repository URL is correct
- Check GitHub token has access
- Ensure repository exists and is accessible

**Issue: "Bob API timeout"**
- Check internet connection
- Verify Bob API URL is correct
- Increase timeout in axios config

### Frontend Issues

**Issue: "Cannot connect to backend"**
- Verify backend is running
- Check `REACT_APP_API_URL` in `.env`
- Check CORS settings in backend

**Issue: "Component not updating"**
- Check state is being updated correctly
- Verify useEffect dependencies
- Use React DevTools to inspect state

## Contributing Guidelines

### Before Contributing

1. **Check existing issues** - See if your feature/bug is already reported
2. **Discuss major changes** - Open an issue to discuss before implementing
3. **Follow code style** - Use existing patterns and conventions
4. **Write tests** - Add tests for new features
5. **Update documentation** - Keep docs in sync with code

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** following code style guidelines
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run tests** and ensure they pass
6. **Commit with clear messages** using conventional commits
7. **Push and create PR** with detailed description
8. **Address review feedback** promptly
9. **Squash commits** before merging (if requested)

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Code Review Guidelines

**As a Reviewer:**
- Be constructive and respectful
- Explain reasoning for suggestions
- Approve when ready, request changes if needed
- Test the changes locally if possible

**As an Author:**
- Respond to all comments
- Make requested changes or explain why not
- Ask for clarification if needed
- Thank reviewers for their time

---

## Additional Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture details
- [SETUP.md](SETUP.md) - Installation and setup guide
- [EXAMPLES.md](EXAMPLES.md) - Usage examples
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

## Getting Help

- **Documentation**: Check the docs first
- **Issues**: Search existing issues on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainers

---

**Happy coding! 🚀**