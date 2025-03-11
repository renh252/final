module.exports = {
    reactStrictMode: true,
    images: {
        domains: ['example.com'], // Replace with your image domain
    },
    async redirects() {
        return [
            {
                source: '/old-route',
                destination: '/new-route',
                permanent: true,
            },
        ];
    },
};