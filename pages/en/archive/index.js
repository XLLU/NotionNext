import ArchivePage, {
  getStaticProps as baseGetStaticProps
} from '@/pages/archive'
import { withLocaleStaticProps } from '@/lib/utils/staticPropsLocale'

export default ArchivePage

export const getStaticProps = withLocaleStaticProps('en', baseGetStaticProps)
