'use client'

import { useState } from 'react'
import { UserPlus, Home, Shield, TrendingUp, ArrowRight, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function SimpleHowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const t = useTranslations('home.howItWorks')

  const steps = [
    {
      icon: UserPlus,
      title: t('steps.kyc.title'),
      description: t('steps.kyc.description'),
      details: t.raw('steps.kyc.details'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Home,
      title: t('steps.property.title'),
      description: t('steps.property.description'),
      details: t.raw('steps.property.details'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: t('steps.smartContract.title'),
      description: t('steps.smartContract.description'),
      details: t.raw('steps.smartContract.details'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: t('steps.investment.title'),
      description: t('steps.investment.description'),
      details: t.raw('steps.investment.details'),
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
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
            {steps[activeStep].details.map((detail: string, idx: number) => (
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
