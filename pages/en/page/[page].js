import PaginationPage, {
  getStaticProps as baseGetStaticProps,
  getStaticPaths as baseGetStaticPaths
} from '@/pages/page/[page]'
import {
  withLocaleStaticProps,
  withLocaleStaticPaths
} from '@/lib/utils/staticPropsLocale'

export default PaginationPage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)

export const getStaticPaths = withLocaleStaticPaths(
  'en',
  baseGetStaticPaths
)
