import CONFIG from '../config'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'

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
export function AnalyticsCard({
  postCount = 0,
  gaSummary,
  dailySummary,
  realtime,
  metrics
}) {
  const { locale } = useGlobal()
  const siteCreateTime = siteConfig('HEO_SITE_CREATE_TIME', null, CONFIG)
  const targetDate = siteCreateTime ? new Date(siteCreateTime) : null
  const today = new Date()
  const diffDays = targetDate
    ? Math.max(
        1,
        Math.ceil((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
      )
    : '--'

  const postCountTitle =
    locale?.COMMON?.POST_COUNT || siteConfig('HEO_POST_COUNT_TITLE', null, CONFIG)
  const siteTimeTitle =
    locale?.COMMON?.SITE_TIME || siteConfig('HEO_SITE_TIME_TITLE', null, CONFIG)

  const performanceScore = (() => {
    const load = metrics?.pageLoadTime
    if (load === null || load === undefined) return null
    if (load <= 0) return 95
    if (load < 1000) return 95
    if (load < 2000) return 85
    if (load < 3000) return 75
    return 60
  })()

  const todaySessions = formatNumber(dailySummary?.sessions)
  const visits7d = formatNumber(gaSummary?.pageViews)
  const realtimeUsers = formatNumber(realtime?.activeUsers)

  return (
    <div className='text-md flex flex-col space-y-1 justify-center px-3'>
      <DataRow label={postCountTitle} value={formatNumber(postCount)} color='text-blue-600' />
      <DataRow label={siteTimeTitle} value={diffDays === '--' ? '--' : `${diffDays}天`} color='text-green-600' />
      <DataRow label='今日访问(会话)' value={todaySessions} color='text-orange-600' />
      <DataRow label='近7天浏览量' value={visits7d} color='text-purple-600' />
      <DataRow
        label='性能评分'
        value={
          performanceScore != null
            ? `${performanceScore}分`
            : metrics?.pageLoadTime !== undefined
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
        value={realtimeUsers}
        color='text-red-500 flex items-center'
        prefix={<span className='w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse' />}
      />
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
