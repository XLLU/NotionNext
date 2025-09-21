import { useGlobal } from '@/lib/global'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnalyticsCard } from '@/themes/heo/components/AnalyticsCard'
import { useClerkAuth } from '@/hooks/useClerkAuth'
import Head from 'next/head'
import Link from 'next/link'

const GA_SOURCE_DESC = '数据来源：Google Analytics 4（最近 7 天）'

export default function AnalyticsDashboard() {
  const { postCount: totalPostCount = 0 } = useGlobal()
  const { isLoaded, hasPermission, openSignIn } = useClerkAuth()

  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    resourceCount: 0,
    memoryUsage: 0,
    connectionType: '',
    deviceType: '',
    browserInfo: ''
  })
  const [gaSummary, setGaSummary] = useState(null)
  const [realtimeData, setRealtimeData] = useState(null)
  const [topPages, setTopPages] = useState([])
  const [dailySummary, setDailySummary] = useState(null)
  const [loadingData, setLoadingData] = useState(false)
  const [analyticsError, setAnalyticsError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0]
    const resources = performance.getEntriesByType('resource')

    setMetrics({
      pageLoadTime: navigation ? Math.max(Math.round(navigation.loadEventEnd - navigation.fetchStart), 0) : 0,
      resourceCount: resources.length,
      memoryUsage: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : '未知',
      connectionType: navigator.connection ? navigator.connection.effectiveType : '未知',
      deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? '移动设备' : '桌面设备',
      browserInfo: navigator.userAgent.split(' ').slice(-2).join(' ')
    })
  }, [])

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingData(true)
      setAnalyticsError(null)

      const res = await fetch('/api/analytics/summary?range=7d')
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || '获取 GA 数据失败')
      }

      if (!result.hasConfig) {
        setAnalyticsError('未检测到 GA4 配置，请先在环境变量中补齐凭据')
        setGaSummary(null)
        setRealtimeData(null)
        setTopPages([])
        return
      }

      setGaSummary(result.summary)
      setRealtimeData(result.realtime)
      setDailySummary(result.dailySummary)
      setTopPages(result.topPages || [])
    } catch (error) {
      console.error('[admin/analytics] fetch error', error)
      setAnalyticsError(error.message || '无法获取 GA 数据')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !hasPermission('analytics')) return
    fetchAnalytics()
  }, [fetchAnalytics, hasPermission, isLoaded])

  const summaryCards = useMemo(() => ([
    {
      label: '活跃用户',
      icon: '👥',
      value: realtimeData?.activeUsers ?? '--',
      color: 'bg-blue-500'
    },
    {
      label: '页面浏览量（近 7 天）',
      icon: '📈',
      value: gaSummary?.pageViews ?? '--',
      color: 'bg-green-500'
    },
    {
      label: '会话数（近 7 天）',
      icon: '📄',
      value: gaSummary?.sessions ?? '--',
      color: 'bg-yellow-500'
    },
    {
      label: '平均会话时长',
      icon: '⏱️',
      value: gaSummary?.averageSessionDuration
        ? `${Math.round(gaSummary.averageSessionDuration)}s`
        : '--',
      color: 'bg-purple-500'
    }
  ]), [gaSummary, realtimeData])

  if (!isLoaded) {
    return (
      <>
        <Head>
          <title>加载中... - FreemiumNext</title>
        </Head>
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-400'>正在验证权限...</p>
          </div>
        </div>
      </>
    )
  }

  if (!hasPermission('analytics')) {
    return (
      <>
        <Head>
          <title>访问受限 - FreemiumNext</title>
        </Head>
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
          <div className='text-center max-w-md mx-auto px-4'>
            <div className='mb-8'>
              <div className='w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-red-600 text-2xl'>🔒</span>
              </div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>访问受限</h1>
              <p className='text-gray-600 dark:text-gray-400 mb-6'>
                您需要管理员权限才能访问监控仪表盘。请联系系统管理员或使用管理员账号登录。
              </p>
              <div className='space-y-3'>
                <button
                  onClick={() => openSignIn('/admin/analytics')}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors'
                >
                  使用管理员账号登录
                </button>
                <Link
                  href='/'
                  className='block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors'
                >
                  返回首页
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>监控仪表盘 - FreemiumNext</title>
        <meta name='description' content='网站监控仪表盘，实时监控网站性能、流量和用户行为数据' />
      </Head>
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>📊 网站监控仪表盘</h1>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>实时监控网站性能、流量和用户行为数据</p>
          </div>

          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4'>
            <div className='text-sm text-gray-500 dark:text-gray-400'>{GA_SOURCE_DESC}</div>
            <div className='flex items-center gap-3'>
              {loadingData && (
                <span className='text-xs text-blue-600 dark:text-blue-400'>正在同步最新数据...</span>
              )}
              <button
                onClick={() => { void fetchAnalytics() }}
                className='inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors disabled:opacity-60'
                disabled={loadingData}
              >
                刷新数据
              </button>
            </div>
          </div>

          {analyticsError && (
            <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200'>
              {analyticsError}
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {summaryCards.map(card => (
              <div key={card.label} className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                <div className='flex items-center'>
                  <div className={`w-8 h-8 ${card.color} rounded-md flex items-center justify-center`}>
                    <span className='text-white text-sm font-bold'>{card.icon}</span>
                  </div>
                  <div className='ml-5 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 dark:text-gray-400 truncate'>
                        {card.label}
                      </dt>
                      <dd className='text-lg font-medium text-gray-900 dark:text-white'>
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>统计概览</h3>
              </div>
              <div className='p-6'>
                <AnalyticsCard
                  postCount={totalPostCount}
                  gaSummary={gaSummary}
                  dailySummary={dailySummary}
                  realtime={realtimeData}
                  metrics={metrics}
                />
              </div>
            </div>

            <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>性能监控</h3>
              </div>
              <div className='p-6 space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>页面加载</span>
                  <span className={`text-sm font-medium ${metrics.pageLoadTime < 1000 ? 'text-green-600' : metrics.pageLoadTime < 3000 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {metrics.pageLoadTime}ms
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>内存占用</span>
                  <span className='text-sm font-medium text-blue-600'>{metrics.memoryUsage}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>网络类型</span>
                  <span className='text-sm font-medium text-purple-600'>{metrics.connectionType}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>浏览器</span>
                  <span className='text-sm font-medium text-gray-600 dark:text-gray-400 truncate max-w-32'>
                    {metrics.browserInfo}
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>实时数据
                  <span className='ml-2 w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse'></span>
                </h3>
              </div>
              <div className='p-6 space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>活跃用户</span>
                  <span className='text-sm font-medium text-green-600'>{realtimeData?.activeUsers ?? '--'}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>实时页面浏览</span>
                  <span className='text-sm font-medium text-blue-600'>{realtimeData?.pageViews ?? '--'}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>本地资源数量</span>
                  <span className='text-sm font-medium text-orange-600'>{metrics.resourceCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow mb-8'>
            <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>热门页面 Top 10</h3>
              <span className='text-xs text-gray-500 dark:text-gray-400'>按近 7 天页面浏览量排序</span>
            </div>
            <div className='p-6 overflow-x-auto'>
              {topPages.length === 0 ? (
                <div className='text-sm text-gray-500 dark:text-gray-400'>暂无数据</div>
              ) : (
                <table className='min-w-full text-sm'>
                  <thead>
                    <tr className='text-left text-gray-500 dark:text-gray-400'>
                      <th className='pb-2'>页面路径</th>
                      <th className='pb-2 text-right'>浏览量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map(item => (
                      <tr key={item.path} className='border-t border-gray-100 dark:border-gray-700/50'>
                        <td className='py-2 pr-4 text-gray-800 dark:text-gray-100 truncate max-w-xs'>
                          {item.path}
                        </td>
                        <td className='py-2 text-right text-gray-900 dark:text-white font-medium'>
                          {item.pageViews}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>监控工具状态</h3>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>Google Analytics</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>UMAMI (待配置)</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>不蒜子统计</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>性能监控</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
