'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function TermsPage() {
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
                {t('terms')}
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
              <h2>Terms of Service</h2>
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using JeonseVault, you accept and agree to be bound by the terms and provision of this agreement.</p>
              
              <h3>2. Description of Service</h3>
              <p>JeonseVault is a blockchain-based escrow platform for Korean housing deposits (Jeonse) that provides secure deposit management and investment opportunities.</p>
              
              <h3>3. User Responsibilities</h3>
              <p>Users are responsible for:</p>
              <ul>
                <li>Providing accurate information</li>
                <li>Maintaining the security of their accounts</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>
              
              <h3>4. Privacy and Data Protection</h3>
              <p>We are committed to protecting your privacy and personal information in accordance with Korean data protection laws.</p>
              
              <h3>5. Limitation of Liability</h3>
              <p>JeonseVault is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service.</p>
              
              <h3>6. Changes to Terms</h3>
              <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.</p>
              
              <h3>7. Contact Information</h3>
              <p>For questions about these terms, please contact us at support@jeonsevault.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
