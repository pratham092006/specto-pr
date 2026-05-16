import React from 'react';
import PropTypes from 'prop-types';
import './ErrorDisplay.css';

const ErrorDisplay = ({ message, onDismiss }) => {
  return (
    <div className="error-display">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-message">{message}</span>
      </div>
      {onDismiss && (
        <button 
          className="error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
};

ErrorDisplay.propTypes = {
  message: PropTypes.string.isRequired,
  onDismiss: PropTypes.func
};

ErrorDisplay.defaultProps = {
  onDismiss: null
};

export default ErrorDisplay;

// Made with Bob
