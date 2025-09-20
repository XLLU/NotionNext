import { useUser, useAuth, useClerk } from '@clerk/nextjs'
import { useCallback, useMemo } from 'react'
import { siteConfig } from '@/lib/config'

/**
 * Clerk 认证状态管理 Hook
 * 统一管理用户认证状态，提供简化的 API 供全站使用
 */
export function useClerkAuth() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser()
  const { signOut, isLoaded: authLoaded } = useAuth()
  const { openSignIn, openSignUp, openUserProfile } = useClerk()

  // 判断是否完全加载完成
  const clerkLoaded = typeof authLoaded === 'boolean' ? authLoaded : true
  const isLoaded = userLoaded && clerkLoaded

  const enableAdminProtection = siteConfig('ENABLE_ADMIN_PROTECTION', true)
  const rawAdminEmails = siteConfig('ADMIN_EMAILS', [])
  const adminEmails = useMemo(() => {
    if (Array.isArray(rawAdminEmails)) {
      return rawAdminEmails
    }
    if (typeof rawAdminEmails === 'string') {
      return rawAdminEmails
        .split(',')
        .map(email => email.trim())
        .filter(Boolean)
    }
    return []
  }, [rawAdminEmails])

  // 用户基本信息
  const userInfo = useMemo(() => {
    if (!user || !isSignedIn) return null

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: user.fullName || '',
      username: user.username || '',
      imageUrl: user.imageUrl || '',
      phoneNumber: user.phoneNumbers[0]?.phoneNumber || '',
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt
    }
  }, [user, isSignedIn])

  // 登出函数
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      // 可以在这里添加登出后的重定向逻辑
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [signOut])

  // 打开登录页面
  const handleSignIn = useCallback((redirectUrl = '/') => {
    openSignIn({
      // Keep backward compat while ensuring v5 behavior
      redirectUrl,
      afterSignInUrl: redirectUrl,
      afterSignUpUrl: redirectUrl,
      appearance: {
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-lg'
        }
      }
    })
  }, [openSignIn])

  // 打开注册页面
  const handleSignUp = useCallback((redirectUrl = '/') => {
    openSignUp({
      // Keep backward compat while ensuring v5 behavior
      redirectUrl,
      afterSignInUrl: redirectUrl,
      afterSignUpUrl: redirectUrl,
      appearance: {
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-lg'
        }
      }
    })
  }, [openSignUp])

  // 打开用户资料页面
  const handleUserProfile = useCallback(() => {
    openUserProfile({
      appearance: {
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-lg'
        }
      }
    })
  }, [openUserProfile])

  // 检查用户是否为管理员
  const isAdmin = useMemo(() => {
    if (!enableAdminProtection) return true
    if (!user || !isSignedIn) return false

    const userEmail = user.emailAddresses[0]?.emailAddress
    if (!userEmail) return false

    // 检查用户邮箱是否在管理员列表中
    return adminEmails.includes(userEmail)
  }, [adminEmails, enableAdminProtection, isSignedIn, user])

  // 检查用户是否有特定权限（可扩展）
  const hasPermission = useCallback((permission) => {
    if (!enableAdminProtection) return true
    if (!user || !isSignedIn) return false

    // 检查特定权限
    switch (permission) {
      case 'admin':
        return isAdmin
      case 'analytics':
        return isAdmin
      case 'seo-check':
        return isAdmin
      default:
        // 基础权限：已登录即可
        return true
    }
  }, [enableAdminProtection, user, isAdmin, isSignedIn])

  // 获取用户偏好设置（从 publicMetadata）
  const userPreferences = useMemo(() => {
    if (!user || !isSignedIn) return {}

    return user.publicMetadata || {}
  }, [user, isSignedIn])

  return {
    // 状态
    isLoaded,
    isSignedIn: isSignedIn || false,
    isAdmin,
    user: userInfo,
    userPreferences,

    // 操作函数
    signOut: handleSignOut,
    openSignIn: handleSignIn,
    openSignUp: handleSignUp,
    openUserProfile: handleUserProfile,

    // 工具函数
    hasPermission,

    // 原始 Clerk 对象（如需高级功能）
    rawUser: user,
    clerkLoaded
  }
}

export default useClerkAuth
