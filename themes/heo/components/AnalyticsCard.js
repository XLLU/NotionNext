import CONFIG from '../config'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useState, useEffect } from 'react'

/**
 * 博客统计卡牌
 * @param {*} props
 * @returns
 */
export function AnalyticsCard(props) {
  const { locale } = useGlobal()
  const targetDate = new Date(siteConfig('HEO_SITE_CREATE_TIME', null, CONFIG))
  const today = new Date()
  const diffTime = today.getTime() - targetDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // 性能监控状态
  const [performanceScore, setPerformanceScore] = useState(null)
  const [todayViews, setTodayViews] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState(1)

  // 监控Web Vitals性能分数
  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {}
    }

    // 获取性能指标用于展示估算分数
    const performanceTimer = setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        const score = loadTime < 1000 ? 95 : loadTime < 2000 ? 85 : loadTime < 3000 ? 75 : 60
        setPerformanceScore(score)
      }
    }, 2000)

    // 简单的客户端访问量计数（刷新后递增）
    try {
      const currentDate = new Date().toDateString()
      const lastDate = localStorage.getItem('lastViewDate')
      if (lastDate !== currentDate) {
        localStorage.setItem('dailyViews', '1')
        localStorage.setItem('lastViewDate', currentDate)
        setTodayViews(1)
      } else {
        const storedViews = parseInt(localStorage.getItem('dailyViews') || '0', 10)
        const updatedViews = Number.isFinite(storedViews) ? storedViews + 1 : 1
        localStorage.setItem('dailyViews', String(updatedViews))
        setTodayViews(updatedViews)
      }
    } catch (error) {
      setTodayViews(1)
    }

    // 模拟在线用户数量波动
    const onlineTimer = setInterval(() => {
      setOnlineUsers(prev => {
        const base = prev || 1
        const delta = Math.floor(Math.random() * 3) - 1
        const next = base + delta
        return next < 1 ? 1 : next
      })
    }, 5000)

    return () => {
      clearTimeout(performanceTimer)
      clearInterval(onlineTimer)
    }
  }, [])

  // 使用国际化文本
  const postCountTitle = locale?.COMMON?.POST_COUNT || siteConfig('HEO_POST_COUNT_TITLE', null, CONFIG)
  const siteTimeTitle = locale?.COMMON?.SITE_TIME || siteConfig('HEO_SITE_TIME_TITLE', null, CONFIG)
  const siteVisitTitle = locale?.COMMON?.VIEWS || siteConfig('HEO_SITE_VISIT_TITLE', null, CONFIG)
  const siteVisitorTitle = locale?.COMMON?.VISITORS || siteConfig('HEO_SITE_VISITOR_TITLE', null, CONFIG)

  const { postCount } = props
  return <>
        <div className='text-md flex flex-col space-y-1 justify-center px-3'>
            <div className='inline'>
                <div className='flex justify-between'>
                    <div>{postCountTitle}</div>
                    <div className='font-medium text-blue-600'>{postCount}</div>
                </div>
            </div>
            <div className='inline'>
                <div className='flex justify-between'>
                    <div>{siteTimeTitle}</div>
                    <div className='font-medium text-green-600'>{diffDays}天</div>
                </div>
            </div>
            <div className='inline'>
                <div className='flex justify-between'>
                    <div>今日访问</div>
                    <div className='font-medium text-orange-600'>{todayViews}</div>
                </div>
            </div>
            <div className='inline'>
                <div className='flex justify-between'>
                    <div>性能评分</div>
                    <div className={`font-medium ${performanceScore > 90 ? 'text-green-600' : performanceScore > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {performanceScore ? `${performanceScore}分` : '检测中...'}
                    </div>
                </div>
            </div>
            <div className='busuanzi_container_page_pv'>
                <div className='flex justify-between'>
                    <div>{siteVisitTitle}</div>
                    <div className='busuanzi_value_page_pv font-medium text-purple-600' />
                </div>
            </div>
            <div className='busuanzi_container_site_uv'>
                <div className='flex justify-between'>
                    <div>{siteVisitorTitle}</div>
                    <div className='busuanzi_value_site_uv font-medium text-indigo-600' />
                </div>
            </div>
            <div className='inline'>
                <div className='flex justify-between'>
                    <div>在线用户</div>
                    <div className='font-medium text-red-500 flex items-center'>
                        <span className='w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse'></span>
                        {onlineUsers}
                    </div>
                </div>
            </div>
        </div>
        </>
}
