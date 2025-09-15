/**
 * HEO Theme Authentication Banner Component
 * 认证页面顶部横幅组件
 * @param {string} title - 页面标题
 * @param {string} description - 页面描述
 * @returns {JSX.Element}
 */
export const Banner = ({ title, description }) => {
  return (
    <div className='relative overflow-hidden bg-white dark:bg-[#1e1e1e] py-16 px-6'>
      {/* 背景装饰 */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 opacity-50'></div>

      <div className='relative mx-auto max-w-4xl text-center'>
        <h1 className='mb-6 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl'>
          {title}
        </h1>
        <p className='mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300'>
          {description}
        </p>

        {/* 装饰性分割线 */}
        <div className='mt-8 flex justify-center'>
          <div className='h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full'></div>
        </div>
      </div>
    </div>
  )
}