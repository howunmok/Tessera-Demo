import { useCallback, useEffect, useState } from 'react'

export type AsyncState<T> =
  { status: 'loading' } | { status: 'error'; error: unknown } | { status: 'ready'; data: T }

/**
 * Runs `load` when `key` changes and tracks loading/error/data. `setData` updates the
 * loaded value locally (e.g. after a delete) without refetching.
 */
export function useAsync<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    load().then(
      (data) => {
        if (!cancelled) setState({ status: 'ready', data })
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', error })
      },
    )
    return () => {
      cancelled = true
    }
    // `load` is intentionally excluded: callers pass inline functions keyed by `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }, [])

  const setData = useCallback((update: (data: T) => T) => {
    setState((current) =>
      current.status === 'ready' ? { status: 'ready', data: update(current.data) } : current,
    )
  }, [])

  return { state, reload, setData }
}
