'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount, useDisconnect } from 'wagmi'
import { Menu, X, Home, PlusCircle, BarChart3, User, LogOut, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const navigation = [
    { name: '홈', href: '/', icon: Home },
    { name: '대시보드', href: '/dashboard', icon: User },
    { name: '보증금 예치', href: '/deposit/create', icon: PlusCircle },
    { name: '투자 풀', href: '/investment', icon: BarChart3 },
    { name: '통계', href: '/stats', icon: BarChart3 },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-korean rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JV</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                JeonseVault
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors focus-ring rounded-md px-3 py-2"
                tabIndex={0}
                aria-label={`${item.name} 페이지로 이동`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                {/* Wallet Info */}
                <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(address!)}
                  </span>
                </div>
                
                {/* Disconnect Button */}
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  size="sm"
                  className="btn-hover"
                  aria-label="지갑 연결 해제"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">연결 해제</span>
                  <span className="sm:hidden">해제</span>
                </Button>
              </div>
            ) : (
              /* AppKit web component opens Reown modal when not connected */
              <appkit-button />
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus-ring"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 slide-in">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors rounded-lg focus-ring"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={0}
                  aria-label={`${item.name} 페이지로 이동`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              
              {/* Mobile Wallet Status */}
              {isConnected && (
                <div className="px-4 py-3 border-t border-gray-200 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        연결됨: {formatAddress(address!)}
                      </span>
                    </div>
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      size="sm"
                      className="btn-hover"
                      aria-label="지갑 연결 해제"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      해제
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
