/** Presents consistent empty and recoverable error states, with an optional retry action. */
export default function FeedbackPanel({ variant = 'empty', title, message, onRetry }) {
  return (
    <div className={`feedback-panel feedback-panel--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <div className="feedback-panel__icon" aria-hidden="true">
        {variant === 'error' ? '!' : '—'}
      </div>
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
        {onRetry && (
          <button className="button button--secondary" type="button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
