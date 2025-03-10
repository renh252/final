module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-domain.com'], // Replace with your image domain
  },
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
};