import { defineConfig, devices } from '@playwright/test'

/**
 * Configuración avanzada de Playwright para JeonseVault
 * Tests E2E completos con soporte para Web3, múltiples navegadores y dispositivos
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
    ['dot'],
  ],
  use: {
    // Configuración base para todos los tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Configuración para Web3
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write'],
    },
    
    // Configuración de viewport
    viewport: { width: 1280, height: 720 },
    
    // Configuración de geolocalización (para tests de compliance)
    geolocation: { longitude: 126.9780, latitude: 37.5665 }, // Seoul, Korea
    
    // Configuración de timezone
    timezoneId: 'Asia/Seoul',
    
    // Configuración de locale
    locale: 'ko-KR',
    
    // Configuración de user agent
    userAgent: 'JeonseVault E2E Test Runner',
    
    // Configuración de extra headers
    extraHTTPHeaders: {
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'X-Test-Mode': 'e2e',
    },
  },

  // Configuración de proyectos para diferentes navegadores y dispositivos
  projects: [
    // Tests en Chromium (desktop)
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Configuración específica para Web3 en Chrome
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--enable-automation',
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    },

    // Tests en Firefox (desktop)
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Configuración específica para Web3 en Firefox
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webdriver.enabled': false,
            'dom.webnotifications.enabled': false,
            'media.navigator.enabled': false,
            'network.http.referer.spoofSource': false,
          },
        },
      },
    },

    // Tests en Safari (desktop)
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // Configuración específica para Web3 en Safari
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
          ],
        },
      },
    },

    // Tests en dispositivos móviles
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // Configuración específica para Web3 en móvil
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },
      },
    },

    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        // Configuración específica para Web3 en iOS
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
          ],
        },
      },
    },

    // Tests en tablet
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro 11 landscape'],
        // Configuración específica para Web3 en tablet
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },
      },
    },

    // Tests de accesibilidad
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // Configuración específica para tests de accesibilidad
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-logging',
            '--v=1',
          ],
        },
      },
    },

    // Tests de performance
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        // Configuración específica para tests de performance
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--enable-automation',
            '--disable-blink-features=AutomationControlled',
            '--enable-logging',
            '--v=1',
          ],
        },
      },
    },
  ],

  // Configuración de web server para tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Configuración de output
  outputDir: 'test-results/',

  // Configuración de global setup y teardown
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),

  // Note: timeout ya está configurado arriba

  // Note: retries y workers ya están configurados arriba

  // Note: reporter y metadata ya están configurados arriba
})
