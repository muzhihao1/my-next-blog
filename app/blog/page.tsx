import { getPublishedPosts, withFallback }
from "@/lib/notion";
import { getFallbackPosts }
from "@/lib/fallback-posts";
import BlogClient from "./BlogClient";

// ISR配置：每30分钟重新验证一次 
export const revalidate = 1800 

export default async function BlogPage() { 
  const posts = await withFallback( 
    () => getPublishedPosts(), 
    getFallbackPosts() 
  )
  
  return <BlogClient posts={posts} />
}
