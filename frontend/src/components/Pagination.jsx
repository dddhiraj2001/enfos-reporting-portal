/** Provides bounded previous/next navigation for a server-provided report page. */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Report pages">
      <button
        className="button button--secondary"
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </button>
      <span aria-live="polite">Page {page + 1} of {totalPages}</span>
      <button
        className="button button--secondary"
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  )
}
