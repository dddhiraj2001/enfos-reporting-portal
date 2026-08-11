import { useCallback, useMemo, useState } from 'react'
import { getReports } from '../api/reportsApi.js'
import FeedbackPanel from '../components/FeedbackPanel.jsx'
import ReportCard from '../components/ReportCard.jsx'
import ReportCardSkeletons from '../components/ReportCardSkeletons.jsx'
import SearchInput from '../components/SearchInput.jsx'
import { reportConfigs } from '../config/reportConfig.js'
import useAsyncData from '../hooks/useAsyncData.js'

/** Loads, searches, and renders the available report catalog and all of its async states. */
export default function ReportsLandingPage() {
  const [query, setQuery] = useState('')
  const loadReports = useCallback((options) => getReports(options), [])
  const { data: reports, status, retry } = useAsyncData(loadReports)

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return reports ?? []

    return (reports ?? []).filter((report) =>
      report.name.toLowerCase().includes(normalizedQuery),
    )
  }, [query, reports])

  return (
    <main id="main-content">
      <section className="landing-hero">
        <div className="content-width">
          <p className="eyebrow">Reporting workspace</p>
          <h1>Clarity across your organization.</h1>
          <p className="landing-hero__intro">
            Find the report you need and explore current operational data in one place.
          </p>
        </div>
      </section>

      <section className="reports-section content-width" aria-labelledby="available-reports-heading">
        <div className="section-heading">
          <div>
            <h2 id="available-reports-heading">Available reports</h2>
            <p>Choose a report to review its latest data.</p>
          </div>
          <SearchInput
            id="report-search"
            label="Search reports"
            value={query}
            onChange={setQuery}
            placeholder="Search reports…"
          />
        </div>

        {status === 'loading' && <ReportCardSkeletons />}

        {status === 'error' && (
          <FeedbackPanel
            variant="error"
            title="Reports could not be loaded"
            message="Check that the reporting service is running, then try again."
            onRetry={retry}
          />
        )}

        {status === 'success' && reports.length === 0 && (
          <FeedbackPanel
            title="No reports are available"
            message="Reports will appear here when they are published."
          />
        )}

        {status === 'success' && reports.length > 0 && filteredReports.length === 0 && (
          <FeedbackPanel
            title="No matching reports"
            message={`No report name matches “${query}”. Try a different search.`}
          />
        )}

        {status === 'success' && filteredReports.length > 0 && (
          <div className="report-grid">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                available={Boolean(reportConfigs[report.id])}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
