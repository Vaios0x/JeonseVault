import './globals.css'
import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import { headers } from 'next/headers'
import ContextProvider from '@/context'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansKR = Noto_Sans_KR({ 
  subsets: ['latin'], 
  variable: '--font-noto-sans-kr',
  weight: ['300', '400', '500', '700']
})

export const metadata: Metadata = {
  title: 'JeonseVault - 혁신적인 전세 보증금 스마트 컨트랙트 플랫폼',
  description: '한국의 전세 시스템을 위한 블록체인 기반 에스크로 플랫폼. 안전하고 투명한 보증금 관리와 투자 기회를 제공합니다.',
  keywords: ['전세', '보증금', '블록체인', '스마트컨트랙트', '에스크로', '투자', 'Kaia', '스테이블코인'],
  authors: [{ name: 'JeonseVault Team' }],
  openGraph: {
    title: 'JeonseVault - 전세 보증금 스마트 컨트랙트 플랫폼',
    description: '900조원 규모의 전세 시장을 혁신하는 블록체인 솔루션',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'JeonseVault'
  },
  manifest: '/manifest.json',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#0052CC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JeonseVault" />
      </head>
      <body className="font-korean antialiased bg-gray-50 min-h-screen flex flex-col">
        <ContextProvider cookies={cookies}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ContextProvider>
      </body>
    </html>
  )
}
