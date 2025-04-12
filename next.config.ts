import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // https://nextjs.org/docs/app/api-reference/next-config-js/logging
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  images: {
    domains: [
      // 'upload.wikimedia.org',
      // 'images.pexels.com',
      // 'images.unsplash.com'
    ]
  }
}

export default nextConfig
