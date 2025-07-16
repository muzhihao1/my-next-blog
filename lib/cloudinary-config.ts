/**
 * Cloudinary 配置（备用图片存储方案）
 * 
 * 使用前需要：
 * 1. 注册 Cloudinary 账号
 * 2. 安装依赖：npm install cloudinary
 * 3. 配置环境变量
 */

import { v2 as cloudinary } from 'cloudinary'

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// 图片转换预设
export const transformations = {
  // 项目缩略图
  projectThumbnail: {
    width: 800,
    height: 600,
    crop: 'fill',
    gravity: 'center',
    quality: 'auto:good',
    format: 'auto',
    fetch_format: 'auto',
  },
  
  // 项目截图
  projectScreenshot: {
    width: 1200,
    height: 800,
    crop: 'limit',
    quality: 'auto:good',
    format: 'auto',
  },
  
  // 博客封面
  blogCover: {
    width: 1200,
    height: 630,
    crop: 'fill',
    gravity: 'center',
    quality: 'auto:good',
    format: 'auto',
  },
  
  // 自动优化（保持原尺寸）
  auto: {
    quality: 'auto',
    format: 'auto',
    fetch_format: 'auto',
  }
}

/**
 * 上传图片到 Cloudinary
 */
export async function uploadImage(
  filePath: string,
  folder: string,
  publicId?: string
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `blog/${folder}`,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
    })
    
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary 上传失败:', error)
    throw error
  }
}

/**
 * 从 URL 上传图片
 */
export async function uploadFromUrl(
  imageUrl: string,
  folder: string,
  publicId?: string
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: `blog/${folder}`,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
    })
    
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary URL 上传失败:', error)
    throw error
  }
}

/**
 * 生成优化的图片 URL
 */
export function getOptimizedUrl(
  publicId: string,
  transformation: keyof typeof transformations = 'auto'
): string {
  const transform = transformations[transformation]
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: transform,
  })
}

/**
 * 删除图片
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary 删除失败:', error)
    throw error
  }
}

/**
 * 批量上传图片
 */
export async function batchUpload(
  images: Array<{
    path: string
    folder: string
    publicId?: string
  }>
): Promise<string[]> {
  const uploadPromises = images.map(image =>
    uploadImage(image.path, image.folder, image.publicId)
  )
  
  return Promise.all(uploadPromises)
}

/**
 * 搜索图片
 */
export async function searchImages(
  folder: string,
  maxResults: number = 30
): Promise<any[]> {
  try {
    const result = await cloudinary.search
      .expression(`folder:blog/${folder}`)
      .max_results(maxResults)
      .execute()
    
    return result.resources
  } catch (error) {
    console.error('Cloudinary 搜索失败:', error)
    return []
  }
}

/**
 * 获取图片信息
 */
export async function getImageInfo(publicId: string): Promise<any> {
  try {
    return await cloudinary.api.resource(publicId)
  } catch (error) {
    console.error('获取图片信息失败:', error)
    return null
  }
}

// 导出 cloudinary 实例以供直接使用
export { cloudinary }