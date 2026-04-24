import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  images: {
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
