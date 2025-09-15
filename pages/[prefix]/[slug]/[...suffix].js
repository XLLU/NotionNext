import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPost } from '@/lib/db/getSiteData'
import { checkSlugHasMorThanTwoSlash, processPostData } from '@/lib/utils/post'
import { idToUuid } from 'notion-utils'
import Slug from '..'

/**
 * 根据notion的slug访问页面
 * 解析三级以上目录 /article/2023/10/29/test
 * @param {*} props
 * @returns
 */
const PrefixSlug = props => {
  return <Slug {...props} />
}

/**
 * 编译渲染页面路径
 * @returns
 */
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
    console.log('[getStaticPaths-multi-level] 获取到页面数量:', allPages?.length || 0)
    
    // 检查是否是错误数据
    if (allPages?.length === 1 && allPages[0].slug === 'oops') {
      console.error('[getStaticPaths-multi-level] 检测到Notion数据获取失败，使用fallback模式')
      return { 
        paths: [], 
        fallback: 'blocking' 
      }
    }
    
    const validPages = allPages?.filter(row => checkSlugHasMorThanTwoSlash(row)) || []
    console.log('[getStaticPaths-multi-level] 有效多级页面数量:', validPages.length)
    
    const paths = validPages.map(row => ({
      params: {
        prefix: row.slug.split('/')[0],
        slug: row.slug.split('/')[1],
        suffix: row.slug.split('/').slice(2)
      }
    }))

    if (paths.length > 0) {
      console.log('[getStaticPaths-multi-level] 前3个多级路径:', 
        paths.slice(0, 3).map(p => `${p.params.prefix}/${p.params.slug}/${p.params.suffix.join('/')}`).join(', '))
    }

    return {
      paths: paths,
      fallback: 'blocking' // 改为blocking以确保页面能正确生成
    }
  } catch (error) {
    console.error('[getStaticPaths-multi-level] 获取路径时发生错误:', error.message)
    return { 
      paths: [], 
      fallback: 'blocking' 
    }
  }
}

/**
 * 抓取页面数据
 * @param {*} param0
 * @returns
 */
export async function getStaticProps({
  params: { prefix, slug, suffix },
  locale
}) {
  const fullSlug = prefix + '/' + slug + '/' + suffix.join('/')
  const from = `slug-props-${fullSlug}`
  const props = await getGlobalData({ from, locale })

  // 在列表内查找文章
  props.post = props?.allPages?.find(p => {
    return (
      p.type.indexOf('Menu') < 0 &&
      (p.slug === suffix ||
        p.slug === fullSlug.substring(fullSlug.lastIndexOf('/') + 1) ||
        p.slug === fullSlug ||
        p.id === idToUuid(fullSlug))
    )
  })

  // 处理非列表内文章的内信息
  if (!props?.post) {
    const pageId = fullSlug.slice(-1)[0]
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
