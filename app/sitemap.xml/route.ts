import { NextResponse }
from 'next/server' 

import { getAllPostSlugs }
from '@/lib/notion' 

import { getProjects }
from '@/lib/notion/projects' 

import { getBooks }
from '@/lib/notion/books' 

import { getTools }
from '@/lib/notion/tools' 

import { fallbackPosts }
from '@/lib/fallback-posts' 

import { fallbackProjects }
from '@/lib/fallback-projects' 

import { fallbackBooks }
from '@/lib/fallback-books' 

import { fallbackTools }
from '@/lib/fallback-tools' export const dynamic = 'force-static' export const revalidate = 3600 // 1 hour export async function GET() { try { const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com' // Get all dynamic paths with fallback let postSlugs: string[] = []
let projects = await getProjects() let books = await getBooks() let tools = await getTools() // Use fallback data if Notion data is not available try { postSlugs = await getAllPostSlugs() }
catch { postSlugs = fallbackPosts.map(post => post.slug) }
if (projects.length === 0) { projects = fallbackProjects }
if (books.length === 0) { books = fallbackBooks }
if (tools.length === 0) { tools = fallbackTools }
// Static pages const staticPages = [ '', '/about', '/posts', '/projects', '/bookshelf', '/tools', '/archive', '/privacy', '/terms', '/stats', ] // Generate sitemap XML const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> ${staticPages.map(page => ` <url>
<loc>${baseUrl}
${page}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
<priority>${page === '' ? '1.0' : '0.8'}</priority> </url>`).join('')}
${postSlugs.map(slug => ` <url>
<loc>${baseUrl}/posts/${slug}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.7</priority> </url>`).join('')}
${projects.map(project => ` <url>
<loc>${baseUrl}/projects/${project.slug}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.7</priority> </url>`).join('')}
${books.map(book => ` <url>
<loc>${baseUrl}/bookshelf/${book.id}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority> </url>`).join('')}
${tools.map(tool => ` <url>
<loc>${baseUrl}/tools/${tool.slug}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority> </url>`).join('')} </urlset>` return new NextResponse(sitemap, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', }, }) }
catch (error) { console.error('Error generating sitemap:', error) // Return a minimal sitemap on error const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<changefreq>daily</changefreq>
<priority>1.0</priority> </url> </urlset>` return new NextResponse(minimalSitemap, { headers: { 'Content-Type': 'application/xml; charset=utf-8', }, }) } }