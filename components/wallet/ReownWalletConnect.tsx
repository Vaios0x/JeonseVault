'use client'

import { useState } from 'react'
import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { 
  Wallet, 
  LogOut, 
  ChevronDown,
  User,
  Settings,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ReownWalletConnectProps {
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
}

export function ReownWalletConnect({ 
  variant = 'default', 
  className = '' 
}: ReownWalletConnectProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect, connectors } = useConnect()
  const [showDropdown, setShowDropdown] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDropdown(false)
  }

  const handleConnect = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] })
    }
  }

  if (!isConnected) {
    return (
      <div className={className}>
        <Button
          onClick={handleConnect}
          className="btn-hover"
          aria-label="지갑 연결"
        >
          <Wallet className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">지갑 연결</span>
          <span className="sm:hidden">연결</span>
        </Button>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={className}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            {formatAddress(address!)}
          </span>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={className}>
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {formatAddress(address!)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="btn-hover"
            aria-label="지갑 연결 해제"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={className}>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          aria-label="지갑 메뉴"
          aria-expanded={showDropdown}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            {formatAddress(address!)}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-500">연결된 지갑</p>
              <p className="text-sm font-medium text-gray-900">{formatAddress(address!)}</p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  setShowDropdown(false)
                  // Add account management functionality
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 mr-3" />
                계정 관리
              </button>
              
              <button
                onClick={() => {
                  setShowDropdown(false)
                  // Add settings functionality
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" />
                설정
              </button>
              
              <button
                onClick={() => {
                  setShowDropdown(false)
                  // Add security functionality
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4 mr-3" />
                보안
              </button>
            </div>
            
            <div className="border-t border-gray-100 pt-1">
              <button
                onClick={handleDisconnect}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                연결 해제
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

// Component ready for use
