import React, { useState } from 'react';
import { validateFile } from './api';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [reportStats, setReportStats] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeView, setActiveView] = useState('validator');

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        setError('Invalid file format. Please select an Excel file (.xlsx or .xls)');
        setFile(null);
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (selectedFile.size > maxSize) {
        setError('File is too large. Maximum file size is 50MB.');
        setFile(null);
        e.target.value = ''; // Clear the input
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setSuccess(false);
      setUploadProgress(0);
      setProcessingStage('');
    }
  };

  // Handle Form Submission
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setUploadProgress(0);
    setProcessingStage('Preparing upload...');

    try {
      // Track upload progress (0-40% for upload phase)
      const { blob, stats } = await validateFile(file, (progress) => {
        // Map upload progress to 0-40%
        const uploadPercentage = Math.floor(progress * 0.4);
        setUploadProgress(uploadPercentage);
        
        if (progress < 100) {
          setProcessingStage('Uploading file...');
        } else {
          // Upload complete, now processing
          setUploadProgress(40);
          setProcessingStage('Processing file...');
        }
      });

      // Simulate processing progress (40-80%)
      setUploadProgress(50);
      setProcessingStage('Validating data...');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setUploadProgress(65);
      setProcessingStage('Generating report...');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setUploadProgress(80);
      setProcessingStage('Formatting report...');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(95);
      setProcessingStage('Finalizing...');
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Compute_Validation_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setUploadProgress(100);
      setProcessingStage('Complete!');
      setSuccess(true);
      
      // Store statistics and show dashboard
      if (stats) {
        setReportStats(stats);
        setShowDashboard(true);
        // Auto-switch to Reports view
        setActiveView('reports');
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || 'An error occurred during validation.');
      setProcessingStage('');
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    setUploadProgress(0);
    setProcessingStage('');
    setShowDashboard(false);
  };

  return (
    <div className="App">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-brand">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FF6B35"/>
              <path d="M8 12h16M8 16h16M8 20h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>Honeywell Validation Tool</h1>
        </div>
        <div className="navbar-actions">
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <div className="user-avatar">A</div>
          </div>
        </div>
      </nav>

      <div className="app-container">
        {/* Left Sidebar Navigation */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeView === 'validator' ? 'active' : ''}`}
              onClick={() => setActiveView('validator')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>File Validator</span>
            </button>
            <button 
              className={`nav-item ${activeView === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveView('reports')}
              disabled={!showDashboard}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
              <span>Reports</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-info">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <span>Help & Support</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {activeView === 'validator' && (
            <>
              <div className="page-header">
                <div>
                  <h2>File Validation</h2>
                  <p className="page-description">Upload Combine Data File to Generate Validation Reports</p>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h3>Upload File</h3>
                </div>
            
            <div className="upload-area">
              <div className="file-drop-zone" onClick={() => document.getElementById('file-upload').click()}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="drop-text">Click to browse or drag and drop</p>
                <p className="drop-hint">Supported formats: .xlsx, .xls</p>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  id="file-upload"
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </div>

              {file && (
                <div className="file-selected">
                  <div className="file-info">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6"/>
                    </svg>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>
                  <button className="btn-icon" onClick={handleClearFile} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="progress-container">
                <div className="progress-info">
                  <span className="progress-text">{processingStage}</span>
                  <span className="progress-percentage">{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <div>
                  <strong>Validation Error:</strong>
                  <p className="error-message">{error}</p>
                  <p className="error-hint">Please ensure you have selected the correct Combined Data File with the required 'README-Glossary' and 'Compute' sheets.</p>
                </div>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span><strong>Success!</strong> The validation report has been downloaded successfully.</span>
              </div>
            )}
          </div>
          </>
          )}

          {activeView === 'reports' && (
            <>
              <div className="page-header">
                <div>
                  <h2>Report Statistics</h2>
                  <p className="page-description">Summary and analytics from the latest validation report</p>
                </div>
              </div>

          {showDashboard && reportStats ? (
            <>
              <div className="content-card">
                <div className="card-header">
                  <h3>Summary Statistics</h3>
                  <p>Key metrics from the validation report</p>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon blue">
                      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h4>Total Records</h4>
                      <p className="stat-value">{reportStats.total_records}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon green">
                      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h4>Unique SBG Count</h4>
                      <p className="stat-value">{reportStats.unique_sbg_count}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon orange">
                      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h4>Unique BAN Count</h4>
                      <p className="stat-value">{reportStats.unique_ban_count}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon purple">
                      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h4>Categories</h4>
                      <p className="stat-value">{reportStats.unique_categories}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h3>Category-wise Breakdown</h3>
                  <p>SBG and BAN distribution by category</p>
                </div>

                {reportStats.category_details && Object.keys(reportStats.category_details).length > 0 ? (
                  <div className="categories-breakdown">
                    {Object.entries(reportStats.category_details).map(([category, categoryData]) => (
                      <div key={category} className="category-section">
                        <div className="category-header">
                          <div className="category-info">
                            <h4>{category}</h4>
                            <span className="category-badge">
                              {categoryData.distinct_sbgs} SBG{categoryData.distinct_sbgs !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="sbg-list">
                          {Object.entries(categoryData.sbg_ban_details || {}).map(([sbg, sbgData]) => (
                            <div key={sbg} className="sbg-item">
                              <div className="sbg-header">
                                <span className="sbg-name">{sbg}</span>
                                <span className="sbg-bans">
                                  {sbgData.distinct_bans} BAN{sbgData.distinct_bans !== 1 ? 's' : ''} • {sbgData.total_records} record{sbgData.total_records !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-breakdown">
                    <p>No category data available</p>
                  </div>
                )}
              </div>

              <div className="content-card">
                <div className="breakdown-section">
                  <h4>SBG Breakdown (Summary)</h4>
                  <div className="breakdown-list">
                    {Object.entries(reportStats.sbg_breakdown || {}).map(([sbg, count]) => (
                      <div key={sbg} className="breakdown-item">
                        <span className="breakdown-label">{sbg}</span>
                        <span className="breakdown-count">{count} record{count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="breakdown-section">
                  <h4>BAN Breakdown (Top 10)</h4>
                  <div className="breakdown-list">
                    {Object.entries(reportStats.ban_breakdown || {}).slice(0, 10).map(([ban, count]) => (
                      <div key={ban} className="breakdown-item">
                        <span className="breakdown-label">{ban}</span>
                        <span className="breakdown-count">{count} record{count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                    {Object.keys(reportStats.ban_breakdown || {}).length > 10 && (
                      <div className="breakdown-item">
                        <span className="breakdown-label text-muted">... and {Object.keys(reportStats.ban_breakdown).length - 10} more</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="content-card">
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p>No report statistics available</p>
                <p style={{ fontSize: '14px', color: '#a0aec0', marginTop: '8px' }}>
                  Generate a validation report to view statistics
                </p>
              </div>
            </div>
          )}
          </>
          )}
        </main>

        {/* Right Action Panel */}
        <aside className="action-panel">
          <div className="panel-section">
            <h3>Actions</h3>
            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className={`btn-primary ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  <span>Generate Report</span>
                </>
              )}
            </button>

            {file && (
              <button onClick={handleClearFile} className="btn-secondary" disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span>Clear File</span>
              </button>
            )}
          </div>

          <div className="panel-section">
            <h3>File Info</h3>
            {file ? (
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{file.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size:</span>
                  <span className="info-value">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{file.type || 'Excel'}</span>
                </div>
              </div>
            ) : (
              <p className="info-empty">No file selected</p>
            )}
          </div>

          <div className="panel-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <p className="info-empty">No recent activity</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;