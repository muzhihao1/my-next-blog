'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import Container from '@/components/ui/Container'

interface UploadedImage {
  url: string
  publicId: string
  format: string
  width: number
  height: number
  size: number
  thumbnailUrl: string
  uploadedAt: Date
  folder: string
}

export default function ImageManagementPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('posts')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleUploadSuccess = (data: any) => {
    const newImage: UploadedImage = {
      ...data,
      uploadedAt: new Date(),
      folder: selectedFolder
    }
    setUploadedImages(prev => [newImage, ...prev])
  }

  const handleCopyUrl = (url: string, type: 'url' | 'markdown' | 'notion') => {
    let textToCopy = url
    
    if (type === 'markdown') {
      textToCopy = `![图片描述](${url})`
    } else if (type === 'notion') {
      textToCopy = url // Notion 直接粘贴 URL 即可
    }
    
    navigator.clipboard.writeText(textToCopy)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Container className="py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          图片管理
        </h1>

        {/* 检查 Cloudinary 配置 */}
        {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ 请在 .env.local 中设置 CLOUDINARY_CLOUD_NAME
            </p>
          </div>
        )}

        {/* 文件夹选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择上传文件夹
          </label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="posts">文章图片</option>
            <option value="projects">项目截图</option>
            <option value="books">书籍封面</option>
            <option value="tools">工具图标</option>
            <option value="avatars">头像</option>
            <option value="misc">其他</option>
          </select>
        </div>

        {/* 图片上传器 */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            上传新图片
          </h2>
          <ImageUploader
            folder={selectedFolder as any}
            onUploadSuccess={handleUploadSuccess}
            maxSize={10}
          />
        </div>

        {/* 已上传的图片列表 */}
        {uploadedImages.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              最近上传的图片
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="aspect-video relative">
                    <CloudinaryImage
                      src={image.publicId}
                      alt={`已上传图片 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    {/* 图片信息 */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>尺寸: {image.width} × {image.height}</p>
                      <p>大小: {formatFileSize(image.size)}</p>
                      <p>格式: {image.format.toUpperCase()}</p>
                      <p>文件夹: {image.folder}</p>
                    </div>

                    {/* 复制按钮组 */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCopyUrl(image.url, 'url')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          copiedUrl === image.url
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {copiedUrl === image.url ? '已复制!' : '复制 URL'}
                      </button>
                      <button
                        onClick={() => handleCopyUrl(image.url, 'markdown')}
                        className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        复制 Markdown
                      </button>
                      <button
                        onClick={() => handleCopyUrl(image.url, 'notion')}
                        className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        复制 Notion
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            使用说明
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• 上传的图片会自动优化并通过 CDN 分发</li>
            <li>• 支持拖拽上传或点击选择文件</li>
            <li>• 图片会根据选择的文件夹分类存储</li>
            <li>• 复制的 URL 可以直接在 Notion 中使用</li>
            <li>• Markdown 格式适合在博客文章中使用</li>
            <li>• 所有图片都会自动转换为最优格式（WebP/AVIF）</li>
          </ul>
        </div>
      </div>
    </Container>
  )
}