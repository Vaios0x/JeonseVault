'use client'

import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Eye,
  FileText,
  Users,
  Database,
  Zap,
  BarChart3,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Shield,
      title: '스마트 컨트랙트 보안',
      description: 'OpenZeppelin 라이브러리 기반의 검증된 보안 패턴',
      status: '완료'
    },
    {
      icon: Lock,
      title: 'KYC/AML 준수',
      description: '한국 금융 규정에 따른 실명 인증 시스템',
      status: '완료'
    },
    {
      icon: Database,
      title: '데이터 암호화',
      description: 'AES-256 암호화로 개인정보 보호',
      status: '완료'
    },
    {
      icon: Eye,
      title: '투명성',
      description: '모든 거래는 블록체인에 공개적으로 기록',
      status: '완료'
    }
  ]

  const auditResults = [
    { category: '스마트 컨트랙트', score: 95, status: '통과' },
    { category: 'KYC/AML', score: 98, status: '통과' },
    { category: '데이터 보호', score: 92, status: '통과' },
    { category: '시스템 가용성', score: 99, status: '통과' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">보안 정책</h1>
              <p className="text-gray-600 mt-1">JeonseVault의 보안 및 개인정보 보호 정책</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Security Overview */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <Shield className="w-12 h-12" />
              <div>
                <h2 className="text-2xl font-bold">보안 중심 설계</h2>
                <p className="text-green-100">최고 수준의 보안으로 자산을 보호합니다</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-green-100">사기 방지율</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">96/100</div>
                <div className="text-sm text-green-100">보안 점수</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">0건</div>
                <div className="text-sm text-green-100">보안 사고</div>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {feature.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Audit Results */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">보안 감사 결과</h2>
            <div className="space-y-4">
              {auditResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{result.category}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-900">{result.score}/100</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">규정 준수</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">한국 금융 규정</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 전자금융거래법 준수</li>
                  <li>• 개인정보보호법 준수</li>
                  <li>• 특정금융거래정보법 준수</li>
                </ul>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">국제 표준</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• ISO 27001 정보보안</li>
                  <li>• SOC 2 Type II 인증</li>
                  <li>• GDPR 준수</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Security Team */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">보안 문제 신고</h3>
              <p className="text-gray-600 mb-4">
                보안 취약점을 발견하셨나요? 즉시 저희 보안팀에 연락해주세요.
              </p>
              <div className="flex justify-center space-x-4">
                <Button>
                  <Mail className="w-4 h-4 mr-2" />
                  security@jeonsevault.com
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  보안 정책서
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
