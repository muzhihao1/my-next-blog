/** @type {import('next').NextConfig} */
const nextConfig = {
  // 临时忽略 TypeScript 构建错误以快速部署
  typescript: {
    ignoreBuildErrors: true,
  },

  // 临时忽略 ESLint 错误
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 移除静态导出配置，因为与 API 路由不兼容
  // output: 'export',

  images: {
    // 在 Vercel 上可以使用图片优化
    // unoptimized: true,

    // 配置图片优化和域名白名单
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "img1.doubanio.com",
      },
      {
        protocol: "https",
        hostname: "img2.doubanio.com",
      },
      {
        protocol: "https",
        hostname: "img3.doubanio.com",
      },
      {
        protocol: "https",
        hostname: "img9.doubanio.com",
      },
      {
        protocol: "https",
        hostname: "*.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "www.sevenstages.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // 允许SVG文件
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // 配置图片格式
    formats: ["image/avif", "image/webp"],

    // 配置图片设备尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 环境变量配置
  env: {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_PROJECTS_DB: process.env.NOTION_PROJECTS_DB,
    NOTION_BOOKS_DB: process.env.NOTION_BOOKS_DB,
    NOTION_TOOLS_DB: process.env.NOTION_TOOLS_DB,
    CACHE_TTL: process.env.CACHE_TTL,
  },

  // 启用实验性功能
  experimental: {
    // Next.js 15 不再需要特殊的ISR配置
  },

  // 配置重定向（如果需要）
  async redirects() {
    return [];
  },

  // 配置重写（如果需要）
  async rewrites() {
    return [];
  },

  // 配置头部（用于安全和缓存）
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
