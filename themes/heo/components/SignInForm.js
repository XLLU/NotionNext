import { useState } from 'react'

/**
 * HEO Theme Custom Sign In Form
 * 自定义登录表单组件 (当 Clerk 未启用时使用)
 * @returns {JSX.Element}
 */
export const SignInForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // 这里可以添加自定义登录逻辑
    alert('自定义登录功能需要后端支持，当前仅作演示')
  }

  return (
    <div className='mx-auto max-w-md px-6 py-12'>
      <div className='rounded-2xl bg-white p-8 shadow-xl dark:bg-[#1e1e1e] dark:shadow-gray-900/30'>
        <div className='mb-8 text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            登录您的账户
          </h2>
          <p className='mt-2 text-gray-600 dark:text-gray-300'>
            欢迎回来！请登录以继续
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              邮箱地址
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              required
              className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
              placeholder='请输入邮箱地址'
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              密码
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleInputChange}
              required
              className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
              placeholder='请输入密码'
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700'
              />
              <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-700 dark:text-gray-300'>
                记住我
              </label>
            </div>

            <div className='text-sm'>
              <a href='#' className='font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400'>
                忘记密码？
              </a>
            </div>
          </div>

          <div>
            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:focus:ring-offset-gray-800'
            >
              登录
            </button>
          </div>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            还没有账户？{' '}
            <a href='/sign-up' className='font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400'>
              立即注册
            </a>
          </p>
        </div>

        <div className='mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800'>
          <p className='text-sm text-amber-800 dark:text-amber-200 text-center'>
            <span className='font-medium'>演示模式：</span>
            当前为自定义表单演示，完整功能需要配置 Clerk 或其他认证服务
          </p>
        </div>
      </div>
    </div>
  )
}