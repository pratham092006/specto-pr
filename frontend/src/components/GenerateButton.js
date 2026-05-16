import React from 'react';
import PropTypes from 'prop-types';
import './GenerateButton.css';

const GenerateButton = ({ loading, disabled }) => {
  return (
    <button
      type="submit"
      className={`generate-button ${loading ? 'loading' : ''}`}
      disabled={disabled}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Generating PR...
        </>
      ) : (
        <>
          <span className="icon">🚀</span>
          Generate Pull Request
        </>
      )}
    </button>
  );
};

GenerateButton.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool
};

GenerateButton.defaultProps = {
  loading: false,
  disabled: false
};

export default GenerateButton;

// Made with Bob
