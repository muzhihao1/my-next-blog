/** * 文章类型定义 */ export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  lastEdited: string;
  category: string;
  tags: string[];
  readingTime: number;
  published: boolean;
}
