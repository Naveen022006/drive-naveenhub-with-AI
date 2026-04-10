/**
 * FileCard — Single file row with icon, metadata, and actions.
 * Clean single-row layout with proper alignment.
 */

import {
  Download, Trash2, ExternalLink,
  FileText, Image, FileSpreadsheet, Film, Music, File, Presentation, Folder
} from 'lucide-react';
import { useState } from 'react';

/* ── Icon + color mapper ── */
function getFileVisuals(mimeType) {
  if (mimeType.includes('folder'))
    return { icon: Folder, color: '#facc15', bg: 'rgba(250,204,21,0.1)' };
  if (mimeType.includes('document') || mimeType.includes('word'))
    return { icon: FileText, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return { icon: FileSpreadsheet, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return { icon: Presentation, color: '#f97316', bg: 'rgba(249,115,22,0.1)' };
  if (mimeType.includes('image'))
    return { icon: Image, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' };
  if (mimeType.includes('video'))
    return { icon: Film, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  if (mimeType.includes('audio'))
    return { icon: Music, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' };
  if (mimeType.includes('pdf'))
    return { icon: FileText, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  return { icon: File, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
}

function getTypeLabel(mimeType) {
  if (mimeType.includes('folder')) return 'Folder';
  if (mimeType.includes('document')) return 'Document';
  if (mimeType.includes('spreadsheet')) return 'Spreadsheet';
  if (mimeType.includes('presentation')) return 'Slides';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('image')) return 'Image';
  if (mimeType.includes('video')) return 'Video';
  if (mimeType.includes('audio')) return 'Audio';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'Archive';
  return 'File';
}

export default function FileCard({ file, onDownload, onDelete, onOpenFolder }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { icon: IconComp, color, bg } = getFileVisuals(file.mimeType);

  const isFolder = file.mimeType.includes('folder');

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    try { await onDownload(file.id, file.name); } finally { setIsDownloading(false); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try { await onDelete(file.id); } catch { setIsDeleting(false); }
  };

  const handleCardClick = () => {
    if (isFolder && onOpenFolder) {
      onOpenFolder({ id: file.id, name: file.name });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group rounded-xl flex items-center gap-4 ${isFolder ? 'cursor-pointer' : ''}`}
      style={{
        padding: '12px 16px',
        background: hovered ? 'var(--color-surface-hover)' : 'var(--color-surface)',
        border: `1px solid ${hovered ? 'rgba(99,102,241,0.3)' : 'var(--color-border-light)'}`,
        transition: 'var(--transition)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-glow)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Icon ── */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{ width: 40, height: 40, background: bg }}
      >
        <IconComp size={20} style={{ color }} />
      </div>

      {/* ── File Info ── */}
      <div className="flex-1 min-w-0">
        <h3
          className={`text-sm font-medium truncate ${isFolder && hovered ? 'underline' : ''}`}
          style={{ color: 'var(--color-text)', textDecorationColor: color }}
          title={file.name}
        >
          {file.name}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: bg, color }}
          >
            {getTypeLabel(file.mimeType)}
          </span>
          {file.sizeFormatted && (
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {file.sizeFormatted}
            </span>
          )}
          {file.modifiedTime && (
            <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--color-text-dim)' }}>
              {new Date(file.modifiedTime).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Open in Drive */}
        {file.webViewLink && (
          <ActionButton
            as="a"
            href={file.webViewLink}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Drive"
            hoverBg="rgba(99,102,241,0.1)"
            hoverColor="var(--color-primary-light)"
          >
            <ExternalLink size={15} />
          </ActionButton>
        )}

        {/* Download */}
        <ActionButton
          onClick={handleDownload}
          disabled={isDownloading}
          title="Download"
          hoverBg="var(--color-success-bg)"
          hoverColor="var(--color-success)"
          id={`download-${file.id}`}
        >
          <Download size={15} className={isDownloading ? 'animate-bounce' : ''} />
        </ActionButton>

        {/* Delete */}
        <ActionButton
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete"
          hoverBg="var(--color-danger-bg)"
          hoverColor="var(--color-danger)"
          id={`delete-${file.id}`}
        >
          <Trash2 size={15} className={isDeleting ? 'animate-spin' : ''} />
        </ActionButton>
      </div>
    </div>
  );
}

/* ── Tiny reusable action button ── */
function ActionButton({ as: Tag = 'button', children, hoverBg, hoverColor, ...props }) {
  const [hover, setHover] = useState(false);

  return (
    <Tag
      {...props}
      className="flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-30"
      style={{
        width: 34,
        height: 34,
        background: hover ? hoverBg : 'transparent',
        color: hover ? hoverColor : 'var(--color-text-dim)',
        border: 'none',
        transition: 'var(--transition)',
        textDecoration: 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Tag>
  );
}
