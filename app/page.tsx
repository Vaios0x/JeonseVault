'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Shield, TrendingUp, BarChart3, Users, CheckCircle, ArrowRight, Star, Zap, Globe, Lock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'


export default function HomePage() {
  const t = useTranslations('home')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {t('hero.subtitle')}
            </p>
                         <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/dashboard">
                 <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                   {t('hero.dashboard')}
                   <ArrowRight className="w-5 h-5 ml-2" />
                 </Button>
               </Link>
               <Link href="/deposit/create">
                 <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                   {t('hero.createDeposit')}
                 </Button>
               </Link>
             </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('features.security.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.security.description')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('features.investment.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.investment.description')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('features.transparency.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.transparency.description')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('features.community.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.community.description')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('features.compliance.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.compliance.description')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('features.performance.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.performance.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('stats.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('stats.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">₩2.5B</div>
              <p className="text-gray-600">{t('stats.totalValue')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">15,420</div>
              <p className="text-gray-600">{t('stats.totalDeposits')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">8,920</div>
              <p className="text-gray-600">{t('stats.totalInvestors')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">6.8%</div>
              <p className="text-gray-600">{t('stats.avgReturn')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('howItWorks.step1.title')}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('howItWorks.step2.title')}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('howItWorks.step3.title')}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {t('cta.subtitle')}
          </p>
                     <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/dashboard">
               <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                 {t('cta.dashboard')}
                 <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
             </Link>
             <Link href="/deposit/create">
               <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                 {t('cta.createDeposit')}
               </Button>
             </Link>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">JeonseVault</h3>
              <p className="text-gray-400">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/deposit/create" className="hover:text-white">{t('footer.createDeposit')}</Link></li>
                <li><Link href="/investment" className="hover:text-white">{t('footer.invest')}</Link></li>
                <li><Link href="/stats" className="hover:text-white">{t('footer.stats')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">{t('footer.about')}</Link></li>
                <li><Link href="/contact" className="hover:text-white">{t('footer.contact')}</Link></li>
                <li><Link href="/privacy" className="hover:text-white">{t('footer.privacy')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">{t('footer.help')}</Link></li>
                <li><Link href="/docs" className="hover:text-white">{t('footer.docs')}</Link></li>
                <li><Link href="/status" className="hover:text-white">{t('footer.status')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JeonseVault. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
