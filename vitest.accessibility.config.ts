import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Configuración de Vitest para Tests de Accesibilidad
 * Tests que verifican compliance con WCAG 2.1 AA usando axe-core
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/accessibility/setup.ts'],
    globals: true,
    css: true,
    
    // Configuración específica para tests de accesibilidad
    include: [
      'tests/accessibility/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/accessibility/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/accessibility/**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    exclude: [
      'node_modules/',
      'dist/',
      '.idea/',
      '.git/',
      '.cache/',
      'tests/e2e/',
      'tests/unit/',
      'tests/integration/',
      'tests/performance/',
    ],
    
    // Coverage para tests de accesibilidad
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/accessibility',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/tests/**',
        '**/__mocks__/**',
        '**/mocks/**',
        '**/stories/**',
        '**/*.stories.*',
        '**/docs/**',
        '**/examples/**',
        '**/scripts/**',
        '**/public/**',
        '**/assets/**',
        '**/images/**',
        '**/icons/**',
        '**/fonts/**',
        '**/locales/**',
        '**/i18n/**',
        '**/translations/**',
        '**/types/**',
        '**/interfaces/**',
        '**/enums/**',
        '**/constants/**',
        '**/utils/**',
        '**/helpers/**',
        '**/services/**',
        '**/api/**',
        '**/middleware/**',
        '**/pages/**',
        '**/app/**',
        '**/components/**',
        '**/hooks/**',
        '**/context/**',
        '**/providers/**',
        '**/layouts/**',
        '**/templates/**',
        '**/styles/**',
        '**/css/**',
        '**/scss/**',
        '**/sass/**',
        '**/less/**',
        '**/stylus/**',
        '**/postcss/**',
        '**/tailwind/**',
        '**/bootstrap/**',
        '**/material-ui/**',
        '**/antd/**',
        '**/chakra/**',
        '**/mantine/**',
        '**/nextui/**',
        '**/shadcn/**',
        '**/radix/**',
        '**/headlessui/**',
        '**/framer-motion/**',
        '**/react-spring/**',
        '**/react-transition-group/**',
      ],
      // thresholds removed for compatibility
    },
    
    // Reporters para tests de accesibilidad
    reporters: ['verbose', 'html', 'json'],
    outputFile: {
      html: './test-results/accessibility/index.html',
      json: './test-results/accessibility/results.json',
    },
    
    // pool configuration removed for compatibility
    
    // Timeouts para tests de accesibilidad
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    
    // Configuración de concurrencia
    maxConcurrency: 2,
    
    // Configuración de retry
    retry: 1,
    
    // Configuración de bail
    bail: 0,
    
        // Simplified configuration for compatibility
    
    // define configuration removed for compatibility
  },
  
  // Configuración de resolve
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  
  // Configuración de define
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.VITEST': 'true',
    'process.env.TEST_TYPE': '"accessibility"',
  },
  
  // Configuración de server
  server: {
    port: 3005,
    host: 'localhost',
  },
  
  // Configuración de preview
  preview: {
    port: 3006,
    host: 'localhost',
  },
  
  // Configuración de build
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  
  // Configuración de optimizeDeps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'next',
      'wagmi',
      'viem',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
      'date-fns',
      'recharts',
      'react-hot-toast',
      'next-intl',
      'uuid',
      'lz-string',
      'sharp',
      'tailwindcss',
      'tailwindcss-animate',
      'axe-core',
      'axe-playwright',
    ],
  },
  
  // Configuración de css
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  
  // Configuración de json
  json: {
    stringify: true,
  },
  
  // Configuración de esbuild
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
