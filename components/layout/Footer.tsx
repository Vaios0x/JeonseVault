'use client'

import Link from 'next/link'
import { Github, Twitter, Mail, Shield, FileText, HelpCircle } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: '보증금 예치', href: '/deposit/create' },
      { name: '투자 풀', href: '/investment' },
      { name: '대시보드', href: '/dashboard' },
      { name: '통계', href: '/stats' },
    ],
    support: [
      { name: '도움말 센터', href: '/help', icon: HelpCircle },
      { name: '문서', href: '/docs', icon: FileText },
      { name: '보안 정책', href: '/security', icon: Shield },
      { name: '문의하기', href: '/contact', icon: Mail },
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
              한국의 전세 시스템을 혁신하는 블록체인 기반 에스크로 플랫폼. 
              안전하고 투명한 보증금 관리와 투자 기회를 제공합니다.
            </p>
            <div className="text-xs text-gray-500">
              <p>🏆 Kaia Stablecoin Hackathon</p>
              <p>🌐 Kaia 테스트넷 배포</p>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">플랫폼</h3>
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
            <h3 className="font-semibold text-lg mb-4">지원</h3>
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
            <h3 className="font-semibold text-lg mb-4">연결</h3>
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
              <h4 className="font-medium text-sm text-gray-300">기술 스택</h4>
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
              <div className="text-sm text-gray-400">전세 시장 규모</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient-korean korean-number">
                4,000건+
              </div>
              <div className="text-sm text-gray-400">연간 전세 사기</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient-korean korean-number">
                0.1%
              </div>
              <div className="text-sm text-gray-400">에스크로 수수료</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gradient-korean korean-number">
                6%
              </div>
              <div className="text-sm text-gray-400">예상 연수익률</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © {currentYear} JeonseVault. 모든 권리 보유.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors focus-ring rounded">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors focus-ring rounded">
              이용약관
            </Link>
            <span className="text-gray-600">|</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Kaia 테스트넷</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
