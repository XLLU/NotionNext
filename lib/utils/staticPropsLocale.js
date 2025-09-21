const localeLangMap = {
  en: 'en-US',
  'en-us': 'en-US',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN'
}

const normalizeLocaleKey = locale => {
  if (!locale || typeof locale !== 'string') {
    return null
  }
  return locale.toLowerCase()
}

const resolveLangValue = locale => {
  const normalized = normalizeLocaleKey(locale)
  if (!normalized) {
    return null
  }
  return localeLangMap[normalized] || locale
}

const applyLocaleToResult = (result, locale) => {
  if (!result || typeof result !== 'object') {
    return result
  }

  if ('props' in result) {
    result.props = result.props || {}
    result.props.NOTION_CONFIG = result.props.NOTION_CONFIG || {}

    const langValue = resolveLangValue(locale)
    if (langValue) {
      result.props.NOTION_CONFIG.LANG = langValue
    }
  }

  return result
}

export const withLocaleStaticProps = (locale, getStaticPropsFn) => {
  if (typeof getStaticPropsFn !== 'function') {
    throw new Error('getStaticPropsFn must be a function')
  }

  return async context => {
    const result = await getStaticPropsFn({
      ...context,
      locale
    })
    return applyLocaleToResult(result, locale)
  }
}

export const withLocaleStaticPaths = (locale, getStaticPathsFn) => {
  if (typeof getStaticPathsFn !== 'function') {
    throw new Error('getStaticPathsFn must be a function')
  }

  return async context => {
    const result = await getStaticPathsFn({
      ...context,
      locale
    })
    return result
  }
}

export const applyLocaleConfig = (props = {}, locale) => {
  if (!props) {
    return props
  }

  props.NOTION_CONFIG = props.NOTION_CONFIG || {}
  const langValue = resolveLangValue(locale)
  if (langValue) {
    props.NOTION_CONFIG.LANG = langValue
  }
  return props
}

