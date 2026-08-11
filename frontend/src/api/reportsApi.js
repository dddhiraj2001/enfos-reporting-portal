const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** Fetches JSON through the configured API boundary and normalizes HTTP failures. */
async function getJson(path, { signal } = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

/** Retrieves the metadata used to build the report catalog. */
export function getReports(options) {
  return getJson('/api/reports', options)
}

/** Retrieves one server-filtered, sorted, and paginated report page. */
export function getReportRows(reportId, parameters, options) {
  const searchParameters = new URLSearchParams({
    page: String(parameters.page),
    size: String(parameters.size),
    query: parameters.query,
    sort: parameters.sort,
    direction: parameters.direction,
  })
  return getJson(`/api/reports/${reportId}?${searchParameters}`, options)
}
