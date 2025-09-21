import TagIndexPage, {
  getStaticProps as baseGetStaticProps
} from '@/pages/tag'
import { withLocaleStaticProps } from '@/lib/utils/staticPropsLocale'

export default TagIndexPage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)
