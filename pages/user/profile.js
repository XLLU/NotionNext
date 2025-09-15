import { getGlobalData } from '@/lib/db/getSiteData'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { LayoutBase } from '@/themes/heo'

/**
 * 个人中心页面
 * 需要用户登录才能访问
 */
export default function UserProfile(props) {
  const { isLoaded, isSignedIn, user, openSignIn } = useGlobal()
  const router = useRouter()

  // 检查登录状态，未登录则打开登录模态框
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // 保存当前URL，登录后重定向回来
      const currentUrl = window.location.href
      sessionStorage.setItem('redirectAfterSignIn', currentUrl)

      // 打开登录模态框而不是跳转页面
      openSignIn()
    }
  }, [isLoaded, isSignedIn, openSignIn])

  // 加载状态
  if (!isLoaded) {
    return (
      <LayoutBase {...props}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </LayoutBase>
    )
  }

  // 未登录状态（这里通常不会显示，因为会重定向）
  if (!isSignedIn) {
    return (
      <LayoutBase {...props}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-lock text-6xl text-gray-400 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">需要登录</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">请先登录以访问个人中心</p>
            <button
              onClick={() => openSignIn()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即登录
            </button>
          </div>
        </div>
      </LayoutBase>
    )
  }

  // 已登录状态 - 显示个人中心内容
  return (
    <LayoutBase {...props}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">个人中心</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">管理您的账户信息和偏好设置</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：用户信息卡片 */}
            <div className="lg:col-span-1">
              <UserInfoCard user={user} />
            </div>

            {/* 右侧：功能面板 */}
            <div className="lg:col-span-2 space-y-6">
              <AccountManagementCard />
              <SecurityCard />
              <PreferencesCard />
            </div>
          </div>
        </div>
      </div>
    </LayoutBase>
  )
}

/**
 * 用户信息卡片
 */
function UserInfoCard({ user }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center">
        {/* 用户头像 */}
        <div className="relative mx-auto w-24 h-24 mb-4">
          <img
            className="w-full h-full rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
            src={user?.imageUrl || '/avatar/default.svg'}
            alt={user?.fullName || '用户头像'}
            onError={(e) => {
              e.target.src = '/avatar/default.svg'
            }}
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>

        {/* 用户基本信息 */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          {user?.fullName || user?.firstName || '用户'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {user?.email}
        </p>
        {user?.phoneNumber && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {user.phoneNumber}
          </p>
        )}

        {/* 账户状态 */}
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <i className="fas fa-check-circle mr-1"></i>
            已验证
          </span>
        </div>

        {/* 加入时间 */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <i className="fas fa-calendar-alt mr-1"></i>
          加入于 {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '未知'}
        </div>
      </div>
    </div>
  )
}

/**
 * 账户管理卡片
 */
function AccountManagementCard() {
  const { openUserProfile } = useGlobal()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        <i className="fas fa-user-cog mr-2"></i>
        账户管理
      </h3>
      <div className="space-y-3">
        <button
          onClick={() => openUserProfile()}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            <i className="fas fa-edit text-blue-500 mr-3"></i>
            <span className="text-gray-900 dark:text-white">编辑个人资料</span>
          </div>
          <i className="fas fa-chevron-right text-gray-400"></i>
        </button>

        <button
          onClick={() => openUserProfile()}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            <i className="fas fa-key text-green-500 mr-3"></i>
            <span className="text-gray-900 dark:text-white">更改密码</span>
          </div>
          <i className="fas fa-chevron-right text-gray-400"></i>
        </button>
      </div>
    </div>
  )
}

/**
 * 安全设置卡片
 */
function SecurityCard() {
  const { user } = useGlobal()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        <i className="fas fa-shield-alt mr-2"></i>
        安全设置
      </h3>
      <div className="space-y-4">
        {/* 最后登录时间 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-clock text-blue-500 mr-3"></i>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">最后登录时间</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString('zh-CN') : '未知'}
              </p>
            </div>
          </div>
        </div>

        {/* 登录方式 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-fingerprint text-green-500 mr-3"></i>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">登录方式</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">邮箱密码 + Google OAuth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 偏好设置卡片
 */
function PreferencesCard() {
  const { isDarkMode, toggleDarkMode, lang, locale } = useGlobal()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        <i className="fas fa-cog mr-2"></i>
        偏好设置
      </h3>
      <div className="space-y-4">
        {/* 主题设置 */}
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-center">
            <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'} text-yellow-500 mr-3`}></i>
            <span className="text-gray-900 dark:text-white">深色模式</span>
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

        {/* 语言设置 */}
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-language text-purple-500 mr-3"></i>
            <span className="text-gray-900 dark:text-white">语言</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'zh-CN' ? '简体中文' : lang === 'en-US' ? 'English' : lang}
          </span>
        </div>
      </div>
    </div>
  )
}

export async function getStaticProps() {
  const props = await getGlobalData({ from: 'user-profile' })
  return {
    props,
    revalidate: parseInt(process.env.NEXT_REVALIDATE_SECOND || 3600)
  }
}