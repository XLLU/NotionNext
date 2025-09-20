import { useGlobal } from '@/lib/global'
import { siteConfig } from '@/lib/config'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useClerkAuth } from '@/hooks/useClerkAuth'
import Link from 'next/link'

/**
 * SEO基础监控页面
 * 检查网站SEO健康度
 */
export default function SEOCheck(props) {
  const { locale } = useGlobal()
  const { isLoaded, hasPermission, openSignIn } = useClerkAuth()
  const [seoData, setSeoData] = useState({
    pageTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    structuredData: null,
    headings: [],
    images: [],
    links: []
  })

  const [seoScore, setSeoScore] = useState(0)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      analyzeCurrentPage()
    }
  }, [])

  const analyzeCurrentPage = () => {
    // 获取页面SEO元素
    const title = document.title
    const metaDescription = document.querySelector('meta[name="description"]')?.content || ''
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || ''
    const canonical = document.querySelector('link[rel="canonical"]')?.href || ''
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content || ''
    const ogDescription = document.querySelector('meta[property="og:description"]')?.content || ''
    const ogImage = document.querySelector('meta[property="og:image"]')?.content || ''

    // 获取结构化数据
    const structuredDataScript = document.querySelector('script[type="application/ld+json"]')
    let structuredData = null
    if (structuredDataScript) {
      try {
        structuredData = JSON.parse(structuredDataScript.textContent)
      } catch (e) {
        console.warn('Invalid structured data:', e)
      }
    }

    // 分析标题层级
    const headings = []
    for (let i = 1; i <= 6; i++) {
      const tags = document.querySelectorAll(`h${i}`)
      tags.forEach(tag => {
        headings.push({
          level: i,
          text: tag.textContent.trim(),
          length: tag.textContent.trim().length
        })
      })
    }

    // 分析图片
    const images = []
    document.querySelectorAll('img').forEach(img => {
      images.push({
        src: img.src,
        alt: img.alt || '',
        title: img.title || '',
        hasAlt: Boolean(img.alt),
        loading: img.loading
      })
    })

    // 分析链接
    const links = []
    document.querySelectorAll('a').forEach(link => {
      const isExternal = link.href && (link.href.startsWith('http') && !link.href.includes(window.location.hostname))
      links.push({
        href: link.href,
        text: link.textContent.trim(),
        title: link.title || '',
        isExternal,
        hasTitle: Boolean(link.title),
        target: link.target
      })
    })

    const pageData = {
      pageTitle: title,
      metaDescription,
      metaKeywords,
      canonicalUrl: canonical,
      ogTitle,
      ogDescription,
      ogImage,
      structuredData,
      headings,
      images,
      links
    }

    setSeoData(pageData)
    calculateSEOScore(pageData)
  }

  const calculateSEOScore = (data) => {
    let score = 0
    const issues = []

    // 标题检查 (20分)
    if (data.pageTitle) {
      if (data.pageTitle.length >= 30 && data.pageTitle.length <= 60) {
        score += 20
      } else {
        score += 10
        issues.push(`页面标题长度不理想 (当前: ${data.pageTitle.length}字符，建议: 30-60字符)`)
      }
    } else {
      issues.push('缺少页面标题')
    }

    // Meta描述检查 (15分)
    if (data.metaDescription) {
      if (data.metaDescription.length >= 120 && data.metaDescription.length <= 160) {
        score += 15
      } else {
        score += 8
        issues.push(`Meta描述长度不理想 (当前: ${data.metaDescription.length}字符，建议: 120-160字符)`)
      }
    } else {
      issues.push('缺少Meta描述')
    }

    // 标题层级检查 (15分)
    const hasH1 = data.headings.some(h => h.level === 1)
    if (hasH1) {
      score += 10
      const h1Count = data.headings.filter(h => h.level === 1).length
      if (h1Count === 1) {
        score += 5
      } else {
        issues.push(`H1标题数量不合适 (当前: ${h1Count}个，建议: 1个)`)
      }
    } else {
      issues.push('缺少H1标题')
    }

    // 图片优化检查 (15分)
    if (data.images.length > 0) {
      const imagesWithAlt = data.images.filter(img => img.hasAlt).length
      const altPercentage = (imagesWithAlt / data.images.length) * 100
      if (altPercentage >= 90) {
        score += 15
      } else if (altPercentage >= 70) {
        score += 10
        issues.push(`图片Alt标签覆盖率偏低 (${altPercentage.toFixed(1)}%，建议: >90%)`)
      } else {
        score += 5
        issues.push(`图片Alt标签覆盖率过低 (${altPercentage.toFixed(1)}%，建议: >90%)`)
      }
    }

    // Open Graph检查 (10分)
    if (data.ogTitle && data.ogDescription) {
      score += 10
    } else {
      issues.push('缺少完整的Open Graph标签')
    }

    // 结构化数据检查 (10分)
    if (data.structuredData) {
      score += 10
    } else {
      issues.push('缺少结构化数据 (JSON-LD)')
    }

    // 规范链接检查 (5分)
    if (data.canonicalUrl) {
      score += 5
    } else {
      issues.push('缺少Canonical链接')
    }

    // 外链优化检查 (10分)
    const externalLinks = data.links.filter(link => link.isExternal)
    if (externalLinks.length > 0) {
      const linksWithTitle = externalLinks.filter(link => link.hasTitle).length
      if (linksWithTitle / externalLinks.length >= 0.8) {
        score += 10
      } else {
        score += 5
        issues.push('外链缺少title属性')
      }
    }

    setSeoScore(score)
    setRecommendations(issues)
  }

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score) => {
    if (score >= 85) return '优秀'
    if (score >= 70) return '良好'
    if (score >= 50) return '一般'
    return '需要改进'
  }

  const exportSEOReport = () => {
    const report = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      score: seoScore,
      data: seoData,
      recommendations
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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

  if (!hasPermission('seo-check')) {
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
                您需要管理员权限才能访问SEO检查工具。请联系系统管理员或使用管理员账号登录。
              </p>
              <div className='space-y-3'>
                <button
                  onClick={() => openSignIn('/admin/seo-check')}
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
        <title>SEO检查工具 - FreemiumNext</title>
        <meta name="description" content="检查网站页面的SEO优化情况，获得改进建议" />
      </Head>

      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              🔍 SEO健康度检查
            </h1>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              分析当前页面的SEO优化情况并提供改进建议
            </p>
          </div>

          {/* SEO评分卡片 */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-1'>
              <div className='text-center'>
                <div className={`text-4xl font-bold ${getScoreColor(seoScore)} mb-2`}>
                  {seoScore}/100
                </div>
                <div className='text-lg text-gray-600 dark:text-gray-400 mb-4'>
                  SEO评分 - {getScoreLabel(seoScore)}
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      seoScore >= 85 ? 'bg-green-500' : seoScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${seoScore}%` }}
                  ></div>
                </div>
                <button
                  onClick={analyzeCurrentPage}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mb-2'
                >
                  重新检查
                </button>
                <button
                  onClick={exportSEOReport}
                  className='w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors'
                >
                  导出报告
                </button>
              </div>
            </div>

            {/* 基础信息 */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                页面基础信息
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium text-gray-500 dark:text-gray-400'>页面标题</label>
                  <div className='text-gray-900 dark:text-white mt-1'>{seoData.pageTitle || '未设置'}</div>
                  {seoData.pageTitle && (
                    <div className='text-xs text-gray-500'>
                      长度: {seoData.pageTitle.length} 字符
                      {seoData.pageTitle.length < 30 && ' (建议增加)'}
                      {seoData.pageTitle.length > 60 && ' (建议缩短)'}
                    </div>
                  )}
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500 dark:text-gray-400'>Meta描述</label>
                  <div className='text-gray-900 dark:text-white mt-1'>{seoData.metaDescription || '未设置'}</div>
                  {seoData.metaDescription && (
                    <div className='text-xs text-gray-500'>
                      长度: {seoData.metaDescription.length} 字符
                      {seoData.metaDescription.length < 120 && ' (建议增加)'}
                      {seoData.metaDescription.length > 160 && ' (建议缩短)'}
                    </div>
                  )}
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500 dark:text-gray-400'>关键词</label>
                  <div className='text-gray-900 dark:text-white mt-1'>{seoData.metaKeywords || '未设置'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 改进建议 */}
          {recommendations.length > 0 && (
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                优化建议 ({recommendations.length}项)
              </h3>
              <div className='space-y-2'>
                {recommendations.map((rec, index) => (
                  <div key={index} className='flex items-start space-x-2'>
                    <span className='text-orange-500 text-sm mt-0.5'>⚠️</span>
                    <span className='text-gray-700 dark:text-gray-300 text-sm'>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 详细分析 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 标题结构 */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                标题结构 ({seoData.headings.length}个)
              </h3>
              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {seoData.headings.map((heading, index) => (
                  <div key={index} className='flex items-start space-x-2'>
                    <span className={`text-xs px-2 py-1 rounded ${
                      heading.level === 1 ? 'bg-blue-100 text-blue-800' :
                      heading.level === 2 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      H{heading.level}
                    </span>
                    <span className='text-sm text-gray-700 dark:text-gray-300 flex-1'>
                      {heading.text.substring(0, 50)}{heading.text.length > 50 ? '...' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 图片优化 */}
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                图片优化 ({seoData.images.length}张)
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600 dark:text-gray-400'>有Alt标签:</span>
                  <span className='text-sm font-medium'>
                    {seoData.images.filter(img => img.hasAlt).length} / {seoData.images.length}
                  </span>
                </div>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {seoData.images.slice(0, 10).map((img, index) => (
                    <div key={index} className='flex items-center space-x-2 text-sm'>
                      <span className={`w-2 h-2 rounded-full ${img.hasAlt ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className='text-gray-700 dark:text-gray-300 truncate flex-1'>
                        {img.src.split('/').pop()}
                      </span>
                      {!img.hasAlt && <span className='text-red-500 text-xs'>无Alt</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function getStaticProps() {
  return {
    props: {},
    revalidate: 300
  }
}
