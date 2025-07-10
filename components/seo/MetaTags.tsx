/** * Meta标签优化组件 * 提供全面的SEO元标签管理 */
import Head from 'next/head' interface MetaTagsProps { // 基础信息 title: string description: string keywords?: string[]
author?: string // Open Graph ogType?: 'website' | 'article' | 'profile' | 'book' | 'video' ogTitle?: string ogDescription?: string ogImage?: string ogUrl?: string ogSiteName?: string ogLocale?: string // Twitter Card twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player' twitterSite?: string twitterCreator?: string twitterTitle?: string twitterDescription?: string twitterImage?: string // 文章特定 publishedTime?: string modifiedTime?: string section?: string tags?: string[] // 其他 canonical?: string robots?: string googlebot?: string viewport?: string themeColor?: string manifest?: string favicon?: string appleTouchIcon?: string }
export function MetaTags({ // 基础信息 title, description, keywords, author = '无题之墨', // Open Graph ogType = 'website', ogTitle, ogDescription, ogImage, ogUrl, ogSiteName = '无题之墨', ogLocale = 'zh_CN', // Twitter Card twitterCard = 'summary_large_image', twitterSite, twitterCreator, twitterTitle, twitterDescription, twitterImage, // 文章特定 publishedTime, modifiedTime, section, tags, // 其他 canonical, robots = 'index, follow', googlebot = 'index, follow', viewport = 'width=device-width, initial-scale=1', themeColor = '#000000', manifest = '/manifest.json', favicon = '/favicon.ico', appleTouchIcon = '/apple-touch-icon.png', }: MetaTagsProps) { return ( <Head> {/* 基础Meta标签 */}
<title>{title}</title>
<meta name="description" content={description}
/> {keywords && keywords.length > 0 && ( <meta name="keywords" content={keywords.join(', ')}
/> )}
<meta name="author" content={author}
/>
<meta name="viewport" content={viewport}
/>
<meta name="theme-color" content={themeColor}
/> {/* 机器人标签 */}
<meta name="robots" content={robots}
/>
<meta name="googlebot" content={googlebot}
/> {/* Canonical URL */} {canonical && <link rel="canonical" href={canonical}
/>} {/* Open Graph标签 */}
<meta property="og:type" content={ogType}
/>
<meta property="og:title" content={ogTitle || title}
/>
<meta property="og:description" content={ogDescription || description}
/> {ogImage && <meta property="og:image" content={ogImage}
/>} {ogUrl && <meta property="og:url" content={ogUrl}
/>}
<meta property="og:site_name" content={ogSiteName}
/>
<meta property="og:locale" content={ogLocale}
/> {/* 文章特定的Open Graph标签 */} {ogType === 'article' && ( <> {publishedTime && ( <meta property="article:published_time" content={publishedTime}
/> )} {modifiedTime && ( <meta property="article:modified_time" content={modifiedTime}
/> )} {author && <meta property="article:author" content={author}
/>} {section && <meta property="article:section" content={section}
/>} {tags && tags.map((tag, index) => ( <meta key={index}
property="article:tag" content={tag}
/> ))} </> )} {/* Twitter Card标签 */}
<meta name="twitter:card" content={twitterCard}
/> {twitterSite && <meta name="twitter:site" content={twitterSite}
/>} {twitterCreator && <meta name="twitter:creator" content={twitterCreator}
/>}
<meta name="twitter:title" content={twitterTitle || ogTitle || title}
/>
<meta name="twitter:description" content={twitterDescription || ogDescription || description}
/> {twitterImage && <meta name="twitter:image" content={twitterImage || ogImage}
/>} {/* 图标 */}
<link rel="icon" href={favicon}
/>
<link rel="apple-touch-icon" href={appleTouchIcon}
/>
<link rel="manifest" href={manifest}
/> {/* 预连接优化 */}
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /> {/* 安全相关 */}
<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" /> {/* 语言标签 */}
<meta name="language" content="Chinese" />
<meta httpEquiv="content-language" content="zh-CN" /> </Head> ) }
// 便捷函数：生成文章页面的Meta标签 export function ArticleMetaTags({ title, excerpt, author, publishedDate, modifiedDate, tags, coverImage, url, }: { title: string excerpt: string author: string publishedDate: string modifiedDate?: string tags?: string[]
coverImage?: string url: string }) { return ( <MetaTags title={`${title} - 无题之墨`}
description={excerpt}
keywords={tags}
author={author}
ogType="article" ogTitle={title}
ogDescription={excerpt}
ogImage={coverImage}
ogUrl={url}
publishedTime={publishedDate}
modifiedTime={modifiedDate}
tags={tags}
canonical={url}
/> ) }
// 便捷函数：生成首页的Meta标签 export function HomeMetaTags({ title = '无题之墨 - 技术与生活的深度思考', description = '探索技术的边界，记录生活的感悟。分享关于编程、设计、产品和个人成长的深度文章。', url, }: { title?: string description?: string url: string }) { return ( <MetaTags title={title}
description={description}
keywords={['技术博客', '编程', '设计', '产品思考', '个人成长', 'React', 'Next.js', '前端开发']
}
ogType="website" ogUrl={url}
canonical={url}
/> ) }