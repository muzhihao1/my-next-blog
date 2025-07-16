import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// 图片上传选项类型
export interface UploadOptions {
  folder?: string
  publicId?: string
  transformation?: Array<any>
  tags?: string[]
  context?: Record<string, string>
}

// 上传图片到 Cloudinary
export async function uploadImage(
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<UploadApiResponse> {
  try {
    const defaultOptions = {
      folder: 'blog',
      resource_type: 'auto' as const,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      transformation: [
        { quality: 'auto:best', fetch_format: 'auto' }
      ],
      ...options
    }

    const result = await cloudinary.uploader.upload(
      file instanceof Buffer ? `data:image/jpeg;base64,${file.toString('base64')}` : file,
      defaultOptions
    )

    return result
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

// 删除图片
export async function deleteImage(publicId: string): Promise<any> {
  try {
    return await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw error
  }
}

// 获取图片优化URL
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
    crop?: string
  } = {}
): string {
  const defaultOptions = {
    quality: 'auto',
    format: 'auto',
    dpr: 'auto',
    ...options
  }

  return cloudinary.url(publicId, {
    transformation: [defaultOptions],
    secure: true
  })
}

// 批量上传
export async function uploadBatch(
  files: Array<{ file: string | Buffer; options?: UploadOptions }>
): Promise<UploadApiResponse[]> {
  const uploadPromises = files.map(({ file, options }) => 
    uploadImage(file, options)
  )
  
  return Promise.all(uploadPromises)
}

// 生成响应式图片URL集合
export function getResponsiveUrls(publicId: string, alt: string = '') {
  const sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
  
  return {
    src: getOptimizedUrl(publicId, { width: 1920 }),
    srcSet: sizes
      .map(size => `${getOptimizedUrl(publicId, { width: size })} ${size}w`)
      .join(', '),
    sizes: '(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 1200px',
    alt
  }
}

// 图片文件夹结构
export const IMAGE_FOLDERS = {
  posts: 'blog/posts',
  projects: 'blog/projects',
  books: 'blog/books',
  tools: 'blog/tools',
  avatars: 'blog/avatars',
  misc: 'blog/misc'
} as const

// 验证配置
export function validateCloudinaryConfig(): boolean {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ]
  
  return required.every(key => process.env[key])
}