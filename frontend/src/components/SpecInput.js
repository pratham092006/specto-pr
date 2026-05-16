import React from 'react';
import PropTypes from 'prop-types';
import './SpecInput.css';

const SpecInput = ({ value, onChange, disabled }) => {
  const minLength = 50;
  const currentLength = value.length;
  const isValid = currentLength >= minLength;

  return (
    <div className="spec-input-container">
      <label htmlFor="specification" className="spec-label">
        Specification *
      </label>
      <textarea
        id="specification"
        className={`spec-textarea ${isValid ? 'valid' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Describe the feature or changes you want to implement...&#10;&#10;Example:&#10;Add a user authentication system with login and registration pages. Include form validation, password hashing, and JWT token generation. Create API endpoints for user registration, login, and profile retrieval."
        rows={8}
      />
      <div className="spec-footer">
        <span className={`char-count ${isValid ? 'valid' : 'invalid'}`}>
          {currentLength} / {minLength} characters
          {!isValid && ` (${minLength - currentLength} more needed)`}
        </span>
        {isValid && (
          <span className="valid-indicator">✓ Ready</span>
        )}
      </div>
    </div>
  );
};

SpecInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

SpecInput.defaultProps = {
  disabled: false
};

export default SpecInput;

// Made with Bob
