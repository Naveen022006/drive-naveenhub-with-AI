/**
 * UploadZone — Drag-and-drop upload with centered layout and progress bar.
 */

import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';

export default function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) handleUpload(e.target.files[0]);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setProgress(0);
    setStatus(null);
    setStatusMessage('');
    try {
      await onUpload(file, (p) => setProgress(p));
      setStatus('success');
      setStatusMessage(`"${file.name}" uploaded successfully!`);
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => { setStatus(null); setStatusMessage(''); setProgress(0); }, 4000);
    }
  };

  return (
    <div>
      {/* ── Drop Zone ── */}
      <div
        className="rounded-xl cursor-pointer group"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          background: isDragging ? 'rgba(99,102,241,0.08)' : 'var(--color-surface)',
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          transition: 'var(--transition)',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
        onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        id="upload-zone"
      >
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} id="file-input" />

        {/* Icon */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full mb-4"
          style={{
            background: isDragging ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
            transition: 'var(--transition)',
          }}
        >
          <Upload
            size={24}
            style={{ color: 'var(--color-primary-light)' }}
            className={isDragging ? 'animate-bounce' : ''}
          />
        </div>

        {/* Text */}
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          {isDragging ? 'Drop your file here' : 'Upload to Google Drive'}
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Drag & drop a file or{' '}
          <span style={{ color: 'var(--color-primary-light)', fontWeight: 500 }}>browse</span>
        </p>

        {/* Progress */}
        {uploading && (
          <div className="w-full max-w-xs mt-5">
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-light)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-muted)' }}>
              Uploading… {progress}%
            </p>
          </div>
        )}
      </div>

      {/* ── Status Toast ── */}
      {status && (
        <div
          className="mt-3 flex items-center gap-3 px-4 py-3 rounded-lg animate-fade-in text-sm"
          style={{
            background: status === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            color: status === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          }}
        >
          {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{statusMessage}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setStatus(null); }}
            className="cursor-pointer"
            style={{ background: 'none', border: 'none', color: 'inherit' }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
