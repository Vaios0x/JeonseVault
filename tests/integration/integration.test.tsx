import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { CreateDepositForm } from '@/components/deposit/CreateDepositForm'
import { DepositStatus } from '@/components/deposit/DepositStatus'
import { InvestmentPool } from '@/components/dashboard/InvestmentPool'
import DashboardPage from '@/app/dashboard/page'

// Mock de hooks
vi.mock('@/hooks/useJeonseVault', () => ({
  useJeonseVault: () => ({
    createDeposit: vi.fn(),
    isCreating: false,
    deposits: [],
    userDeposits: [],
    contractState: {
      totalValueLocked: BigInt(1000000000),
      totalDeposits: BigInt(10),
    },
  })
}))

vi.mock('@/hooks/usePropertyOracle', () => ({
  usePropertyOracle: () => ({
    verifyPropertyOwnership: vi.fn(),
    isPropertyVerified: false,
  })
}))

vi.mock('@/hooks/useCompliance', () => ({
  useCompliance: () => ({
    checkCompliance: vi.fn(),
    userCompliance: {
      level: 'Premium',
      transactionLimit: BigInt(1000000000),
    },
  })
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
  }),
  useBalance: () => ({
    data: { value: BigInt(1000000000000000000) },
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('Tests de Integración', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Flujo de Creación de Depósito', () => {
    it('debe integrar formulario con validación y hooks', async () => {
      render(<CreateDepositForm />)
      
      // Llenar formulario
      fireEvent.change(screen.getByLabelText(/ID de Propiedad/i), {
        target: { value: 'test-property-123' }
      })
      
      fireEvent.change(screen.getByLabelText(/Dirección Completa/i), {
        target: { value: '서울특별시 강남구 역삼동 123-45' }
      })
      
      fireEvent.change(screen.getByLabelText(/Monto del Depósito/i), {
        target: { value: '500000000' }
      })
      
      // Verificar que los hooks se integran correctamente
      await waitFor(() => {
        expect(screen.getByText(/Monto estimado/i)).toBeInTheDocument()
      })
    })
  })

  describe('Integración Dashboard', () => {
    it('debe mostrar componentes integrados correctamente', () => {
      render(<DashboardPage />)
      
      // Verificar que todos los componentes principales están presentes
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/Crear Depósito/i)).toBeInTheDocument()
      expect(screen.getByText(/Invertir/i)).toBeInTheDocument()
    })
  })
})
