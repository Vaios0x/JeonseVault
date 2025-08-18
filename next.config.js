/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  // PWA configuration for mobile app experience
  headers: async () => {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // Reown AppKit SSR requirements
  // https://docs.reown.com/appkit/next/core/installation
  webpack: (config) => {
    config.externals = config.externals || []
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
};

module.exports = nextConfig;
