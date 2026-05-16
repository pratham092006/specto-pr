import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner-container">
          <div className="spinner"></div>
          <div className="spinner-ring"></div>
        </div>
        <h3 className="loading-title">Generating Your Pull Request</h3>
        <p className="loading-text">
          Analyzing repository, generating code, and creating PR...
        </p>
        <div className="loading-steps">
          <div className="step">
            <span className="step-icon">🔍</span>
            <span className="step-text">Extracting DNA</span>
          </div>
          <div className="step">
            <span className="step-icon">🤖</span>
            <span className="step-text">Generating Code</span>
          </div>
          <div className="step">
            <span className="step-icon">📝</span>
            <span className="step-text">Creating PR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

// Made with Bob
