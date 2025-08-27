'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, PlusCircle, BarChart3, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { SimpleWalletConnect } from '@/components/ui/SimpleWalletConnect'
import { useTranslations } from 'next-intl'


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = useTranslations('navigation')
  // Wallet connection state removed for simplified version

  // Crear navigation dinámicamente para que se actualice con el idioma
  const navigation = [
    { name: t('home'), href: '/', icon: Home },
    { name: t('dashboard'), href: '/dashboard', icon: User },
    { name: t('deposit'), href: '/deposit/create', icon: PlusCircle },
    { name: t('investment'), href: '/investment', icon: BarChart3 },
    { name: t('stats'), href: '/stats', icon: BarChart3 },
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

          {/* Language Selector and Wallet Connect */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <LanguageSelector size="sm" />

            {/* Wallet Connect Button */}
            <SimpleWalletConnect size="sm" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
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
              
              {/* Mobile wallet status removed for simplified version */}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
