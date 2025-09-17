import { useGlobal } from '@/lib/global'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment } from 'react'

/**
 * 用户登录状态控件
 * 根据用户登录状态显示不同的内容：
 * - 未登录：显示登录按钮
 * - 已登录：显示用户头像和下拉菜单
 */
export default function UserButton({ className = '', size = 'md' }) {
  const {
    isLoaded,
    isSignedIn,
    user,
    openSignIn,
    openUserProfile,
    signOut,
    locale,
    lang
  } = useGlobal()
  const router = useRouter()

  // 根据当前路由确定用户中心页面URL
  const getUserProfileUrl = () => {
    const currentPath = router.asPath ? router.asPath.split('?')[0] : '/'
    const prefixMatch = currentPath.match(/^\/([^/]+)(?=\/|$)/)
    const pathPrefix = prefixMatch?.[1]
    const normalizedLang = lang?.toLowerCase()
    const isEnglish =
      normalizedLang?.startsWith('en') || pathPrefix?.toLowerCase() === 'en'

    return `${isEnglish ? '/en' : ''}/user/profile`
  }

  // 尺寸样式配置
  const sizeConfig = {
    sm: {
      avatar: 'w-6 h-6',
      text: 'text-xs px-2 py-0.5',
      button: 'w-6 h-6'
    },
    md: {
      avatar: 'w-8 h-8',
      text: 'text-sm px-3 py-1',
      button: 'w-8 h-8'
    },
    lg: {
      avatar: 'w-10 h-10',
      text: 'text-base px-4 py-1.5',
      button: 'w-10 h-10'
    }
  }

  const config = sizeConfig[size] || sizeConfig.md

  // 加载状态
  if (!isLoaded) {
    return (
      <div className={`${config.button} ${className}`}>
        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full w-full h-full"></div>
      </div>
    )
  }

  // 未登录状态 - 显示登录按钮
  if (!isSignedIn) {
    return (
      <button
        onClick={() => openSignIn()}
        className={`
          ${config.text} ${className}
          flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-600
          bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
          hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          whitespace-nowrap min-w-fit
        `}
      >
        <i className="fas fa-sign-in-alt text-xs"></i>
        <span className="hidden sm:inline-block">{locale.COMMON.SIGN_IN}</span>
      </button>
    )
  }

  // 已登录状态 - 显示用户头像和下拉菜单
  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <div>
        <Menu.Button
          className={`
            ${config.avatar} rounded-full border-2 border-gray-200 dark:border-gray-600
            hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200
          `}
          onClick={(e) => {
            // 单击直接跳转到个人中心页面
            e.preventDefault()
            window.location.href = getUserProfileUrl()
          }}
          onContextMenu={(e) => {
            // 右键显示下拉菜单（阻止默认右键菜单）
            e.preventDefault()
            // 手动触发 Menu 的打开状态（需要额外处理）
          }}
        >
          <img
            className="w-full h-full rounded-full object-cover"
            src={user?.imageUrl || '/avatar/default.svg'}
            alt={user?.fullName || user?.email || '用户头像'}
            onError={(e) => {
              e.target.src = '/avatar/default.svg'
            }}
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Panel className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* 用户信息区域 */}
          <div className="px-4 py-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.fullName || user?.firstName || '用户'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </div>
          </div>

          {/* 菜单选项 */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={getUserProfileUrl()}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <i className="fas fa-user mr-3 h-4 w-4" />
                  {locale?.USER?.PROFILE || '个人中心'}
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => openUserProfile()}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  <i className="fas fa-cog mr-3 h-4 w-4" />
                  {locale?.USER?.ACCOUNT_MANAGEMENT || '账户设置'}
                </button>
              )}
            </Menu.Item>
          </div>

          {/* 登出区域 */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  <i className="fas fa-sign-out-alt mr-3 h-4 w-4" />
                  {locale?.COMMON?.SIGN_OUT || '退出登录'}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Panel>
      </Transition>
    </Menu>
  )
}

/**
 * 移动端用户按钮组件
 * 专门为移动端侧边抽屉设计的用户状态控件
 */
export function UserButtonMobile({ className = '' }) {
  const {
    isLoaded,
    isSignedIn,
    user,
    openSignIn,
    openUserProfile,
    signOut,
    locale,
    lang
  } = useGlobal()
  const router = useRouter()

  // 根据当前路由确定用户中心页面URL
  const getUserProfileUrl = () => {
    const currentPath = router.asPath ? router.asPath.split('?')[0] : '/'
    const prefixMatch = currentPath.match(/^\/([^/]+)(?=\/|$)/)
    const pathPrefix = prefixMatch?.[1]
    const normalizedLang = lang?.toLowerCase()
    const isEnglish =
      normalizedLang?.startsWith('en') || pathPrefix?.toLowerCase() === 'en'

    return `${isEnglish ? '/en' : ''}/user/profile`
  }

  // 加载状态
  if (!isLoaded) {
    return (
      <div className={`animate-pulse flex items-center space-x-3 px-4 py-3 ${className}`}>
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // 未登录状态
  if (!isSignedIn) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-sm font-medium text-gray-900 dark:text-white">{locale.COMMON.USER_CENTER || 'User Center'}</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => openSignIn()}
            className="duration-200 hover:text-white hover:shadow-md flex cursor-pointer justify-center items-center px-3 py-2 border dark:border-gray-600 bg-white hover:bg-blue-600 dark:bg-[#1e1e1e] rounded-lg text-sm"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            {locale.COMMON.SIGN_IN}
          </button>
          <Link
            href="/sign-up"
            className="duration-200 hover:text-white hover:shadow-md flex cursor-pointer justify-center items-center px-3 py-2 border dark:border-gray-600 bg-white hover:bg-green-600 dark:bg-[#1e1e1e] rounded-lg text-sm"
          >
            <i className="fas fa-user-plus mr-2"></i>
            {locale.COMMON.SIGN_UP || 'Sign Up'}
          </Link>
        </div>
      </div>
    )
  }

  // 已登录状态
  return (
    <div className={`space-y-3 ${className}`}>
      {/* 用户信息 */}
      <div className="flex items-center space-x-3 px-2">
        <img
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
          src={user?.imageUrl || '/avatar/default.svg'}
          alt={user?.fullName || user?.email || '用户头像'}
          onError={(e) => {
            e.target.src = '/avatar/default.svg'
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {user?.fullName || user?.firstName || '用户'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user?.email}
          </div>
        </div>
      </div>

      {/* 功能按钮 */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={getUserProfileUrl()}
          className="duration-200 hover:text-white hover:shadow-md flex cursor-pointer justify-center items-center px-3 py-2 border dark:border-gray-600 bg-white hover:bg-blue-600 dark:bg-[#1e1e1e] rounded-lg text-sm"
        >
          <i className="fas fa-user mr-2"></i>
          {locale?.USER?.PROFILE || '个人中心'}
        </Link>
        <button
          onClick={() => openUserProfile()}
          className="duration-200 hover:text-white hover:shadow-md flex cursor-pointer justify-center items-center px-3 py-2 border dark:border-gray-600 bg-white hover:bg-gray-600 dark:bg-[#1e1e1e] rounded-lg text-sm"
        >
          <i className="fas fa-cog mr-2"></i>
          {locale?.USER?.PREFERENCES || '设置'}
        </button>
      </div>

      {/* 登出按钮 */}
      <button
        onClick={() => signOut()}
        className="w-full duration-200 hover:text-white hover:shadow-md flex cursor-pointer justify-center items-center px-3 py-2 border dark:border-gray-600 bg-white hover:bg-red-600 dark:bg-[#1e1e1e] rounded-lg text-sm"
      >
        <i className="fas fa-sign-out-alt mr-2"></i>
        {locale?.COMMON?.SIGN_OUT || '退出登录'}
      </button>
    </div>
  )
}
