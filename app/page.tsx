'use client'

import { SimpleHowItWorks } from '@/components/home/SimpleHowItWorks'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="block">한국 전세 시장을 혁신하는</span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              블록체인 에스크로 플랫폼
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            JeonseVault는 스마트 컨트랙트 기술로 전세 보증금을 안전하게 보호하고, 
            투자 기회를 제공하여 900조원 규모의 전세 시장을 혁신합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300">
              지금 시작하기
            </button>
            
            <button className="border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300">
              데모 체험하기
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Kaia 공식 지원</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>OpenZeppelin 보안</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>한국 규정 준수</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              숫자로 보는 JeonseVault
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              전세 시장의 문제점을 해결하고 새로운 기회를 창출하는 혁신적인 플랫폼
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                1,000조원
              </div>
              <div className="text-gray-600">전세 시장 규모</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                4,000건+
              </div>
              <div className="text-gray-600">연간 전세 사기</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                0.1%
              </div>
              <div className="text-gray-600">낮은 수수료</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                6%
              </div>
              <div className="text-gray-600">연간 수익률</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <SimpleHowItWorks />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            전세 혁신의 새로운 시작
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            JeonseVault와 함께 안전하고 수익성 있는 전세 보증금 관리를 시작하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:bg-gray-100 transition-colors">
              지금 시작하기
            </button>
            <button className="border-2 border-blue-300 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors">
              투자 가이드 보기
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
