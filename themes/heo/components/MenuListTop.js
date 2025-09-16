import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import CONFIG from '../config'
import { MenuItemDrop } from './MenuItemDrop'

export const MenuListTop = props => {
  const { customNav, customMenu } = props
  const { locale } = useGlobal()
  const router = useRouter()

  let links = [
    {
      id: 1,
      icon: 'fa-solid fa-house',
      name: locale.NAV.INDEX,
      href: '/',
      show: siteConfig('HEO_MENU_INDEX', null, CONFIG)
    },
    {
      id: 2,
      icon: 'fas fa-search',
      name: locale.NAV.SEARCH,
      href: '/search',
      show: siteConfig('HEO_MENU_SEARCH', null, CONFIG)
    },
    {
      id: 3,
      icon: 'fas fa-archive',
      name: locale.NAV.ARCHIVE,
      href: '/archive',
      show: siteConfig('HEO_MENU_ARCHIVE', null, CONFIG)
    }
  ]

  if (customNav) {
    links = links.concat(customNav)
  }

  // 如果 开启自定义菜单，则覆盖Page生成的菜单
  if (siteConfig('CUSTOM_MENU')) {
    // 过滤语言切换按钮：根据当前页面语言只显示对应的切换按钮
    const isEnglishPage = router.asPath.startsWith('/en')
    const filteredCustomMenu = customMenu?.filter(item => {
      // 如果不是语言切换按钮，则显示
      if (!item.title?.includes('English') && !item.title?.includes('中文')) {
        return true
      }
      // 中文页面只显示英文切换按钮
      if (!isEnglishPage && item.title?.includes('English')) {
        return true
      }
      // 英文页面只显示中文切换按钮
      if (isEnglishPage && item.title?.includes('中文')) {
        return true
      }
      return false
    })
    links = filteredCustomMenu || customMenu
  }

  if (!links || links.length === 0) {
    return null
  }

  return (
    <>
      <nav
        id='nav-mobile'
        className='leading-8 justify-center font-light w-full flex'>
        {links?.map(
          (link, index) =>
            link && link.show && <MenuItemDrop key={index} link={link} />
        )}
      </nav>
    </>
  )
}
