import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, validateCloudinaryConfig, IMAGE_FOLDERS } from '@/lib/cloudinary'
import { auth } from '@/lib/auth' // 假设有认证系统

export async function POST(request: NextRequest) {
  try {
    // 验证配置
    if (!validateCloudinaryConfig()) {
      return NextResponse.json(
        { error: 'Cloudinary configuration missing' },
        { status: 500 }
      )
    }

    // 可选：验证用户权限
    // const session = await auth()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // 获取表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'misc'
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // 验证文件大小（10MB限制）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // 转换文件为 Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成公共ID（使用时间戳和原始文件名）
    const timestamp = Date.now()
    const originalName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-')
    const publicId = `${timestamp}-${originalName}`

    // 确定文件夹路径
    const uploadFolder = IMAGE_FOLDERS[folder as keyof typeof IMAGE_FOLDERS] || IMAGE_FOLDERS.misc

    // 上传到 Cloudinary
    const result = await uploadImage(buffer, {
      folder: uploadFolder,
      publicId,
      tags: tags ? tags.split(',') : ['user-upload'],
      context: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      }
    })

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        thumbnailUrl: result.eager?.[0]?.secure_url || result.secure_url
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 支持的最大请求体大小配置
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}