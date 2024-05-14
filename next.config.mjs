/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.smold.app',
        port: '',
        pathname: '/api/token/**',
      },
    ],
  },
};

export default nextConfig;
