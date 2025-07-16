'use client'

import React, { useState, useRef, useCallback } from 'react'
import { CloudinaryImage } from './CloudinaryImage'

interface ImageUploaderProps {
  onUploadSuccess?: (data: UploadResult) => void
  onUploadError?: (error: Error) => void
  folder?: 'posts' | 'projects' | 'books' | 'tools' | 'avatars' | 'misc'
  maxSize?: number // MB
  accept?: string
  multiple?: boolean
  className?: string
}

interface UploadResult {
  url: string
  publicId: string
  format: string
  width: number
  height: number
  size: number
  thumbnailUrl: string
}

export function ImageUploader({
  onUploadSuccess,
  onUploadError,
  folder = 'misc',
  maxSize = 10,
  accept = 'image/*',
  multiple = false,
  className = ''
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0] // 暂时只处理单个文件
    
    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      const error = new Error(`文件大小不能超过 ${maxSize}MB`)
      onUploadError?.(error)
      alert(error.message)
      return
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      const error = new Error('只能上传图片文件')
      onUploadError?.(error)
      alert(error.message)
      return
    }

    // 显示预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 上传文件
    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('tags', `upload,${folder}`)

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      const result = await response.json()
      const uploadResult = result.data as UploadResult

      setUploadedImages(prev => [...prev, uploadResult])
      onUploadSuccess?.(uploadResult)
      
      // 清除预览
      setTimeout(() => {
        setPreview(null)
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error as Error)
      alert(error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [folder, maxSize, onUploadError, onUploadSuccess])

  // 拖拽处理
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  // 点击选择文件
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传区域 */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="预览"
              className="max-h-64 mx-auto rounded-lg"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                  <p>上传中...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              点击或拖拽图片到这里上传
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              支持 JPG、PNG、GIF、WebP，最大 {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {/* 已上传的图片 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            已上传的图片
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <CloudinaryImage
                  src={image.publicId}
                  alt={`已上传图片 ${index + 1}`}
                  width={256}
                  height={256}
                  className="rounded-lg object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(image.url)
                      alert('图片链接已复制到剪贴板')
                    }}
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium transition-opacity"
                  >
                    复制链接
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}