/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
  },
  // Admin 路由特殊處理
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // output: 'export', // don't use with `next start` or api route
  // distDir: 'dist',
}

module.exports = nextConfig
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://payment-stage.ecpay.com.tw https://gpayment-stage.ecpay.com.tw",
          },
        ],
      },
    ]
  },
}
