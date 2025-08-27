'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, BookOpen, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function HelpPage() {
  const t = useTranslations('common')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('help')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How can we help you?</h2>
              <p className="text-gray-600 text-lg">Find answers to common questions and get support</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Link href="/docs">
                <div className="bg-gray-50 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
                  <p className="text-sm text-gray-600">Learn how to use JeonseVault</p>
                </div>
              </Link>
              
              <Link href="/contact">
                <div className="bg-gray-50 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-600">Get help from our team</p>
                </div>
              </Link>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <HelpCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
                <p className="text-sm text-gray-600">Common questions answered</p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">What is JeonseVault?</h4>
                  <p className="text-gray-600">JeonseVault is a blockchain-based escrow platform for Korean housing deposits (Jeonse) that provides secure deposit management and investment opportunities.</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">How does the deposit process work?</h4>
                  <p className="text-gray-600">The deposit process involves KYC verification, property registration, smart contract creation, and optional investment participation for additional returns.</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">What are the fees?</h4>
                  <p className="text-gray-600">We charge a 0.5% escrow fee, network gas fees apply, and there's a 1% early release fee if applicable.</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Is my deposit safe?</h4>
                  <p className="text-gray-600">Yes, your deposit is protected by multi-signature smart contracts and real-time monitoring, ensuring bank-level security.</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">How do I get started?</h4>
                  <p className="text-gray-600">Connect your wallet, complete KYC verification, and you can start creating deposits or investing in our pools.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
