'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone,
  FileText,
  Video,
  BookOpen,
  Shield,
  TrendingUp,
  Home,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface HelpCategory {
  id: string
  title: string
  description: string
  icon: any
  articles: number
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: '시작하기',
      description: 'JeonseVault 사용을 위한 기본 가이드',
      icon: Home,
      articles: 8
    },
    {
      id: 'deposits',
      title: '보증금 관리',
      description: '보증금 예치 및 관리 방법',
      icon: Shield,
      articles: 12
    },
    {
      id: 'investments',
      title: '투자',
      description: '투자 풀 및 수익 관리',
      icon: TrendingUp,
      articles: 10
    },
    {
      id: 'security',
      title: '보안',
      description: '보안 및 KYC 인증',
      icon: Shield,
      articles: 6
    },
    {
      id: 'account',
      title: '계정 관리',
      description: '계정 설정 및 개인정보',
      icon: Users,
      articles: 5
    },
    {
      id: 'technical',
      title: '기술 지원',
      description: '기술적 문제 해결',
      icon: Settings,
      articles: 7
    }
  ]

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'JeonseVault는 어떻게 작동하나요?',
      answer: 'JeonseVault는 블록체인 기반의 스마트 컨트랙트를 사용하여 전세 보증금을 안전하게 관리합니다. 임차인이 보증금을 예치하면 스마트 컨트랙트가 자동으로 관리하며, 계약 기간이 끝나면 자동으로 반환됩니다.',
      category: 'getting-started'
    },
    {
      id: '2',
      question: '보증금을 예치하려면 어떻게 해야 하나요?',
      answer: '1. 지갑을 연결하세요. 2. KYC 인증을 완료하세요. 3. "새 보증금 예치" 버튼을 클릭하세요. 4. 필요한 정보를 입력하고 검토하세요. 5. 거래를 확인하세요.',
      category: 'deposits'
    },
    {
      id: '3',
      question: '투자 풀에 참여할 수 있나요?',
      answer: '네, 보증금의 일부를 투자 풀에 활용할 수 있습니다. 투자 비율은 10-30% 사이에서 선택할 수 있으며, 연 6-8%의 수익률을 기대할 수 있습니다.',
      category: 'investments'
    },
    {
      id: '4',
      question: 'KYC 인증이 필요한 이유는 무엇인가요?',
      answer: '한국의 금융 규정에 따라 실명 인증이 필요합니다. 이를 통해 사기 방지 및 안전한 거래 환경을 제공합니다.',
      category: 'security'
    },
    {
      id: '5',
      question: '수수료는 얼마인가요?',
      answer: '에스크로 수수료는 보증금의 0.1%입니다. 투자 풀 이용 시 추가 수수료는 없습니다.',
      category: 'deposits'
    },
    {
      id: '6',
      question: '보증금을 언제 반환받을 수 있나요?',
      answer: '계약 기간이 종료되면 자동으로 반환됩니다. 중도 해지 시에는 조기 해지 수수료가 적용될 수 있습니다.',
      category: 'deposits'
    },
    {
      id: '7',
      question: '사기 위험은 없나요?',
      answer: 'JeonseVault는 블록체인 기술과 스마트 컨트랙트를 사용하여 사기를 방지합니다. 모든 거래는 투명하게 기록되며, KYC 인증을 통해 안전성을 보장합니다.',
      category: 'security'
    },
    {
      id: '8',
      question: '지원되는 지갑은 무엇인가요?',
      answer: 'Kaia Wallet, Kaikas Wallet, MetaMask 등 EVM 호환 지갑을 지원합니다.',
      category: 'technical'
    }
  ]

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">도움말</h1>
                <p className="text-gray-600 mt-1">JeonseVault 사용에 대한 모든 정보</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="도움말 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 채팅</h3>
              <p className="text-gray-600 mb-4">24/7 고객 지원팀과 실시간으로 대화하세요</p>
              <Button className="w-full">
                채팅 시작하기
              </Button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">이메일 지원</h3>
              <p className="text-gray-600 mb-4">상세한 문의사항을 이메일로 보내주세요</p>
              <Button variant="outline" className="w-full">
                이메일 보내기
              </Button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">전화 지원</h3>
              <p className="text-gray-600 mb-4">평일 9AM-6PM 전화 지원</p>
              <Button variant="outline" className="w-full">
                1588-1234
              </Button>
            </div>
          </div>

          {/* Help Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">도움말 카테고리</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div 
                  key={category.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <category.icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{category.articles}개의 문서</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">학습 자료</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <FileText className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">사용자 가이드</h3>
                <p className="text-sm text-gray-600 mb-4">단계별 사용 방법을 확인하세요</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  보기
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Video className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">비디오 튜토리얼</h3>
                <p className="text-sm text-gray-600 mb-4">시각적 가이드를 통해 학습하세요</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  보기
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <BookOpen className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">API 문서</h3>
                <p className="text-sm text-gray-600 mb-4">개발자를 위한 기술 문서</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  보기
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Shield className="w-8 h-8 text-red-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">보안 가이드</h3>
                <p className="text-sm text-gray-600 mb-4">안전한 사용을 위한 팁</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  보기
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">연락처</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">고객 지원</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">1588-1234</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">support@jeonsevault.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">실시간 채팅 (24/7)</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">운영 시간</h3>
                <div className="space-y-2 text-gray-600">
                  <p>평일: 09:00 - 18:00</p>
                  <p>주말: 10:00 - 17:00</p>
                  <p>공휴일: 휴무</p>
                  <p className="text-sm text-gray-500 mt-2">* 긴급 상황 시 24시간 지원</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
