/**
 * Code Generator Service - Phase 3
 * Generates code files based on specification and DNA constraints
 */

import { getCodeGenerationPrompt } from '../utils/promptTemplates.js';
import { callBobForCodeGeneration } from './bobApiClient.js';

/**
 * Validate generated file structure
 * @param {Object} generatedCode - Generated code object from Bob API
 * @returns {boolean} True if valid
 */
function validateGeneratedCode(generatedCode) {
  if (!generatedCode || typeof generatedCode !== 'object') {
    return false;
  }

  if (!Array.isArray(generatedCode.files)) {
    return false;
  }

  // Validate each file has required fields
  return generatedCode.files.every(file => 
    file.path && 
    typeof file.path === 'string' &&
    file.content !== undefined &&
    typeof file.content === 'string'
  );
}

/**
 * Sanitize file path to prevent directory traversal
 * @param {string} filePath - File path to sanitize
 * @returns {string} Sanitized path
 */
function sanitizeFilePath(filePath) {
  // Remove leading slashes and parent directory references
  return filePath
    .replace(/^\/+/, '')
    .replace(/\.\.\//g, '')
    .replace(/\\/g, '/');
}

/**
 * Validate file content for basic syntax
 * @param {string} content - File content
 * @param {string} filePath - File path for extension detection
 * @returns {Object} Validation result with isValid and errors
 */
function validateFileContent(content, filePath) {
  const errors = [];

  // Check if content is empty
  if (!content || content.trim().length === 0) {
    errors.push('File content is empty');
  }

  // Basic syntax checks based on file extension
  const ext = filePath.split('.').pop().toLowerCase();

  if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') {
    // Check for balanced braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces detected');
    }

    // Check for balanced parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Unbalanced parentheses detected');
    }
  }

  if (ext === 'json') {
    // Validate JSON syntax
    try {
      JSON.parse(content);
    } catch (e) {
      errors.push(`Invalid JSON: ${e.message}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if generated code follows DNA constraints
 * @param {Array<Object>} files - Generated files
 * @param {Object} dna - Repository DNA
 * @returns {Object} Compliance check result
 */
function checkDNACompliance(files, dna) {
  const issues = [];

  for (const file of files) {
    const { content, path: filePath } = file;

    // Check indentation
    if (dna.indentation === '2-spaces' && content.includes('\t')) {
      issues.push(`${filePath}: Uses tabs instead of 2 spaces`);
    } else if (dna.indentation === 'tabs' && /^  /m.test(content)) {
      issues.push(`${filePath}: Uses spaces instead of tabs`);
    }

    // Check import style for JS/TS files
    if (/\.(js|jsx|ts|tsx)$/.test(filePath)) {
      if (dna.importStyle === 'ES6' && /require\(/.test(content)) {
        issues.push(`${filePath}: Uses CommonJS require instead of ES6 import`);
      } else if (dna.importStyle === 'CommonJS' && /^import /m.test(content)) {
        issues.push(`${filePath}: Uses ES6 import instead of CommonJS require`);
      }
    }
  }

  return {
    compliant: issues.length === 0,
    issues
  };
}

/**
 * Generate code files based on specification and DNA
 * 
 * @param {string} specification - User's specification
 * @param {Object} dna - Repository DNA object
 * @returns {Promise<Object>} Generated files and metadata
 */
export async function generateCode(specification, dna) {
  try {
    console.log('[Code Generator] Starting code generation...');
    console.log('[Code Generator] Specification length:', specification.length);

    // Build code generation prompt
    const prompt = getCodeGenerationPrompt(dna, specification);

    // Call Bob API for code generation
    console.log('[Code Generator] Calling Bob API for code generation...');
    const generatedCode = await callBobForCodeGeneration(prompt);

    // Validate generated code structure
    if (!validateGeneratedCode(generatedCode)) {
      throw new Error('Invalid generated code structure from Bob API');
    }

    console.log(`[Code Generator] Generated ${generatedCode.files.length} files`);

    // Process and validate each file
    const processedFiles = [];
    const validationErrors = [];

    for (const file of generatedCode.files) {
      // Sanitize file path
      const sanitizedPath = sanitizeFilePath(file.path);

      // Validate file content
      const validation = validateFileContent(file.content, sanitizedPath);
      if (!validation.isValid) {
        validationErrors.push({
          path: sanitizedPath,
          errors: validation.errors
        });
        console.warn(`[Code Generator] Validation issues in ${sanitizedPath}:`, validation.errors);
      }

      processedFiles.push({
        path: sanitizedPath,
        content: file.content,
        action: file.action || 'create',
        explanation: file.explanation || 'Generated file'
      });
    }

    // Check DNA compliance
    const compliance = checkDNACompliance(processedFiles, dna);
    if (!compliance.compliant) {
      console.warn('[Code Generator] DNA compliance issues:', compliance.issues);
    }

    console.log('[Code Generator] Code generation complete');

    return {
      files: processedFiles,
      summary: generatedCode.summary || 'Code generated successfully',
      validationErrors: validationErrors.length > 0 ? validationErrors : null,
      dnaCompliance: compliance,
      metadata: {
        filesGenerated: processedFiles.length,
        totalLines: processedFiles.reduce((sum, f) => sum + f.content.split('\n').length, 0),
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('[Code Generator] Error during code generation:', error.message);
    throw new Error(`Code generation failed: ${error.message}`);
  }
}

/**
 * Generate a single file based on specification
 * Useful for regenerating specific files
 * 
 * @param {string} specification - File-specific specification
 * @param {Object} dna - Repository DNA
 * @param {string} filePath - Target file path
 * @returns {Promise<Object>} Generated file
 */
export async function generateSingleFile(specification, dna, filePath) {
  try {
    console.log(`[Code Generator] Generating single file: ${filePath}`);

    const enhancedSpec = `${specification}\n\nGenerate ONLY the file at path: ${filePath}`;
    const result = await generateCode(enhancedSpec, dna);

    // Find the requested file
    const file = result.files.find(f => f.path === filePath);
    if (!file) {
      throw new Error(`Generated code does not include requested file: ${filePath}`);
    }

    return file;

  } catch (error) {
    console.error('[Code Generator] Error generating single file:', error.message);
    throw error;
  }
}

/**
 * Estimate token usage for code generation
 * @param {string} specification - User specification
 * @param {Object} dna - Repository DNA
 * @returns {number} Estimated tokens
 */
export function estimateTokenUsage(specification, dna) {
  // Rough estimation: 1 token ≈ 4 characters
  const specTokens = Math.ceil(specification.length / 4);
  const dnaTokens = Math.ceil(JSON.stringify(dna).length / 4);
  const promptOverhead = 500; // Template and instructions
  
  return specTokens + dnaTokens + promptOverhead;
}

// Made with Bob
