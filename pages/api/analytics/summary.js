import { clerkClient, getAuth } from '@clerk/nextjs/server'
import monitoringConfig from '@/conf/monitoring.config'
import { normalizeAdminEmails } from '@/lib/utils/admin'
import { getGA4Summary, getTopPages } from '@/lib/services/googleAnalytics'

const CACHE_SECONDS = 60

const ADMIN_EMAILS = normalizeAdminEmails(monitoringConfig.ADMIN_EMAILS)
const ADMIN_PROTECTION_ENABLED = monitoringConfig.ENABLE_ADMIN_PROTECTION !== false

const verifyAdminAccess = async (req) => {
  if (!ADMIN_PROTECTION_ENABLED) {
    return { allowed: true }
  }

  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return {
        allowed: false,
        status: 401,
        message: '未登录或会话已过期，请使用管理员账号重新登录'
      }
    }

    const user = await clerkClient.users.getUser(userId)
    const emails = user?.emailAddresses?.map(addr => addr.emailAddress?.toLowerCase()).filter(Boolean) || []

    if (!emails.some(email => ADMIN_EMAILS.includes(email))) {
      return {
        allowed: false,
        status: 403,
        message: '当前账号没有访问分析数据的权限'
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('[GA4] admin verification failed', error)
    return {
      allowed: false,
      status: 500,
      message: '验证管理员权限时出错'
    }
  }
}

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const access = await verifyAdminAccess(req)
    if (!access.allowed) {
      return res.status(access.status).json({ error: access.message })
    }

    const { range = '7d' } = req.query

    const rangeMap = {
      '1d': { startDate: 'yesterday', endDate: 'today' },
      '7d': { startDate: '7daysAgo', endDate: 'today' },
      '30d': { startDate: '30daysAgo', endDate: 'today' }
    }

    const dateRange = rangeMap[range] || rangeMap['7d']

    const summary = await getGA4Summary(dateRange)

    if (!summary.hasConfig) {
      return res.status(200).json({
        hasConfig: false,
        summary: null,
        realtime: null,
        topPages: []
      })
    }

    const topPages = await getTopPages({ ...dateRange, limit: 10 })

    res.setHeader('Cache-Control', `private, max-age=${CACHE_SECONDS}`)

    return res.status(200).json({
      ...summary,
      topPages
    })
  } catch (error) {
    console.error('[GA4] summary api error', error)
    let message = error?.message || 'GA4 summary request failed'
    if (error?.code === 7 || message.includes('PERMISSION_DENIED')) {
      message = 'GA4 服务账号缺少属性权限，请在 GA 后台为该属性授予访问权限'
    }
    return res.status(500).json({
      hasConfig: false,
      error: message
    })
  }
}

export default handler
