import { useEffect, useMemo, useState } from 'react'
import CONFIG from '../config'
import { siteConfig } from '@/lib/config'
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
export function AnalyticsCard({ postCount, analytics, metrics, showSiteMeta = true }) {
  const {
    locale,
    postCount: globalPostCount = 0,
    siteStats,
    allNavPages = []
  } = useGlobal()

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

  const posts = useMemo(() => {
    return allNavPages.filter(
      post => post?.type === 'Post' && post?.status === 'Published'
    )
  }, [allNavPages])

  const toDate = value => {
    if (!value) return null
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date?.getTime()) ? null : date
  }

  const computedFirstPostDate = useMemo(() => {
    const explicit = toDate(siteStats?.firstPostDate)
    if (explicit) return explicit
    const publishTimes = posts
      .map(post => {
        const candidate = toDate(post?.publishDate || post?.date)
        return candidate ? candidate.getTime() : null
      })
      .filter(Boolean)
    if (publishTimes.length === 0) return null
    return new Date(Math.min(...publishTimes))
  }, [posts, siteStats?.firstPostDate])

  const fallbackCreateTime = siteConfig('HEO_SITE_CREATE_TIME', null, CONFIG)
  const createDate = computedFirstPostDate || toDate(fallbackCreateTime)
  const today = new Date()
  const diffDays = createDate
    ? Math.max(1, Math.ceil((today.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24)))
    : '--'

  const effectivePostCount = useMemo(() => {
    if (postCount !== undefined && postCount !== null) return postCount
    if (siteStats?.postCount !== undefined && siteStats?.postCount !== null) {
      return siteStats.postCount
    }
    if (posts.length) return posts.length
    return globalPostCount
  }, [postCount, siteStats?.postCount, posts, globalPostCount])

  const performanceScore = (() => {
    const load = effectiveMetrics?.pageLoadTime
    if (load === null || load === undefined) return null
    if (load <= 0) return 95
    if (load < 1000) return 95
    if (load < 2000) return 85
    if (load < 3000) return 75
    return 60
  })()

  const postCountTitle =
    locale?.COMMON?.POST_COUNT || siteConfig('HEO_POST_COUNT_TITLE', null, CONFIG)
  const siteTimeTitle =
    locale?.COMMON?.SITE_TIME || siteConfig('HEO_SITE_TIME_TITLE', null, CONFIG)

  const todaySessions = formatNumber(dailySummary?.sessions)
  const visits7d = formatNumber(summary?.pageViews)
  const realtimeUsers = formatNumber(realtime?.activeUsers)

  const gaUnavailable = !hasConfig || !!error

  return (
    <div className='text-md flex flex-col space-y-1 justify-center px-3'>
      {showSiteMeta && (
        <>
          <DataRow label={postCountTitle} value={formatNumber(effectivePostCount)} color='text-blue-600' />
          <DataRow label={siteTimeTitle} value={diffDays === '--' ? '--' : `${diffDays}天`} color='text-green-600' />
        </>
      )}
      <DataRow label='今日访问(会话)' value={gaUnavailable && !loading ? '--' : todaySessions} color='text-orange-600' />
      <DataRow label='近7天浏览量' value={gaUnavailable && !loading ? '--' : visits7d} color='text-purple-600' />
      <DataRow
        label='性能评分'
        value={
          performanceScore != null
            ? `${performanceScore}分`
            : effectiveMetrics?.pageLoadTime !== undefined
              ? '计算中...'
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
        label='在线用户'
        value={gaUnavailable && !loading ? '--' : realtimeUsers}
        color='text-red-500 flex items-center'
        prefix={
          gaUnavailable && !loading
            ? null
            : <span className='w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse' />
        }
      />
      {loading && (
        <div className='text-xs text-gray-500 mt-1'>同步中...</div>
      )}
      {error && (
        <div className='text-xs text-red-500 mt-1'>统计数据获取失败</div>
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
