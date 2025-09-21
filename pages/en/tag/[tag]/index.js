import TagDetailPage, {
  getStaticProps as baseGetStaticProps,
  getStaticPaths as baseGetStaticPaths
} from '@/pages/tag/[tag]'
import {
  withLocaleStaticProps,
  withLocaleStaticPaths
} from '@/lib/utils/staticPropsLocale'

export default TagDetailPage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)

export const getStaticPaths = withLocaleStaticPaths(
  'en',
  baseGetStaticPaths
)
