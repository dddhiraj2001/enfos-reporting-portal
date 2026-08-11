import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('reports API client', () => {
  it('uses the configured production API base URL without a duplicate slash', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://reports-api.example.com/')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const { getReports } = await import('./reportsApi.js')

    await getReports()

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://reports-api.example.com/api/reports',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })
})
