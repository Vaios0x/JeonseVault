'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Code, 
  FileText, 
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Github,
  Terminal,
  Database,
  Shield,
  Zap,
  MessageCircle,
  Users,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const docSections = [
    {
      id: 'getting-started',
      title: '시작하기',
      description: 'JeonseVault 개발 환경 설정',
      icon: Zap,
      articles: [
        { title: '개발 환경 설정', path: '/docs/setup' },
        { title: '스마트 컨트랙트 배포', path: '/docs/deployment' },
        { title: '프론트엔드 연동', path: '/docs/frontend' }
      ]
    },
    {
      id: 'smart-contracts',
      title: '스마트 컨트랙트',
      description: 'JeonseVault 스마트 컨트랙트 API',
      icon: Code,
      articles: [
        { title: 'JeonseVault.sol', path: '/docs/contracts/jeonsevault' },
        { title: 'InvestmentPool.sol', path: '/docs/contracts/investment' },
        { title: 'PropertyOracle.sol', path: '/docs/contracts/oracle' },
        { title: 'ComplianceModule.sol', path: '/docs/contracts/compliance' }
      ]
    },
    {
      id: 'api',
      title: 'API 참조',
      description: 'REST API 및 Web3 인터페이스',
      icon: Database,
      articles: [
        { title: 'REST API 개요', path: '/docs/api/overview' },
        { title: '인증 및 권한', path: '/docs/api/auth' },
        { title: '보증금 API', path: '/docs/api/deposits' },
        { title: '투자 API', path: '/docs/api/investments' }
      ]
    },
    {
      id: 'security',
      title: '보안',
      description: '보안 가이드 및 모범 사례',
      icon: Shield,
      articles: [
        { title: '보안 모범 사례', path: '/docs/security/best-practices' },
        { title: 'KYC/AML 가이드', path: '/docs/security/kyc' },
        { title: '감사 보고서', path: '/docs/security/audit' }
      ]
    }
  ]

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
                <h1 className="text-3xl font-bold text-gray-900">문서</h1>
                <p className="text-gray-600 mt-1">JeonseVault 개발자 문서</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </Button>
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
                placeholder="문서 검색..."
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
          {/* Quick Start */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">빠른 시작</h2>
              <p className="text-blue-100 mb-6">
                JeonseVault 플랫폼을 개발하고 통합하는 방법을 알아보세요.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  <Terminal className="w-4 h-4 mr-2" />
                  시작하기
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  예제 보기
                </Button>
              </div>
            </div>
          </div>

          {/* Documentation Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {docSections.map((section) => (
              <div key={section.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <section.icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {section.articles.map((article, index) => (
                    <Link 
                      key={index}
                      href={article.path}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm text-gray-700">{article.title}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* API Reference */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">API 참조</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">REST API</h3>
                <p className="text-sm text-gray-600 mb-3">HTTP 기반 REST API</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  API 문서
                </Button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Web3 API</h3>
                <p className="text-sm text-gray-600 mb-3">블록체인 직접 연동</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Web3 문서
                </Button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">SDK</h3>
                <p className="text-sm text-gray-600 mb-3">JavaScript/TypeScript SDK</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  SDK 문서
                </Button>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">코드 예제</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">보증금 생성</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
{`// 보증금 생성 예제
const createDeposit = async () => {
  const jeonseVault = new JeonseVault(contractAddress);
  
  const tx = await jeonseVault.createDeposit({
    landlord: "0x...",
    amount: ethers.parseEther("500000000"),
    startDate: Math.floor(Date.now() / 1000),
    endDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    propertyId: "PROP-001"
  });
  
  await tx.wait();
  console.log("보증금이 생성되었습니다!");
};`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">투자 풀 참여</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
{`// 투자 풀 참여 예제
const investInPool = async () => {
  const investmentPool = new InvestmentPool(poolAddress);
  
  const tx = await investmentPool.invest({
    value: ethers.parseEther("10000000")
  });
  
  await tx.wait();
  console.log("투자 풀에 참여했습니다!");
};`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">개발자 리소스</h3>
              <div className="space-y-3">
                <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <Github className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">GitHub 저장소</span>
                </Link>
                <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">API 명세서</span>
                </Link>
                <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <Code className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">코드 샘플</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">커뮤니티</h3>
              <div className="space-y-3">
                <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">개발자 포럼</span>
                </Link>
                <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Discord 채널</span>
                </Link>
                <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">개발자 지원</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
