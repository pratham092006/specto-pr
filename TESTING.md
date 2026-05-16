# Testing Guide for SpecToPR

This document provides comprehensive guidelines for testing the SpecToPR system, including unit tests, integration tests, end-to-end tests, and verification procedures.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [Mocking Strategies](#mocking-strategies)
7. [CI/CD Integration](#cicd-integration)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Best Practices](#best-practices)

## Testing Philosophy

SpecToPR follows a comprehensive testing strategy that ensures:

- **Reliability**: All critical paths are tested
- **Maintainability**: Tests are clear, concise, and easy to update
- **Speed**: Tests run quickly to enable rapid development
- **Confidence**: High test coverage provides confidence in deployments

### Testing Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /____\     - Full system workflows
     /      \    
    /        \   Integration Tests (30%)
   /__________\  - API endpoints, service interactions
  /            \ 
 /              \ Unit Tests (60%)
/________________\ - Individual functions, components
```

## Test Types

### Unit Tests

Test individual functions, methods, and components in isolation.

**Backend Unit Tests:**
- Utility functions (file sampling, prompt templates)
- Service methods (DNA extraction logic, code generation)
- Input validation
- Error handling

**Frontend Unit Tests:**
- React components
- Utility functions (formatters)
- API service methods
- State management

### Integration Tests

Test interactions between multiple components or services.

**Backend Integration Tests:**
- API endpoint workflows
- Service orchestration
- Database interactions (if applicable)
- External API mocking

**Frontend Integration Tests:**
- Component interactions
- Form submissions
- API calls
- State updates

### End-to-End Tests

Test complete user workflows from start to finish.

**E2E Scenarios:**
- Generate PR from specification
- Handle errors gracefully
- Display results correctly
- Navigate between tabs

## Running Tests

### Quick Verification

Run the automated verification script to check your setup:

```bash
./verify-setup.sh
```

This script checks:
- Node.js and npm versions
- Dependencies installation
- Environment configuration
- Backend health
- Frontend build

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- integration.test.js

# Run tests matching pattern
npm test -- --testNamePattern="generate-pr"
```

### Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode (default for create-react-app)
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- App.test.js
```

### Running All Tests

From the root directory:

```bash
# Backend tests
cd backend && npm test && cd ..

# Frontend tests
cd frontend && npm test -- --watchAll=false && cd ..
```

## Writing Tests

### Backend Test Structure

```javascript
// backend/tests/example.test.js
const request = require('supertest');
const app = require('../server');

describe('Example Service', () => {
  // Setup before all tests
  beforeAll(() => {
    // Initialize test database, mock services, etc.
  });

  // Cleanup after all tests
  afterAll(() => {
    // Close connections, cleanup resources
  });

  // Setup before each test
  beforeEach(() => {
    // Reset mocks, clear data
  });

  describe('Feature X', () => {
    it('should handle valid input', async () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = await someFunction(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });

    it('should handle invalid input', async () => {
      // Arrange
      const invalidInput = null;
      
      // Act & Assert
      await expect(someFunction(invalidInput))
        .rejects.toThrow('Invalid input');
    });
  });
});
```

### Frontend Test Structure

```javascript
// frontend/src/components/Example.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Example from './Example';

describe('Example Component', () => {
  it('should render correctly', () => {
    render(<Example />);
    expect(screen.getByText('Example')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<Example />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('should handle errors', async () => {
    // Mock API to return error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(
      new Error('API Error')
    );
    
    render(<Example />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Test Fixtures

Store reusable test data in fixtures:

```javascript
// backend/tests/fixtures/sample-data.js
module.exports = {
  validRepo: {
    url: 'https://github.com/user/repo',
    branch: 'main'
  },
  
  validSpec: `
    Add a new feature to calculate user statistics.
    The feature should include:
    - Total user count
    - Active users in last 30 days
    - User growth rate
  `,
  
  mockDNA: {
    structure: {
      'src/': ['utils/', 'services/', 'components/'],
      'tests/': ['unit/', 'integration/']
    },
    patterns: {
      naming: 'camelCase',
      imports: 'ES6',
      testing: 'Jest'
    }
  }
};
```

## Test Coverage

### Coverage Goals

- **Overall Coverage**: 80%+
- **Critical Paths**: 95%+
- **Utility Functions**: 90%+
- **UI Components**: 70%+

### Viewing Coverage Reports

```bash
# Backend coverage
cd backend
npm test -- --coverage

# Frontend coverage
cd frontend
npm test -- --coverage --watchAll=false
```

Coverage reports are generated in:
- Backend: `backend/coverage/`
- Frontend: `frontend/coverage/`

Open `coverage/lcov-report/index.html` in a browser for detailed reports.

### Coverage Thresholds

Configure in `package.json`:

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Mocking Strategies

### Mocking External APIs

#### Bob API

```javascript
// Mock Bob API responses
jest.mock('../services/bobApiClient', () => ({
  extractDNA: jest.fn().mockResolvedValue({
    structure: { /* mock structure */ },
    patterns: { /* mock patterns */ }
  }),
  
  generateCode: jest.fn().mockResolvedValue({
    files: [
      { path: 'src/feature.js', content: '// Generated code' }
    ]
  })
}));
```

#### GitHub API

```javascript
// Mock GitHub API responses
jest.mock('../services/githubApiClient', () => ({
  createBranch: jest.fn().mockResolvedValue({
    ref: 'refs/heads/feature-branch',
    sha: 'abc123'
  }),
  
  createPullRequest: jest.fn().mockResolvedValue({
    number: 42,
    html_url: 'https://github.com/user/repo/pull/42'
  })
}));
```

### Mocking File System

```javascript
const fs = require('fs').promises;

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn()
  }
}));

// In test
fs.promises.readFile.mockResolvedValue('file content');
```

### Mocking HTTP Requests

```javascript
// Using nock for HTTP mocking
const nock = require('nock');

nock('https://api.github.com')
  .get('/repos/user/repo')
  .reply(200, { name: 'repo', default_branch: 'main' });
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./backend/coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests
        run: cd frontend && npm test -- --coverage --watchAll=false
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./frontend/coverage
```

### Pre-commit Hooks

Use Husky to run tests before commits:

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## Performance Testing

### Backend Performance

Test API response times:

```javascript
describe('Performance Tests', () => {
  it('should respond within 5 seconds', async () => {
    const start = Date.now();
    
    const response = await request(app)
      .post('/api/generate-pr')
      .send(validPayload);
    
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000);
  });
});
```

### Load Testing

Use tools like Apache Bench or Artillery:

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 http://localhost:3001/api/health
```

### Frontend Performance

Test component render times:

```javascript
import { render } from '@testing-library/react';

it('should render quickly', () => {
  const start = performance.now();
  render(<LargeComponent />);
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(100); // 100ms
});
```

## Security Testing

### Input Validation

Test for injection attacks:

```javascript
describe('Security Tests', () => {
  it('should reject malicious input', async () => {
    const maliciousInput = {
      repoUrl: 'https://evil.com/$(rm -rf /)',
      specification: '<script>alert("xss")</script>'
    };
    
    const response = await request(app)
      .post('/api/generate-pr')
      .send(maliciousInput);
    
    expect(response.status).toBe(400);
  });
});
```

### Authentication Testing

Test authentication and authorization:

```javascript
it('should require valid API key', async () => {
  const response = await request(app)
    .post('/api/generate-pr')
    .set('Authorization', 'Bearer invalid-token')
    .send(validPayload);
  
  expect(response.status).toBe(401);
});
```

### Dependency Scanning

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```javascript
// ❌ Bad
it('works', () => { /* ... */ });

// ✅ Good
it('should generate PR successfully when given valid specification', () => {
  /* ... */
});
```

### 2. Arrange-Act-Assert Pattern

Structure tests clearly:

```javascript
it('should calculate total correctly', () => {
  // Arrange - Set up test data
  const items = [10, 20, 30];
  
  // Act - Execute the function
  const result = calculateTotal(items);
  
  // Assert - Verify the result
  expect(result).toBe(60);
});
```

### 3. Test One Thing

Each test should verify one specific behavior:

```javascript
// ❌ Bad - Testing multiple things
it('should handle user operations', () => {
  expect(createUser()).toBeDefined();
  expect(updateUser()).toBeTruthy();
  expect(deleteUser()).toBeNull();
});

// ✅ Good - Separate tests
it('should create user successfully', () => {
  expect(createUser()).toBeDefined();
});

it('should update user successfully', () => {
  expect(updateUser()).toBeTruthy();
});
```

### 4. Avoid Test Interdependence

Tests should be independent and runnable in any order:

```javascript
// ❌ Bad - Tests depend on each other
let userId;

it('should create user', () => {
  userId = createUser();
});

it('should update user', () => {
  updateUser(userId); // Depends on previous test
});

// ✅ Good - Independent tests
it('should create user', () => {
  const userId = createUser();
  expect(userId).toBeDefined();
});

it('should update user', () => {
  const userId = createUser(); // Create own test data
  const result = updateUser(userId);
  expect(result).toBeTruthy();
});
```

### 5. Use Test Fixtures

Reuse test data across tests:

```javascript
const fixtures = require('./fixtures/sample-data');

it('should process valid repository', () => {
  const result = processRepo(fixtures.validRepo);
  expect(result).toBeDefined();
});
```

### 6. Clean Up After Tests

Always clean up resources:

```javascript
describe('Database Tests', () => {
  let connection;
  
  beforeAll(async () => {
    connection = await createConnection();
  });
  
  afterAll(async () => {
    await connection.close(); // Clean up
  });
  
  afterEach(async () => {
    await clearTestData(); // Clean up after each test
  });
});
```

### 7. Mock External Dependencies

Don't make real API calls in tests:

```javascript
// ❌ Bad - Real API call
it('should fetch user data', async () => {
  const data = await fetch('https://api.example.com/user');
  expect(data).toBeDefined();
});

// ✅ Good - Mocked API call
it('should fetch user data', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ id: 1, name: 'Test' })
  });
  
  const data = await fetchUser();
  expect(data.name).toBe('Test');
});
```

### 8. Test Error Cases

Don't just test the happy path:

```javascript
describe('Error Handling', () => {
  it('should handle missing required fields', async () => {
    await expect(generatePR({}))
      .rejects.toThrow('Missing required fields');
  });
  
  it('should handle network errors', async () => {
    mockAPI.mockRejectedValue(new Error('Network error'));
    
    await expect(generatePR(validInput))
      .rejects.toThrow('Network error');
  });
});
```

### 9. Keep Tests Fast

- Use mocks instead of real services
- Avoid unnecessary delays
- Run tests in parallel when possible
- Use test databases in memory

### 10. Maintain Tests

- Update tests when code changes
- Remove obsolete tests
- Refactor tests to reduce duplication
- Keep test code as clean as production code

## Manual Testing Checklist

Before releasing, manually verify:

### Backend
- [ ] Health endpoint responds correctly
- [ ] API accepts valid requests
- [ ] API rejects invalid requests
- [ ] Error messages are clear
- [ ] Logs are informative
- [ ] Environment variables are validated

### Frontend
- [ ] UI loads without errors
- [ ] Forms validate input correctly
- [ ] Loading states display properly
- [ ] Error messages are user-friendly
- [ ] Results display correctly
- [ ] Responsive design works on mobile
- [ ] Browser console has no errors

### Integration
- [ ] Frontend can communicate with backend
- [ ] CORS is configured correctly
- [ ] Authentication works (if applicable)
- [ ] End-to-end workflow completes successfully

## Troubleshooting Tests

### Common Issues

**Tests fail with "Cannot find module"**
```bash
# Solution: Install dependencies
npm install
```

**Tests timeout**
```bash
# Solution: Increase timeout
jest.setTimeout(10000); // 10 seconds
```

**Mock not working**
```bash
# Solution: Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

**Coverage not generated**
```bash
# Solution: Run with coverage flag
npm test -- --coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this guide if needed

---

For questions or issues with testing, please open an issue on GitHub or contact the development team.