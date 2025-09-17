import { NotionAPI as NotionLibrary } from 'notion-client'
import BLOG from '@/blog.config'

const notionAPI = getNotionAPI()

function getNotionAPI() {
  return new NotionLibrary({
    activeUser: BLOG.NOTION_ACTIVE_USER || null,
    authToken: BLOG.NOTION_TOKEN_V2 || null,
    userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    kyOptions: {
      mode: 'cors',
      headers: {
        // Some Notion edge locations reject requests without a browser-like UA/origin pair
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        origin: 'https://www.notion.so',
        referer: 'https://www.notion.so/',
        'accept-language': 'en-US,en;q=0.9'
      }
      // Removed problematic URL replacement hooks that cause 406 errors
    }
  })
}

export default notionAPI
