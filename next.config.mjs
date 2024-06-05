/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.smold.app',
        pathname: '/api/token/**',
      },
      {
        protocol: 'https',
        hostname: 'yearn.fi',
      },
    ],
  },
};

export default nextConfig;
