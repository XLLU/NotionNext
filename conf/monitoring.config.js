/**
 * 网站监控配置
 * 包含所有监控、分析、SEO相关的设置
 */
module.exports = {
  // 基础监控开关
  ENABLE_WEB_VITALS: process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS || true,
  ENABLE_USER_BEHAVIOR_TRACKING: process.env.NEXT_PUBLIC_ENABLE_USER_BEHAVIOR_TRACKING || true,
  ENABLE_SEO_MONITORING: process.env.NEXT_PUBLIC_ENABLE_SEO_MONITORING || true,
  ENABLE_GEO_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_GEO_ANALYTICS || true,

  // 监控数据存储
  MONITORING_DATA_RETENTION_DAYS: process.env.NEXT_PUBLIC_MONITORING_DATA_RETENTION_DAYS || 30,
  LOCAL_STORAGE_PREFIX: process.env.NEXT_PUBLIC_LOCAL_STORAGE_PREFIX || 'freemium_analytics_',

  // 实时监控配置
  REALTIME_UPDATE_INTERVAL: process.env.NEXT_PUBLIC_REALTIME_UPDATE_INTERVAL || 30000, // 30秒
  PERFORMANCE_CHECK_INTERVAL: process.env.NEXT_PUBLIC_PERFORMANCE_CHECK_INTERVAL || 60000, // 1分钟
  MEMORY_MONITORING_INTERVAL: process.env.NEXT_PUBLIC_MEMORY_MONITORING_INTERVAL || 30000, // 30秒

  // 用户行为追踪配置
  SCROLL_TRACKING_MILESTONES: [25, 50, 75, 100], // 滚动深度里程碑
  INACTIVITY_TIMEOUT: process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT || 60000, // 1分钟无活动视为非活跃
  CLICK_TRACKING_ELEMENTS: ['a', 'button', 'input[type="submit"]', '.trackable'], // 需要追踪点击的元素

  // SEO监控配置
  SEO_CHECK_ELEMENTS: {
    TITLE_MIN_LENGTH: 30,
    TITLE_MAX_LENGTH: 60,
    META_DESCRIPTION_MIN_LENGTH: 120,
    META_DESCRIPTION_MAX_LENGTH: 160,
    MIN_ALT_TAG_COVERAGE: 90, // 图片Alt标签覆盖率最低要求(%)
    MAX_H1_COUNT: 1 // 页面H1标题最大数量
  },

  // 性能预算配置
  PERFORMANCE_BUDGETS: {
    FCP: 1800, // First Contentful Paint (ms)
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1,  // Cumulative Layout Shift
    LOAD_TIME: 3000, // 页面加载时间 (ms)
    RESOURCE_TIMEOUT: 1000 // 资源加载超时阈值 (ms)
  },

  // 告警配置
  ENABLE_PERFORMANCE_ALERTS: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_ALERTS || false,
  ALERT_THRESHOLDS: {
    HIGH_MEMORY_USAGE: 80, // 内存使用率超过80%时告警
    SLOW_PAGE_LOAD: 5000,  // 页面加载超过5秒告警
    HIGH_BOUNCE_RATE: 80,  // 跳出率超过80%告警
    LOW_SCROLL_DEPTH: 25   // 平均滚动深度低于25%告警
  },

  // 数据上报配置
  ENABLE_DATA_EXPORT: process.env.NEXT_PUBLIC_ENABLE_DATA_EXPORT || true,
  EXPORT_FORMATS: ['json', 'csv'], // 支持的导出格式
  AUTO_EXPORT_INTERVAL: process.env.NEXT_PUBLIC_AUTO_EXPORT_INTERVAL || 0, // 0表示不自动导出

  // GEO分析配置
  GEO_IP_SERVICE: process.env.NEXT_PUBLIC_GEO_IP_SERVICE || 'ipapi', // 可选: ipapi, maxmind, cloudflare
  ENABLE_CITY_LEVEL_TRACKING: process.env.NEXT_PUBLIC_ENABLE_CITY_LEVEL_TRACKING || true,
  GEO_DATA_PRIVACY_MODE: process.env.NEXT_PUBLIC_GEO_DATA_PRIVACY_MODE || true, // 隐私模式，不记录精确位置

  // A/B测试配置
  ENABLE_AB_TESTING: process.env.NEXT_PUBLIC_ENABLE_AB_TESTING || false,
  AB_TEST_SAMPLE_RATE: process.env.NEXT_PUBLIC_AB_TEST_SAMPLE_RATE || 0.1, // 10%的用户参与A/B测试

  // 热力图配置
  ENABLE_HEATMAP: process.env.NEXT_PUBLIC_ENABLE_HEATMAP || false,
  HEATMAP_SAMPLE_RATE: process.env.NEXT_PUBLIC_HEATMAP_SAMPLE_RATE || 0.05, // 5%的会话记录热力图数据

  // 监控面板配置
  DASHBOARD_REFRESH_INTERVAL: process.env.NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL || 30000, // 30秒刷新
  DASHBOARD_DEFAULT_TIME_RANGE: process.env.NEXT_PUBLIC_DASHBOARD_DEFAULT_TIME_RANGE || '7d', // 默认显示7天数据
  ENABLE_REALTIME_DASHBOARD: process.env.NEXT_PUBLIC_ENABLE_REALTIME_DASHBOARD || true,

  // 隐私和合规配置
  RESPECT_DNT: process.env.NEXT_PUBLIC_RESPECT_DNT || true, // 尊重Do Not Track设置
  GDPR_COMPLIANCE: process.env.NEXT_PUBLIC_GDPR_COMPLIANCE || true,
  ANONYMIZE_IPS: process.env.NEXT_PUBLIC_ANONYMIZE_IPS || true, // IP地址匿名化

  // 调试配置
  DEBUG_MONITORING: process.env.NODE_ENV === 'development',
  VERBOSE_LOGGING: process.env.NEXT_PUBLIC_VERBOSE_LOGGING || false,

  // Admin 访问控制配置
  ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS ?
    process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(email => email.trim()) :
    ['lucas@freemium.cc', 'lucas.lu.xllu@gmail.com', 'lucasluu@yahoo.com'], // 默认管理员邮箱，生产环境应通过环境变量配置
  ENABLE_ADMIN_PROTECTION: process.env.NEXT_PUBLIC_ENABLE_ADMIN_PROTECTION !== 'false', // 默认启用

  // 第三方集成配置
  GOOGLE_ANALYTICS_ENHANCED: process.env.NEXT_PUBLIC_GA_ENHANCED || true, // 增强型电子商务
  UMAMI_API_ENABLED: process.env.NEXT_PUBLIC_UMAMI_API_ENABLED || false,
  CLARITY_INTEGRATION: process.env.NEXT_PUBLIC_CLARITY_INTEGRATION || false,

  // 内容分析配置
  CONTENT_ANALYSIS_ENABLED: process.env.NEXT_PUBLIC_CONTENT_ANALYSIS_ENABLED || true,
  TRACK_READING_TIME: process.env.NEXT_PUBLIC_TRACK_READING_TIME || true,
  TRACK_READING_PROGRESS: process.env.NEXT_PUBLIC_TRACK_READING_PROGRESS || true,

  // 移动端特殊配置
  MOBILE_PERFORMANCE_BUDGET: {
    FCP: 2500, // 移动端FCP预算更宽松
    LCP: 4000,
    FID: 100,
    CLS: 0.1
  },

  // 自定义事件配置
  CUSTOM_EVENTS: {
    NEWSLETTER_SIGNUP: 'newsletter_signup',
    SOCIAL_SHARE: 'social_share',
    DOWNLOAD: 'download',
    EXTERNAL_LINK_CLICK: 'external_link_click',
    SEARCH: 'search'
  }
}
