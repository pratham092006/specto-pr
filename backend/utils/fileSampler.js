/**
 * Smart file sampling utility for DNA extraction
 * Implements the strategy from ARCHITECTURE.md:
 * - Max 6 files
 * - Max 80 lines per file
 * - Diverse sampling across source, tests, and config
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Categorize files by type
 * @param {Array<string>} files - Array of file paths
 * @returns {Object} Categorized files
 */
function categorizeFiles(files) {
  return {
    source: files.filter(f => 
      /\.(js|jsx|ts|tsx|py|java|go|rb|php|cs|cpp|c|h)$/i.test(f) &&
      !/\.(test|spec)\./i.test(f)
    ),
    tests: files.filter(f => 
      /\.(test|spec)\.(js|jsx|ts|tsx|py|java|go|rb|php)$/i.test(f)
    ),
    config: files.filter(f => 
      /\.(json|yaml|yml|toml|ini|config\.js|config\.ts)$/i.test(f) ||
      /^(package\.json|tsconfig\.json|jest\.config|webpack\.config|vite\.config)/.test(path.basename(f))
    )
  };
}

/**
 * Select random items from an array
 * @param {Array} arr - Source array
 * @param {number} count - Number of items to select
 * @returns {Array} Random selection
 */
function selectRandom(arr, count) {
  if (arr.length <= count) return arr;
  
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Limit file content to specified number of lines
 * @param {string} content - File content
 * @param {number} maxLines - Maximum number of lines
 * @returns {string} Limited content
 */
function limitLines(content, maxLines) {
  const lines = content.split('\n');
  if (lines.length <= maxLines) return content;
  
  return lines.slice(0, maxLines).join('\n') + '\n... (truncated)';
}

/**
 * Read file content safely
 * @param {string} filePath - Path to file
 * @returns {Promise<string|null>} File content or null if error
 */
async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Recursively get all files in a directory
 * @param {string} dir - Directory path
 * @param {Array<string>} fileList - Accumulated file list
 * @returns {Promise<Array<string>>} List of file paths
 */
async function getAllFiles(dir, fileList = []) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      // Skip common directories to ignore
      if (file.isDirectory()) {
        const dirName = file.name;
        if (dirName === 'node_modules' || 
            dirName === '.git' || 
            dirName === 'dist' || 
            dirName === 'build' ||
            dirName === 'coverage' ||
            dirName === '.next' ||
            dirName === '__pycache__') {
          continue;
        }
        await getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return fileList;
}

/**
 * Smart sample files from a repository
 * Implements the 6-file, 80-line strategy from architecture
 * 
 * @param {string} repoPath - Path to repository
 * @returns {Promise<Array<Object>>} Sampled files with path and content
 */
export async function smartSample(repoPath) {
  // Get all files in repository
  const allFiles = await getAllFiles(repoPath);
  
  if (allFiles.length === 0) {
    throw new Error('No files found in repository');
  }
  
  // Categorize files
  const categories = categorizeFiles(allFiles);
  
  // Select diverse samples (3 source, 2 tests, 1 config)
  const samples = [
    ...selectRandom(categories.source, 3),
    ...selectRandom(categories.tests, 2),
    ...selectRandom(categories.config, 1)
  ];
  
  // If we don't have enough, fill with any available files
  if (samples.length < 6) {
    const remaining = allFiles.filter(f => !samples.includes(f));
    samples.push(...selectRandom(remaining, 6 - samples.length));
  }
  
  // Read and limit file contents
  const sampledFiles = [];
  for (const filePath of samples.slice(0, 6)) {
    const content = await readFileSafe(filePath);
    if (content !== null) {
      sampledFiles.push({
        path: path.relative(repoPath, filePath),
        content: limitLines(content, 80)
      });
    }
  }
  
  return sampledFiles;
}

/**
 * Format sampled files for prompt
 * @param {Array<Object>} sampledFiles - Array of {path, content} objects
 * @returns {string} Formatted string for prompt
 */
export function formatSampledFiles(sampledFiles) {
  return sampledFiles.map(file => 
    `[FILE: ${file.path}]\n${file.content}\n`
  ).join('\n');
}

/**
 * Get file statistics for logging
 * @param {string} repoPath - Path to repository
 * @returns {Promise<Object>} Statistics about the repository
 */
export async function getRepoStats(repoPath) {
  const allFiles = await getAllFiles(repoPath);
  const categories = categorizeFiles(allFiles);
  
  return {
    totalFiles: allFiles.length,
    sourceFiles: categories.source.length,
    testFiles: categories.tests.length,
    configFiles: categories.config.length
  };
}

// Made with Bob
