/**
 * DashboardPage — Main layout view holding the Drive files.
 * Redesigned for premium SaaS aesthetic with strict full-width flex centering.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, FolderOpen, CloudOff } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getFiles, uploadFile, downloadFile, deleteFile } from '../services/api';

import Navbar from '../components/Navbar';
import FileCard from '../components/FileCard';
import { FileCardSkeleton } from '../components/LoadingSpinner';
import UploadZone from '../components/UploadZone';
import AiAssistant from '../components/AiAssistant';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Files' },
  { value: 'document', label: 'Docs' },
  { value: 'spreadsheet', label: 'Sheets' },
  { value: 'presentation', label: 'Slides' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'folder', label: 'Folders' },
];

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Folder navigation state
  const [folderHistory, setFolderHistory] = useState([{ id: 'root', name: 'My Drive' }]);
  const currentFolderId = folderHistory[folderHistory.length - 1].id;

  // Redirect if logged out
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/');
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch files when folder changes
  useEffect(() => {
    if (isAuthenticated) fetchFiles();
  }, [isAuthenticated, currentFolderId]);

  // Apply Search & Filter locally
  useEffect(() => {
    let result = files;
    if (filterType !== 'all') {
      result = result.filter((f) => f.mimeType.includes(filterType));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }
    setFilteredFiles(result);
  }, [files, searchQuery, filterType]);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFiles(50, null, currentFolderId);
      setFiles(data.files || []);
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFiles();
    setRefreshing(false);
  };

  const handleOpenFolder = (folder) => {
    setFolderHistory((prev) => [...prev, folder]);
  };

  const navigateToHistoryIndex = (index) => {
    setFolderHistory((prev) => prev.slice(0, index + 1));
  };

  const handleUpload = async (file, onProgress) => {
    await uploadFile(file, currentFolderId, onProgress);
    await fetchFiles();
  };

  const handleDownload = async (fileId, fileName) => {
    await downloadFile(fileId, fileName);
  };

  const handleDelete = async (fileId) => {
    await deleteFile(fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  if (authLoading) return null;

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Navbar />

      {/* Main Layout Container - strictly centered */}
      <main className="flex-1 w-full flex flex-col items-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-6xl flex flex-col gap-8">
          
          {/* ── Upload Section ── */}
          <section className="animate-fade-in">
            <UploadZone onUpload={handleUpload} />
          </section>

          {/* ── Toolbar & Filters Group ── */}
          <section className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Breadcrumb Navigation */}
            {folderHistory.length > 1 && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-black/5 border border-white/5 w-fit">
                {folderHistory.map((folder, index) => {
                  const isLast = index === folderHistory.length - 1;
                  return (
                    <div key={folder.id} className="flex items-center gap-2">
                      <button
                        onClick={() => navigateToHistoryIndex(index)}
                        className={`text-sm font-medium transition-colors ${
                          isLast ? 'text-[var(--color-primary)] cursor-default' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer'
                        }`}
                        disabled={isLast}
                      >
                        {folder.name}
                      </button>
                      {!isLast && <span className="text-[var(--color-text-dim)] text-sm">/</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Header Row: Title & Search */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                  {folderHistory.length > 1 ? folderHistory[folderHistory.length - 1].name : 'Your Files'}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {files.length} items in your Drive
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 h-10 rounded-lg flex-1 sm:w-72"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    transition: 'var(--transition)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  <Search size={16} style={{ color: 'var(--color-text-dim)' }} />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none w-full text-sm"
                    style={{ color: 'var(--color-text)', caretColor: 'var(--color-primary)' }}
                  />
                </div>

                {/* Refresh */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer flex-shrink-0"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'var(--color-primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                  }}
                  title="Refresh Files"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Filter Pills Row */}
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_OPTIONS.map((f) => {
                const active = filterType === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilterType(f.value)}
                    className="px-4 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-all"
                    style={{
                      background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: active ? 'white' : 'var(--color-text-muted)',
                      border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.borderColor = 'var(--color-text-dim)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── File List Grid/Table ── */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {loading ? (
              <div className="flex flex-col gap-2">
                <FileCardSkeleton />
                <FileCardSkeleton />
                <FileCardSkeleton />
                <FileCardSkeleton />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <CloudOff size={40} style={{ color: 'var(--color-danger)' }} className="mb-4" />
                <h3 className="text-lg font-bold">Failed to load files</h3>
                <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
                <button
                  onClick={fetchFiles}
                  className="px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                  style={{ background: 'var(--color-primary)', color: 'white' }}
                >
                  Try Again
                </button>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <FolderOpen size={48} style={{ color: 'var(--color-text-dim)' }} className="mb-4 opacity-50" />
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {searchQuery || filterType !== 'all' ? 'No matches found' : 'Your Drive is empty'}
                </h3>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Upload your first file using the drop zone above'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 stagger-children">
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onOpenFolder={handleOpenFolder}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Floating AI Panel */}
      <AiAssistant />
    </div>
  );
}
