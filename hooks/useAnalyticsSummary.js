import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Client-side helper to retrieve GA4 analytics summary from /api/analytics/summary.
 * Optionally accepts initial data to skip the first fetch.
 */
export function useAnalyticsSummary({ range = '7d', auto = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(auto && !initialData)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/analytics/summary?range=${encodeURIComponent(range)}`)
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || '获取 GA 数据失败')
      }
      setData(json)
      return json
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    if (auto && !initialData) {
      void fetchData()
    }
  }, [auto, initialData, fetchData])

  const analytics = useMemo(() => ({
    hasConfig: data?.hasConfig ?? true,
    summary: data?.summary ?? null,
    realtime: data?.realtime ?? null,
    topPages: data?.topPages ?? [],
    dailySummary: data?.dailySummary ?? null
  }), [data])

  return {
    data,
    ...analytics,
    loading,
    error,
    refresh: fetchData
  }
}

export default useAnalyticsSummary
