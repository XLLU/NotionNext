import CONFIG from '../config'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'

/**
 * 博客统计卡牌
 * @param {*} props
 * @returns
 */
export function AnalyticsCard(props) {
  const { locale } = useGlobal()
  const targetDate = new Date(siteConfig('HEO_SITE_CREATE_TIME', null, CONFIG))
  const today = new Date()
  const diffTime = today.getTime() - targetDate.getTime() // 获取两个日期之间的毫秒数差值
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // 将毫秒数差值转换为天数差值

  // 使用国际化文本，如果没有则回退到配置文件
  const postCountTitle = locale?.COMMON?.POST_COUNT || siteConfig('HEO_POST_COUNT_TITLE', null, CONFIG)
  const siteTimeTitle = locale?.COMMON?.SITE_TIME || siteConfig('HEO_SITE_TIME_TITLE', null, CONFIG)
  const siteVisitTitle = locale?.COMMON?.VIEWS || siteConfig('HEO_SITE_VISIT_TITLE', null, CONFIG)
  const siteVisitorTitle = locale?.COMMON?.VISITORS || siteConfig('HEO_SITE_VISITOR_TITLE', null, CONFIG)

  const { postCount } = props
  return <>
        <div className='text-md flex flex-col space-y-1 justify-center px-3'>
            <div className='inline'>
                <div className='flex justify-between'>
                    <div>{postCountTitle}</div>
                    <div>{postCount}</div>
                </div>
            </div>
            <div className='inline'>
                <div className='flex justify-between'>
                    <div>{siteTimeTitle}</div>
                    <div>{diffDays}</div>
                </div>
            </div>
            <div className='busuanzi_container_page_pv'>
                <div className='flex justify-between'>
                    <div>{siteVisitTitle}</div>
                    <div className='busuanzi_value_page_pv' />
                </div>
            </div>
            <div className='busuanzi_container_site_uv'>
                <div className='flex justify-between'>
                    <div>{siteVisitorTitle}</div>
                    <div className='busuanzi_value_site_uv' />
                </div>
            </div>
        </div>
        </>
}
