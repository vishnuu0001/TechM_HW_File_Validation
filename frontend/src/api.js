import axios from 'axios';

// Use relative URL for Vercel deployment (works locally with proxy and in production)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Vercel production
  : 'http://localhost:5000/api';  // Local development

/**
 * Uploads the Excel file to the backend for validation.
 * @param {File} file - The file object selected by the user.
 * @param {Function} onProgress - Callback function to track upload progress (0-100).
 * @returns {Promise<{blob: Blob, stats: Object}>} - The generated report and statistics.
 */
export const validateFile = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/validate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Important: We expect a binary file (Blob) back, not JSON
      responseType: 'blob',
      // Track upload progress
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    // Extract statistics from response headers
    let stats = null;
    const statsHeader = response.headers['x-report-stats'];
    if (statsHeader) {
      try {
        stats = JSON.parse(statsHeader);
      } catch (e) {
        console.error('Failed to parse statistics:', e);
      }
    }

    return { blob: response.data, stats };
  } catch (error) {
    // Handle specific case where backend returns JSON error wrapped in a Blob
    if (error.response && error.response.data instanceof Blob) {
      const errorText = await error.response.data.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || 'An unknown server error occurred.');
      } catch (e) {
        // If parsing fails, just use the raw text or a default message
        throw new Error('File validation failed. Please check the file format.');
      }
    }

    // Fallback for network errors or standard JSON errors
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Server is unreachable. Please ensure the backend is running.'
    );
  }
};