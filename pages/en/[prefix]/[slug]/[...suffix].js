import PrefixSlugSuffixPage, {
  getStaticProps as baseGetStaticProps,
  getStaticPaths as baseGetStaticPaths
} from '@/pages/[prefix]/[slug]/[...suffix]'
import {
  withLocaleStaticProps,
  withLocaleStaticPaths
} from '@/lib/utils/staticPropsLocale'

export default PrefixSlugSuffixPage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)

export const getStaticPaths = withLocaleStaticPaths(
  'en',
  baseGetStaticPaths
)
