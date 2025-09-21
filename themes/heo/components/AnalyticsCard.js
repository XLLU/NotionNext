import { useEffect, useState } from 'react'
import { useGlobal } from '@/lib/global'
import useAnalyticsSummary from '@/hooks/useAnalyticsSummary'

const formatNumber = value => {
  if (value === null || value === undefined) return '--'
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value.toLocaleString()
  }
  return value
}

/**
 * 网站统计卡片，展示 Post 数量、站龄、GA4 会话等指标
 */
export function AnalyticsCard({ analytics, metrics }) {
  const {
    locale
  } = useGlobal()

  const analyticsLocale = locale?.ANALYTICS_CARD ?? {}
  const t = {
    todaySessions: analyticsLocale.TODAY_SESSIONS ?? '今日访问(会话)',
    weeklyViews: analyticsLocale.WEEKLY_VIEWS ?? '近7天浏览量',
    performanceScore: analyticsLocale.PERFORMANCE_SCORE ?? '性能评分',
    scoreSuffix: analyticsLocale.SCORE_SUFFIX ?? '分',
    scoreCalculating: analyticsLocale.SCORE_CALCULATING ?? '计算中...',
    onlineUsers: analyticsLocale.ONLINE_USERS ?? '在线用户',
    syncing: analyticsLocale.SYNCING ?? '同步中...',
    fetchError: analyticsLocale.ERROR ?? '统计数据获取失败'
  }

  const [localMetrics, setLocalMetrics] = useState(null)
  const analyticsHook = useAnalyticsSummary({ auto: !analytics })

  const summary = analytics?.summary ?? analyticsHook.summary
  const dailySummary = analytics?.dailySummary ?? analyticsHook.dailySummary
  const realtime = analytics?.realtime ?? analyticsHook.realtime
  const loading = analytics ? false : analyticsHook.loading
  const error = analytics ? null : analyticsHook.error
  const hasConfig = analytics?.hasConfig ?? analyticsHook.hasConfig

  useEffect(() => {
    if (metrics || typeof window === 'undefined') return
    const navigation = performance.getEntriesByType('navigation')[0]
    const resources = performance.getEntriesByType('resource') || []
    setLocalMetrics({
      pageLoadTime: navigation
        ? Math.max(Math.round(navigation.loadEventEnd - navigation.fetchStart), 0)
        : null,
      resourceCount: resources.length
    })
  }, [metrics])

  const effectiveMetrics = metrics || localMetrics || {}

  const toDate = value => {
    if (!value) return null
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date?.getTime()) ? null : date
  }

  const performanceScore = (() => {
    const load = effectiveMetrics?.pageLoadTime
    if (load === null || load === undefined) return null
    if (load <= 0) return 95
    if (load < 1000) return 95
    if (load < 2000) return 85
    if (load < 3000) return 75
    return 60
  })()

  const todaySessions = formatNumber(dailySummary?.sessions)
  const visits7d = formatNumber(summary?.pageViews)
  const realtimeUsers = formatNumber(realtime?.activeUsers)

  const gaUnavailable = !hasConfig || !!error

  return (
    <div className='text-md flex flex-col space-y-1 justify-center px-3'>
      <DataRow label={t.todaySessions} value={gaUnavailable && !loading ? '--' : todaySessions} color='text-orange-600' />
      <DataRow label={t.weeklyViews} value={gaUnavailable && !loading ? '--' : visits7d} color='text-purple-600' />
      <DataRow
        label={t.performanceScore}
        value={
          performanceScore != null
            ? `${performanceScore}${t.scoreSuffix}`
            : effectiveMetrics?.pageLoadTime !== undefined
              ? t.scoreCalculating
              : '--'
        }
        color={
          performanceScore == null
            ? 'text-gray-500'
            : performanceScore >= 90
              ? 'text-green-600'
              : performanceScore >= 75
                ? 'text-yellow-600'
                : 'text-red-600'
        }
      />
      <DataRow
        label={t.onlineUsers}
        value={gaUnavailable && !loading ? '--' : realtimeUsers}
        color='text-red-500 flex items-center'
        prefix={
          gaUnavailable && !loading
            ? null
            : <span className='w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse' />
        }
      />
      {loading && (
        <div className='text-xs text-gray-500 mt-1'>{t.syncing}</div>
      )}
      {error && (
        <div className='text-xs text-red-500 mt-1'>{t.fetchError}</div>
      )}
    </div>
  )
}

const DataRow = ({ label, value, color, prefix = null }) => (
  <div className='inline'>
    <div className='flex justify-between items-center'>
      <div>{label}</div>
      <div className={`font-medium ${color}`}>
        {prefix}
        {value ?? '--'}
      </div>
    </div>
  </div>
)
