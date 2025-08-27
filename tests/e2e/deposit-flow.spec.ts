import { test, expect } from '@playwright/test'
import { setupWallet, connectWallet, createDeposit, verifyDeposit } from './utils/web3-helpers'

/**
 * Tests E2E para el flujo completo de creación de depósitos
 * Verifica todo el proceso desde la conexión de wallet hasta la confirmación
 */
test.describe('Flujo de Creación de Depósitos', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/')
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle')
  })

  test('debe permitir crear un depósito completo', async ({ page }) => {
    // 1. Verificar que la página carga correctamente
    await expect(page).toHaveTitle(/JeonseVault/)
    await expect(page.locator('h1')).toContainText('JeonseVault')

    // 2. Conectar wallet
    const walletButton = page.locator('[data-testid="connect-wallet"]')
    await expect(walletButton).toBeVisible()
    await walletButton.click()

    // Esperar a que se abra el modal de conexión
    await page.waitForSelector('[data-testid="wallet-modal"]')
    
    // Seleccionar MetaMask (o wallet disponible)
    const metamaskOption = page.locator('[data-testid="wallet-option-metamask"]')
    await metamaskOption.click()

    // 3. Verificar que la wallet se conectó
    await expect(page.locator('[data-testid="wallet-address"]')).toBeVisible()
    
    // 4. Navegar a crear depósito
    const createDepositLink = page.locator('[data-testid="create-deposit-link"]')
    await createDepositLink.click()
    
    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*\/deposit\/create/)
    await expect(page.locator('h1')).toContainText('Crear Nuevo Depósito')

    // 5. Llenar formulario de depósito
    const form = page.locator('[data-testid="deposit-form"]')
    
    // Información de la propiedad
    await page.fill('[data-testid="property-id"]', 'test-property-001')
    await page.selectOption('[data-testid="property-type"]', 'apartment')
    await page.fill('[data-testid="property-address"]', '서울특별시 강남구 역삼동 123-45')
    await page.fill('[data-testid="landlord-address"]', '0x1234567890123456789012345678901234567890')

    // Información del depósito
    await page.fill('[data-testid="deposit-amount"]', '500000000') // 500M KRW
    await page.fill('[data-testid="deposit-end-date"]', '2025-12-31')
    await page.fill('[data-testid="deposit-description"]', 'Depósito de prueba para tests E2E')

    // Habilitar inversión
    await page.check('[data-testid="enable-investment"]')
    await page.fill('[data-testid="investment-percentage"]', '20')

    // 6. Verificar propiedad
    const verifyButton = page.locator('[data-testid="verify-property"]')
    await verifyButton.click()
    
    // Esperar verificación
    await expect(page.locator('[data-testid="verification-success"]')).toBeVisible()

    // 7. Enviar formulario
    const submitButton = page.locator('[data-testid="submit-deposit"]')
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // 8. Confirmar transacción en wallet
    // Simular confirmación de MetaMask
    await page.waitForSelector('[data-testid="transaction-modal"]')
    
    const confirmButton = page.locator('[data-testid="confirm-transaction"]')
    await confirmButton.click()

    // 9. Esperar confirmación de transacción
    await expect(page.locator('[data-testid="transaction-success"]')).toBeVisible()
    
    // 10. Verificar redirección al dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    // 11. Verificar que el depósito aparece en la lista
    await expect(page.locator('[data-testid="deposit-list"]')).toContainText('test-property-001')
    await expect(page.locator('[data-testid="deposit-amount"]')).toContainText('500,000,000')
  })

  test('debe validar campos requeridos', async ({ page }) => {
    // Navegar a crear depósito
    await page.goto('/deposit/create')
    
    // Intentar enviar formulario vacío
    const submitButton = page.locator('[data-testid="submit-deposit"]')
    await submitButton.click()

    // Verificar mensajes de error
    await expect(page.locator('[data-testid="error-property-id"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-property-address"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-landlord-address"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-deposit-amount"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-deposit-end-date"]')).toBeVisible()
  })

  test('debe validar formato de dirección de wallet', async ({ page }) => {
    await page.goto('/deposit/create')
    
    // Ingresar dirección inválida
    await page.fill('[data-testid="landlord-address"]', 'invalid-address')
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="error-landlord-address"]')).toContainText('Dirección de wallet inválida')
  })

  test('debe validar monto mínimo y máximo', async ({ page }) => {
    await page.goto('/deposit/create')
    
    // Probar monto muy bajo
    await page.fill('[data-testid="deposit-amount"]', '100000') // 100K KRW (muy bajo)
    await expect(page.locator('[data-testid="error-deposit-amount"]')).toContainText('Monto mínimo')
    
    // Probar monto muy alto
    await page.fill('[data-testid="deposit-amount"]', '20000000000') // 20B KRW (muy alto)
    await expect(page.locator('[data-testid="error-deposit-amount"]')).toContainText('Monto máximo')
  })

  test('debe validar fecha de vencimiento', async ({ page }) => {
    await page.goto('/deposit/create')
    
    // Probar fecha pasada
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    await page.fill('[data-testid="deposit-end-date"]', yesterday.toISOString().split('T')[0])
    await expect(page.locator('[data-testid="error-deposit-end-date"]')).toContainText('Fecha debe estar en el futuro')
    
    // Probar fecha muy lejana
    const farFuture = new Date()
    farFuture.setFullYear(farFuture.getFullYear() + 5)
    await page.fill('[data-testid="deposit-end-date"]', farFuture.toISOString().split('T')[0])
    await expect(page.locator('[data-testid="error-deposit-end-date"]')).toContainText('Fecha debe estar dentro de un año')
  })

  test('debe mostrar progreso de financiación', async ({ page }) => {
    // Crear depósito primero
    await page.goto('/deposit/create')
    
    // Llenar formulario básico
    await page.fill('[data-testid="property-id"]', 'test-property-002')
    await page.fill('[data-testid="property-address"]', '서울특별시 강남구 역삼동 456-78')
    await page.fill('[data-testid="landlord-address"]', '0x1234567890123456789012345678901234567890')
    await page.fill('[data-testid="deposit-amount"]', '1000000000') // 1B KRW
    await page.fill('[data-testid="deposit-end-date"]', '2025-12-31')
    
    // Habilitar inversión
    await page.check('[data-testid="enable-investment"]')
    
    // Enviar formulario
    await page.click('[data-testid="submit-deposit"]')
    
    // Esperar confirmación
    await expect(page.locator('[data-testid="transaction-success"]')).toBeVisible()
    
    // Verificar que aparece en el dashboard con progreso
    await expect(page.locator('[data-testid="deposit-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="progress-percentage"]')).toContainText('0%')
  })

  test('debe manejar errores de red', async ({ page }) => {
    // Simular error de red
    await page.route('**/api/**', route => route.abort('failed'))
    
    await page.goto('/deposit/create')
    
    // Llenar formulario
    await page.fill('[data-testid="property-id"]', 'test-property-003')
    await page.fill('[data-testid="property-address"]', '서울특별시 강남구 역삼동 789-01')
    await page.fill('[data-testid="landlord-address"]', '0x1234567890123456789012345678901234567890')
    await page.fill('[data-testid="deposit-amount"]', '500000000')
    await page.fill('[data-testid="deposit-end-date"]', '2025-12-31')
    
    // Intentar enviar
    await page.click('[data-testid="submit-deposit"]')
    
    // Verificar mensaje de error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Error de conexión')
  })

  test('debe ser accesible con navegación por teclado', async ({ page }) => {
    await page.goto('/deposit/create')
    
    // Navegar por el formulario con Tab
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="property-id"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="property-type"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="property-address"]')).toBeFocused()
    
    // Continuar navegación...
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="landlord-address"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="deposit-amount"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="deposit-end-date"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="submit-deposit"]')).toBeFocused()
  })

  test('debe funcionar en dispositivos móviles', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/deposit/create')
    
    // Verificar que el formulario es responsive
    await expect(page.locator('[data-testid="deposit-form"]')).toBeVisible()
    
    // Llenar formulario en móvil
    await page.fill('[data-testid="property-id"]', 'test-property-mobile')
    await page.fill('[data-testid="property-address"]', '서울특별시 강남구 역삼동 123-45')
    await page.fill('[data-testid="landlord-address"]', '0x1234567890123456789012345678901234567890')
    await page.fill('[data-testid="deposit-amount"]', '300000000')
    await page.fill('[data-testid="deposit-end-date"]', '2025-12-31')
    
    // Verificar que el botón es accesible en móvil
    const submitButton = page.locator('[data-testid="submit-deposit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })
})
