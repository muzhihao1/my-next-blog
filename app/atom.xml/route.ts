/** * Atom Feed Route Handler * @module app/atom.xml/route * @description 动态生成 Atom 1.0 订阅源 */
import { getAllPosts }
from '@/lib/notion' 

import { NextResponse }
from 'next/server' 

import type { BlogPost }
from '@/types/notion' 

export const dynamic = 'force-static' 

/** * 转义 XML 特殊字符 * @param {string}
str - 需要转义的字符串 * @returns {string} 转义后的字符串 */
function escapeXml(str: string): string { 
  if (!str) return '' 
  
  const xmlEscapeMap: Record<string, string> = { 
    '&': '&amp;', 
    '<': '&lt;', 
    '>': '&gt;', 
    '"': '&quot;', 
    "'": '&apos;' 
  }
return str.replace(/[&<>"']/g, (char) => xmlEscapeMap[char] || char) 
}
/** * 生成 Atom feed * @returns {Response}
Atom XML 响应 */
export async function GET() { 
  try { 
    const posts = await getAllPosts() 
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com' 
    
    const entries = posts 
      .slice(0, 20) 
      .map((post: BlogPost) => { 
        const postUrl = `${baseUrl}/posts/${post.slug}` 
        const updated = post.lastEditedTime || post.date 
        
        return ` <entry>
<title>${escapeXml(post.title)}</title>
<link href="${postUrl}" />
<id>${postUrl}</id>
<updated>${new Date(updated).toISOString()}</updated>
<published>${new Date(post.date).toISOString()}</published>
<author>
<name>${escapeXml(post.author.name)}</name> </author>
<summary>${escapeXml(post.excerpt || post.title)}</summary>
    ${post.tags?.map((tag: string) => `<category term="${escapeXml(tag)}" />`).join('') || ''}
  </entry>`
      })
      .join('\n')
    
    const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>无题之墨</title>
<link href="${baseUrl}" />
<link href="${baseUrl}/atom.xml" rel="self" />
<updated>${new Date().toISOString()}</updated>
<id>${baseUrl}/</id>
<author>
<name>Zhihao Mu</name> </author>
<subtitle>分享技术见解、展示项目成果、记录学习历程</subtitle>
<generator>Next.js Blog Atom Generator</generator>
${entries}
</feed>`
    
    return new NextResponse(atomFeed, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  }
  catch (error) {
    console.error('Error generating Atom feed:', error)
    const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>无题之墨</title>
<link href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}" />
<updated>${new Date().toISOString()}</updated>
<id>${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/</id>
<subtitle>Atom feed temporarily unavailable</subtitle>
</feed>`
    
    return new NextResponse(emptyFeed, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8'
      }
    })
  }
}