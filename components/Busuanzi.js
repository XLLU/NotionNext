import busuanzi from '@/lib/plugins/busuanzi'
import { useRouter } from 'next/router'
import { useGlobal } from '@/lib/global'
import { useEffect } from 'react'

let path = ''

export default function Busuanzi () {
  const { theme } = useGlobal()
  const router = useRouter()

  useEffect(() => {
    // 初始加载时获取统计
    busuanzi.fetch()

    // 路由变化时更新统计
    const handleRouteChange = (url) => {
      if (url !== path) {
        path = url
        setTimeout(() => {
          busuanzi.fetch()
        }, 100)
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  // 更换主题时更新
  useEffect(() => {
    if (theme) {
      setTimeout(() => {
        busuanzi.fetch()
      }, 100)
    }
  }, [theme])

  return null
}
