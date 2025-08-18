'use client'

import { useState } from 'react'
import { UserPlus, Home, Shield, TrendingUp, ArrowRight, Check } from 'lucide-react'

export function SimpleHowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      icon: UserPlus,
      title: '1. KYC 인증',
      description: '실명 인증과 은행 계좌 연결로 안전한 거래 환경 구축',
      details: [
        '한국 실명 인증 시스템 연동',
        '은행 계좌 연결 및 검증',
        '거래 한도 설정',
        '컴플라이언스 체크'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Home,
      title: '2. 부동산 등록',
      description: '부동산 소유권 확인 및 시장 가치 평가를 통한 검증',
      details: [
        '부동산 등기부 등본 확인',
        '현재 시장 가치 평가',
        '임대인 소유권 검증',
        '부동산 상태 점검'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: '3. 스마트 컨트랙트',
      description: '보증금을 스마트 컨트랙트에 예치하여 안전하게 보관',
      details: [
        '자동 에스크로 시스템',
        '계약 조건 코드화',
        '투명한 자금 관리',
        '분쟁 해결 메커니즘'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: '4. 투자 및 수익',
      description: '보증금의 일부를 활용한 안전한 투자로 추가 수익 창출',
      details: [
        '보증금 20% 투자 풀 활용',
        '연 6% 안정적 수익률',
        '분산 투자 포트폴리오',
        '실시간 수익률 모니터링'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            어떻게 작동하나요?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            JeonseVault는 4단계의 간단하고 안전한 프로세스로 전세 보증금을 보호하고 수익을 창출합니다
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative cursor-pointer transition-all duration-300 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl ${
                index <= activeStep ? 'opacity-100' : 'opacity-60'
              }`}
              onClick={() => setActiveStep(index)}
            >
              {/* Step Icon */}
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                {(() => {
                  const IconComponent = step.icon
                  return <IconComponent className="w-8 h-8 text-white" />
                })()}
                {index <= activeStep && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Active Step Details */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${steps[activeStep].color} flex items-center justify-center mr-4`}>
              {(() => {
                const IconComponent = steps[activeStep].icon
                return <IconComponent className="w-6 h-6 text-white" />
              })()}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {steps[activeStep].title}
              </h3>
              <p className="text-gray-600">
                {steps[activeStep].description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps[activeStep].details.map((detail, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                <span className="text-gray-700">{detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              지금 바로 시작하세요
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              간단한 4단계로 안전하고 수익성 있는 전세 보증금 관리를 경험해보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">
                보증금 예치하기
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              
              <button className="px-8 py-3 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                더 자세히 알아보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
