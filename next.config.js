const withNextIntl = require('next-intl/plugin')('./i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración experimental para optimizaciones avanzadas
  experimental: {
    // Optimizaciones de bundle
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'clsx',
      'tailwind-merge',
      'framer-motion',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'react-hot-toast'
    ],
    
    // Tree shaking optimizado
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    
    // Optimizaciones de compilación
    swcMinify: true,
    forceSwcTransforms: true,
  },

  // Configuración de webpack para optimizaciones
  webpack: (config, { dev, isServer }) => {
    // Excluir dependencias problemáticas
    config.resolve.alias = {
      ...config.resolve.alias,
      '@safe-global/safe-apps-sdk': false,
      '@safe-global/safe-apps-provider': false,
      'bigint-buffer': false,
    };
    
    // Resolver módulos para evitar conflictos con Reown
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimizaciones para SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Optimizaciones para imágenes
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp)$/i,
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize: 8 * 1024, // 8KB
        },
      },
    })

    return config
  },

  // Configuración de imágenes optimizada
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Configuración de compresión
  compress: true,

  // Configuración de headers para caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configuración de output
  output: 'standalone',

  // Configuración de trailing slash
  trailingSlash: false,

  // Configuración de powered by header
  poweredByHeader: false,

  // Configuración de react strict mode
  reactStrictMode: true,

  // Configuración de swc minify
  swcMinify: true,

  // Configuración de transpilePackages
  transpilePackages: [
    'lucide-react',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-toast',
    '@radix-ui/react-tooltip',
    'clsx',
    'tailwind-merge',
    'framer-motion',
    'react-hook-form',
    '@hookform/resolvers',
    'zod',
    'react-hot-toast'
  ],

  // Configuración de basePath
  basePath: '',

  // Configuración de assetPrefix
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // Configuración de distDir
  distDir: '.next',

  // Configuración de generateEtags
  generateEtags: true,

  // Configuración de onDemandEntries
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configuración de pageExtensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

module.exports = withNextIntl(nextConfig)
