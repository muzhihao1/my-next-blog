'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeFile {
  filename: string
  language: string
  code: string
}

interface CodeSnippetProps {
  files: CodeFile[]
  defaultFile?: number
  showLineNumbers?: boolean
  maxHeight?: string
}

/**
 * 代码片段展示组件
 * 支持多文件切换和语法高亮
 */
export function CodeSnippet({
  files,
  defaultFile = 0,
  showLineNumbers = true,
  maxHeight = '500px'
}: CodeSnippetProps) {
  const [activeFile, setActiveFile] = useState(defaultFile)
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    const code = files[activeFile].code
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (files.length === 0) {
    return null
  }
  
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      {/* 文件标签页 */}
      {files.length > 1 && (
        <div className="flex items-center gap-0 border-b border-gray-200 bg-gray-100 overflow-x-auto">
          {files.map((file, index) => (
            <button
              key={index}
              onClick={() => setActiveFile(index)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeFile === index
                  ? 'bg-white text-gray-900 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {file.filename}
            </button>
          ))}
        </div>
      )}
      
      {/* 代码区域 */}
      <div className="relative">
        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              已复制
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              复制
            </span>
          )}
        </button>
        
        {/* 语法高亮 */}
        <div style={{ maxHeight }} className="overflow-auto">
          <SyntaxHighlighter
            language={files[activeFile].language}
            style={tomorrow}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              padding: '1rem',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}
            codeTagProps={{
              style: {
                fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              }
            }}
          >
            {files[activeFile].code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}