/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};

module.exports = nextConfig;
