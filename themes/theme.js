import BLOG, { LAYOUT_MAPPINGS } from '@/blog.config'
import * as ThemeComponents from '@theme-components'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { getQueryParam, getQueryVariable, isBrowser } from '../lib/utils'

// 在next.config.js中扫描所有主题
export const { THEMES = [] } = getConfig()?.publicRuntimeConfig || {}

/**
 * 获取主题配置
 * @param {string} themeQuery - 主题查询参数（支持多个主题用逗号分隔）
 * @returns {Promise<object>} 主题配置对象
 */
export const getThemeConfig = async themeQuery => {
  // 如果 themeQuery 存在且不等于默认主题，处理多主题情况
  if (typeof themeQuery === 'string' && themeQuery.trim()) {
    // 取 themeQuery 中第一个主题（以逗号为分隔符）
    const themeName = themeQuery.split(',')[0].trim()

    // 如果 themeQuery 不等于当前默认主题，则加载指定主题的配置
    if (themeName !== BLOG.THEME) {
      try {
        // 动态导入主题配置
        const THEME_CONFIG = await import(`@/themes/${themeName}`)
          .then(m => m.THEME_CONFIG)
          .catch(err => {
            console.error(`Failed to load theme ${themeName}:`, err)
            return null // 主题加载失败时返回 null 或者其他默认值
          })

        // 如果主题配置加载成功，返回配置
        if (THEME_CONFIG) {
          return THEME_CONFIG
        } else {
          // 如果加载失败，返回默认主题配置
          console.warn(
            `Loading ${themeName} failed. Falling back to default theme.`
          )
          return ThemeComponents?.THEME_CONFIG
        }
      } catch (error) {
        // 如果 import 过程中出现异常，返回默认主题配置
        console.error(
          `Error loading theme configuration for ${themeName}:`,
          error
        )
        return ThemeComponents?.THEME_CONFIG
      }
    }
  }

  // 如果没有 themeQuery 或 themeQuery 与默认主题相同，返回默认主题配置
  return ThemeComponents?.THEME_CONFIG
}

/**
 * 加载全局布局
 * @param {*} theme
 * @returns
 */
export const getBaseLayoutByTheme = theme => {
  const LayoutBase = ThemeComponents['LayoutBase']
  const isDefaultTheme = !theme || theme === BLOG.THEME
  if (!isDefaultTheme) {
    return dynamic(
      () => import(`@/themes/${theme}`).then(m => m['LayoutBase']),
      { ssr: true }
    )
  }

  return LayoutBase
}

/**
 * 动态获取布局
 * @param {*} props
 */
export const DynamicLayout = props => {
  const { theme, layoutName } = props
  const SelectedLayout = useLayoutByTheme({ layoutName, theme })
  return <SelectedLayout {...props} />
}

/**
 * 加载主题文件
 * @param {*} layoutName
 * @param {*} theme
 * @returns
 */
export const useLayoutByTheme = ({ layoutName, theme }) => {
  // const layoutName = getLayoutNameByPath(router.pathname, router.asPath)
  const LayoutComponents =
    ThemeComponents[layoutName] || ThemeComponents.LayoutSlug

  const router = useRouter()
  const themeQuery = getQueryParam(router?.asPath, 'theme') || theme
  const isDefaultTheme = !themeQuery || themeQuery === BLOG.THEME

  // 加载非当前默认主题
  if (!isDefaultTheme) {
    const loadThemeComponents = componentsSource => {
      const components =
        componentsSource[layoutName] || componentsSource.LayoutSlug
      setTimeout(fixThemeDOM, 500)
      return components
    }
    return dynamic(
      () => import(`@/themes/${themeQuery}`).then(m => loadThemeComponents(m)),
      { ssr: true }
    )
  }

  setTimeout(fixThemeDOM, 100)
  return LayoutComponents
}

/**
 * 根据路径 获取对应的layout名称
 * @param {*} path
 * @returns
 */
const getLayoutNameByPath = path => {
  const layoutName = LAYOUT_MAPPINGS[path] || 'LayoutSlug'
  //   console.log('path-layout',path,layoutName)
  return layoutName
}

/**
 * 切换主题时的特殊处理
 * 删除多余的元素，增强版本用于处理生产环境hydration问题
 */
const fixThemeDOM = () => {
  if (isBrowser) {
    // 原有的主题元素清理
    const themeElements = document.querySelectorAll('[id^="theme-"]')
    if (themeElements?.length > 1) {
      for (let i = 0; i < themeElements.length - 1; i++) {
        if (
          themeElements[i] &&
          themeElements[i].parentNode &&
          themeElements[i].parentNode.contains(themeElements[i])
        ) {
          themeElements[i].parentNode.removeChild(themeElements[i])
        }
      }
      themeElements[0]?.scrollIntoView()
    }

    // 增强清理：处理生产环境hydration导致的重复结构
    // 检查是否有重复的header、main、footer结构
    const headers = document.querySelectorAll('header')
    const mains = document.querySelectorAll('main')
    const footers = document.querySelectorAll('footer')

    // 如果发现重复的结构元素，保留最后一个（通常是正确hydrated的）
    ;[headers, mains, footers].forEach(elements => {
      if (elements.length > 1) {
        console.log(`[fixThemeDOM] Found ${elements.length} duplicate ${elements[0].tagName} elements, cleaning up...`)
        for (let i = 0; i < elements.length - 1; i++) {
          const element = elements[i]
          if (element && element.parentNode && element.parentNode.contains(element)) {
            // 检查是否是真正的重复内容（避免误删正常的嵌套结构）
            const isTopLevel = element.parentNode === document.body ||
                             element.parentNode.tagName === 'DIV' &&
                             element.parentNode.parentNode === document.body
            if (isTopLevel) {
              console.log(`[fixThemeDOM] Removing duplicate ${element.tagName} element`)
              element.parentNode.removeChild(element)
            }
          }
        }
      }
    })
  }
}

/**
 * 初始化主题 , 优先级 query > cookies > systemPrefer
 * @param isDarkMode
 * @param updateDarkMode 更改主题ChangeState函数
 * @description 读取cookie中存的用户主题
 */
export const initDarkMode = (updateDarkMode, defaultDarkMode) => {
  // 查看用户设备浏览器是否深色模型
  let newDarkMode = isPreferDark()

  // 查看localStorage中用户记录的是否深色模式
  const userDarkMode = loadDarkModeFromLocalStorage()
  if (userDarkMode) {
    newDarkMode = userDarkMode === 'dark' || userDarkMode === 'true'
    saveDarkModeToLocalStorage(newDarkMode) // 用户手动的才保存
  }

  // 如果站点强制设置默认深色，则优先级改过用
  if (defaultDarkMode === 'true') {
    newDarkMode = true
  }

  // url查询条件中是否深色模式
  const queryMode = getQueryVariable('mode')
  if (queryMode) {
    newDarkMode = queryMode === 'dark'
  }

  updateDarkMode(newDarkMode)
  document
    .getElementsByTagName('html')[0]
    .setAttribute('class', newDarkMode ? 'dark' : 'light')
}

/**
 * 是否优先深色模式， 根据系统深色模式以及当前时间判断
 * @returns {*}
 */
export function isPreferDark() {
  if (BLOG.APPEARANCE === 'dark') {
    return true
  }
  if (BLOG.APPEARANCE === 'auto') {
    // 系统深色模式或时间是夜间时，强行置为夜间模式
    const date = new Date()
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return (
      prefersDarkMode ||
      (BLOG.APPEARANCE_DARK_TIME &&
        (date.getHours() >= BLOG.APPEARANCE_DARK_TIME[0] ||
          date.getHours() < BLOG.APPEARANCE_DARK_TIME[1]))
    )
  }
  return false
}

/**
 * 读取深色模式
 * @returns {*}
 */
export const loadDarkModeFromLocalStorage = () => {
  return localStorage.getItem('darkMode')
}

/**
 * 保存深色模式
 * @param newTheme
 */
export const saveDarkModeToLocalStorage = newTheme => {
  localStorage.setItem('darkMode', newTheme)
}
