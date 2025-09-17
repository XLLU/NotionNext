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
 * 首页布局
 * @param {*} props
 * @returns
 */
const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

/**
 * SSG 获取数据
 * @returns
 */
export async function getStaticProps(req) {
  const { locale } = req
  const from = locale ? `index-${locale}` : 'index'

  try {
    const props = await getGlobalData({ from, locale })

    const POST_PREVIEW_LINES = siteConfig(
      'POST_PREVIEW_LINES',
      12,
      props?.NOTION_CONFIG
    )

    props.posts = props.allPages?.filter(
      page => page.type === 'Post' && page.status === 'Published'
    )

    if (siteConfig('POST_LIST_STYLE') === 'scroll') {
      // 滚动列表默认给前端返回所有数据
    } else if (siteConfig('POST_LIST_STYLE') === 'page') {
      props.posts = props.posts?.slice(
        0,
        siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
      )
    }

    if (siteConfig('POST_LIST_PREVIEW', false, props?.NOTION_CONFIG)) {
      for (const i in props.posts) {
        const post = props.posts[i]
        if (post.password && post.password !== '') {
          continue
        }
        post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
      }
    }

    if (siteConfig('isProd', BLOG.isProd, props?.NOTION_CONFIG)) {
      try {
        generateRobotsTxt(props)
      } catch (error) {
        console.error('[index] generateRobotsTxt failed', { from, locale, error })
      }
      try {
        generateRss(props)
      } catch (error) {
        console.error('[index] generateRss failed', { from, locale, error })
      }
      try {
        generateSitemapXml(props)
      } catch (error) {
        console.error('[index] generateSitemapXml failed', {
          from,
          locale,
          error
        })
      }
      try {
        checkDataFromAlgolia(props)
      } catch (error) {
        console.error('[index] checkDataFromAlgolia failed', {
          from,
          locale,
          error
        })
      }
      if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
        try {
          generateRedirectJson(props)
        } catch (error) {
          console.error('[index] generateRedirectJson failed', {
            from,
            locale,
            error
          })
        }
      }
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
  } catch (error) {
    console.error('[index] getStaticProps failed', { from, locale, error })

    const fallbackProps = {
      siteInfo: {
        title: BLOG.TITLE || 'NotionNext',
        description: BLOG.BIO || 'A NotionNext site',
        pageCover: BLOG.HOME_BANNER_IMAGE || '/bg_image.jpg',
        icon: BLOG.BLOG_FAVICON || '/favicon.ico'
      },
      posts: []
    }

    return {
      props: fallbackProps,
      revalidate: siteConfig(
        'NEXT_REVALIDATE_SECOND',
        BLOG.NEXT_REVALIDATE_SECOND
      )
    }
  }
}

export default Index
