import { Link } from 'react-router-dom'
import { formatDateTime } from '../utils/formatters.js'

const reportInitials = {
  users: 'US',
  departments: 'DE',
  projects: 'PR',
}

/** Summarizes report metadata and links configured reports to their detail view. */
export default function ReportCard({ report, available }) {
  const content = (
    <>
      <div className={`report-card__icon report-card__icon--${report.id}`} aria-hidden="true">
        {reportInitials[report.id] ?? 'RP'}
      </div>
      <div className="report-card__content">
        <div className="report-card__heading">
          <h3>{report.name}</h3>
          {available ? (
            <svg className="report-card__arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          ) : (
            <span className="coming-soon">Next</span>
          )}
        </div>
        <p className="report-card__description">{report.description}</p>
        <div className="report-card__meta">
          <span>{report.rowCount} rows</span>
          <span aria-hidden="true">•</span>
          <span>Updated {formatDateTime(report.lastUpdated)}</span>
        </div>
      </div>
    </>
  )

  if (!available) {
    return <article className="report-card report-card--disabled">{content}</article>
  }

  return (
    <Link className="report-card" to={`/reports/${report.id}`}>
      {content}
    </Link>
  )
}
