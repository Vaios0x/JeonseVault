'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function PrivacyPage() {
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
                {t('privacy')}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose prose-lg max-w-none">
              <h2>Privacy Policy</h2>
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              
              <h3>1. Information We Collect</h3>
              <p>We collect information you provide directly to us, such as when you create an account, make a deposit, or contact us for support.</p>
              
              <h3>2. How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Process transactions and manage deposits</li>
                <li>Send you important updates and notifications</li>
                <li>Improve our services and user experience</li>
              </ul>
              
              <h3>3. Information Sharing</h3>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law.</p>
              
              <h3>4. Data Security</h3>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              
              <h3>5. Your Rights</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt out of marketing communications</li>
              </ul>
              
              <h3>6. Contact Us</h3>
              <p>If you have questions about this privacy policy, please contact us at privacy@jeonsevault.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
