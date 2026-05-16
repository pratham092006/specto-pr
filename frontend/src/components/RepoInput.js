import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './RepoInput.css';

const RepoInput = ({ 
  repositoryUrl, 
  githubToken, 
  onRepositoryUrlChange, 
  onGithubTokenChange, 
  disabled 
}) => {
  const [showToken, setShowToken] = useState(false);

  const isValidUrl = (url) => {
    if (!url) return null;
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url);
  };

  const isValidToken = (token) => {
    if (!token) return null;
    return token.length >= 20;
  };

  const urlValid = isValidUrl(repositoryUrl);
  const tokenValid = isValidToken(githubToken);

  return (
    <div className="repo-input-container">
      <div className="input-group">
        <label htmlFor="repositoryUrl" className="input-label">
          GitHub Repository URL *
        </label>
        <input
          type="text"
          id="repositoryUrl"
          className={`input-field ${urlValid === true ? 'valid' : urlValid === false ? 'invalid' : ''}`}
          value={repositoryUrl}
          onChange={(e) => onRepositoryUrlChange(e.target.value)}
          disabled={disabled}
          placeholder="https://github.com/username/repository"
        />
        <span className="help-text">
          Enter the full GitHub repository URL (e.g., https://github.com/user/repo)
        </span>
        {urlValid === false && (
          <span className="error-text">Please enter a valid GitHub repository URL</span>
        )}
      </div>

      <div className="input-group">
        <label htmlFor="githubToken" className="input-label">
          GitHub Personal Access Token *
        </label>
        <div className="token-input-wrapper">
          <input
            type={showToken ? 'text' : 'password'}
            id="githubToken"
            className={`input-field ${tokenValid === true ? 'valid' : tokenValid === false ? 'invalid' : ''}`}
            value={githubToken}
            onChange={(e) => onGithubTokenChange(e.target.value)}
            disabled={disabled}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowToken(!showToken)}
            disabled={disabled}
            aria-label={showToken ? 'Hide token' : 'Show token'}
          >
            {showToken ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        <span className="help-text">
          Token needs 'repo' scope. <a 
            href="https://github.com/settings/tokens/new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="help-link"
          >
            Generate token
          </a>
        </span>
        {tokenValid === false && (
          <span className="error-text">Token must be at least 20 characters</span>
        )}
      </div>
    </div>
  );
};

RepoInput.propTypes = {
  repositoryUrl: PropTypes.string.isRequired,
  githubToken: PropTypes.string.isRequired,
  onRepositoryUrlChange: PropTypes.func.isRequired,
  onGithubTokenChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

RepoInput.defaultProps = {
  disabled: false
};

export default RepoInput;

// Made with Bob
