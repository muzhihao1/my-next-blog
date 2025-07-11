import { redirect } from 'next/navigation'

export default function PostsPage() {
  // 将 /posts 重定向到 /blog
  redirect('/blog')
}