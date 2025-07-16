/** * 书架页面 * @module app/bookshelf/page */
import { getBooks } from '@/lib/notion/books' 
import BookshelfClient from './BookshelfClient' 

/** * 书架页面组件 * @async * @function BookshelfPage * @returns {Promise<JSX.Element>} 渲染的书架页面 * @description 服务端组件，负责从 Notion 获取书籍数据并传递给客户端组件。 * 当 Notion 不可用时会自动使用后备数据确保页面正常显示。 * @example * // 在路由中访问 /bookshelf */
export default async function BookshelfPage() { 
  // 尝试从 Notion 获取数据，失败时使用后备数据 
  const books = await getBooks() 
  
  return <BookshelfClient books={books} /> 
}