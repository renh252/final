/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // ignoreDuringBuilds: true,
  },
  images: {
    domains: ['via.placeholder.com', 'picsum.photos', 'loremflickr.com', 'localhost', 'placehold.co'],
    unoptimized: true,
  },
  // Admin 路由特殊處理
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // output: 'export', // don't use with `next start` or api route
  // distDir: 'dist',
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

module.exports = nextConfig