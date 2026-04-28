import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  images: {
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
