/**
 * API Service — Centralized Axios instance for backend communication.
 * All API calls go through this module for consistent error handling.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Response Interceptor for global error handling ──────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401 && window.location.pathname !== '/') {
        // Redirect to login if unauthorized and not already there
        window.location.href = '/';
      }

      return Promise.reject({
        status,
        message: data.error || 'An error occurred',
      });
    }

    // Network error or server unreachable
    return Promise.reject({
      status: 0,
      message: 'Network error. Please check your connection.',
    });
  }
);

// ── Auth API ────────────────────────────────────────────
/**
 * Get the Google OAuth login URL.
 * Redirects the browser to this URL.
 */
export const login = () => {
  window.location.href = `${API_BASE_URL}/login`;
};

/**
 * Fetch the currently authenticated user's info.
 * @returns {Promise<{authenticated: boolean, user: object}>}
 */
export const getUser = async () => {
  const response = await api.get('/user');
  return response.data;
};

/**
 * Log out the current user (clear server session).
 */
export const logout = async () => {
  const response = await api.get('/logout');
  return response.data;
};

// ── Drive API ───────────────────────────────────────────
/**
 * Fetch all files from the user's Google Drive inside a specific folder.
 * @param {number} pageSize — max files to return
 * @param {string} query — optional Drive search query
 * @param {string} folderId — optional. Default "root"
 * @returns {Promise<{files: Array, count: number}>}
 */
export const getFiles = async (pageSize = 50, query = null, folderId = 'root') => {
  const params = { page_size: pageSize, folder_id: folderId };
  if (query) params.q = query;
  const response = await api.get('/files', { params });
  return response.data;
};

/**
 * Upload a file to Google Drive.
 * @param {File} file — the file to upload
 * @param {string} folderId — the ID of the folder to upload into (default 'root')
 * @param {function} onProgress — progress callback (0-100)
 * @returns {Promise<{message: string, file: object}>}
 */
export const uploadFile = async (file, folderId = 'root', onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder_id', folderId);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return response.data;
};

/**
 * Download a file from Google Drive.
 * @param {string} fileId — Google Drive file ID
 * @param {string} fileName — suggested file name
 */
export const downloadFile = async (fileId, fileName) => {
  const response = await api.get(`/download/${fileId}`, {
    responseType: 'blob',
  });

  // Create a download link and trigger it
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName || 'download');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Delete a file from Google Drive.
 * @param {string} fileId — Google Drive file ID
 * @returns {Promise<{message: string}>}
 */
export const deleteFile = async (fileId) => {
  const response = await api.delete(`/delete/${fileId}`);
  return response.data;
};

// ── AI Chat API ───────────────────────────────────────────
/**
 * Send a series of messages to the AI assistant.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{reply: string}>}
 */
export const chatWithAi = async (messages) => {
  const response = await api.post('/api/chat/message', { messages });
  return response.data;
};

export default api;
