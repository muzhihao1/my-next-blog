/** * 优化的代码块组件 * 按需加载语言支持，减少bundle大小 */ 'use client' import { useState, useEffect }
from 'react' 

import { Light as SyntaxHighlighter }
from 'react-syntax-highlighter' 

import { atomOneDark }
from 'react-syntax-highlighter/dist/esm/styles/hljs' // 语言映射和动态导入 const languageLoaders = { javascript: () => import('react-syntax-highlighter/dist/esm/languages/hljs/javascript'), typescript: () => import('react-syntax-highlighter/dist/esm/languages/hljs/typescript'), jsx: () => import('react-syntax-highlighter/dist/esm/languages/hljs/javascript'), tsx: () => import('react-syntax-highlighter/dist/esm/languages/hljs/typescript'), python: () => import('react-syntax-highlighter/dist/esm/languages/hljs/python'), bash: () => import('react-syntax-highlighter/dist/esm/languages/hljs/bash'), shell: () => import('react-syntax-highlighter/dist/esm/languages/hljs/shell'), css: () => import('react-syntax-highlighter/dist/esm/languages/hljs/css'), json: () => import('react-syntax-highlighter/dist/esm/languages/hljs/json'), markdown: () => import('react-syntax-highlighter/dist/esm/languages/hljs/markdown'), sql: () => import('react-syntax-highlighter/dist/esm/languages/hljs/sql'), yaml: () => import('react-syntax-highlighter/dist/esm/languages/hljs/yaml'), html: () => import('react-syntax-highlighter/dist/esm/languages/hljs/xml'), xml: () => import('react-syntax-highlighter/dist/esm/languages/hljs/xml'), }
// 已注册的语言缓存 const registeredLanguages = new Set<string>() // 注册语言函数 async function registerLanguage(language: string) { if (registeredLanguages.has(language)) { return }
const loader = languageLoaders[language as keyof typeof languageLoaders]
if (loader) { try { const lang = await loader() SyntaxHighlighter.registerLanguage(language, lang.default) registeredLanguages.add(language) }
catch (error) { console.error(`Failed to load language: ${language}`, error) }
} }
interface OptimizedCodeBlockProps { code: string language?: string showLineNumbers?: boolean className?: string customStyle?: React.CSSProperties }
export function OptimizedCodeBlock({ code, language = 'plaintext', showLineNumbers = true, className = '', customStyle = {}
}: OptimizedCodeBlockProps) { const [isLanguageLoaded, setIsLanguageLoaded] = useState(false) const [copied, setCopied] = useState(false) // 标准化语言名称 const normalizedLanguage = language.toLowerCase().replace(/[^a-z]/g, '') useEffect(() => { if (normalizedLanguage === 'plaintext' || !languageLoaders[normalizedLanguage as keyof typeof languageLoaders]) { setIsLanguageLoaded(true) return }
registerLanguage(normalizedLanguage).then(() => { setIsLanguageLoaded(true) }) }, [normalizedLanguage]) // 复制代码功能 const handleCopy = async () => { try { await navigator.clipboard.writeText(code) setCopied(true) setTimeout(() => setCopied(false), 2000) }
catch (error) { console.error('Failed to copy code:', error) }
}
// 如果语言未加载，显示纯文本 if (!isLanguageLoaded && normalizedLanguage !== 'plaintext') { return ( <div className={`relative group ${className}`}>
<pre className="p-4 bg-gray-900 text-gray-300 rounded-lg overflow-x-auto">
<code>{code}</code> </pre> </div> ) }
return ( <div className={`relative group ${className}`}> {/* 复制按钮 */}
<button onClick={handleCopy}
className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity" aria-label="复制代码" > {copied ? '已复制' : '复制'} </button> {/* 语言标签 */} {language !== 'plaintext' && ( <div className="absolute top-2 left-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded opacity-75"> {language} </div> )}
<SyntaxHighlighter language={normalizedLanguage}
style={atomOneDark}
showLineNumbers={showLineNumbers}
customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.875rem', ...customStyle }
}
codeTagProps={{ style: { fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace', } }
}> {code} </SyntaxHighlighter> </div> ) }
/** * 预加载常用语言 * 在应用启动时调用，提升用户体验 */
export async function preloadCommonLanguages() { const commonLanguages = ['javascript', 'typescript', 'python', 'bash', 'css']
await Promise.all(commonLanguages.map(lang => registerLanguage(lang))) }
/** * 简化的代码块组件（无语法高亮） * 用于不需要语法高亮的场景，进一步减小bundle */
export function SimpleCodeBlock({ code, className = '' }: { code: string className?: string }) { const [copied, setCopied] = useState(false) const handleCopy = async () => { try { await navigator.clipboard.writeText(code) setCopied(true) setTimeout(() => setCopied(false), 2000) }
catch (error) { console.error('Failed to copy code:', error) }
}
return ( <div className={`relative group ${className}`}>
<button onClick={handleCopy}
className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label="复制代码" > {copied ? '已复制' : '复制'} </button>
<pre className="p-4 bg-gray-900 text-gray-300 rounded-lg overflow-x-auto font-mono text-sm">
<code>{code}</code> </pre> </div> ) }