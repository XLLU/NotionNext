import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

/**
 * 高阶组件：为页面或组件添加认证保护
 * @param {React.Component} WrappedComponent 需要保护的组件
 * @param {Object} options 配置选项
 * @returns {React.Component} 包装后的组件
 */
export function withAuth(WrappedComponent, options = {}) {
  const {
    redirectTo = '/sign-in',
    loadingComponent = DefaultLoadingComponent,
    unauthorizedComponent = DefaultUnauthorizedComponent,
    requirePermission = null
  } = options

  return function AuthenticatedComponent(props) {
    const { isLoaded, isSignedIn, user, hasPermission, openSignIn } = useGlobal()
    const router = useRouter()

    useEffect(() => {
      if (isLoaded && !isSignedIn) {
        // 保存当前页面路径，用于登录后重定向
        const currentPath = router.asPath
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterSignIn', currentPath)
        }

        // 如果指定了重定向路径，则跳转
        if (redirectTo) {
          router.push(redirectTo)
        }
      }
    }, [isLoaded, isSignedIn, router])

    // 加载状态
    if (!isLoaded) {
      return loadingComponent ? loadingComponent(props) : <DefaultLoadingComponent />
    }

    // 未登录状态
    if (!isSignedIn) {
      return unauthorizedComponent
        ? unauthorizedComponent({ ...props, openSignIn, redirectTo })
        : <DefaultUnauthorizedComponent openSignIn={openSignIn} />
    }

    // 权限检查
    if (requirePermission && !hasPermission(requirePermission)) {
      return <DefaultPermissionDeniedComponent permission={requirePermission} />
    }

    // 已登录且有权限，渲染原组件
    return <WrappedComponent {...props} user={user} />
  }
}

/**
 * 默认加载组件
 */
function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">正在验证身份...</p>
      </div>
    </div>
  )
}

/**
 * 默认未授权组件
 */
function DefaultUnauthorizedComponent({ openSignIn }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <i className="fas fa-lock text-6xl text-gray-400 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">需要登录</h1>
          <p className="text-gray-600 dark:text-gray-400">
            此页面需要登录后才能访问，请先登录您的账户。
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => openSignIn()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            立即登录
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            还没有账户？
            <a href="/sign-up" className="text-blue-600 hover:text-blue-700 ml-1">
              立即注册
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * 默认权限不足组件
 */
function DefaultPermissionDeniedComponent({ permission }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <i className="fas fa-ban text-6xl text-red-400 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">权限不足</h1>
          <p className="text-gray-600 dark:text-gray-400">
            您没有访问此页面的权限。
            {permission && (
              <span className="block mt-2 text-sm">
                需要权限：<code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{permission}</code>
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          返回
        </button>
      </div>
    </div>
  )
}

/**
 * 组件级认证保护装饰器
 * 用于包装需要认证的组件
 */
export function ProtectedContent({
  children,
  fallback = null,
  requirePermission = null,
  className = ''
}) {
  const { isLoaded, isSignedIn, hasPermission, openSignIn } = useGlobal()

  // 加载状态
  if (!isLoaded) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-32 ${className}`}></div>
    )
  }

  // 未登录状态
  if (!isSignedIn) {
    return fallback || (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center ${className}`}>
        <i className="fas fa-lock text-3xl text-gray-400 mb-3"></i>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">需要登录</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          此内容需要登录后才能查看
        </p>
        <button
          onClick={() => openSignIn()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          立即登录
        </button>
      </div>
    )
  }

  // 权限检查
  if (requirePermission && !hasPermission(requirePermission)) {
    return fallback || (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
          <span className="text-red-700 dark:text-red-400 text-sm">
            权限不足，无法查看此内容
          </span>
        </div>
      </div>
    )
  }

  // 已登录且有权限，显示内容
  return <div className={className}>{children}</div>
}

export default withAuth