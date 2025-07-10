'use client' /** * 评论组件 * @module components/features/Comments * @description 使用 Giscus（基于 GitHub Discussions）实现评论功能 */
import { useEffect, useRef }
from 'react' interface CommentsProps { /** * GitHub 仓库名（格式：owner/repo） */
repo?: string /** * GitHub Discussions 的分类 ID */
repoId?: string /** * 讨论分类 */
category?: string /** * 讨论分类 ID */
categoryId?: string /** * 映射方式 */
mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number' /** * 当 mapping 为 'specific' 或 'number' 时使用 */
term?: string /** * 是否启用反应（表情回应） */
reactionsEnabled?: '0' | '1' /** * 是否显示反应数 */
emitMetadata?: '0' | '1' /** * 输入框位置 */
inputPosition?: 'top' | 'bottom' /** * 主题 */
theme?: string /** * 语言 */
lang?: string /** * 加载方式 */
loading?: 'lazy' | 'eager' }
/** * Giscus 评论组件 * @component * @param {CommentsProps}
props - 组件属性 * @returns {JSX.Element} 渲染的评论组件 * @description 集成 Giscus 评论系统，基于 GitHub Discussions。 * 支持主题切换、多语言、自定义映射方式等功能。 * 需要配置 GitHub 仓库和 Giscus 相关环境变量。 * @example * <Comments * repo="username/repo" * repoId="R_xxx" * category="General" * categoryId="DIC_xxx" * /> */
export default function Comments({ repo = process.env.NEXT_PUBLIC_GISCUS_REPO || 'your-username/your-repo', repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '', category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'Announcements', categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '', mapping = 'pathname', term, reactionsEnabled = '1', emitMetadata = '0', inputPosition = 'bottom', theme = 'preferred_color_scheme', lang = 'zh-CN', loading = 'lazy' }: CommentsProps) { const ref = useRef<HTMLDivElement>(null) useEffect(() => { // 检查是否已经加载 if (!ref.current || ref.current.hasChildNodes()) return const scriptElem = document.createElement('script') scriptElem.src = 'https://giscus.app/client.js' scriptElem.async = true scriptElem.crossOrigin = 'anonymous' scriptElem.setAttribute('data-repo', repo) scriptElem.setAttribute('data-repo-id', repoId) scriptElem.setAttribute('data-category', category) scriptElem.setAttribute('data-category-id', categoryId) scriptElem.setAttribute('data-mapping', mapping) scriptElem.setAttribute('data-strict', '0') scriptElem.setAttribute('data-reactions-enabled', reactionsEnabled) scriptElem.setAttribute('data-emit-metadata', emitMetadata) scriptElem.setAttribute('data-input-position', inputPosition) scriptElem.setAttribute('data-theme', theme) scriptElem.setAttribute('data-lang', lang) scriptElem.setAttribute('data-loading', loading) if (term) { scriptElem.setAttribute('data-term', term) }
ref.current.appendChild(scriptElem) }, [repo, repoId, category, categoryId, mapping, term, reactionsEnabled, emitMetadata, inputPosition, theme, lang, loading]) // 监听主题变化 useEffect(() => { const handleMessage = (event: MessageEvent) => { if (event.origin !== 'https://giscus.app') return // 处理 Giscus 消息 }
window.addEventListener('message', handleMessage) return () => window.removeEventListener('message', handleMessage) }, []) return ( <div className="mt-16">
<div className="border-t border-gray-200 pt-12">
<h2 className="text-2xl font-bold text-gray-900 mb-8"> 评论 </h2>
<div className="prose max-w-none mb-6">
<p className="text-sm text-gray-600"> 评论功能基于 GitHub Discussions，需要 GitHub 账号才能评论。 您的评论会同步显示在 <a href={`https://github.com/${repo}/discussions`}
target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" > GitHub Discussions </a> 中。 </p> </div>
<div ref={ref}
className="giscus-wrapper min-h-[200px]" /> </div> </div> ) }