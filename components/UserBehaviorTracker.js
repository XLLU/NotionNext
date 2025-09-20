import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { siteConfig } from '@/lib/config'

/**
 * 用户行为追踪组件
 * 追踪页面停留时间、滚动深度、点击行为等
 */
const UserBehaviorTracker = () => {
  const router = useRouter()
  const [sessionData, setSessionData] = useState({})
  const startTimeRef = useRef(Date.now())
  const maxScrollRef = useRef(0)
  const clickCountRef = useRef(0)

  const enableTracking = siteConfig('ENABLE_USER_BEHAVIOR_TRACKING', true)
  const respectDnt = siteConfig('RESPECT_DNT', true)
  const inactivityTimeout = siteConfig('INACTIVITY_TIMEOUT', 60000)
  const rawScrollMilestones = siteConfig('SCROLL_TRACKING_MILESTONES', [25, 50, 75, 100])
  const rawClickSelectors = siteConfig('CLICK_TRACKING_ELEMENTS', ['a', 'button', 'input[type="submit"]', '.trackable'])
  const storagePrefix = siteConfig('LOCAL_STORAGE_PREFIX', 'freemium_analytics_')
  const dataRetentionDays = siteConfig('MONITORING_DATA_RETENTION_DAYS', 30)

  const scrollMilestones = useMemo(() => {
    if (Array.isArray(rawScrollMilestones)) {
      return rawScrollMilestones
        .map(item => Number(item))
        .filter(item => !Number.isNaN(item) && item >= 0)
        .sort((a, b) => a - b)
    }
    if (typeof rawScrollMilestones === 'string') {
      return rawScrollMilestones
        .split(',')
        .map(item => Number(item.trim()))
        .filter(item => !Number.isNaN(item) && item >= 0)
        .sort((a, b) => a - b)
    }
    return [25, 50, 75, 100]
  }, [rawScrollMilestones])

  const clickSelectors = useMemo(() => {
    if (Array.isArray(rawClickSelectors)) {
      return rawClickSelectors.map(selector => selector?.toString()?.trim()).filter(Boolean)
    }
    if (typeof rawClickSelectors === 'string') {
      return rawClickSelectors
        .split(',')
        .map(selector => selector.trim())
        .filter(Boolean)
    }
    return ['a', 'button', 'input[type="submit"]', '.trackable']
  }, [rawClickSelectors])

  const storageKey = useMemo(() => {
    const prefix = typeof storagePrefix === 'string' && storagePrefix.trim() !== ''
      ? storagePrefix.trim()
      : 'freemium_analytics_'
    return `${prefix}userBehavior`
  }, [storagePrefix])

  useEffect(() => {
    if (!enableTracking || typeof window === 'undefined') return

    if (respectDnt && window.navigator?.doNotTrack === '1') {
      return
    }

    const sessionId = generateSessionId(storageKey)
    const pageStartTime = Date.now()
    startTimeRef.current = pageStartTime

    // 存储会话数据
    const storeSessionData = (data) => {
      let sessionDataMap = {}
      try {
        sessionDataMap = JSON.parse(localStorage.getItem(storageKey) || '{}')
      } catch (error) {
        sessionDataMap = {}
      }

      const pageUrl = window.location.pathname

      if (!sessionDataMap[sessionId]) {
        sessionDataMap[sessionId] = {
          startTime: pageStartTime,
          pages: {}
        }
      }

      if (!sessionDataMap[sessionId].pages[pageUrl]) {
        sessionDataMap[sessionId].pages[pageUrl] = {
          startTime: pageStartTime,
          ...data
        }
      } else {
        sessionDataMap[sessionId].pages[pageUrl] = {
          ...sessionDataMap[sessionId].pages[pageUrl],
          ...data
        }
      }

      const prunedData = pruneExpiredSessions(sessionDataMap, dataRetentionDays)

      localStorage.setItem(storageKey, JSON.stringify(prunedData))
      setSessionData(prunedData)
    }

    // 追踪滚动深度
    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      const scrollPercent = Math.round((scrollTop + windowHeight) / documentHeight * 100)

      if (scrollPercent <= maxScrollRef.current) {
        return
      }

      maxScrollRef.current = Math.min(scrollPercent, 100)

      const reachedMilestone = scrollMilestones.find(milestone => {
        const storageId = `${storageKey}_scroll_${milestone}_${router.asPath}`
        const milestoneReached = maxScrollRef.current >= milestone
        if (!milestoneReached) return false
        try {
          return !sessionStorage.getItem(storageId)
        } catch (error) {
          return milestoneReached
        }
      })

      if (reachedMilestone !== undefined) {
        const milestoneStorageKey = `${storageKey}_scroll_${reachedMilestone}_${router.asPath}`
        try {
          sessionStorage.setItem(milestoneStorageKey, 'true')
        } catch (error) {
          // 忽略存储异常，例如无痕模式
        }

        if (window.gtag) {
          window.gtag('event', 'scroll_depth', {
            event_category: 'User Behavior',
            event_label: `${reachedMilestone}%`,
            value: reachedMilestone
          })
        }

        if (window.umami) {
          window.umami.track('Scroll Depth', { depth: reachedMilestone })
        }
      }

      storeSessionData({
        maxScrollDepth: maxScrollRef.current,
        lastScrollTime: Date.now()
      })
    }

    // 追踪点击行为
    const trackClicks = (event) => {
      const target = event.target

      if (!shouldTrackElement(target, clickSelectors)) {
        return
      }

      clickCountRef.current++

      const elementType = target.tagName.toLowerCase()
      const elementClass = target.className
      const elementId = target.id
      const linkHref = target.href

      // 特别关注的点击类型
      let clickType = 'general'
      if (elementType === 'a') {
        clickType = linkHref && linkHref.startsWith('http') ? 'external_link' : 'internal_link'
      } else if (elementType === 'button') {
        clickType = 'button'
      } else if (target.closest('article')) {
        clickType = 'article_content'
      }

      const clickData = {
        elementType,
        elementClass,
        elementId,
        clickType,
        timestamp: Date.now(),
        href: linkHref
      }

      // 发送点击事件到Analytics
      if (window.gtag) {
        window.gtag('event', 'click', {
          event_category: 'User Behavior',
          event_label: clickType,
          value: 1
        })
      }

      if (window.umami) {
        window.umami.track('Click', { type: clickType, element: elementType })
      }

      storeSessionData({
        clickCount: clickCountRef.current,
        lastClick: clickData
      })
    }

    // 追踪页面停留时间
    const trackTimeOnPage = () => {
      const timeSpent = Date.now() - startTimeRef.current
      storeSessionData({
        timeOnPage: Math.round(timeSpent / 1000), // 秒
        lastActiveTime: Date.now()
      })
    }

    // 追踪页面离开
    const trackPageLeave = () => {
      const timeSpent = Date.now() - startTimeRef.current
      const pageUrl = window.location.pathname

      const leaveData = {
        timeOnPage: Math.round(timeSpent / 1000),
        maxScrollDepth: maxScrollRef.current,
        clickCount: clickCountRef.current,
        leaveTime: Date.now()
      }

      storeSessionData(leaveData)

      // 发送页面停留时间到Analytics
      if (window.gtag && timeSpent > 5000) { // 只记录停留超过5秒的
        window.gtag('event', 'time_on_page', {
          event_category: 'User Behavior',
          event_label: pageUrl,
          value: Math.round(timeSpent / 1000)
        })
      }
    }

    // 检测用户活跃状态
    const trackUserActivity = () => {
      let isActive = true
      let lastActivity = Date.now()

      const resetActivity = () => {
        lastActivity = Date.now()
        if (!isActive) {
          isActive = true
          storeSessionData({ becameActiveAt: Date.now() })
        }
      }

      const checkInactivity = () => {
        if (Date.now() - lastActivity > inactivityTimeout && isActive) {
          isActive = false
          storeSessionData({ becameInactiveAt: Date.now() })
        }
      }

      // 监听用户活动
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      events.forEach(event => {
        document.addEventListener(event, resetActivity, true)
      })

      const interval = Math.max(5000, Math.min(inactivityTimeout / 3, 60000))
      const inactivityTimer = setInterval(checkInactivity, interval)

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetActivity, true)
        })
        clearInterval(inactivityTimer)
      }
    }

    // 注册事件监听器
    window.addEventListener('scroll', trackScrollDepth, { passive: true })
    document.addEventListener('click', trackClicks, true)
    window.addEventListener('beforeunload', trackPageLeave)

    // 定期更新页面停留时间
    const timeTracker = setInterval(trackTimeOnPage, 10000) // 每10秒更新一次

    // 启动用户活跃度监控
    const cleanupActivity = trackUserActivity()

    // 路由变化时记录页面切换
    const handleRouteChange = (url) => {
      trackPageLeave()
      startTimeRef.current = Date.now()
      maxScrollRef.current = 0
      clickCountRef.current = 0
    }

    router.events.on('routeChangeStart', handleRouteChange)

    // 初始化数据
    storeSessionData({
      entryTime: pageStartTime,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language
    })

    // 清理函数
    return () => {
      window.removeEventListener('scroll', trackScrollDepth)
      document.removeEventListener('click', trackClicks, true)
      window.removeEventListener('beforeunload', trackPageLeave)
      clearInterval(timeTracker)
      cleanupActivity()
      router.events.off('routeChangeStart', handleRouteChange)
      trackPageLeave() // 确保离开时数据被记录
    }
  }, [clickSelectors, dataRetentionDays, enableTracking, inactivityTimeout, respectDnt, router, scrollMilestones, storageKey])

  return null
}

// 生成会话ID
function generateSessionId(prefix = '') {
  if (typeof window === 'undefined') return `${Date.now().toString(36)}`

  const sanitizedPrefix = (prefix || '').toString()
  const key = sanitizedPrefix
    ? `${sanitizedPrefix}${sanitizedPrefix.endsWith('_') ? '' : '_'}sessionId`
    : 'sessionId'
  try {
    const existing = window.sessionStorage.getItem(key)
    if (existing) return existing

    const sessionId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(key, sessionId)
    return sessionId
  } catch (error) {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  }
}

function pruneExpiredSessions(sessionMap, retentionDays) {
  if (!retentionDays || retentionDays <= 0) {
    return sessionMap
  }

  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
  return Object.fromEntries(
    Object.entries(sessionMap).filter(([, session]) => {
      if (!session || typeof session.startTime !== 'number') {
        return false
      }
      return session.startTime >= cutoff
    })
  )
}

function shouldTrackElement(target, selectors) {
  if (!target || !selectors || selectors.length === 0) {
    return true
  }

  return selectors.some(selector => {
    if (!selector) return false

    try {
      return target.matches?.(selector) || target.closest?.(selector)
    } catch (error) {
      return false
    }
  })
}

export default UserBehaviorTracker
