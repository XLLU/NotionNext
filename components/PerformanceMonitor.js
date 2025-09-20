import { useEffect, useMemo, useState } from 'react'
import { siteConfig } from '@/lib/config'

/**
 * 性能监控组件
 * 监控Web Vitals指标并上报
 */
const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState({})
  const enableWebVitals = siteConfig('ENABLE_WEB_VITALS', true)
  const storagePrefix = siteConfig('LOCAL_STORAGE_PREFIX', 'freemium_analytics_')
  const rawBudgets = siteConfig('PERFORMANCE_BUDGETS', null)
  const respectDnt = siteConfig('RESPECT_DNT', true)

  const performanceBudgets = useMemo(() => {
    const defaultBudgets = {
      FCP: 1800,
      LCP: 2500,
      FID: 100,
      CLS: 0.1,
      LOAD_TIME: 3000,
      RESOURCE_TIMEOUT: 1000
    }

    if (rawBudgets && typeof rawBudgets === 'object') {
      return { ...defaultBudgets, ...rawBudgets }
    }
    return defaultBudgets
  }, [rawBudgets])

  const storageKey = useMemo(() => {
    const prefix = typeof storagePrefix === 'string' && storagePrefix.trim() !== ''
      ? storagePrefix.trim()
      : 'freemium_analytics_'
    return `${prefix}performanceMetrics`
  }, [storagePrefix])

  useEffect(() => {
    if (!enableWebVitals || typeof window === 'undefined') {
      return
    }

    if (respectDnt && window.navigator?.doNotTrack === '1') {
      return
    }

    // 存储性能数据到localStorage
    const storePerformanceData = (data) => {
      let existingData = {}
      try {
        existingData = JSON.parse(localStorage.getItem(storageKey) || '{}')
      } catch (error) {
        existingData = {}
      }
      const updatedData = { ...existingData, ...data, timestamp: Date.now() }
      localStorage.setItem(storageKey, JSON.stringify(updatedData))
      setPerformanceData(updatedData)
    }

    // 监控Core Web Vitals
    const reportWebVitals = (metric) => {
      const { name, value, id } = metric

      // 检查是否超出性能预算
      const metricBudget = performanceBudgets[name]
      const isOverBudget = typeof metricBudget === 'number' && value > metricBudget

      // 控制台输出性能指标
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${value}${isOverBudget ? ' ⚠️ Over Budget' : ' ✅'}`)
      }

      // 存储性能数据
      storePerformanceData({
        [name]: {
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          isOverBudget,
          timestamp: Date.now()
        }
      })

      // 发送到Google Analytics
      if (window.gtag) {
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          event_label: id,
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          non_interaction: true
        })
      }

      // 发送到UMAMI (如果配置了)
      if (window.umami) {
        window.umami.track('Web Vitals', {
          metric: name,
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          overBudget: isOverBudget
        })
      }
    }

    // 动态导入web-vitals库
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals)
      getFID(reportWebVitals)
      getFCP(reportWebVitals)
      getLCP(reportWebVitals)
      getTTFB(reportWebVitals)
    }).catch(err => {
      console.warn('Failed to load web-vitals:', err)
    })

    // 监控资源加载性能
    const monitorResourceTiming = () => {
      if (!window.performance || !window.performance.getEntriesByType) {
        return
      }

      const resources = window.performance.getEntriesByType('resource')
      const slowResources = resources.filter(resource => resource.duration > performanceBudgets.RESOURCE_TIMEOUT)

      if (slowResources.length > 0) {
        const slowResourceData = {
          slowResourceCount: slowResources.length,
          slowestResource: Math.max(...slowResources.map(r => r.duration)),
          totalResources: resources.length
        }

        storePerformanceData(slowResourceData)

        if (process.env.NODE_ENV === 'development') {
          console.warn('[Performance] Slow resources detected:', slowResources)
        }
      }
    }

    // 监控页面加载性能
    const monitorPageLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        const pageLoadData = {
          pageLoadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          firstByte: Math.round(navigation.responseStart - navigation.fetchStart)
        }
        storePerformanceData(pageLoadData)
      }
    }

    // 监控内存使用
    const monitorMemoryUsage = () => {
      if (performance.memory) {
        const memoryData = {
          memoryUsed: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
          memoryTotal: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
          memoryLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
        }
        storePerformanceData(memoryData)
      }
    }

    // 延迟执行各种监控
    setTimeout(monitorResourceTiming, 3000)
    setTimeout(monitorPageLoad, 1000)
    setTimeout(monitorMemoryUsage, 2000)

    // 定期更新内存使用情况
    const memoryInterval = setInterval(monitorMemoryUsage, 30000) // 每30秒

    return () => {
      clearInterval(memoryInterval)
    }
  }, [enableWebVitals, performanceBudgets, respectDnt, storageKey])

  return null
}

export default PerformanceMonitor
