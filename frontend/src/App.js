import React, { useState } from 'react';
import './App.css';
import SpecInput from './components/SpecInput';
import RepoInput from './components/RepoInput';
import GenerateButton from './components/GenerateButton';
import ResultsTabs from './components/ResultsTabs';
import ErrorDisplay from './components/ErrorDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { generatePR } from './services/api';

function App() {
  const [specification, setSpecification] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const validateForm = () => {
    if (!specification || specification.length < 50) {
      setError('Specification must be at least 50 characters long');
      return false;
    }

    if (!repositoryUrl) {
      setError('Repository URL is required');
      return false;
    }

    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(repositoryUrl)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)');
      return false;
    }

    if (!githubToken || githubToken.length < 20) {
      setError('GitHub token is required and must be at least 20 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await generatePR({
        specification,
        repositoryUrl,
        githubToken
      });

      if (response.success) {
        setResults(response.data);
      } else {
        // Handle error object or string
        const errorMessage = typeof response.error === 'object'
          ? response.error.message || 'Failed to generate PR. Please try again.'
          : response.error || 'Failed to generate PR. Please try again.';
        setError(errorMessage);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSpecification('');
    setRepositoryUrl('');
    setGithubToken('');
    setError(null);
    setResults(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>SpecToPR</h1>
        <p>AI-Powered Pull Request Generation</p>
      </header>

      <main className="app-main">
        <div className="container">
          {!results ? (
            <form onSubmit={handleSubmit} className="input-form">
              <SpecInput
                value={specification}
                onChange={setSpecification}
                disabled={loading}
              />

              <RepoInput
                repositoryUrl={repositoryUrl}
                githubToken={githubToken}
                onRepositoryUrlChange={setRepositoryUrl}
                onGithubTokenChange={setGithubToken}
                disabled={loading}
              />

              {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

              <GenerateButton
                loading={loading}
                disabled={loading || !specification || !repositoryUrl || !githubToken}
              />
            </form>
          ) : (
            <div className="results-container">
              <div className="results-header">
                <h2>PR Generated Successfully!</h2>
                <button onClick={handleReset} className="reset-button">
                  Generate Another PR
                </button>
              </div>
              <ResultsTabs results={results} />
            </div>
          )}

          {loading && <LoadingSpinner />}
        </div>
      </main>

      <footer className="app-footer">
        <p>Powered by IBM Bob AI • SpecToPR v1.0.0</p>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob
