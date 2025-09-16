import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPost } from '@/lib/db/getSiteData'
import { checkSlugHasOneSlash, processPostData } from '@/lib/utils/post'
import { idToUuid } from 'notion-utils'
import Slug from '..'

/**
 * 根据notion的slug访问页面
 * 解析二级目录 /article/about
 * @param {*} props
 * @returns
 */
const PrefixSlug = props => {
  return <Slug {...props} />
}

export async function getStaticPaths() {
  if (!BLOG.isProd) {
    return {
      paths: [],
      fallback: true
    }
  }

  try {
    const from = 'slug-paths'
    const { allPages } = await getGlobalData({ from })

    // 添加调试日志
    console.log('[getStaticPaths-two-level] 获取到页面数量:', allPages?.length || 0)

    // 检查是否是错误数据
    if (!allPages || allPages.length === 0 || (allPages?.length === 1 && allPages[0].slug === 'oops')) {
      console.error('[getStaticPaths-two-level] 检测到Notion数据获取失败，使用fallback模式')
      // 生产环境下，如果无法获取数据，返回一些基本的两级路径避免全部404
      const fallbackPaths = BLOG.isProd ? [
        { params: { prefix: 'article', slug: 'welcome' } },
        { params: { prefix: 'docs', slug: 'getting-started' } },
        { params: { prefix: 'blog', slug: 'first-post' } }
      ] : []
      return {
        paths: fallbackPaths,
        fallback: 'blocking'
      }
    }

    // 根据slug中的 / 分割成prefix和slug两个字段 ; 例如 article/test
    // 最终用户可以通过  [domain]/[prefix]/[slug] 路径访问，即这里的 [domain]/article/test
    const validPages = allPages?.filter(row => checkSlugHasOneSlash(row)) || []
    console.log('[getStaticPaths-two-level] 有效两级页面数量:', validPages.length)

    const paths = validPages.map(row => ({
      params: { prefix: row.slug.split('/')[0], slug: row.slug.split('/')[1] }
    }))

    if (paths.length > 0) {
      console.log('[getStaticPaths-two-level] 前3个两级路径:',
        paths.slice(0, 3).map(p => `${p.params.prefix}/${p.params.slug}`).join(', '))
    }

    // 增加一种访问路径 允许通过 [category]/[slug] 访问文章
    // 例如文章slug 是 test ，然后文章的分类category是 production
    // 则除了 [domain]/[slug] 以外，还支持分类名访问: [domain]/[category]/[slug]

    return {
      paths: paths,
      fallback: 'blocking' // 改为blocking以确保页面能正确生成
    }
  } catch (error) {
    console.error('[getStaticPaths-two-level] 获取路径时发生错误:', error.message)
    // 生产环境下提供基本的fallback路径
    const fallbackPaths = BLOG.isProd ? [
      { params: { prefix: 'article', slug: 'welcome' } },
      { params: { prefix: 'docs', slug: 'getting-started' } },
      { params: { prefix: 'blog', slug: 'first-post' } }
    ] : []
    return {
      paths: fallbackPaths,
      fallback: 'blocking'
    }
  }
}

export async function getStaticProps({ params: { prefix, slug }, locale }) {
  const fullSlug = prefix + '/' + slug
  const from = `slug-props-${fullSlug}`
  const props = await getGlobalData({ from, locale })

  // 在列表内查找文章
  props.post = props?.allPages?.find(p => {
    return (
      p.type.indexOf('Menu') < 0 &&
      (p.slug === slug || p.slug === fullSlug || p.id === idToUuid(fullSlug))
    )
  })

  // 处理非列表内文章的内信息
  if (!props?.post) {
    const pageId = slug.slice(-1)[0]
    if (pageId.length >= 32) {
      const post = await getPost(pageId)
      props.post = post
    }
  }

  if (!props?.post) {
    // 无法获取文章
    props.post = null
  } else {
    await processPostData(props, from)
  }
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

export default PrefixSlug
