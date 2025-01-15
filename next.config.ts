import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  optimizeFonts: false,
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
}

export default nextConfig
