// The one placeholder for opportunity covers — shown while a cover loads
// (underneath it), and instead of it when there is no cover or it fails.
// Brand lilac + muted МОЖUВО wordmark; styles in app/globals.css
// (.cover-placeholder*). Pure CSS with an inline data-URI mask: no requests.
// Fills its parent; the parent owns the box (aspect ratio / height).
export default function CoverPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`cover-placeholder flex items-center justify-center ${className}`}>
      <span className="cover-placeholder-logo" />
    </div>
  );
}
