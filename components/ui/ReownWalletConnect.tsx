'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Wallet, LogOut, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitBalance } from '@reown/appkit/react'

interface ReownWalletConnectProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ReownWalletConnect({ 
  size = 'md',
  className = '' 
}: ReownWalletConnectProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('wallet')
  
  // Reown AppKit hooks
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { fetchBalance } = useAppKitBalance()

  // Configuración de la red Kaia
  const KAIROS_CHAIN_ID = 1001

  // Copiar dirección al portapapeles
  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Error copying address:', error)
      }
    }
  }

  // Verificar si está en la red correcta
  const isCorrectNetwork = chainId === KAIROS_CHAIN_ID

  // Formatear balance
  const formatBalance = (balance: any) => {
    if (!balance) return '0.00'
    return parseFloat(balance?.formatted || '0').toFixed(4)
  }

  // Formatear dirección
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Manejar conexión
  const handleConnect = () => {
    open()
  }

  // Si no está conectado, mostrar botón de conexión
  if (!isConnected) {
    return (
      <Button
        variant="primary"
        size={size}
        className={`${className} cursor-pointer`}
        onClick={handleConnect}
        type="button"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {t('connect')}
      </Button>
    )
  }

  // Si está conectado pero en red incorrecta
  if (!isCorrectNetwork) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`${className} border-red-200 text-red-600 hover:bg-red-50 cursor-pointer`}
        onClick={handleConnect}
        type="button"
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        {t('switchNetwork')}
      </Button>
    )
  }

  // Si está conectado y en red correcta
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size={size}
        className="flex items-center space-x-2 cursor-pointer"
        onClick={copyAddress}
        type="button"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="hidden sm:block">{formatAddress(address!)}</span>
        <span className="hidden md:block text-xs text-gray-500">
          0.0000 ETH
        </span>
        {copied ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size={size}
        className="text-red-600 hover:bg-red-50 cursor-pointer"
        onClick={handleConnect}
        type="button"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  )
}
