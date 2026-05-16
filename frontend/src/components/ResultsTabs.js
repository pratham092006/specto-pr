import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import './ResultsTabs.css';
import { formatDuration, getLanguageFromPath } from '../utils/formatters';

const ResultsTabs = ({ results }) => {
  const [expandedFiles, setExpandedFiles] = useState({});
  const [copiedFile, setCopiedFile] = useState(null);

  const toggleFile = (index) => {
    setExpandedFiles(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const copyToClipboard = async (content, fileIndex) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileIndex);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filesGenerated = results.filesGenerated || [];
  const prDescription = results.prDescription || '';
  const dna = results.dna || {};
  const prUrl = results.prUrl || '';
  const prNumber = results.prNumber || 0;
  const summary = results.summary || '';

  // Calculate stats
  const totalLines = filesGenerated.reduce((sum, file) => {
    return sum + (file.content ? file.content.split('\n').length : 0);
  }, 0);

  return (
    <div className="results-tabs">
      <Tabs>
        <TabList>
          <Tab>
            <span className="tab-icon">📄</span>
            Generated Files
            <span className="tab-badge">{filesGenerated.length}</span>
          </Tab>
          <Tab>
            <span className="tab-icon">📝</span>
            PR Description
          </Tab>
          <Tab>
            <span className="tab-icon">🧬</span>
            Repository DNA
          </Tab>
          <Tab>
            <span className="tab-icon">📊</span>
            Summary
          </Tab>
        </TabList>

        <TabPanel>
          <div className="files-panel">
            {filesGenerated.length === 0 ? (
              <div className="empty-state">No files generated</div>
            ) : (
              filesGenerated.map((file, index) => (
                <div key={index} className="file-item">
                  <div 
                    className="file-header"
                    onClick={() => toggleFile(index)}
                  >
                    <span className="file-icon">
                      {expandedFiles[index] ? '📂' : '📁'}
                    </span>
                    <span className="file-path">{file.path}</span>
                    <span className="file-lines">
                      {file.content ? file.content.split('\n').length : 0} lines
                    </span>
                  </div>
                  {expandedFiles[index] && (
                    <div className="file-content">
                      <div className="file-actions">
                        <button
                          className="copy-button"
                          onClick={() => copyToClipboard(file.content, index)}
                        >
                          {copiedFile === index ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language={getLanguageFromPath(file.path)}
                        style={vscDarkPlus}
                        showLineNumbers
                        wrapLines
                      >
                        {file.content || ''}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabPanel>

        <TabPanel>
          <div className="description-panel">
            <ReactMarkdown>{prDescription}</ReactMarkdown>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="dna-panel">
            <pre className="json-viewer">
              {JSON.stringify(dna, null, 2)}
            </pre>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="summary-panel">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-icon">📄</div>
                <div className="summary-content">
                  <div className="summary-label">Files Generated</div>
                  <div className="summary-value">{filesGenerated.length}</div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">📏</div>
                <div className="summary-content">
                  <div className="summary-label">Total Lines</div>
                  <div className="summary-value">{totalLines}</div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">🔢</div>
                <div className="summary-content">
                  <div className="summary-label">PR Number</div>
                  <div className="summary-value">#{prNumber}</div>
                </div>
              </div>

              <div className="summary-card full-width">
                <div className="summary-icon">🔗</div>
                <div className="summary-content">
                  <div className="summary-label">Pull Request URL</div>
                  <a 
                    href={prUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pr-link"
                  >
                    {prUrl}
                  </a>
                </div>
              </div>
            </div>

            {summary && (
              <div className="summary-text">
                <h3>Summary</h3>
                <p>{summary}</p>
              </div>
            )}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

ResultsTabs.propTypes = {
  results: PropTypes.shape({
    filesGenerated: PropTypes.arrayOf(PropTypes.shape({
      path: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })),
    prDescription: PropTypes.string,
    dna: PropTypes.object,
    prUrl: PropTypes.string,
    prNumber: PropTypes.number,
    summary: PropTypes.string
  }).isRequired
};

export default ResultsTabs;

// Made with Bob
