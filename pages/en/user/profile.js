import UserProfile, { getUserProfileStaticProps } from '../../user/profile'

export default UserProfile

export async function getStaticProps() {
  return getUserProfileStaticProps({ from: 'user-profile-en', locale: 'en' })
}
