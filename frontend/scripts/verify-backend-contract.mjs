import assert from 'node:assert/strict'
import { reportConfigs } from '../src/config/reportConfig.js'

const apiBaseUrl = (process.env.API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

async function getJson(path) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
  })

  assert.equal(
    response.status,
    200,
    `${path} returned HTTP ${response.status}; is the backend running?`,
  )

  return response.json()
}

const reports = await getJson('/api/reports')
const backendIds = reports.map(({ id }) => id).sort()
const configuredIds = Object.keys(reportConfigs).sort()

assert.deepEqual(
  backendIds,
  configuredIds,
  'Backend report IDs and frontend report configuration must stay synchronized.',
)

for (const reportId of configuredIds) {
  const firstColumn = reportConfigs[reportId].columns[0].key
  const reportPage = await getJson(
    `/api/reports/${reportId}?page=0&size=50&query=&sort=${firstColumn}&direction=asc`,
  )
  assert.ok(Array.isArray(reportPage.items), `${reportId}.items must be an array.`)
  assert.equal(reportPage.page, 0, `${reportId}.page must describe the requested page.`)
  assert.equal(
    reportPage.totalItems,
    reportPage.items.length,
    `${reportId}.totalItems must match the complete 50-row contract page.`,
  )
  assert.ok(
    reportPage.items.length > 0,
    `${reportId} must contain data for this contract check.`,
  )

  for (const { key } of reportConfigs[reportId].columns) {
    assert.ok(
      Object.hasOwn(reportPage.items[0], key),
      `${reportId} response is missing configured field "${key}".`,
    )
  }
}

console.log(`Live backend contract verified at ${apiBaseUrl}.`)
