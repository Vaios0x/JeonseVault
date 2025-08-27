'use client'

import Link from 'next/link'
import { Github, Twitter, Mail, Shield, FileText, HelpCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const t = useTranslations('footer')

  // Crear footerLinks dinámicamente para que se actualice con el idioma
  const footerLinks = {
    platform: [
      { name: t('platform.deposit'), href: '/deposit/create' },
      { name: t('platform.investment'), href: '/investment' },
      { name: t('platform.dashboard'), href: '/dashboard' },
      { name: t('platform.stats'), href: '/stats' },
    ],
    support: [
      { name: t('support.help'), href: '/help', icon: HelpCircle },
      { name: t('support.docs'), href: '/docs', icon: FileText },
      { name: t('support.security'), href: '/security', icon: Shield },
      { name: t('support.contact'), href: '/contact', icon: Mail },
    ],
    social: [
      { name: 'GitHub', href: 'https://github.com/jeonsevault', icon: Github },
      { name: 'Twitter', href: 'https://twitter.com/jeonsevault', icon: Twitter },
      { name: 'Email', href: 'mailto:support@jeonsevault.com', icon: Mail },
    ]
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-korean rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JV</span>
              </div>
              <span className="text-xl font-bold">JeonseVault</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('description')}
            </p>
            <div className="text-xs text-gray-500">
              <p>🏆 {t('hackathon')}</p>
              <p>🌐 {t('testnet')}</p>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('platform.title')}</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm focus-ring rounded"
                    tabIndex={0}
                    aria-label={`${link.name} 페이지로 이동`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('support.title')}</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm focus-ring rounded"
                    tabIndex={0}
                    aria-label={`${link.name} 페이지로 이동`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Tech */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('social.title')}</h3>
            <ul className="space-y-3 mb-6">
              {footerLinks.social.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm focus-ring rounded"
                    tabIndex={0}
                    aria-label={`${link.name} 페이지로 이동 (새 창)`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Tech Stack */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-300">{t('techStack.title')}</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-800 text-xs rounded">Kaia</span>
                <span className="px-2 py-1 bg-gray-800 text-xs rounded">Solidity</span>
                <span className="px-2 py-1 bg-gray-800 text-xs rounded">Next.js</span>
                <span className="px-2 py-1 bg-gray-800 text-xs rounded">TypeScript</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gradient-korean korean-number">
                1,000조원
              </div>
              <div className="text-sm text-gray-400">{t('stats.marketSize')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient-korean korean-number">
                4,000건+
              </div>
              <div className="text-sm text-gray-400">{t('stats.fraudCases')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient-korean korean-number">
                0.1%
              </div>
              <div className="text-sm text-gray-400">{t('stats.escrowFee')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient-korean korean-number">
                6%
              </div>
              <div className="text-sm text-gray-400">{t('stats.expectedReturn')}</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © {currentYear} JeonseVault. {t('copyright')}
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors focus-ring rounded">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors focus-ring rounded">
              {t('terms')}
            </Link>
            <span className="text-gray-600">|</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{t('testnet')}</span>
            </div>
          </div>
        </div>

        {/* Made by Vai0sx */}
        <div className="border-t border-gray-800 mt-4 pt-4 text-center">
          <a 
            href="https://t.me/Vai0sx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white transition-colors focus-ring rounded inline-flex items-center space-x-1"
            aria-label="Vai0sx의 Telegram으로 이동 (새 창)"
          >
            <span>{t('madeBy')}</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
