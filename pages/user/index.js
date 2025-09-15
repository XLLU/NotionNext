import { useRouter } from 'next/router'
import { useEffect } from 'react'

/**
 * 用户中心首页
 * 自动重定向到 profile 页面
 */
export default function UserIndex() {
  const router = useRouter()
  
  useEffect(() => {
    // 重定向到用户资料页面
    router.replace('/user/profile')
  }, [router])

  return null
}

// 使用 getServerSideProps 进行服务端重定向
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/user/profile',
      permanent: false,
    },
  }
}
