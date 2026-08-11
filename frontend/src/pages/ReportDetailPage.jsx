import { useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getReportRows } from '../api/reportsApi.js'
import DataTable from '../components/DataTable.jsx'
import FeedbackPanel from '../components/FeedbackPanel.jsx'
import Pagination from '../components/Pagination.jsx'
import SearchInput from '../components/SearchInput.jsx'
import { getReportConfig } from '../config/reportConfig.js'
import useAsyncData from '../hooks/useAsyncData.js'
import useDebouncedValue from '../hooks/useDebouncedValue.js'

const PAGE_SIZE = 5

/** Converts the human-facing one-based URL page into the API's zero-based index. */
function getPageIndex(value) {
  const pageNumber = Number(value ?? '1')
  return Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber - 1 : 0
}

/** Coordinates shareable table state with server-side report queries and UI feedback. */
export default function ReportDetailPage() {
  const { reportId } = useParams()
  const config = getReportConfig(reportId)
  const [searchParameters, setSearchParameters] = useSearchParams()
  const query = searchParameters.get('query') ?? ''
  const page = getPageIndex(searchParameters.get('page'))
  const defaultSortKey = config?.columns[0].key ?? ''
  const requestedSortKey = searchParameters.get('sort') ?? defaultSortKey
  const sortKey = config?.columns.some(({ key }) => key === requestedSortKey)
    ? requestedSortKey
    : defaultSortKey
  const sortDirection = searchParameters.get('direction') === 'desc'
    ? 'descending'
    : 'ascending'
  // Keep the URL responsive while avoiding a backend request for every typed character.
  const debouncedQuery = useDebouncedValue(query.trim(), 150)
  const loadRows = useCallback(
    (options) => getReportRows(
      reportId,
      {
        page,
        size: PAGE_SIZE,
        query: debouncedQuery,
        sort: sortKey,
        direction: sortDirection === 'ascending' ? 'asc' : 'desc',
      },
      options,
    ),
    [debouncedQuery, page, reportId, sortDirection, sortKey],
  )
  const { data: reportPage, status, retry } = useAsyncData(loadRows, {
    enabled: Boolean(config),
  })
  const rows = reportPage?.items ?? []

  function updateView(
    { nextPage = page, nextQuery = query, nextSortKey = sortKey,
      nextSortDirection = sortDirection },
    options,
  ) {
    // URL state makes filtered and sorted report pages refreshable and shareable.
    const nextParameters = new URLSearchParams(searchParameters)
    nextParameters.set('page', String(nextPage + 1))
    nextParameters.set('sort', nextSortKey)
    nextParameters.set(
      'direction',
      nextSortDirection === 'ascending' ? 'asc' : 'desc',
    )

    if (nextQuery) {
      nextParameters.set('query', nextQuery)
    } else {
      nextParameters.delete('query')
    }

    setSearchParameters(nextParameters, options)
  }

  function handleQueryChange(value) {
    // Replace search edits so browser Back is not polluted with one entry per keystroke.
    updateView({ nextPage: 0, nextQuery: value }, { replace: true })
  }

  function handleSort(key) {
    const nextDirection = sortKey === key && sortDirection === 'ascending'
      ? 'descending'
      : 'ascending'
    updateView({
      nextPage: 0,
      nextSortKey: key,
      nextSortDirection: nextDirection,
    })
  }

  if (!config) {
    return (
      <main className="content-width detail-page" id="main-content">
        <Link className="back-link" to="/">← All reports</Link>
        <FeedbackPanel
          variant="error"
          title="Report not available"
          message="This report view has not been configured. Return to all reports and choose another."
        />
      </main>
    )
  }

  return (
    <main className="content-width detail-page" id="main-content">
      <Link className="back-link" to="/">← All reports</Link>

      <div className="detail-heading">
        <div>
          <p className="eyebrow">Report</p>
          <h1>{config.name}</h1>
          <p>{config.description}</p>
        </div>
        {status === 'success' && (
          <span className="row-count">{reportPage.totalItems} rows</span>
        )}
      </div>

      <div className="table-toolbar">
        <SearchInput
          id="row-search"
          label={`Search ${config.name.toLowerCase()}`}
          value={query}
          onChange={handleQueryChange}
          placeholder={`Search ${config.name.toLowerCase()}…`}
        />
      </div>

      {status === 'loading' && (
        <div className="table-loading" role="status">
          <span className="spinner" aria-hidden="true" />
          Loading {config.name.toLowerCase()}…
        </div>
      )}

      {status === 'error' && (
        <FeedbackPanel
          variant="error"
          title={`${config.name} could not be loaded`}
          message="The reporting service did not return data. Please try again."
          onRetry={retry}
        />
      )}

      {status === 'success' && reportPage.totalItems === 0 && !debouncedQuery && (
        <FeedbackPanel
          title={`No ${config.name.toLowerCase()} to display`}
          message={`This report currently contains no ${config.singularName} records.`}
        />
      )}

      {status === 'success' && reportPage.totalItems === 0 && debouncedQuery && (
        <FeedbackPanel
          title="No matching rows"
          message={`No ${config.singularName} matches “${query}”. Try a different search.`}
        />
      )}

      {status === 'success' && rows.length > 0 && (
        <>
          <p className="page-summary">
            Showing {reportPage.page * reportPage.size + 1}–
            {reportPage.page * reportPage.size + rows.length} of {reportPage.totalItems}
          </p>
          <DataTable
            caption={`${config.name} report`}
            columns={config.columns}
            rows={rows}
            sort={{ key: sortKey, direction: sortDirection }}
            onSort={handleSort}
          />
          <Pagination
            page={reportPage.page}
            totalPages={reportPage.totalPages}
            onPageChange={(nextPage) => updateView({ nextPage })}
          />
        </>
      )}
    </main>
  )
}
