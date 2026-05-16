/**
 * Format duration in seconds to human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(0);
  
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Get programming language from file path
 * @param {string} path - File path
 * @returns {string} Language identifier for syntax highlighting
 */
export const getLanguageFromPath = (path) => {
  if (!path) return 'text';
  
  const extension = path.split('.').pop().toLowerCase();
  
  const languageMap = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'ps1': 'powershell',
    'r': 'r',
    'dart': 'dart',
    'vue': 'vue',
    'svelte': 'svelte'
  };
  
  return languageMap[extension] || 'text';
};

/**
 * Format file size in bytes to human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Extract repository owner and name from GitHub URL
 * @param {string} url - GitHub repository URL
 * @returns {Object} Object with owner and repo properties
 */
export const parseGitHubUrl = (url) => {
  if (!url) return { owner: '', repo: '' };
  
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  
  if (!match) return { owner: '', repo: '' };
  
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
};

/**
 * Validate GitHub token format
 * @param {string} token - GitHub token
 * @returns {boolean} True if valid format
 */
export const isValidGitHubToken = (token) => {
  if (!token) return false;
  
  // GitHub tokens start with ghp_, gho_, ghu_, ghs_, or ghr_
  const tokenPattern = /^gh[pousr]_[A-Za-z0-9_]{36,}$/;
  
  return tokenPattern.test(token) || token.length >= 40;
};

export default {
  formatDuration,
  getLanguageFromPath,
  formatFileSize,
  formatNumber,
  truncateText,
  formatDate,
  parseGitHubUrl,
  isValidGitHubToken
};

// Made with Bob
