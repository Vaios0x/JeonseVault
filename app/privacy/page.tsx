'use client'

import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Users,
  FileText,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function PrivacyPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">개인정보 처리방침</h1>
              <p className="text-gray-600 mt-1">JeonseVault의 개인정보 보호 정책</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <Shield className="w-12 h-12" />
              <div>
                <h2 className="text-2xl font-bold">개인정보 보호</h2>
                <p className="text-blue-100">최고 수준의 개인정보 보호를 약속합니다</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">AES-256</div>
                <div className="text-sm text-blue-100">암호화</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-blue-100">데이터 보호</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">GDPR</div>
                <div className="text-sm text-blue-100">준수</div>
              </div>
            </div>
          </div>

          {/* Privacy Policy Content */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">개인정보 처리방침</h2>
            
            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. 수집하는 개인정보</h3>
                <div className="space-y-2">
                  <p>• 필수정보: 이름, 이메일, 전화번호, 주민등록번호</p>
                  <p>• 선택정보: 프로필 사진, 주소</p>
                  <p>• 자동수집정보: IP 주소, 쿠키, 접속 로그</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. 개인정보 수집 목적</h3>
                <div className="space-y-2">
                  <p>• 서비스 제공 및 계정 관리</p>
                  <p>• KYC/AML 규정 준수</p>
                  <p>• 고객 지원 및 문의 응답</p>
                  <p>• 서비스 개선 및 마케팅</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. 개인정보 보호 조치</h3>
                <div className="space-y-2">
                  <p>• AES-256 암호화 저장</p>
                  <p>• 접근 권한 관리</p>
                  <p>• 정기적인 보안 감사</p>
                  <p>• 직원 보안 교육</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. 개인정보 보유 기간</h3>
                <div className="space-y-2">
                  <p>• 서비스 이용 기간 + 5년</p>
                  <p>• 법정 보존 의무 기간 준수</p>
                  <p>• 탈퇴 시 즉시 삭제</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. 개인정보 제3자 제공</h3>
                <div className="space-y-2">
                  <p>• 원칙적으로 제3자 제공 금지</p>
                  <p>• 법적 의무에 의한 경우만 제공</p>
                  <p>• 사전 동의 시에만 제공</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">6. 이용자의 권리</h3>
                <div className="space-y-2">
                  <p>• 개인정보 열람 요구</p>
                  <p>• 개인정보 정정·삭제 요구</p>
                  <p>• 개인정보 처리정지 요구</p>
                  <p>• 개인정보 이전 요구</p>
                </div>
              </section>
            </div>
          </div>

          {/* Data Protection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <Lock className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">데이터 암호화</h3>
              </div>
              <p className="text-gray-600 mb-4">
                모든 개인정보는 AES-256 암호화로 저장되며, 전송 시에도 SSL/TLS 암호화를 사용합니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 저장 데이터 암호화</li>
                <li>• 전송 데이터 암호화</li>
                <li>• 키 관리 시스템</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <Eye className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">접근 제어</h3>
              </div>
              <p className="text-gray-600 mb-4">
                개인정보에 대한 접근은 최소 권한 원칙에 따라 엄격하게 제한됩니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 역할 기반 접근 제어</li>
                <li>• 다중 인증 시스템</li>
                <li>• 접근 로그 기록</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">개인정보 보호책임자</h3>
              <p className="text-gray-600 mb-4">
                개인정보 처리에 관한 문의사항이 있으시면 언제든 연락주세요.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>이름: 김보안 (개인정보 보호책임자)</p>
                <p>이메일: privacy@jeonsevault.com</p>
                <p>전화: 1588-1234</p>
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
