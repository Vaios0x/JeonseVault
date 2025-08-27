'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Wallet, LogOut, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { 
  useAccount, 
  useDisconnect, 
  useBalance,
  useChainId,
  useSwitchChain
} from 'wagmi'
import { ConnectKitButton } from 'connectkit'

interface WalletConnectProps {
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function WalletConnect({ 
  variant = 'button', 
  size = 'md',
  className = '' 
}: WalletConnectProps) {
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const t = useTranslations('wallet')
  
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Configuración de la red Kaia
  const KAIROS_CHAIN_ID = 1001

  // Copiar dirección al portapapeles
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Verificar si está en la red correcta
  const isCorrectNetwork = chainId === KAIROS_CHAIN_ID

  // Formatear balance
  const formatBalance = (balance: any) => {
    if (!balance) return '0.00'
    return parseFloat(balance.formatted).toFixed(4)
  }

  // Formatear dirección
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Manejar cambio de red
  const handleSwitchNetwork = () => {
    switchChain({ chainId: KAIROS_CHAIN_ID })
  }

  // Si no está conectado, mostrar botón de conexión
  if (!isConnected) {
    return (
      <ConnectKitButton.Custom>
        {({ isConnecting, show }) => {
          return (
            <Button
              variant="primary"
              size={size}
              className={className}
              onClick={show}
              disabled={isConnecting}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnecting ? t('connecting') : t('connect')}
            </Button>
          )
        }}
      </ConnectKitButton.Custom>
    )
  }

  // Si está conectado pero en red incorrecta
  if (!isCorrectNetwork) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size={size}
          className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
          onClick={handleSwitchNetwork}
          type="button"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          {t('switchNetwork')}
        </Button>
      </div>
    )
  }

  // Si está conectado y en red correcta
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size={size}
        className="flex items-center space-x-2"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="hidden sm:block">{formatAddress(address!)}</span>
        <span className="hidden md:block text-xs text-gray-500">
          {formatBalance(balance)} ETH
        </span>
      </Button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {t('connected')}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('network')}: Kaia Testnet
            </p>
          </div>

          {/* Address */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('address')}</span>
              <button
                onClick={copyAddress}
                className="text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-sm font-mono text-gray-900 mt-1 break-all">
              {address}
            </p>
          </div>

          {/* Balance */}
          <div className="px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">{t('balance')}</span>
            <p className="text-lg font-semibold text-gray-900">
              {formatBalance(balance)} ETH
            </p>
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => disconnect()}
              className="flex items-center w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('disconnect')}
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

// Funciones auxiliares
function getSizeClasses() {
  return 'inline-flex items-center justify-center font-medium transition-colors focus-ring'
}
