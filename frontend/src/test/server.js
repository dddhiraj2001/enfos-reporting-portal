import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { departments, projects, reports, users } from './fixtures.js'

export const apiUrl = (path) => `http://localhost:5173${path}`

/** Mirrors backend paging semantics so isolated UI tests exercise the real response shape. */
function pagedResponse(request, rows) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? 0)
  const size = Number(url.searchParams.get('size') ?? 5)
  const query = (url.searchParams.get('query') ?? '').toLowerCase()
  const sort = url.searchParams.get('sort')
  const direction = url.searchParams.get('direction') ?? 'asc'

  const matchingRows = rows.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(query)),
  )
  const sortedRows = [...matchingRows].sort((left, right) => {
    const comparison = String(left[sort]).localeCompare(String(right[sort]), 'en', {
      numeric: true,
      sensitivity: 'base',
    })
    return direction === 'desc' ? -comparison : comparison
  })
  const start = page * size

  return {
    items: sortedRows.slice(start, start + size),
    page,
    size,
    totalItems: sortedRows.length,
    totalPages: sortedRows.length === 0 ? 0 : Math.ceil(sortedRows.length / size),
  }
}

export const handlers = [
  http.get(apiUrl('/api/reports'), () => HttpResponse.json(reports)),
  http.get(apiUrl('/api/reports/users'), ({ request }) => (
    HttpResponse.json(pagedResponse(request, users))
  )),
  http.get(apiUrl('/api/reports/departments'), ({ request }) => (
    HttpResponse.json(pagedResponse(request, departments))
  )),
  http.get(apiUrl('/api/reports/projects'), ({ request }) => (
    HttpResponse.json(pagedResponse(request, projects))
  )),
]

export const server = setupServer(...handlers)
