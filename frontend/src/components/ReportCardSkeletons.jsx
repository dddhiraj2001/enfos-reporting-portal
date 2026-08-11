/** Reserves the report-card layout while catalog metadata is loading. */
export default function ReportCardSkeletons() {
  return (
    <div className="report-grid" aria-label="Loading reports" aria-busy="true">
      {[1, 2, 3].map((item) => (
        <div className="report-card report-card--skeleton" key={item} aria-hidden="true">
          <div className="skeleton skeleton--icon" />
          <div className="report-card__content">
            <div className="skeleton skeleton--heading" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--short" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading reports…</span>
    </div>
  )
}
