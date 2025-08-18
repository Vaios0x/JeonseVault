'use client'

import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function TermsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">이용약관</h1>
              <p className="text-gray-600 mt-1">JeonseVault 서비스 이용 약관</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <FileText className="w-12 h-12" />
              <div>
                <h2 className="text-2xl font-bold">서비스 이용약관</h2>
                <p className="text-blue-100">JeonseVault 서비스 이용에 관한 모든 조건</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">2024</div>
                <div className="text-sm text-blue-100">시행일</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">한국어</div>
                <div className="text-sm text-blue-100">기본 언어</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">법적</div>
                <div className="text-sm text-blue-100">구속력</div>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">이용약관</h2>
            
            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제1조 (목적)</h3>
                <p className="text-gray-600">
                  이 약관은 JeonseVault(이하 "회사")가 제공하는 블록체인 기반 전세 보증금 관리 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제2조 (정의)</h3>
                <div className="space-y-2 text-gray-600">
                  <p>1. "서비스"란 회사가 제공하는 전세 보증금 스마트 컨트랙트 관리 플랫폼을 의미합니다.</p>
                  <p>2. "이용자"란 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</p>
                  <p>3. "보증금"이란 전세 계약에 따른 보증금을 의미합니다.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제3조 (서비스의 제공)</h3>
                <div className="space-y-2 text-gray-600">
                  <p>회사는 다음과 같은 서비스를 제공합니다:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>전세 보증금 스마트 컨트랙트 관리</li>
                    <li>투자 풀 서비스</li>
                    <li>KYC/AML 인증 서비스</li>
                    <li>부동산 정보 검증 서비스</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제4조 (이용계약의 체결)</h3>
                <div className="space-y-2 text-gray-600">
                  <p>1. 이용계약은 이용자가 약관에 동의하고 회사가 정한 절차에 따라 서비스 이용을 신청한 후, 회사가 이를 승낙함으로써 체결됩니다.</p>
                  <p>2. 회사는 다음 각 호에 해당하는 경우 이용계약 체결을 거부할 수 있습니다:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                    <li>허위 정보를 기재하거나 회사가 요구하는 내용을 기재하지 않은 경우</li>
                    <li>미성년자가 법정대리인의 동의 없이 신청한 경우</li>
                    <li>기타 회사가 정한 이용신청 요건을 충족하지 못한 경우</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제5조 (서비스 이용)</h3>
                <div className="space-y-2 text-gray-600">
                  <p>1. 이용자는 서비스 이용 시 다음 사항을 준수해야 합니다:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>관련 법령 및 이 약관의 준수</li>
                    <li>회사의 서비스 운영에 지장을 주는 행위 금지</li>
                    <li>타인의 권리나 명예, 신용 등을 침해하는 행위 금지</li>
                    <li>허위 정보 제공 금지</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제6조 (수수료)</h3>
                <div className="space-y-2 text-gray-600">
                  <p>1. 서비스 이용에 따른 수수료는 다음과 같습니다:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>에스크로 수수료: 보증금의 0.1%</li>
                    <li>투자 풀 수수료: 수익의 1%</li>
                    <li>조기 해지 수수료: 보증금의 0.5%</li>
                  </ul>
                  <p>2. 수수료는 서비스 이용 시 자동으로 차감됩니다.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제7조 (책임제한)</h3>
                <div className="space-y-2 text-gray-600">
                  <p>1. 회사는 천재지변, 전쟁, 기타 불가항력적 사유로 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                  <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                  <p>3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">제8조 (분쟁해결)</h3>
                <div className="space-y-2 text-gray-600">
                  <p>1. 서비스 이용으로 발생한 분쟁에 대해 소송이 필요할 경우 회사의 본사 소재지를 관할하는 법원을 관할법원으로 합니다.</p>
                  <p>2. 이 약관은 대한민국 법률에 따라 규율되고 해석됩니다.</p>
                </div>
              </section>
            </div>
          </div>

          {/* Important Notices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center space-x-4 mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">중요 고지사항</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 투자는 원금 손실 위험이 있습니다</li>
                <li>• 과거 수익률이 미래 수익률을 보장하지 않습니다</li>
                <li>• 블록체인 거래는 되돌릴 수 없습니다</li>
                <li>• 개인키 관리는 이용자의 책임입니다</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-4 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">이용자 보호</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 스마트 컨트랙트 보안 감사 완료</li>
                <li>• KYC/AML 규정 준수</li>
                <li>• 투명한 거래 기록</li>
                <li>• 24/7 고객 지원</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
            <div className="text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">약관 관련 문의</h3>
              <p className="text-gray-600 mb-4">
                이용약관에 관한 문의사항이 있으시면 언제든 연락주세요.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>이메일: legal@jeonsevault.com</p>
                <p>전화: 1588-1234</p>
                <p>주소: 서울특별시 강남구 테헤란로 123</p>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                최종 업데이트: 2024년 1월 15일
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
