/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure environment variables are available during build time
  env: {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    CACHE_TTL: process.env.CACHE_TTL,
  },
  // Enable static generation with environment variables
  trailingSlash: true,
}

module.exports = nextConfig