import { test, expect } from '@playwright/test'

/**
 * Tests E2E para el Flujo de Inversión
 * Prueba la funcionalidad completa de inversión en depósitos
 */
test.describe('Flujo de Inversión', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/investment')
  })

  test('debe permitir invertir en un depósito existente', async ({ page }) => {
    // Conectar wallet
    await page.click('[data-testid="connect-wallet"]')
    await expect(page.locator('[data-testid="wallet-connected"]')).toBeVisible()

    // Navegar a la página de inversión
    await page.goto('/investment')
    await expect(page.locator('h1')).toContainText('Inversión')

    // Seleccionar un depósito para invertir
    const depositCard = page.locator('[data-testid="deposit-card"]').first()
    await expect(depositCard).toBeVisible()
    
    await depositCard.click()
    await expect(page.locator('[data-testid="investment-form"]')).toBeVisible()

    // Llenar formulario de inversión
    await page.fill('[data-testid="investment-amount"]', '100000000')
    await page.click('[data-testid="enable-investment"]')
    
    // Confirmar inversión
    await page.click('[data-testid="confirm-investment"]')
    
    // Verificar transacción
    await expect(page.locator('[data-testid="transaction-pending"]')).toBeVisible()
    await expect(page.locator('[data-testid="transaction-success"]')).toBeVisible({ timeout: 30000 })
    
    // Verificar que la inversión aparece en el dashboard
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="my-investments"]')).toContainText('100,000,000')
  })

  test('debe validar límites de inversión', async ({ page }) => {
    await page.click('[data-testid="connect-wallet"]')
    await page.goto('/investment')
    
    const depositCard = page.locator('[data-testid="deposit-card"]').first()
    await depositCard.click()
    
    // Intentar invertir más del límite permitido
    await page.fill('[data-testid="investment-amount"]', '999999999999')
    await page.click('[data-testid="confirm-investment"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Monto excede el límite')
  })

  test('debe mostrar progreso de financiación actualizado', async ({ page }) => {
    await page.click('[data-testid="connect-wallet"]')
    await page.goto('/investment')
    
    // Verificar progreso inicial
    const initialProgress = await page.locator('[data-testid="funding-progress"]').textContent()
    
    // Realizar inversión
    const depositCard = page.locator('[data-testid="deposit-card"]').first()
    await depositCard.click()
    await page.fill('[data-testid="investment-amount"]', '50000000')
    await page.click('[data-testid="confirm-investment"]')
    await expect(page.locator('[data-testid="transaction-success"]')).toBeVisible({ timeout: 30000 })
    
    // Verificar que el progreso se actualizó
    await page.goto('/investment')
    const updatedProgress = await page.locator('[data-testid="funding-progress"]').textContent()
    expect(updatedProgress).not.toBe(initialProgress)
  })

  test('debe calcular retornos correctamente', async ({ page }) => {
    await page.click('[data-testid="connect-wallet"]')
    await page.goto('/investment')
    
    const depositCard = page.locator('[data-testid="deposit-card"]').first()
    await depositCard.click()
    
    // Verificar calculadora de retornos
    await page.fill('[data-testid="investment-amount"]', '100000000')
    await expect(page.locator('[data-testid="estimated-return"]')).toContainText('6,000,000')
    await expect(page.locator('[data-testid="annual-yield"]')).toContainText('6%')
  })

  test('debe manejar errores de red durante inversión', async ({ page }) => {
    // Simular error de red
    await page.route('**/api/invest', route => route.abort())
    
    await page.click('[data-testid="connect-wallet"]')
    await page.goto('/investment')
    
    const depositCard = page.locator('[data-testid="deposit-card"]').first()
    await depositCard.click()
    await page.fill('[data-testid="investment-amount"]', '100000000')
    await page.click('[data-testid="confirm-investment"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Error de conexión')
  })

  test('debe ser accesible con navegación por teclado', async ({ page }) => {
    await page.click('[data-testid="connect-wallet"]')
    await page.goto('/investment')
    
    // Navegar usando Tab
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'deposit-card')
    
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="investment-form"]')).toBeVisible()
    
    // Navegar por el formulario
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'investment-amount')
  })

  test('debe funcionar en dispositivos móviles', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.click('[data-testid="connect-wallet"]')
    await page.goto('/investment')
    
    // Verificar que la interfaz es responsive
    await expect(page.locator('[data-testid="deposit-card"]')).toBeVisible()
    
    // Realizar inversión en móvil
    const depositCard = page.locator('[data-testid="deposit-card"]').first()
    await depositCard.tap()
    await expect(page.locator('[data-testid="investment-form"]')).toBeVisible()
    
    await page.fill('[data-testid="investment-amount"]', '100000000')
    await page.tap('[data-testid="confirm-investment"]')
    
    await expect(page.locator('[data-testid="transaction-success"]')).toBeVisible({ timeout: 30000 })
  })
})
