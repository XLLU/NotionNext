import CategoryIndexPage, {
  getStaticProps as baseGetStaticProps
} from '@/pages/category'
import { withLocaleStaticProps } from '@/lib/utils/staticPropsLocale'

export default CategoryIndexPage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)
