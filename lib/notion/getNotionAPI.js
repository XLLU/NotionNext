import { NotionAPI as NotionLibrary } from 'notion-client'
import BLOG from '@/blog.config'

const notionAPI = getNotionAPI()

function getNotionAPI() {
  return new NotionLibrary({
    activeUser: BLOG.NOTION_ACTIVE_USER || null,
    authToken: BLOG.NOTION_TOKEN_V2 || null,
    userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    kyOptions: {
      mode:'cors'
      // Removed problematic URL replacement hooks that cause 406 errors
    }
  })
}

export default notionAPI
