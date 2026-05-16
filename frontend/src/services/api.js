import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 300000 // 5 minutes timeout for PR generation
});

/**
 * Generate a Pull Request from specification
 * @param {Object} data - Request data
 * @param {string} data.specification - Feature specification
 * @param {string} data.repositoryUrl - GitHub repository URL
 * @param {string} data.githubToken - GitHub personal access token
 * @returns {Promise<Object>} Response with PR details
 */
export const generatePR = async (data) => {
  try {
    // Map frontend parameter names to backend expected names
    const requestData = {
      repoUrl: data.repositoryUrl,
      specification: data.specification,
      githubToken: data.githubToken,
      baseBranch: data.baseBranch,
      branchPrefix: data.branchPrefix
    };
    
    const response = await apiClient.post('/api/generate-pr', requestData);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || 
                          error.response.data?.message || 
                          'Server error occurred';
      
      return {
        success: false,
        error: errorMessage,
        status: error.response.status
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        success: false,
        error: 'No response from server. Please check if the backend is running.'
      };
    } else {
      // Error in request setup
      return {
        success: false,
        error: error.message || 'Failed to make request'
      };
    }
  }
};

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  generatePR,
  healthCheck
};

// Made with Bob
