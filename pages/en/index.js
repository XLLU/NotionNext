import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPostBlocks } from '@/lib/db/getSiteData'
import { generateRobotsTxt } from '@/lib/robots.txt'
import { generateRss } from '@/lib/rss'
import { generateSitemapXml } from '@/lib/sitemap.xml'
import { DynamicLayout } from '@/themes/theme'
import { generateRedirectJson } from '@/lib/redirect'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'

/**
 * 英文首页布局
 * @param {*} props
 * @returns
 */
const EnIndex = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

/**
 * SSG 获取数据 - 强制使用英文数据源
 * @returns
 */
export async function getStaticProps() {
  const locale = 'en' // 强制使用英文语言 - 对应.env.local中的en:前缀
  const from = 'index-en'
  const props = await getGlobalData({ from, locale })
  
  // 为英文页面设置语言和配置
  if (props?.NOTION_CONFIG) {
    props.NOTION_CONFIG.LANG = 'en-US' // 设置语言包为en-US
    props.NOTION_CONFIG.HEO_POST_COUNT_TITLE = 'Posts:'
    props.NOTION_CONFIG.HEO_SITE_TIME_TITLE = 'Site Days:'
  }
  
  // 确保siteInfo存在，防止构建时出错
  if (!props.siteInfo && props.allPages && props.allPages.length > 0) {
    // 从首页数据中获取siteInfo基本信息
    props.siteInfo = {
      title: props.NOTION_CONFIG?.TITLE || 'FREEMIUM',
      description: props.NOTION_CONFIG?.DESCRIPTION || 'Open Source and AI value sharing',
      pageCover: props.NOTION_CONFIG?.HOME_BANNER_IMAGE
    }
  }
  
  const POST_PREVIEW_LINES = siteConfig(
    'POST_PREVIEW_LINES',
    12,
    props?.NOTION_CONFIG
  )
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )

  // 处理分页
  if (siteConfig('POST_LIST_STYLE') === 'scroll') {
    // 滚动列表默认给前端返回所有数据
  } else if (siteConfig('POST_LIST_STYLE') === 'page') {
    props.posts = props.posts?.slice(
      0,
      siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
    )
  }

  // 预览文章内容
  if (siteConfig('POST_LIST_PREVIEW', false, props?.NOTION_CONFIG)) {
    for (const i in props.posts) {
      const post = props.posts[i]
      if (post.password && post.password !== '') {
        continue
      }
      post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
    }
  }

  // 生成RSS
  if (BLOG.isProd) {
    await generateRss(props)
    await generateSitemapXml(props)
    await generateRobotsTxt()
    // 重定向配置
    if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
      await generateRedirectJson(props.allPages)
    }
    // Algolia 检查数据
    await checkDataFromAlgolia(props)
  }

  delete props.allPages
  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default EnIndex
