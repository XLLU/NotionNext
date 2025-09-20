import { useGlobal } from '@/lib/global'
import { siteConfig } from '@/lib/config'
import { useState, useEffect } from 'react'
import { AnalyticsCard } from '@/themes/heo/components/AnalyticsCard'
import { useClerkAuth } from '@/hooks/useClerkAuth'
import Head from 'next/head'
import Link from 'next/link'

/**
 * 网站监控仪表盘
 * 聚合展示各项监控数据
 */
export default function AnalyticsDashboard(props) {
  const { locale, allNavPages = [] } = useGlobal()
  const { isLoaded, hasPermission, openSignIn } = useClerkAuth()
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    resourceCount: 0,
    memoryUsage: 0,
    connectionType: '',
    deviceType: '',
    browserInfo: ''
  })

  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 1,
    pageViews: 0,
    sessions: 0,
    bounceRate: 0
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 获取性能指标
      const navigation = performance.getEntriesByType('navigation')[0]
      const resources = performance.getEntriesByType('resource')

      setMetrics({
        pageLoadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
        resourceCount: resources.length,
        memoryUsage: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : '未知',
        connectionType: navigator.connection ? navigator.connection.effectiveType : '未知',
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? '移动设备' : '桌面设备',
        browserInfo: navigator.userAgent.split(' ').slice(-2).join(' ')
      })

      // 模拟实时数据更新
      const interval = setInterval(() => {
        setRealtimeData(prev => ({
          activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
          pageViews: prev.pageViews + Math.floor(Math.random() * 2),
          sessions: prev.sessions + (Math.random() > 0.8 ? 1 : 0),
          bounceRate: Math.min(100, Math.max(0, prev.bounceRate + (Math.random() - 0.5) * 5))
        }))
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [])

  const postCount = allNavPages?.filter(page => page.type === 'Post')?.length || 0

  // 权限检查
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
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                访问受限
              </h1>
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
        <meta name="description" content="网站监控仪表盘，实时监控网站性能、流量和用户行为数据" />
      </Head>
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            📊 网站监控仪表盘
          </h1>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            实时监控网站性能、流量和用户行为数据
          </p>
        </div>

        {/* 快速概览卡片 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>👥</span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400 truncate'>
                    活跃用户
                  </dt>
                  <dd className='text-lg font-medium text-gray-900 dark:text-white'>
                    {realtimeData.activeUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-green-500 rounded-md flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>📈</span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400 truncate'>
                    页面加载时间
                  </dt>
                  <dd className='text-lg font-medium text-gray-900 dark:text-white'>
                    {metrics.pageLoadTime}ms
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>📄</span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400 truncate'>
                    资源数量
                  </dt>
                  <dd className='text-lg font-medium text-gray-900 dark:text-white'>
                    {metrics.resourceCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>🔧</span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400 truncate'>
                    设备类型
                  </dt>
                  <dd className='text-lg font-medium text-gray-900 dark:text-white'>
                    {metrics.deviceType}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 主要监控区域 */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          {/* 统计概览 */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                统计概览
              </h3>
            </div>
            <div className='p-6'>
              <AnalyticsCard postCount={postCount} />
            </div>
          </div>

          {/* 性能监控 */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                性能监控
              </h3>
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

          {/* 实时数据 */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                实时数据
                <span className='ml-2 w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse'></span>
              </h3>
            </div>
            <div className='p-6 space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>活跃用户</span>
                <span className='text-sm font-medium text-green-600'>{realtimeData.activeUsers}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>页面浏览</span>
                <span className='text-sm font-medium text-blue-600'>{realtimeData.pageViews}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>会话数</span>
                <span className='text-sm font-medium text-orange-600'>{realtimeData.sessions}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>跳出率</span>
                <span className='text-sm font-medium text-red-600'>{realtimeData.bounceRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 监控工具状态 */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
          <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
              监控工具状态
            </h3>
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

        {/* 快速操作 */}
        <div className='mt-8 text-center'>
          <div className='space-x-4'>
            <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors'>
              刷新数据
            </button>
            <button className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors'>
              导出报告
            </button>
            <Link
              href='/admin/seo-check'
              className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors inline-block'
            >
              SEO检查
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export function getStaticProps() {
  const props = {}
  return {
    props,
    revalidate: 300 // 5分钟重新生成
  }
}
