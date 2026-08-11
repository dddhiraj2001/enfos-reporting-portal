import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { reports, users } from './test/fixtures.js'
import { apiUrl, server } from './test/server.js'

function renderAt(path = '/') {
  window.history.pushState({}, '', path)
  return render(<App />)
}

const accessibilityOptions = {
  rules: {
    // jsdom does not calculate the rendered colors needed by this rule.
    'color-contrast': { enabled: false },
  },
}

describe('reporting portal', () => {
  it('loads report metadata and filters reports by name', async () => {
    const user = userEvent.setup()
    renderAt()

    expect(screen.getByText('Loading reports…')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /^Users/ })).toBeVisible()
    expect(screen.getByRole('link', { name: /^Departments/ })).toBeVisible()
    expect(screen.getByRole('link', { name: /^Projects/ })).toBeVisible()

    await user.type(screen.getByRole('searchbox', { name: 'Search reports' }), 'users')
    expect(screen.getByRole('link', { name: /^Users/ })).toBeVisible()
    expect(screen.queryByRole('link', { name: /^Departments/ })).not.toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: 'Search reports' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search reports' }), 'missing')
    expect(screen.getByRole('heading', { name: 'No matching reports' })).toBeVisible()
  })

  it('renders an empty state when no reports are published', async () => {
    server.use(
      http.get(apiUrl('/api/reports'), () => HttpResponse.json([])),
    )

    renderAt()

    expect(await screen.findByRole('heading', { name: 'No reports are available' })).toBeVisible()
  })

  it('shows an error and retries a failed metadata request', async () => {
    const user = userEvent.setup()
    let requestCount = 0
    server.use(
      http.get(apiUrl('/api/reports'), () => {
        requestCount += 1
        return requestCount === 1
          ? new HttpResponse(null, { status: 503 })
          : HttpResponse.json(reports)
      }),
    )

    renderAt()

    expect(await screen.findByRole('alert')).toHaveTextContent('Reports could not be loaded')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('link', { name: /^Users/ })).toBeVisible()
    expect(requestCount).toBe(2)
  })

  it.each([
    {
      path: '/reports/users',
      tableName: 'Users report',
      headers: ['User ID', 'Name', 'Email', 'Role', 'Status', 'Created date'],
      rowCount: 2,
    },
    {
      path: '/reports/departments',
      tableName: 'Departments report',
      headers: ['Department ID', 'Department name', 'Manager', 'Employee count', 'Location'],
      rowCount: 2,
    },
    {
      path: '/reports/projects',
      tableName: 'Projects report',
      headers: ['Project ID', 'Project name', 'Department', 'Owner', 'Status', 'Start date', 'End date'],
      rowCount: 2,
    },
  ])('renders the required columns for $tableName', async ({ path, tableName, headers, rowCount }) => {
    renderAt(path)

    const table = await screen.findByRole('table', { name: tableName })
    headers.forEach((header) => {
      expect(within(table).getByRole('columnheader', { name: new RegExp(header) })).toBeVisible()
    })
    expect(within(table).getAllByRole('row')).toHaveLength(rowCount + 1)
  })

  it('filters Users rows and sorts them by name', async () => {
    const user = userEvent.setup()
    renderAt('/reports/users')

    await screen.findByRole('table', { name: 'Users report' })
    const search = screen.getByRole('searchbox', { name: 'Search users' })
    await user.type(search, 'Daniel')

    let table
    await waitFor(() => {
      table = screen.getByRole('table', { name: 'Users report' })
      expect(within(table).getAllByRole('row')).toHaveLength(2)
    })
    expect(within(table).getByText('Daniel Kim')).toBeVisible()

    await user.clear(search)
    await screen.findByText('Ava Patel')
    table = await screen.findByRole('table', { name: 'Users report' })
    const nameSort = within(table).getByRole('button', { name: /^Name/ })
    await user.click(nameSort)
    await waitFor(() => {
      table = screen.getByRole('table', { name: 'Users report' })
      expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Ava Patel')
    })
    await user.click(within(table).getByRole('button', { name: /^Name/ }))
    await waitFor(() => {
      table = screen.getByRole('table', { name: 'Users report' })
      expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Daniel Kim')
    })
  })

  it('navigates through server-provided report pages', async () => {
    const user = userEvent.setup()
    const pagedUsers = [
      ...users,
      ...Array.from({ length: 4 }, (_, index) => ({
        ...users[0],
        userId: `USR-200${index}`,
        name: `Test User ${index}`,
        email: `test${index}@enfos.example`,
      })),
    ]
    server.use(
      http.get(apiUrl('/api/reports/users'), ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'))
        const start = page * 5
        return HttpResponse.json({
          items: pagedUsers.slice(start, start + 5),
          page,
          size: 5,
          totalItems: pagedUsers.length,
          totalPages: 2,
        })
      }),
    )

    renderAt('/reports/users')

    expect(await screen.findByText('Page 1 of 2')).toBeVisible()
    expect(screen.getByRole('button', { name: '← Previous' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next →' }))
    expect(await screen.findByText('Page 2 of 2')).toBeVisible()
    expect(screen.getByText('Showing 6–6 of 6')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next →' })).toBeDisabled()

    window.history.back()
    expect(await screen.findByText('Page 1 of 2')).toBeVisible()
    window.history.forward()
    expect(await screen.findByText('Page 2 of 2')).toBeVisible()
  })

  it('restores URL table state and resets search and sort to page 1', async () => {
    const user = userEvent.setup()
    const requestedUrls = []
    const pagedUsers = [
      ...users,
      ...Array.from({ length: 4 }, (_, index) => ({
        ...users[0],
        userId: `USR-200${index}`,
        name: `Test User ${index}`,
        email: `test${index}@enfos.example`,
      })),
    ]
    server.use(
      http.get(apiUrl('/api/reports/users'), ({ request }) => {
        const url = new URL(request.url)
        requestedUrls.push(url)
        const page = Number(url.searchParams.get('page'))
        const query = url.searchParams.get('query').toLowerCase()
        const sort = url.searchParams.get('sort')
        const direction = url.searchParams.get('direction')
        const matchingUsers = pagedUsers
          .filter((record) => Object.values(record).some((value) => (
            String(value).toLowerCase().includes(query)
          )))
          .sort((left, right) => {
            const comparison = String(left[sort]).localeCompare(String(right[sort]))
            return direction === 'desc' ? -comparison : comparison
          })
        const start = page * 5

        return HttpResponse.json({
          items: matchingUsers.slice(start, start + 5),
          page,
          size: 5,
          totalItems: matchingUsers.length,
          totalPages: Math.ceil(matchingUsers.length / 5),
        })
      }),
    )

    renderAt('/reports/users?page=2&sort=userId&direction=asc')

    expect(await screen.findByText('Page 2 of 2')).toBeVisible()
    expect(requestedUrls.at(-1).searchParams.get('page')).toBe('1')

    await user.type(screen.getByRole('searchbox', { name: 'Search users' }), 'Daniel')
    expect(await screen.findByText('Daniel Kim')).toBeVisible()
    expect(new URLSearchParams(window.location.search).get('page')).toBe('1')
    expect(new URLSearchParams(window.location.search).get('query')).toBe('Daniel')
    expect(requestedUrls.at(-1).searchParams.get('page')).toBe('0')

    await user.clear(screen.getByRole('searchbox', { name: 'Search users' }))
    await screen.findByText('Ava Patel')
    await user.click(screen.getByRole('button', { name: 'Next →' }))
    expect(await screen.findByText('Page 2 of 2')).toBeVisible()

    const table = screen.getByRole('table', { name: 'Users report' })
    await user.click(within(table).getByRole('button', { name: /^Name/ }))
    expect(await screen.findByText('Page 1 of 2')).toBeVisible()
    const finalParameters = new URLSearchParams(window.location.search)
    expect(finalParameters.get('page')).toBe('1')
    expect(finalParameters.get('sort')).toBe('name')
    expect(requestedUrls.at(-1).searchParams.get('page')).toBe('0')
  })

  it('shows a recoverable error when report rows fail to load', async () => {
    const user = userEvent.setup()
    let requestCount = 0
    server.use(
      http.get(apiUrl('/api/reports/users'), () => {
        requestCount += 1
        return requestCount === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json({
            items: [], page: 0, size: 5, totalItems: 0, totalPages: 0,
          })
      }),
    )

    renderAt('/reports/users')

    expect(await screen.findByRole('alert')).toHaveTextContent('Users could not be loaded')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'No users to display' })).toBeVisible()
  })

  it('renders a useful page for an unknown route', () => {
    renderAt('/does-not-exist')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Return to reports' })).toHaveAttribute('href', '/')
  })

  it('does not request data for an unconfigured report route', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    renderAt('/reports/unknown')

    expect(screen.getByRole('heading', { name: 'Report not available' })).toBeVisible()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it.each(['/', '/reports/projects'])(
    'has no detectable structural accessibility violations at %s',
    async (path) => {
      renderAt(path)
      await screen.findByRole('main')

      if (path === '/') {
        await screen.findByRole('link', { name: /^Users/ })
      } else {
        await screen.findByRole('table', { name: 'Projects report' })
      }

      const results = await axe.run(document.body, accessibilityOptions)
      expect(results.violations.map((violation) => violation.id)).toEqual([])
    },
  )
})
