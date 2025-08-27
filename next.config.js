const withNextIntl = require('next-intl/plugin')('./i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    _next_intl_trailing_slash: 'false'
  },
  
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

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.vercel.json',
  },

  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

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
}

module.exports = withNextIntl(nextConfig)
