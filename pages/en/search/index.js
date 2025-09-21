import SearchIndexPage, {
  getStaticProps as baseGetStaticProps
} from '@/pages/search'
import { withLocaleStaticProps } from '@/lib/utils/staticPropsLocale'

export default SearchIndexPage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)
