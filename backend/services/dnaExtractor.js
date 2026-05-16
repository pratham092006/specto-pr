/**
 * DNA Extractor Service - Phase 2
 * Extracts repository coding patterns and conventions
 */

import { smartSample, formatSampledFiles, getRepoStats } from '../utils/fileSampler.js';
import { getDNAExtractionPrompt } from '../utils/promptTemplates.js';
import { callBobForDNA } from './bobApiClient.js';

/**
 * Default DNA structure for fallback
 */
const DEFAULT_DNA = {
  codingPatterns: ['standard'],
  namingConventions: {
    variables: 'camelCase',
    functions: 'camelCase',
    classes: 'PascalCase',
    files: 'kebab-case'
  },
  fileStructure: {
    organization: 'feature-based',
    testLocation: 'alongside',
    configLocation: 'root'
  },
  dependencies: [],
  testingPatterns: ['jest'],
  errorHandling: 'try-catch',
  asyncPatterns: 'async-await',
  importStyle: 'ES6',
  commentStyle: 'JSDoc',
  indentation: '2-spaces'
};

/**
 * Validate DNA structure
 * @param {Object} dna - DNA object to validate
 * @returns {boolean} True if valid
 */
function validateDNA(dna) {
  if (!dna || typeof dna !== 'object') return false;
  
  const requiredFields = [
    'codingPatterns',
    'namingConventions',
    'fileStructure',
    'errorHandling',
    'asyncPatterns',
    'importStyle',
    'indentation'
  ];

  return requiredFields.every(field => field in dna);
}

/**
 * Merge DNA with defaults for missing fields
 * @param {Object} dna - Extracted DNA
 * @returns {Object} Complete DNA with defaults
 */
function mergeDNAWithDefaults(dna) {
  return {
    codingPatterns: dna.codingPatterns || DEFAULT_DNA.codingPatterns,
    namingConventions: {
      ...DEFAULT_DNA.namingConventions,
      ...(dna.namingConventions || {})
    },
    fileStructure: {
      ...DEFAULT_DNA.fileStructure,
      ...(dna.fileStructure || {})
    },
    dependencies: dna.dependencies || DEFAULT_DNA.dependencies,
    testingPatterns: dna.testingPatterns || DEFAULT_DNA.testingPatterns,
    errorHandling: dna.errorHandling || DEFAULT_DNA.errorHandling,
    asyncPatterns: dna.asyncPatterns || DEFAULT_DNA.asyncPatterns,
    importStyle: dna.importStyle || DEFAULT_DNA.importStyle,
    commentStyle: dna.commentStyle || DEFAULT_DNA.commentStyle,
    indentation: dna.indentation || DEFAULT_DNA.indentation
  };
}

/**
 * Extract repository DNA from code samples
 * 
 * @param {string} repoPath - Path to cloned repository
 * @returns {Promise<Object>} Extracted DNA object
 */
export async function extractDNA(repoPath) {
  try {
    console.log('[DNA Extractor] Starting DNA extraction...');
    
    // Get repository statistics
    const stats = await getRepoStats(repoPath);
    console.log('[DNA Extractor] Repository stats:', stats);

    // Smart sample files (max 6 files, 80 lines each)
    console.log('[DNA Extractor] Sampling files...');
    const sampledFiles = await smartSample(repoPath);
    
    if (sampledFiles.length === 0) {
      console.warn('[DNA Extractor] No files sampled, using default DNA');
      return {
        dna: DEFAULT_DNA,
        sampledFiles: [],
        stats
      };
    }

    console.log(`[DNA Extractor] Sampled ${sampledFiles.length} files`);

    // Format files for prompt
    const formattedFiles = formatSampledFiles(sampledFiles);

    // Build DNA extraction prompt
    const prompt = getDNAExtractionPrompt(formattedFiles);

    // Call Bob API for DNA extraction
    console.log('[DNA Extractor] Calling Bob API for DNA extraction...');
    const extractedDNA = await callBobForDNA(prompt);

    // Validate and merge with defaults
    if (!validateDNA(extractedDNA)) {
      console.warn('[DNA Extractor] Invalid DNA structure, merging with defaults');
    }

    const completeDNA = mergeDNAWithDefaults(extractedDNA);

    console.log('[DNA Extractor] DNA extraction complete');
    console.log('[DNA Extractor] Extracted patterns:', {
      codingPatterns: completeDNA.codingPatterns.length,
      dependencies: completeDNA.dependencies.length,
      testingPatterns: completeDNA.testingPatterns.length
    });

    return {
      dna: completeDNA,
      sampledFiles: sampledFiles.map(f => ({
        path: f.path,
        lines: f.content.split('\n').length
      })),
      stats
    };

  } catch (error) {
    console.error('[DNA Extractor] Error during DNA extraction:', error.message);
    
    // Return default DNA on error
    console.log('[DNA Extractor] Falling back to default DNA');
    return {
      dna: DEFAULT_DNA,
      sampledFiles: [],
      stats: { totalFiles: 0, sourceFiles: 0, testFiles: 0, configFiles: 0 },
      error: error.message
    };
  }
}

/**
 * Get a summary of DNA for logging/display
 * @param {Object} dna - DNA object
 * @returns {Object} Summary object
 */
export function getDNASummary(dna) {
  return {
    language: dna.importStyle === 'ES6' ? 'JavaScript (ES6)' : 
              dna.importStyle === 'CommonJS' ? 'JavaScript (CommonJS)' : 
              'Mixed',
    asyncStyle: dna.asyncPatterns,
    errorHandling: dna.errorHandling,
    testFramework: dna.testingPatterns[0] || 'unknown',
    indentation: dna.indentation,
    fileOrganization: dna.fileStructure.organization,
    patterns: dna.codingPatterns.length
  };
}

/**
 * Validate repository path exists and is accessible
 * @param {string} repoPath - Path to repository
 * @returns {Promise<boolean>} True if valid
 */
export async function validateRepoPath(repoPath) {
  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(repoPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

// Made with Bob
