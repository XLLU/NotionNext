import SEO from '@/components/SEO'
import { useGlobal } from '@/lib/global'
import { useEffect } from 'react'
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from '@clerk/nextjs'

/**
 * 个人中心页面
 * 需要用户登录才能访问
 */
export default function UserProfile(props) {
  const global = useGlobal()
  const { isLoaded, isSignedIn, openSignIn, locale } = global
  const userText = locale?.USER || {}
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  const loadingView = (
    <LoadingState message={userText.LOADING ?? '加载中...'} />
  )

  const signedOutView = (
    <SignInPrompt
      messageTitle={userText.LOGIN_REQUIRED ?? '需要登录'}
      messageBody={userText.LOGIN_TO_ACCESS ?? '请先登录以访问个人中心'}
      ctaLabel={userText.LOGIN_NOW ?? '立即登录'}
      onSignIn={openSignIn}
      autoOpen={clerkEnabled}
    />
  )

  const signedInView = <ProfileLayout />

  if (clerkEnabled) {
    return (
      <>
        <SEO {...props} />
        <ClerkLoading>{loadingView}</ClerkLoading>
        <ClerkLoaded>
          <SignedIn>{signedInView}</SignedIn>
          <SignedOut>{signedOutView}</SignedOut>
        </ClerkLoaded>
      </>
    )
  }

  if (!isLoaded) {
    return loadingView
  }

  if (!isSignedIn) {
    return signedOutView
  }

  return (
    <>
      <SEO {...props} />
      {signedInView}
    </>
  )
}

function LoadingState({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

function SignInPrompt({ messageTitle, messageBody, ctaLabel, onSignIn, autoOpen }) {
  useEffect(() => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    if (currentUrl) {
      sessionStorage.setItem('redirectAfterSignIn', currentUrl)
    }
    if (autoOpen) {
      onSignIn?.()
    }
  }, [autoOpen, onSignIn])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <i className="fas fa-lock text-6xl text-gray-400 mb-4"></i>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {messageTitle}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{messageBody}</p>
        <button
          onClick={() => onSignIn?.()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}

function ProfileLayout() {
  const { locale, user } = useGlobal()
  const userText = locale?.USER || {}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {userText.PROFILE ?? '个人中心'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {userText.MANAGE_ACCOUNT ?? '管理您的账户信息和偏好设置'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <UserInfoCard user={user} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <AccountManagementCard />
            <SecurityCard />
            <PreferencesCard />
          </div>
        </div>
      </div>
    </div>
  )
}

function UserInfoCard({ user }) {
  const { locale, lang } = useGlobal()
  const userText = locale?.USER || {}
  const unknownText =
    userText.UNKNOWN ?? (lang?.startsWith('en') ? 'Unknown' : '未知')
  const displayLang = lang || 'zh-CN'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center">
        <div className="relative mx-auto w-24 h-24 mb-4">
          <img
            className="w-full h-full rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
            src={user?.imageUrl || '/avatar/default.svg'}
            alt={user?.fullName || userText.AVATAR_ALT || '用户头像'}
            onError={e => {
              e.target.src = '/avatar/default.svg'
            }}
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          {user?.fullName || user?.firstName || userText.DEFAULT_NAME || '用户'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
        {user?.phoneNumber && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {user.phoneNumber}
          </p>
        )}

        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <i className="fas fa-check-circle mr-1"></i>
            {userText.VERIFIED ?? '已验证'}
          </span>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <i className="fas fa-calendar-alt mr-1"></i>
          {userText.JOINED ?? '加入于'}{' '}
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString(displayLang)
            : unknownText}
        </div>
      </div>
    </div>
  )
}

function AccountManagementCard() {
  const { openUserProfile, locale } = useGlobal()
  const userText = locale?.USER || {}

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        <i className="fas fa-user-cog mr-2"></i>
        {userText.ACCOUNT_MANAGEMENT ?? '账户管理'}
      </h3>
      <div className="space-y-3">
        <button
          onClick={() => openUserProfile()}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            <i className="fas fa-edit text-blue-500 mr-3"></i>
            <span className="text-gray-900 dark:text-white">
              {userText.EDIT_PROFILE ?? '编辑个人资料'}
            </span>
          </div>
          <i className="fas fa-chevron-right text-gray-400"></i>
        </button>

        <button
          onClick={() => openUserProfile()}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            <i className="fas fa-key text-green-500 mr-3"></i>
            <span className="text-gray-900 dark:text-white">
              {userText.CHANGE_PASSWORD ?? '更改密码'}
            </span>
          </div>
          <i className="fas fa-chevron-right text-gray-400"></i>
        </button>
      </div>
    </div>
  )
}

function SecurityCard() {
  const { user, locale, lang } = useGlobal()
  const userText = locale?.USER || {}
  const unknownText =
    userText.UNKNOWN ?? (lang?.startsWith('en') ? 'Unknown' : '未知')
  const displayLang = lang || 'zh-CN'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        <i className="fas fa-shield-alt mr-2"></i>
        {userText.SECURITY_SETTINGS ?? '安全设置'}
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-clock text-blue-500 mr-3"></i>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userText.LAST_LOGIN ?? '最后登录时间'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.lastSignInAt
                  ? new Date(user.lastSignInAt).toLocaleString(displayLang)
                  : unknownText}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-fingerprint text-green-500 mr-3"></i>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userText.LOGIN_METHOD ?? '登录方式'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userText.EMAIL_PASSWORD_OAUTH ?? '邮箱密码 + Google OAuth'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreferencesCard() {
  const { isDarkMode, toggleDarkMode, lang, locale } = useGlobal()
  const userText = locale?.USER || {}

  const languageLabel =
    lang === 'zh-CN'
      ? userText.LANGUAGE_ZH ?? '简体中文'
      : lang === 'en-US'
        ? userText.LANGUAGE_EN ?? 'English'
        : lang

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        <i className="fas fa-cog mr-2"></i>
        {userText.PREFERENCES ?? '偏好设置'}
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-center">
            <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'} text-yellow-500 mr-3`}></i>
            <span className="text-gray-900 dark:text-white">
              {userText.DARK_MODE ?? '深色模式'}
            </span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-language text-purple-500 mr-3"></i>
            <span className="text-gray-900 dark:text-white">
              {userText.LANGUAGE ?? '语言'}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{languageLabel}</span>
        </div>
      </div>
    </div>
  )
}

export async function getUserProfileStaticProps({ from = 'user-profile', locale } = {}) {
  const { getGlobalData } = await import('@/lib/db/getSiteData')
  const props = await getGlobalData({ from, locale })

  if (locale && props?.NOTION_CONFIG) {
    const normalizedLocale = locale.toLowerCase()
    if (normalizedLocale.startsWith('en')) {
      props.NOTION_CONFIG.LANG = 'en-US'
    }
  }

  return {
    props,
    revalidate: parseInt(process.env.NEXT_REVALIDATE_SECOND || 3600, 10)
  }
}

export async function getStaticProps() {
  return getUserProfileStaticProps()
}
