import TagPaginationPage, {
  getStaticProps as baseGetStaticProps,
  getStaticPaths as baseGetStaticPaths
} from '@/pages/tag/[tag]/page/[page]'
import {
  withLocaleStaticProps,
  withLocaleStaticPaths
} from '@/lib/utils/staticPropsLocale'

export default TagPaginationPage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)

export const getStaticPaths = withLocaleStaticPaths(
  'en',
  baseGetStaticPaths
)
