/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  devIndicators: {
    buildActivity: false,
  },
  allowedDevOrigins: [
    '127.0.0.1',
    /\.replit\.dev$/,
  ],
};

module.exports = nextConfig;
