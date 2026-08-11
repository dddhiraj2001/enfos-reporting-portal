import { useCallback, useEffect, useState } from 'react'

/**
 * Runs an abortable async loader and exposes the UI states shared by data-driven pages.
 * Retrying increments an internal version so callers can keep a stable loader function.
 */
export default function useAsyncData(loadData, { enabled = true } = {}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('loading')
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setData(null)
      setError(null)
      setStatus('idle')
      return undefined
    }

    // Abort stale work when URL state changes or the consuming page unmounts.
    const controller = new AbortController()

    async function run() {
      setStatus('loading')
      setError(null)

      try {
        const result = await loadData({ signal: controller.signal })
        setData(result)
        setStatus('success')
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError)
          setStatus('error')
        }
      }
    }

    run()

    return () => controller.abort()
  }, [enabled, loadData, requestVersion])

  return { data, error, status, retry }
}
