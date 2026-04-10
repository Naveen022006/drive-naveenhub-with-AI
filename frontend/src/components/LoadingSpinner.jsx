/**
 * LoadingSpinner — Clean animated loading indicator.
 */

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 20, md: 32, lg: 44, xl: 56 };
  const px = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="rounded-full animate-spin"
        style={{
          width: px,
          height: px,
          border: '2.5px solid var(--color-surface-light)',
          borderTopColor: 'var(--color-primary)',
          borderRightColor: 'var(--color-accent)',
        }}
      />
      {text && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * FileCardSkeleton — Ghost loading row for the file list.
 */
export function FileCardSkeleton() {
  return (
    <div
      className="rounded-xl flex items-center gap-4"
      style={{
        padding: '12px 16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-light)',
      }}
    >
      <div className="skeleton flex-shrink-0" style={{ width: 40, height: 40, borderRadius: 10 }} />
      <div className="flex-1 space-y-2">
        <div className="skeleton" style={{ width: '60%', height: 14 }} />
        <div className="skeleton" style={{ width: '35%', height: 10 }} />
      </div>
      <div className="flex gap-1">
        <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8 }} />
      </div>
    </div>
  );
}
