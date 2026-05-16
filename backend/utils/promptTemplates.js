/**
 * Prompt templates for Bob API interactions
 * Based on SpecToPR architecture specifications
 */

/**
 * Template 1: DNA Extraction
 * Temperature: 0.1 (deterministic)
 * Max Tokens: 4000
 * 
 * @param {string} sampledFiles - Formatted file samples with paths and content
 * @returns {string} Complete prompt for DNA extraction
 */
export function getDNAExtractionPrompt(sampledFiles) {
  return `You are a code analysis expert. Analyze the following code samples and extract the repository's DNA.

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

${sampledFiles}

Extract the DNA patterns. Respond ONLY with valid JSON.`;
}

/**
 * Template 2: Code Generation
 * Temperature: 0.3 (balanced)
 * Max Tokens: 8000
 * 
 * @param {Object} dna - Repository DNA object
 * @param {string} specification - User's specification
 * @returns {string} Complete prompt for code generation
 */
export function getCodeGenerationPrompt(dna, specification) {
  const dnaJson = JSON.stringify(dna, null, 2);
  
  return `You are an expert developer who writes code that perfectly matches existing codebases.

REPOSITORY DNA (STRICT CONSTRAINTS):
${dnaJson}

USER SPECIFICATION:
${specification}

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
2. Use the same indentation style (${dna.indentation || '2-spaces'})
3. Follow the same import/export patterns (${dna.importStyle || 'ES6'})
4. Use the same error handling approach (${dna.errorHandling || 'try-catch'})
5. Match the file organization structure (${dna.fileStructure?.organization || 'feature-based'})
6. Use the same async patterns (${dna.asyncPatterns || 'async-await'})
7. Follow the same comment style (${dna.commentStyle || 'JSDoc'})
8. Use the same testing patterns (${dna.testingPatterns?.join(', ') || 'jest'})

Respond ONLY with valid JSON.`;
}

/**
 * Template 3: PR Description Generation
 * Temperature: 0.3 (natural language)
 * Max Tokens: 2000
 * 
 * @param {string} specification - User's original specification
 * @param {Array<Object>} files - List of generated files with explanations
 * @returns {string} Complete prompt for PR description
 */
export function getPRDescriptionPrompt(specification, files) {
  const fileList = files.map(f => `- ${f.path}: ${f.explanation || 'New file'}`).join('\n');
  
  return `Generate a professional pull request description for the following changes.

ORIGINAL SPECIFICATION:
${specification}

FILES CHANGED:
${fileList}

Create a clear, professional PR description that includes:
1. Brief summary of changes
2. What problem this solves
3. Key implementation details
4. Testing considerations

Use markdown formatting. Be concise but complete.`;
}

/**
 * Configuration for Bob API calls per phase
 */
export const BOB_API_CONFIG = {
  dnaExtraction: {
    temperature: 0.1,
    maxTokens: 4000,
    responseFormat: { type: 'json_object' }
  },
  codeGeneration: {
    temperature: 0.3,
    maxTokens: 8000,
    responseFormat: { type: 'json_object' }
  },
  prDescription: {
    temperature: 0.3,
    maxTokens: 2000
  }
};

// Made with Bob
