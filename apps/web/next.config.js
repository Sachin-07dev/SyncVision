/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@exceliboard/types', '@exceliboard/utils'],
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
