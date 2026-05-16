/**
 * Tests for App Component
 * 
 * These tests verify the main App component functionality including:
 * - Initial rendering
 * - Form validation
 * - Form submission
 * - Error handling
 * - Results display
 * - Reset functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './App';
import * as api from './services/api';

// Mock the API service
jest.mock('./services/api');

describe('App Component', () => {
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // ========================================
  // Initial Rendering Tests
  // ========================================

  describe('Initial Rendering', () => {
    it('should render the app header', () => {
      render(<App />);
      
      expect(screen.getByText('SpecToPR')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Pull Request Generation')).toBeInTheDocument();
    });

    it('should render the footer', () => {
      render(<App />);
      
      expect(screen.getByText(/Powered by IBM Bob AI/i)).toBeInTheDocument();
      expect(screen.getByText(/SpecToPR v1.0.0/i)).toBeInTheDocument();
    });

    it('should render the input form initially', () => {
      render(<App />);
      
      // Check for form elements
      expect(screen.getByRole('textbox', { name: /specification/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });

    it('should have generate button disabled initially', () => {
      render(<App />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeDisabled();
    });

    it('should not show results initially', () => {
      render(<App />);
      
      expect(screen.queryByText(/PR Generated Successfully/i)).not.toBeInTheDocument();
    });

    it('should not show error initially', () => {
      render(<App />);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should not show loading spinner initially', () => {
      render(<App />);
      
      expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
    });
  });

  // ========================================
  // Form Validation Tests
  // ========================================

  describe('Form Validation', () => {
    it('should show error when specification is too short', async () => {
      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill in short specification
      await userEvent.type(specInput, 'Too short');
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Specification must be at least 50 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when repository URL is missing', async () => {
      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill in specification and token but not repo URL
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Repository URL is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when repository URL is invalid', async () => {
      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill in invalid repo URL
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'not-a-valid-url');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid GitHub repository URL/i)).toBeInTheDocument();
      });
    });

    it('should show error when GitHub token is missing', async () => {
      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill in specification and repo but not token
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/GitHub token is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when GitHub token is too short', async () => {
      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill in short token
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'short');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/GitHub token is required and must be at least 20 characters/i)).toBeInTheDocument();
      });
    });

    it('should accept valid GitHub URLs with and without trailing slash', async () => {
      render(<App />);
      
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      
      // Test with trailing slash
      await userEvent.type(repoInput, 'https://github.com/user/repo/');
      expect(repoInput.value).toBe('https://github.com/user/repo/');
      
      // Clear and test without trailing slash
      await userEvent.clear(repoInput);
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      expect(repoInput.value).toBe('https://github.com/user/repo');
    });
  });

  // ========================================
  // Form Submission Tests
  // ========================================

  describe('Form Submission', () => {
    const validFormData = {
      specification: 'Add a new feature to calculate user statistics including total count, active users, and growth rate metrics',
      repositoryUrl: 'https://github.com/user/repo',
      githubToken: 'ghp_1234567890abcdefghij'
    };

    it('should call API with correct parameters on valid submission', async () => {
      api.generatePR.mockResolvedValue({
        success: true,
        data: {
          prUrl: 'https://github.com/user/repo/pull/42',
          prNumber: 42
        }
      });

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill in valid form data
      await userEvent.type(specInput, validFormData.specification);
      await userEvent.type(repoInput, validFormData.repositoryUrl);
      await userEvent.type(tokenInput, validFormData.githubToken);
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(api.generatePR).toHaveBeenCalledWith({
          specification: validFormData.specification,
          repositoryUrl: validFormData.repositoryUrl,
          githubToken: validFormData.githubToken
        });
      });
    });

    it('should show loading spinner during submission', async () => {
      api.generatePR.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { prUrl: 'https://github.com/user/repo/pull/42' }
        }), 100))
      );

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill in valid form data
      await userEvent.type(specInput, validFormData.specification);
      await userEvent.type(repoInput, validFormData.repositoryUrl);
      await userEvent.type(tokenInput, validFormData.githubToken);
      
      fireEvent.click(generateButton);
      
      // Loading spinner should appear
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
      });
    });

    it('should disable form inputs during submission', async () => {
      api.generatePR.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { prUrl: 'https://github.com/user/repo/pull/42' }
        }), 100))
      );

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill in valid form data
      await userEvent.type(specInput, validFormData.specification);
      await userEvent.type(repoInput, validFormData.repositoryUrl);
      await userEvent.type(tokenInput, validFormData.githubToken);
      
      fireEvent.click(generateButton);
      
      // Inputs should be disabled
      expect(specInput).toBeDisabled();
      expect(generateButton).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(specInput).not.toBeDisabled();
      });
    });
  });

  // ========================================
  // Success Handling Tests
  // ========================================

  describe('Success Handling', () => {
    it('should display results on successful PR generation', async () => {
      api.generatePR.mockResolvedValue({
        success: true,
        data: {
          prUrl: 'https://github.com/user/repo/pull/42',
          prNumber: 42,
          branchName: 'spectropr-feature'
        }
      });

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill and submit form
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/PR Generated Successfully/i)).toBeInTheDocument();
      });
    });

    it('should hide form when results are displayed', async () => {
      api.generatePR.mockResolvedValue({
        success: true,
        data: {
          prUrl: 'https://github.com/user/repo/pull/42',
          prNumber: 42
        }
      });

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill and submit form
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: /specification/i })).not.toBeInTheDocument();
      });
    });

    it('should show reset button when results are displayed', async () => {
      api.generatePR.mockResolvedValue({
        success: true,
        data: {
          prUrl: 'https://github.com/user/repo/pull/42',
          prNumber: 42
        }
      });

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill and submit form
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Generate Another PR/i)).toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Error Handling Tests
  // ========================================

  describe('Error Handling', () => {
    it('should display error when API returns error response', async () => {
      api.generatePR.mockResolvedValue({
        success: false,
        error: 'Failed to generate PR'
      });

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill and submit form
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to generate PR/i)).toBeInTheDocument();
      });
    });

    it('should display error when API throws exception', async () => {
      api.generatePR.mockRejectedValue(new Error('Network error'));

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill and submit form
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should allow dismissing error messages', async () => {
      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Trigger validation error
      await userEvent.type(specInput, 'Short');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Specification must be at least 50 characters/i)).toBeInTheDocument();
      });
      
      // Dismiss error
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Specification must be at least 50 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Reset Functionality Tests
  // ========================================

  describe('Reset Functionality', () => {
    it('should reset form when reset button is clicked', async () => {
      api.generatePR.mockResolvedValue({
        success: true,
        data: {
          prUrl: 'https://github.com/user/repo/pull/42',
          prNumber: 42
        }
      });

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill and submit form
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByText(/PR Generated Successfully/i)).toBeInTheDocument();
      });
      
      // Click reset button
      const resetButton = screen.getByText(/Generate Another PR/i);
      fireEvent.click(resetButton);
      
      // Form should be visible again
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /specification/i })).toBeInTheDocument();
      });
      
      // Form should be empty
      const newSpecInput = screen.getByRole('textbox', { name: /specification/i });
      expect(newSpecInput.value).toBe('');
    });

    it('should clear results when reset button is clicked', async () => {
      api.generatePR.mockResolvedValue({
        success: true,
        data: {
          prUrl: 'https://github.com/user/repo/pull/42',
          prNumber: 42
        }
      });

      render(<App />);
      
      const specInput = screen.getByRole('textbox', { name: /specification/i });
      const repoInput = screen.getByPlaceholderText(/github\.com\/user\/repo/i);
      const tokenInput = screen.getByPlaceholderText(/github token/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Fill and submit form
      await userEvent.type(specInput, 'A'.repeat(50));
      await userEvent.type(repoInput, 'https://github.com/user/repo');
      await userEvent.type(tokenInput, 'ghp_1234567890abcdefghij');
      
      fireEvent.click(generateButton);
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByText(/PR Generated Successfully/i)).toBeInTheDocument();
      });
      
      // Click reset button
      const resetButton = screen.getByText(/Generate Another PR/i);
      fireEvent.click(resetButton);
      
      // Results should be hidden
      await waitFor(() => {
        expect(screen.queryByText(/PR Generated Successfully/i)).not.toBeInTheDocument();
      });
    });
  });
});

// Made with Bob