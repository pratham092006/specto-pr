/**
 * Bob API Client Service
 * Handles all interactions with the Bob API
 * Now supports OpenAI API as an alternative
 */

import axios from 'axios';

// Support both Bob API and OpenAI API
const BOB_API_URL = process.env.BOB_API_URL || process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
const BOB_API_KEY = process.env.BOB_API_KEY || process.env.OPENAI_API_KEY;
const USE_OPENAI = process.env.USE_OPENAI === 'true' || !process.env.BOB_API_KEY;

/**
 * Call Bob API with retry logic
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
async function callBobAPI(prompt, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const timeout = options.timeout || 60000;

  if (!BOB_API_KEY) {
    console.warn('[Bob API] No API key configured, using mock response');
    return { mock: true };
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Bob API] Attempt ${attempt}/${maxRetries} ${USE_OPENAI ? '(OpenAI)' : '(Bob)'}`);
      
      // Determine endpoint based on API type
      const endpoint = USE_OPENAI
        ? `${BOB_API_URL}/chat/completions`
        : `${BOB_API_URL}/v1/chat/completions`;
      
      const response = await axios.post(
        endpoint,
        {
          model: options.model || (USE_OPENAI ? 'gpt-3.5-turbo' : 'gpt-4'),
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || 'You are a helpful coding assistant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${BOB_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout
        }
      );

      return response.data;

    } catch (error) {
      console.error(`[Bob API] Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`API call failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * Parse JSON response from Bob API
 * @param {Object} response - API response
 * @returns {Object} Parsed JSON
 */
function parseJSONResponse(response) {
  try {
    if (response.mock) {
      return null;
    }

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in API response');
    }

    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                     content.match(/```\n([\s\S]*?)\n```/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to parse the entire content as JSON
    return JSON.parse(content);

  } catch (error) {
    console.error('[Bob API] Failed to parse JSON response:', error.message);
    throw new Error(`Failed to parse Bob API response: ${error.message}`);
  }
}

/**
 * Call Bob API for DNA extraction
 * @param {string} prompt - DNA extraction prompt
 * @returns {Promise<Object>} Extracted DNA object
 */
export async function callBobForDNA(prompt) {
  try {
    console.log('[Bob API] Calling Bob for DNA extraction...');
    
    const response = await callBobAPI(prompt, {
      systemPrompt: 'You are an expert at analyzing code repositories and extracting coding patterns. Always respond with valid JSON.',
      temperature: 0.3,
      maxTokens: 2000
    });

    if (response.mock) {
      console.log('[Bob API] Using mock DNA response');
      return {
        codingPatterns: ['standard', 'functional'],
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
        dependencies: ['express', 'axios'],
        testingPatterns: ['jest'],
        errorHandling: 'try-catch',
        asyncPatterns: 'async-await',
        importStyle: 'ES6',
        commentStyle: 'JSDoc',
        indentation: '2-spaces'
      };
    }

    const dna = parseJSONResponse(response);
    console.log('[Bob API] DNA extraction successful');
    return dna;

  } catch (error) {
    console.error('[Bob API] DNA extraction failed:', error.message);
    throw error;
  }
}

/**
 * Call Bob API for code generation
 * @param {string} prompt - Code generation prompt
 * @returns {Promise<Object>} Generated code object
 */
export async function callBobForCodeGeneration(prompt) {
  try {
    console.log('[Bob API] Calling Bob for code generation...');
    
    const response = await callBobAPI(prompt, {
      systemPrompt: 'You are an expert software developer. Generate clean, well-documented code following the specified patterns. Always respond with valid JSON containing a "files" array.',
      temperature: 0.5,
      maxTokens: 4000
    });

    if (response.mock) {
      console.log('[Bob API] Using mock code generation response');
      return {
        files: [
          {
            path: 'src/example.js',
            content: '// Generated code example\nexport function example() {\n  return "Hello World";\n}',
            action: 'create',
            explanation: 'Example file generated'
          }
        ],
        summary: 'Mock code generation - configure BOB_API_KEY for real generation'
      };
    }

    const generatedCode = parseJSONResponse(response);
    console.log('[Bob API] Code generation successful');
    return generatedCode;

  } catch (error) {
    console.error('[Bob API] Code generation failed:', error.message);
    throw error;
  }
}

/**
 * Call Bob API for PR description generation
 * @param {string} prompt - PR description prompt
 * @returns {Promise<string>} Generated PR description
 */
export async function callBobForPRDescription(prompt) {
  try {
    console.log('[Bob API] Calling Bob for PR description...');
    
    const response = await callBobAPI(prompt, {
      systemPrompt: 'You are an expert at writing clear, professional pull request descriptions.',
      temperature: 0.7,
      maxTokens: 1000
    });

    if (response.mock) {
      console.log('[Bob API] Using mock PR description');
      return '## Changes\n\nThis PR implements the requested features.\n\n## Testing\n\nPlease test thoroughly before merging.';
    }

    const description = response.choices?.[0]?.message?.content;
    if (!description) {
      throw new Error('No content in API response');
    }

    console.log('[Bob API] PR description generation successful');
    return description;

  } catch (error) {
    console.error('[Bob API] PR description generation failed:', error.message);
    throw error;
  }
}

/**
 * Validate Bob API configuration
 * @returns {boolean} True if configuration is valid
 * @throws {Error} If configuration is invalid
 */
export function validateBobConfig() {
  if (!BOB_API_URL) {
    throw new Error('API URL is not set in environment variables (BOB_API_URL or OPENAI_API_URL required)');
  }
  if (!BOB_API_KEY) {
    console.warn('[API] No API key configured - will use mock responses');
  } else {
    console.log(`[API] Using ${USE_OPENAI ? 'OpenAI-compatible' : 'Bob'} API at ${BOB_API_URL}`);
  }
  return true;
}

/**
 * Test Bob API connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testBobConnection() {
  try {
    if (!BOB_API_KEY) {
      console.log('[Bob API] No API key configured - will use mock responses');
      return true;
    }

    const response = await callBobAPI('Test connection', {
      maxTokens: 10,
      timeout: 5000
    });

    return !!response;

  } catch (error) {
    console.error('[Bob API] Connection test failed:', error.message);
    return false;
  }
}

// Made with Bob