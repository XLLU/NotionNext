import { BetaAnalyticsDataClient } from '@google-analytics/data'

const {
  GA4_PROPERTY_ID,
  GA4_CLIENT_EMAIL,
  GA4_PRIVATE_KEY,
  GA4_PRIVATE_KEY_BASE64,
  GA4_SERVICE_ACCOUNT_JSON_BASE64
} = process.env

let analyticsClient = null

const parseServiceAccount = () => {
  if (!GA4_SERVICE_ACCOUNT_JSON_BASE64) return null
  try {
    const jsonString = Buffer.from(
      GA4_SERVICE_ACCOUNT_JSON_BASE64,
      'base64'
    ).toString('utf8')
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('[GA4] 解析 GA4_SERVICE_ACCOUNT_JSON_BASE64 失败', error)
    return null
  }
}

const parsePrivateKey = () => {
  let raw = GA4_PRIVATE_KEY
  if (!raw && GA4_PRIVATE_KEY_BASE64) {
    raw = Buffer.from(GA4_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
  }
  if (!raw) return null
  if (raw.includes('\n')) {
    return raw.replace(/\r?\n/g, '\n')
  }
  return raw.replace(/\\n/g, '\n')
}

const getCredentials = () => {
  const serviceAccount = parseServiceAccount()
  if (serviceAccount?.client_email && serviceAccount?.private_key) {
    return {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key.replace(/\r?\n/g, '\n')
    }
  }

  const privateKey = parsePrivateKey()
  if (GA4_CLIENT_EMAIL && privateKey) {
    return {
      client_email: GA4_CLIENT_EMAIL,
      private_key: privateKey
    }
  }
  return null
}

const hasGAConfig = GA4_PROPERTY_ID && getCredentials()

const getClient = () => {
  if (!hasGAConfig) {
    throw new Error('GA4 未配置：缺少服务账号凭据或属性 ID')
  }

  if (!analyticsClient) {
    const credentials = getCredentials()
    analyticsClient = new BetaAnalyticsDataClient({ credentials })
  }

  return analyticsClient
}

export const getGA4Summary = async ({
  startDate = '7daysAgo',
  endDate = 'today'
} = {}) => {
  if (!hasGAConfig) {
    return {
      hasConfig: false,
      summary: null,
      realtime: null
    }
  }

  const client = getClient()
  const property = `properties/${GA4_PROPERTY_ID}`

  const [summaryReport] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'averageSessionDuration' }
    ]
  })

  const [realtimeReport] = await client.runRealtimeReport({
    property,
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' }
    ]
  })

  const getMetricValue = (row, index) => {
    const value = row?.metricValues?.[index]?.value
    return value ? Number(value) || 0 : 0
  }

  return {
    hasConfig: true,
    summary: {
      pageViews: getMetricValue(summaryReport.rows?.[0], 0),
      sessions: getMetricValue(summaryReport.rows?.[0], 1),
      totalUsers: getMetricValue(summaryReport.rows?.[0], 2),
      averageSessionDuration: getMetricValue(summaryReport.rows?.[0], 3)
    },
    realtime: {
      activeUsers: getMetricValue(realtimeReport.rows?.[0], 0),
      pageViews: getMetricValue(realtimeReport.rows?.[0], 1)
    }
  }
}

export const getTopPages = async ({
  startDate = '7daysAgo',
  endDate = 'today',
  limit = 10
} = {}) => {
  if (!hasGAConfig) {
    return []
  }

  const client = getClient()
  const property = `properties/${GA4_PROPERTY_ID}`

  const [report] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [
      {
        metric: {
          metricName: 'screenPageViews'
        },
        desc: true
      }
    ],
    limit
  })

  return (
    report.rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || '/',
      pageViews: Number(row.metricValues?.[0]?.value || 0)
    })) || []
  )
}
