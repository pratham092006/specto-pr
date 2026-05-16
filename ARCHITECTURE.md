# SpecToPR System Architecture

## Executive Summary

SpecToPR is an intelligent system that converts user specifications into production-ready pull requests by analyzing existing codebase patterns (DNA) and generating code that is indistinguishable from human-written code in that repository.

**Core Philosophy**: Generate code that matches the existing codebase so perfectly that reviewers cannot tell it was AI-generated.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SpecToPR System                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
│  Interface   │
│  (React)     │
└──────┬───────┘
       │
       │ 1. Submit Spec
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js/Express)                      │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              generatePR() Orchestrator                       │   │
│  │                                                              │   │
│  │  Phase 1: Spec Input ──────────────────────────────────┐   │   │
│  │       │                                                 │   │   │
│  │       ▼                                                 │   │   │
│  │  Phase 2: DNA Extraction                               │   │   │
│  │       │  ┌──────────────────────────────────┐         │   │   │
│  │       │  │ Smart File Sampler               │         │   │   │
│  │       │  │ - Max 6 files                    │         │   │   │
│  │       │  │ - 80 lines each                  │         │   │   │
│  │       │  │ - Diverse file types             │         │   │   │
│  │       │  └──────────────────────────────────┘         │   │   │
│  │       │                                                 │   │   │
│  │       ▼                                                 │   │   │
│  │  Phase 3: Code Generation                              │   │   │
│  │       │  ┌──────────────────────────────────┐         │   │   │
│  │       │  │ DNA-Constrained Generation       │         │   │   │
│  │       │  │ - Apply coding patterns          │         │   │   │
│  │       │  │ - Match conventions              │         │   │   │
│  │       │  │ - Follow structure               │         │   │   │
│  │       │  └──────────────────────────────────┘         │   │   │
│  │       │                                                 │   │   │
│  │       ▼                                                 │   │   │
│  │  Phase 4: PR Creation                                  │   │   │
│  │       │  ┌──────────────────────────────────┐         │   │   │
│  │       │  │ PR Description Generator         │         │   │   │
│  │       │  │ - Natural language summary       │         │   │   │
│  │       │  │ - Change documentation           │         │   │   │
│  │       │  └──────────────────────────────────┘         │   │   │
│  │       │                                                 │   │   │
│  └───────┼─────────────────────────────────────────────────┘   │
│          │                                                       │
└──────────┼───────────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐         ┌──────────────┐
    │   Bob API    │         │  GitHub API  │
    │              │         │              │
    │ - DNA Extract│         │ - Create PR  │
    │ - Code Gen   │         │ - Push Files │
    │ - PR Desc    │         │ - Add Labels │
    └──────────────┘         └──────────────┘
```

---

## Component Breakdown

### 1. Frontend Components (React)

#### 1.1 Main Application Container
**Component**: `App.jsx`
- Manages global state
- Handles routing
- Provides context for API communication

#### 1.2 Tabbed Interface
**Component**: `TabbedInterface.jsx`
- **Tab 1: Specification Input**
  - Multi-line text area for spec
  - Repository URL input
  - GitHub token input (masked)
  - Submit button
  
- **Tab 2: DNA Extraction Progress**
  - Real-time progress indicator
  - File sampling visualization
  - Extracted patterns preview
  - Token usage counter
  
- **Tab 3: Code Generation**
  - Generated files list
  - File content preview
  - Diff viewer (if modifying existing files)
  - Regenerate options
  
- **Tab 4: PR Creation**
  - PR description preview
  - Branch name input
  - Target branch selector
  - Create PR button
  - Success/error status

#### 1.3 Supporting Components
- `ProgressBar.jsx` - Visual progress indicator
- `FilePreview.jsx` - Syntax-highlighted code preview
- `ErrorBoundary.jsx` - Error handling wrapper
- `StatusIndicator.jsx` - Phase status display

### 2. Backend API Endpoints

#### 2.1 Core Endpoints

**POST `/api/generate-pr`**
- **Purpose**: Main orchestrator endpoint
- **Input**: 
  ```json
  {
    "specification": "string",
    "repositoryUrl": "string",
    "githubToken": "string",
    "targetBranch": "string (default: main)"
  }
  ```
- **Output**: 
  ```json
  {
    "prUrl": "string",
    "branchName": "string",
    "filesCreated": ["string"],
    "dnaAnalysis": "object"
  }
  ```
- **Process**: Executes all 4 phases sequentially

**POST `/api/extract-dna`**
- **Purpose**: Phase 2 - Extract repository DNA
- **Input**: 
  ```json
  {
    "repositoryUrl": "string",
    "githubToken": "string"
  }
  ```
- **Output**: 
  ```json
  {
    "dna": {
      "codingPatterns": ["string"],
      "namingConventions": "object",
      "fileStructure": "object",
      "dependencies": ["string"],
      "testingPatterns": ["string"]
    },
    "sampledFiles": ["string"],
    "tokenUsage": "number"
  }
  ```

**POST `/api/generate-code`**
- **Purpose**: Phase 3 - Generate code with DNA constraints
- **Input**: 
  ```json
  {
    "specification": "string",
    "dna": "object",
    "repositoryContext": "object"
  }
  ```
- **Output**: 
  ```json
  {
    "files": [
      {
        "path": "string",
        "content": "string",
        "action": "create|modify"
      }
    ],
    "explanation": "string"
  }
  ```

**POST `/api/create-pr`**
- **Purpose**: Phase 4 - Create GitHub PR
- **Input**: 
  ```json
  {
    "repositoryUrl": "string",
    "githubToken": "string",
    "files": ["object"],
    "specification": "string",
    "branchName": "string"
  }
  ```
- **Output**: 
  ```json
  {
    "prUrl": "string",
    "prNumber": "number",
    "branchName": "string"
  }
  ```

**GET `/api/status/:jobId`**
- **Purpose**: Check progress of long-running operations
- **Output**: 
  ```json
  {
    "phase": "1|2|3|4",
    "status": "in_progress|completed|failed",
    "progress": "number (0-100)",
    "message": "string"
  }
  ```

### 3. Backend Service Modules

#### 3.1 DNA Extractor Service
**File**: `services/dnaExtractor.js`

**Responsibilities**:
- Clone/fetch repository contents
- Smart file sampling (max 6 files, 80 lines each)
- Call Bob API for DNA extraction
- Parse and structure DNA response

**Key Functions**:
- `sampleFiles(repoPath)` - Intelligent file selection
- `extractDNA(sampledFiles)` - Bob API call with temp 0.1
- `parseDNA(response)` - Structure DNA object

#### 3.2 Code Generator Service
**File**: `services/codeGenerator.js`

**Responsibilities**:
- Apply DNA constraints to generation
- Call Bob API for code generation
- Validate generated code structure
- Handle multi-file generation

**Key Functions**:
- `generateCode(spec, dna)` - Main generation function
- `applyDNAConstraints(prompt, dna)` - Inject DNA into prompt
- `validateOutput(files)` - Ensure valid file structure

#### 3.3 PR Creator Service
**File**: `services/prCreator.js`

**Responsibilities**:
- Create GitHub branch
- Commit generated files
- Generate PR description
- Create pull request

**Key Functions**:
- `createBranch(repo, baseBranch)` - Create feature branch
- `commitFiles(branch, files)` - Commit all files
- `generateDescription(spec, files)` - Bob API call with temp 0.3
- `createPullRequest(repo, branch, description)` - GitHub API call

#### 3.4 Bob API Client
**File**: `services/bobApiClient.js`

**Responsibilities**:
- Centralized Bob API communication
- Handle authentication
- Manage temperature settings per phase
- Error handling and retries

**Key Functions**:
- `callBobAPI(prompt, temperature, options)` - Generic API call
- `extractDNA(sampledCode)` - DNA extraction wrapper
- `generateCode(spec, dna)` - Code generation wrapper
- `generatePRDescription(spec, files)` - PR description wrapper

#### 3.5 GitHub API Client
**File**: `services/githubApiClient.js`

**Responsibilities**:
- GitHub API authentication
- Repository operations
- Branch and PR management

**Key Functions**:
- `cloneRepository(url, token)` - Clone repo locally
- `createBranch(repo, branchName, baseBranch)` - Create branch
- `commitFiles(repo, branch, files, message)` - Commit changes
- `createPR(repo, branch, base, title, description)` - Create PR

---

## File Structure

```
spectropr/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx
│   │   │   ├── TabbedInterface.jsx
│   │   │   ├── SpecificationInput.jsx
│   │   │   ├── DNAExtractionView.jsx
│   │   │   ├── CodeGenerationView.jsx
│   │   │   ├── PRCreationView.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── FilePreview.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── StatusIndicator.jsx
│   │   ├── services/
│   │   │   └── apiClient.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   └── api.js
│   │   ├── services/
│   │   │   ├── dnaExtractor.js
│   │   │   ├── codeGenerator.js
│   │   │   ├── prCreator.js
│   │   │   ├── bobApiClient.js
│   │   │   └── githubApiClient.js
│   │   ├── utils/
│   │   │   ├── fileUtils.js
│   │   │   ├── promptBuilder.js
│   │   │   └── validators.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validator.js
│   │   ├── config/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── shared/
│   ├── types/
│   │   └── index.js
│   └── constants/
│       └── index.js
│
├── docs/
│   ├── ARCHITECTURE.md (this file)
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── package.json
└── README.md
```

---

## API Integration Details

### 1. Bob API Integration

#### 1.1 Phase 2: DNA Extraction

**Endpoint**: `${BOB_API_URL}/chat/completions`

**Configuration**:
```javascript
{
  temperature: 0.1,  // Deterministic output
  max_tokens: 4000,
  response_format: { type: "json_object" }
}
```

**Prompt Structure**:
```
You are a code analysis expert. Analyze the following code samples and extract the repository's DNA.

Respond ONLY with valid JSON in this exact format:
{
  "codingPatterns": ["pattern1", "pattern2"],
  "namingConventions": {
    "variables": "camelCase|snake_case|PascalCase",
    "functions": "camelCase|snake_case",
    "classes": "PascalCase",
    "files": "kebab-case|camelCase"
  },
  "fileStructure": {
    "organization": "feature-based|layer-based|domain-driven",
    "testLocation": "alongside|separate",
    "configLocation": "root|config-folder"
  },
  "dependencies": ["dep1", "dep2"],
  "testingPatterns": ["jest", "mocha", "pytest"],
  "errorHandling": "try-catch|error-first-callbacks|promises",
  "asyncPatterns": "async-await|promises|callbacks",
  "importStyle": "ES6|CommonJS|mixed",
  "commentStyle": "JSDoc|inline|minimal",
  "indentation": "2-spaces|4-spaces|tabs"
}

Code samples (max 6 files, 80 lines each):

[FILE: path/to/file1.js]
<file content>

[FILE: path/to/file2.js]
<file content>

Extract the DNA patterns. Respond ONLY with valid JSON.
```

**Error Handling**:
- Retry up to 3 times on network errors
- Validate JSON response structure
- Fallback to default DNA if extraction fails
- Log token usage for monitoring

#### 1.2 Phase 3: Code Generation

**Endpoint**: `${BOB_API_URL}/chat/completions`

**Configuration**:
```javascript
{
  temperature: 0.3,  // Balanced creativity
  max_tokens: 8000,
  response_format: { type: "json_object" }
}
```

**Prompt Structure**:
```
You are an expert developer who writes code that perfectly matches existing codebases.

REPOSITORY DNA (STRICT CONSTRAINTS):
{dna_json}

USER SPECIFICATION:
{specification}

Generate code that is INDISTINGUISHABLE from the existing codebase. Follow ALL DNA patterns exactly.

Respond ONLY with valid JSON in this format:
{
  "files": [
    {
      "path": "relative/path/to/file.js",
      "content": "complete file content",
      "action": "create",
      "explanation": "why this file is needed"
    }
  ],
  "summary": "brief summary of changes"
}

CRITICAL RULES:
1. Match naming conventions exactly
2. Use the same indentation style
3. Follow the same import/export patterns
4. Use the same error handling approach
5. Match the file organization structure
6. Use the same async patterns
7. Follow the same comment style
8. Use the same testing patterns

Respond ONLY with valid JSON.
```

**Error Handling**:
- Validate generated file paths
- Check for syntax errors in generated code
- Ensure all files have content
- Verify DNA constraints were applied

#### 1.3 Phase 4: PR Description Generation

**Endpoint**: `${BOB_API_URL}/chat/completions`

**Configuration**:
```javascript
{
  temperature: 0.3,  // Natural language
  max_tokens: 2000
}
```

**Prompt Structure**:
```
Generate a professional pull request description for the following changes.

ORIGINAL SPECIFICATION:
{specification}

FILES CHANGED:
{file_list_with_summaries}

Create a clear, professional PR description that includes:
1. Brief summary of changes
2. What problem this solves
3. Key implementation details
4. Testing considerations

Use markdown formatting. Be concise but complete.
```

### 2. GitHub API Integration

#### 2.1 Authentication
```javascript
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});
```

#### 2.2 Repository Operations

**Clone Repository**:
```javascript
// Use simple-git or nodegit
const git = simpleGit();
await git.clone(repositoryUrl, localPath, ['--depth', '1']);
```

**Create Branch**:
```javascript
const { data: ref } = await octokit.rest.git.getRef({
  owner,
  repo,
  ref: `heads/${baseBranch}`
});

await octokit.rest.git.createRef({
  owner,
  repo,
  ref: `refs/heads/${newBranch}`,
  sha: ref.object.sha
});
```

**Commit Files**:
```javascript
// For each file:
const { data: blob } = await octokit.rest.git.createBlob({
  owner,
  repo,
  content: Buffer.from(fileContent).toString('base64'),
  encoding: 'base64'
});

// Create tree with all blobs
const { data: tree } = await octokit.rest.git.createTree({
  owner,
  repo,
  base_tree: baseTreeSha,
  tree: fileBlobs
});

// Create commit
const { data: commit } = await octokit.rest.git.createCommit({
  owner,
  repo,
  message: commitMessage,
  tree: tree.sha,
  parents: [parentCommitSha]
});

// Update branch reference
await octokit.rest.git.updateRef({
  owner,
  repo,
  ref: `heads/${branchName}`,
  sha: commit.sha
});
```

**Create Pull Request**:
```javascript
const { data: pr } = await octokit.rest.pulls.create({
  owner,
  repo,
  title: prTitle,
  head: branchName,
  base: baseBranch,
  body: prDescription
});
```

#### 2.3 Error Handling Strategies

**Rate Limiting**:
```javascript
// Check rate limit before operations
const { data: rateLimit } = await octokit.rest.rateLimit.get();
if (rateLimit.rate.remaining < 10) {
  throw new Error('GitHub API rate limit approaching');
}
```

**Authentication Errors**:
- Validate token before operations
- Provide clear error messages
- Suggest token regeneration

**Repository Access Errors**:
- Check repository exists
- Verify user has write access
- Handle private repository scenarios

**Conflict Handling**:
- Check if branch already exists
- Handle merge conflicts gracefully
- Provide rollback mechanism

---

## Prompt Templates

### Template 1: DNA Extraction

```javascript
const DNA_EXTRACTION_PROMPT = `You are a code analysis expert. Analyze the following code samples and extract the repository's DNA.

Respond ONLY with valid JSON in this exact format:
{
  "codingPatterns": ["pattern1", "pattern2"],
  "namingConventions": {
    "variables": "camelCase|snake_case|PascalCase",
    "functions": "camelCase|snake_case",
    "classes": "PascalCase",
    "files": "kebab-case|camelCase"
  },
  "fileStructure": {
    "organization": "feature-based|layer-based|domain-driven",
    "testLocation": "alongside|separate",
    "configLocation": "root|config-folder"
  },
  "dependencies": ["dep1", "dep2"],
  "testingPatterns": ["jest", "mocha", "pytest"],
  "errorHandling": "try-catch|error-first-callbacks|promises",
  "asyncPatterns": "async-await|promises|callbacks",
  "importStyle": "ES6|CommonJS|mixed",
  "commentStyle": "JSDoc|inline|minimal",
  "indentation": "2-spaces|4-spaces|tabs"
}

Code samples (max 6 files, 80 lines each):

{{SAMPLED_FILES}}

Extract the DNA patterns. Respond ONLY with valid JSON.`;
```

**Variables**:
- `{{SAMPLED_FILES}}`: Formatted file samples with paths and content

**Temperature**: 0.1 (deterministic)

**Max Tokens**: 4000

### Template 2: Code Generation

```javascript
const CODE_GENERATION_PROMPT = `You are an expert developer who writes code that perfectly matches existing codebases.

REPOSITORY DNA (STRICT CONSTRAINTS):
{{DNA_JSON}}

USER SPECIFICATION:
{{SPECIFICATION}}

Generate code that is INDISTINGUISHABLE from the existing codebase. Follow ALL DNA patterns exactly.

Respond ONLY with valid JSON in this format:
{
  "files": [
    {
      "path": "relative/path/to/file.js",
      "content": "complete file content",
      "action": "create",
      "explanation": "why this file is needed"
    }
  ],
  "summary": "brief summary of changes"
}

CRITICAL RULES:
1. Match naming conventions exactly
2. Use the same indentation style ({{INDENTATION}})
3. Follow the same import/export patterns ({{IMPORT_STYLE}})
4. Use the same error handling approach ({{ERROR_HANDLING}})
5. Match the file organization structure ({{FILE_STRUCTURE}})
6. Use the same async patterns ({{ASYNC_PATTERNS}})
7. Follow the same comment style ({{COMMENT_STYLE}})
8. Use the same testing patterns ({{TESTING_PATTERNS}})

Respond ONLY with valid JSON.`;
```

**Variables**:
- `{{DNA_JSON}}`: Complete DNA object as JSON
- `{{SPECIFICATION}}`: User's specification
- `{{INDENTATION}}`: From DNA
- `{{IMPORT_STYLE}}`: From DNA
- `{{ERROR_HANDLING}}`: From DNA
- `{{FILE_STRUCTURE}}`: From DNA
- `{{ASYNC_PATTERNS}}`: From DNA
- `{{COMMENT_STYLE}}`: From DNA
- `{{TESTING_PATTERNS}}`: From DNA

**Temperature**: 0.3 (balanced)

**Max Tokens**: 8000

### Template 3: PR Description

```javascript
const PR_DESCRIPTION_PROMPT = `Generate a professional pull request description for the following changes.

ORIGINAL SPECIFICATION:
{{SPECIFICATION}}

FILES CHANGED:
{{FILE_LIST}}

Create a clear, professional PR description that includes:
1. Brief summary of changes
2. What problem this solves
3. Key implementation details
4. Testing considerations

Use markdown formatting. Be concise but complete.`;
```

**Variables**:
- `{{SPECIFICATION}}`: User's original specification
- `{{FILE_LIST}}`: List of files with brief descriptions

**Temperature**: 0.3 (natural language)

**Max Tokens**: 2000

---

## Data Flow

### Complete Flow Diagram

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Specification Input                                 │
│                                                              │
│ Input: { spec, repoUrl, githubToken, targetBranch }        │
│ Output: Validated input object                              │
│ Duration: < 1 second                                         │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: DNA Extraction                                      │
│                                                              │
│ 1. Clone repository (or use GitHub API)                     │
│ 2. Smart file sampling:                                     │
│    - Scan all files                                         │
│    - Select diverse file types                              │
│    - Prioritize: src > tests > config                       │
│    - Max 6 files, 80 lines each                            │
│ 3. Call Bob API (temp 0.1)                                  │
│ 4. Parse DNA JSON response                                  │
│                                                              │
│ Output: DNA object                                           │
│ Duration: 10-30 seconds                                      │
│ Token Usage: ~2000-3000 tokens                              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Code Generation                                     │
│                                                              │
│ 1. Build prompt with DNA constraints                        │
│ 2. Include user specification                               │
│ 3. Call Bob API (temp 0.3)                                  │
│ 4. Parse generated files JSON                               │
│ 5. Validate file structure                                  │
│ 6. Optional: Syntax check generated code                    │
│                                                              │
│ Output: Array of file objects                                │
│ Duration: 20-60 seconds                                      │
│ Token Usage: ~4000-6000 tokens                              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: PR Creation                                         │
│                                                              │
│ 1. Create feature branch                                    │
│ 2. Commit all generated files                               │
│ 3. Generate PR description (Bob API, temp 0.3)             │
│ 4. Create pull request                                      │
│ 5. Return PR URL                                            │
│                                                              │
│ Output: { prUrl, prNumber, branchName }                     │
│ Duration: 5-15 seconds                                       │
│ Token Usage: ~500-1000 tokens                               │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
Success Response to User
```

### State Management

**Frontend State**:
```javascript
{
  currentPhase: 1 | 2 | 3 | 4,
  specification: string,
  repositoryUrl: string,
  githubToken: string,
  targetBranch: string,
  dna: object | null,
  generatedFiles: array | null,
  prUrl: string | null,
  error: string | null,
  loading: boolean,
  progress: number (0-100)
}
```

**Backend State** (per job):
```javascript
{
  jobId: string,
  phase: 1 | 2 | 3 | 4,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  input: object,
  dna: object | null,
  files: array | null,
  prUrl: string | null,
  error: string | null,
  tokenUsage: {
    dnaExtraction: number,
    codeGeneration: number,
    prDescription: number,
    total: number
  },
  timestamps: {
    started: Date,
    dnaCompleted: Date | null,
    codeCompleted: Date | null,
    prCompleted: Date | null
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Set up project structure and basic API communication

**Tasks**:
1. Initialize project structure
   - Create frontend (React + Vite)
   - Create backend (Node.js + Express)
   - Set up shared types/constants

2. Implement Bob API client
   - Authentication
   - Basic request/response handling
   - Error handling

3. Implement GitHub API client
   - Authentication
   - Repository cloning
   - Basic operations

4. Create basic frontend UI
   - Single page with input form
   - Basic styling

**Deliverables**:
- Project structure in place
- API clients functional
- Basic UI operational

**Dependencies**: None

### Phase 2: DNA Extraction (Week 2)

**Goal**: Implement Phase 2 of the system

**Tasks**:
1. Implement smart file sampler
   - File type detection
   - Diversity algorithm
   - Line limiting (80 lines)
   - Max 6 files selection

2. Build DNA extraction prompt
   - Template system
   - Variable substitution
   - JSON validation

3. Implement DNA extraction service
   - Bob API integration
   - Response parsing
   - Error handling

4. Create DNA visualization UI
   - Display extracted patterns
   - Show sampled files
   - Token usage display

**Deliverables**:
- Working DNA extraction
- UI showing DNA results
- Validated JSON responses

**Dependencies**: Phase 1 complete

### Phase 3: Code Generation (Week 3)

**Goal**: Implement Phase 3 of the system

**Tasks**:
1. Build code generation prompt
   - DNA constraint injection
   - Specification formatting
   - JSON response structure

2. Implement code generator service
   - Bob API integration
   - DNA constraint application
   - File validation

3. Create code preview UI
   - File list display
   - Syntax highlighting
   - Diff viewer (if modifying)

4. Add regeneration capability
   - Retry with adjustments
   - User feedback loop

**Deliverables**:
- Working code generation
- Preview UI functional
- Regeneration working

**Dependencies**: Phase 2 complete

### Phase 4: PR Creation (Week 4)

**Goal**: Implement Phase 4 and complete system

**Tasks**:
1. Implement branch creation
   - GitHub API integration
   - Branch naming strategy
   - Conflict detection

2. Implement file committing
   - Batch commit strategy
   - Commit message generation
   - Error rollback

3. Build PR description generator
   - Bob API integration
   - Template system
   - Markdown formatting

4. Create PR creation UI
   - Description preview
   - Branch configuration
   - Success/error display

**Deliverables**:
- Complete PR creation flow
- Full system integration
- End-to-end testing

**Dependencies**: Phase 3 complete

### Phase 5: Polish & Optimization (Week 5)

**Goal**: Improve UX and performance

**Tasks**:
1. Add progress indicators
   - Real-time updates
   - Phase transitions
   - Token usage tracking

2. Implement error recovery
   - Retry mechanisms
   - Graceful degradation
   - User-friendly messages

3. Add validation
   - Input validation
   - Token limit warnings
   - Repository access checks

4. Performance optimization
   - Caching strategies
   - Parallel operations
   - Response streaming

**Deliverables**:
- Polished UI/UX
- Robust error handling
- Optimized performance

**Dependencies**: Phase 4 complete

### Phase 6: Testing & Documentation (Week 6)

**Goal**: Ensure quality and maintainability

**Tasks**:
1. Write unit tests
   - Service layer tests
   - Utility function tests
   - API client tests

2. Write integration tests
   - End-to-end flows
   - API integration tests
   - Error scenarios

3. Create documentation
   - API documentation
   - User guide
   - Deployment guide

4. Security audit
   - Token handling
   - Input sanitization
   - Rate limiting

**Deliverables**:
- Comprehensive test suite
- Complete documentation
- Security hardening

**Dependencies**: Phase 5 complete

---

## Key Design Decisions

### 1. Smart File Sampling Strategy

**Decision**: Limit to 6 files, 80 lines each

**Rationale**:
- Keeps token usage manageable (~2000-3000 tokens)
- Provides sufficient diversity for pattern detection
- Prevents context window overflow
- Allows for detailed analysis per file

**Implementation**:
```javascript
function smartSample(files) {
  // 1. Categorize files
  const categories = {
    source: files.filter(f => /\.(js|ts|py|java)$/.test(f)),
    tests: files.filter(f => /\.(test|spec)\.(js|ts|py)$/.test(f)),
    config: files.filter(f => /\.(json|yaml|yml|config)$/.test(f))
  };
  
  // 2. Select diverse samples
  const samples = [
    ...selectRandom(categories.source, 3),
    ...selectRandom(categories.tests, 2),
    ...selectRandom(categories.config, 1)
  ];
  
  // 3. Limit to 80 lines each
  return samples.map(file => ({
    path: file.path,
    content: limitLines(file.content, 80)
  }));
}
```

### 2. Temperature Settings

**Decision**: Different temperatures for different phases

**Rationale**:
- **DNA Extraction (0.1)**: Need deterministic, consistent pattern detection
- **Code Generation (0.3)**: Balance between creativity and consistency
- **PR Description (0.3)**: Natural language requires some creativity

### 3. JSON-Only Responses

**Decision**: Force JSON responses with "Respond ONLY with valid JSON"

**Rationale**:
- Ensures parseable output
- Prevents markdown formatting issues
- Enables structured data extraction
- Reduces parsing errors

### 4. Monolithic generatePR() Function

**Decision**: Single orchestrator function for all phases

**Rationale**:
- Simplifies state management
- Ensures phase order
- Easier error handling
- Clear transaction boundaries

**Alternative Considered**: Separate endpoints per phase
- **Rejected**: More complex state management, harder to ensure consistency

### 5. Frontend Tabbed Interface

**Decision**: Show all phases in tabs, not wizard-style

**Rationale**:
- Users can review previous phases
- Better for debugging
- More transparent process
- Easier to regenerate specific phases

---

## Token Budget Management

### Token Usage Estimates

**Phase 2 - DNA Extraction**:
- Input: ~2000-3000 tokens (6 files × 80 lines)
- Output: ~500-1000 tokens (DNA JSON)
- Total: ~2500-4000 tokens

**Phase 3 - Code Generation**:
- Input: ~1000 tokens (DNA + spec)
- Output: ~3000-5000 tokens (generated files)
- Total: ~4000-6000 tokens

**Phase 4 - PR Description**:
- Input: ~500 tokens (spec + file list)
- Output: ~300-500 tokens (description)
- Total: ~800-1000 tokens

**Total per PR**: ~7300-11000 tokens

### Context Window Strategy

**Bob API Limits**: Assume 8K-16K context window

**Strategy**:
1. Keep DNA extraction under 4K tokens
2. Keep code generation under 6K tokens
3. Keep PR description under 1K tokens
4. If limits exceeded, reduce file samples or split generation

### Cost Optimization

**Estimated Cost per PR** (assuming $0.002/1K tokens):
- DNA: $0.005-0.008
- Code: $0.008-0.012
- PR: $0.002
- **Total: ~$0.015-0.022 per PR**

**Optimization Strategies**:
1. Cache DNA for same repository
2. Reuse DNA for multiple specs
3. Batch multiple specs for same repo
4. Implement token usage warnings

---

## Error Handling Strategy

### Error Categories

**1. Input Validation Errors**
- Invalid repository URL
- Invalid GitHub token
- Empty specification
- **Response**: 400 Bad Request with clear message

**2. Authentication Errors**
- Invalid Bob API key
- Invalid GitHub token
- Expired tokens
- **Response**: 401 Unauthorized with token refresh instructions

**3. Rate Limiting Errors**
- Bob API rate limit
- GitHub API rate limit
- **Response**: 429 Too Many Requests with retry-after header

**4. API Errors**
- Bob API timeout
- GitHub API errors
- Network failures
- **Response**: 502 Bad Gateway with retry suggestion

**5. Generation Errors**
- Invalid JSON from Bob
- Syntax errors in generated code
- DNA extraction failure
- **Response**: 500 Internal Server Error with detailed logs

### Retry Strategy

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await sleep(delay);
    }
  }
}
```

### Rollback Strategy

**On PR Creation Failure**:
1. Delete created branch
2. Clean up any partial commits
3. Return detailed error to user
4. Preserve generated files for retry

**On Code Generation Failure**:
1. Preserve DNA extraction results
2. Allow user to modify spec and retry
3. Don't re-extract DNA

---

## Security Considerations

### 1. Token Management

**GitHub Tokens**:
- Never log tokens
- Store encrypted in transit
- Don't persist on backend
- Use minimal required scopes

**Bob API Keys**:
- Store in environment variables
- Never expose to frontend
- Rotate regularly

### 2. Input Sanitization

**Repository URLs**:
- Validate format
- Check for malicious patterns
- Limit to GitHub domains

**Specifications**:
- Limit length (10KB max)
- Sanitize for prompt injection
- Validate character encoding

### 3. Rate Limiting

**Per User**:
- 10 requests per hour
- 100 requests per day

**Per IP**:
- 50 requests per hour

### 4. Code Validation

**Generated Code**:
- Syntax validation before commit
- Scan for obvious security issues
- Limit file sizes (100KB max per file)
- Limit total files (50 max)

---

## Monitoring & Observability

### Metrics to Track

**Performance Metrics**:
- Phase duration (each phase)
- Total PR generation time
- Token usage per phase
- API response times

**Success Metrics**:
- PR creation success rate
- DNA extraction success rate
- Code generation success rate
- User satisfaction (if feedback collected)

**Error Metrics**:
- Error rate by type
- Retry success rate
- Rollback frequency

### Logging Strategy

**Log Levels**:
- **ERROR**: All failures, exceptions
- **WARN**: Retries, rate limits approaching
- **INFO**: Phase completions, PR creations
- **DEBUG**: API calls, token usage

**Log Format**:
```javascript
{
  timestamp: "ISO 8601",
  level: "INFO|WARN|ERROR|DEBUG",
  jobId: "uuid",
  phase: 1|2|3|4,
  message: "string",
  metadata: {
    tokenUsage: number,
    duration: number,
    // ... other relevant data
  }
}
```

---

## Future Enhancements

### Phase 7: Advanced Features (Future)

**1. Multi-Repository Support**
- Extract DNA from multiple repos
- Blend patterns intelligently
- Support monorepo structures

**2. Incremental Updates**
- Modify existing PRs
- Add to existing branches
- Handle feedback loops

**3. Testing Generation**
- Auto-generate tests for new code
- Match existing test patterns
- Ensure coverage

**4. Documentation Generation**
- Auto-generate README updates
- Create API documentation
- Generate inline comments

**5. Code Review Integration**
- Auto-respond to review comments
- Implement requested changes
- Learn from review patterns

**6. Template Library**
- Save successful DNA profiles
- Reuse for similar projects
- Community-shared templates

---

## Conclusion

This architecture provides a solid foundation for the SpecToPR system with clear separation of concerns, robust error handling, and scalable design. The 4-phase approach ensures that generated code is indistinguishable from human-written code by deeply analyzing and applying repository patterns.

**Key Success Factors**:
1. Smart file sampling keeps token usage manageable
2. DNA extraction provides strong constraints
3. Temperature tuning balances creativity and consistency
4. JSON-only responses ensure parseability
5. Comprehensive error handling ensures reliability

**Next Steps**:
1. Review and approve this architecture
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on testing and feedback