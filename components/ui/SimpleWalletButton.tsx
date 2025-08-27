'use client'

import { useState } from 'react'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { Wallet, LogOut, Copy, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SimpleWalletButtonProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SimpleWalletButton({ 
  size = 'md',
  className = '' 
}: SimpleWalletButtonProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('wallet')
  
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
  })
  const { disconnect } = useDisconnect()

  // Copiar dirección al portapapeles
  const copyAddress = async () => {
    if (!address) return
    
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying address:', error)
    }
  }

  // Formatear dirección
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Formatear balance
  const formatBalance = () => {
    if (!balance) return '0.0000'
    return parseFloat(balance.formatted).toFixed(4)
  }

  // Si no está conectado, mostrar botón de conexión
  if (!isConnected || !address) {
    return (
      <Button
        variant="primary"
        size={size}
        className={`${className} cursor-pointer`}
        type="button"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {t('connect')}
      </Button>
    )
  }

  // Si está conectado, mostrar información de la wallet
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
        <span className="hidden sm:block">{formatAddress(address)}</span>
        <span className="hidden md:block text-xs text-gray-500">
          {formatBalance()} {balance?.symbol || 'ETH'}
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
        onClick={() => disconnect()}
        type="button"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  )
}
