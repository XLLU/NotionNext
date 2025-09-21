import DashboardPage, {
  getStaticProps as baseGetStaticProps,
  getStaticPaths as baseGetStaticPaths
} from '@/pages/dashboard/[[...index]]'
import {
  withLocaleStaticProps,
  withLocaleStaticPaths
} from '@/lib/utils/staticPropsLocale'

export default DashboardPage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)

export const getStaticPaths = withLocaleStaticPaths(
  'en',
  baseGetStaticPaths
)
