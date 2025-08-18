'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { 
  ArrowLeft, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Users, 
  Clock,
  Shield,
  Eye,
  Plus,
  Filter,
  Search,
  Star,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface InvestmentPool {
  id: string
  name: string
  totalValue: string
  availableAmount: string
  totalInvestors: number
  expectedReturn: string
  actualReturn: string
  riskLevel: 'low' | 'medium' | 'high'
  duration: string
  minInvestment: string
  maxInvestment: string
  status: 'active' | 'full' | 'closed'
  description: string
  properties: string[]
  startDate: string
  endDate: string
}

interface UserInvestment {
  id: string
  poolId: string
  amount: string
  shares: string
  investmentDate: string
  currentValue: string
  profit: string
  profitPercentage: string
  status: 'active' | 'completed' | 'pending'
}

export default function InvestmentPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [activeTab, setActiveTab] = useState<'pools' | 'my-investments' | 'analytics'>('pools')
  const [selectedPool, setSelectedPool] = useState<InvestmentPool | null>(null)
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const [pools, setPools] = useState<InvestmentPool[]>([
    {
      id: 'POOL-001',
      name: '강남구 아파트 투자 풀',
      totalValue: '2,500,000,000',
      availableAmount: '500,000,000',
      totalInvestors: 45,
      expectedReturn: '6.2%',
      actualReturn: '6.8%',
      riskLevel: 'low',
      duration: '12개월',
      minInvestment: '50,000',
      maxInvestment: '100,000,000',
      status: 'active',
      description: '강남구 역삼동, 서초동 지역의 프리미엄 아파트 투자 풀입니다.',
      properties: ['서울특별시 강남구 역삼동 123-45', '서울특별시 서초구 서초동 67-89'],
      startDate: '2024-01-15',
      endDate: '2025-01-15'
    },
    {
      id: 'POOL-002',
      name: '서초구 오피스텔 투자 풀',
      totalValue: '1,800,000,000',
      availableAmount: '300,000,000',
      totalInvestors: 32,
      expectedReturn: '7.5%',
      actualReturn: '7.2%',
      riskLevel: 'medium',
      duration: '18개월',
      minInvestment: '100,000',
      maxInvestment: '200,000,000',
      status: 'active',
      description: '서초구 지역의 오피스텔 투자 풀입니다.',
      properties: ['서울특별시 서초구 서초동 101-202'],
      startDate: '2024-02-01',
      endDate: '2025-08-01'
    },
    {
      id: 'POOL-003',
      name: '마포구 상가 투자 풀',
      totalValue: '3,200,000,000',
      availableAmount: '0',
      totalInvestors: 78,
      expectedReturn: '8.5%',
      actualReturn: '8.9%',
      riskLevel: 'high',
      duration: '24개월',
      minInvestment: '200,000',
      maxInvestment: '500,000,000',
      status: 'full',
      description: '마포구 홍대 지역의 상가 투자 풀입니다.',
      properties: ['서울특별시 마포구 동교동 456-789'],
      startDate: '2024-01-01',
      endDate: '2026-01-01'
    }
  ])

  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([
    {
      id: 'INV-001',
      poolId: 'POOL-001',
      amount: '100,000,000',
      shares: '4.0%',
      investmentDate: '2024-01-20',
      currentValue: '106,800,000',
      profit: '6,800,000',
      profitPercentage: '6.8%',
      status: 'active'
    }
  ])

  const stats = {
    totalInvested: '100,000,000',
    totalProfit: '6,800,000',
    averageReturn: '6.8%',
    activeInvestments: '1',
    totalPools: '3',
    availablePools: '2'
  }

  const filteredPools = pools.filter(pool => {
    const matchesRisk = filterRisk === 'all' || pool.riskLevel === filterRisk
    const matchesSearch = pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRisk && matchesSearch
  })

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return '낮음'
      case 'medium': return '보통'
      case 'high': return '높음'
      default: return '알 수 없음'
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">지갑을 연결해주세요</h2>
          <p className="text-gray-600 mb-6">투자 기회를 보려면 지갑을 연결해야 합니다.</p>
          <Link href="/">
            <Button>
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

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
                <h1 className="text-3xl font-bold text-gray-900">투자 풀</h1>
                <p className="text-gray-600 mt-1">전세 보증금 기반 투자 기회를 발견하세요</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">잔액</p>
              <p className="text-lg font-semibold text-gray-900">
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 KAIA'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'pools', name: '투자 풀', icon: BarChart3 },
              { id: 'my-investments', name: '내 투자', icon: TrendingUp },
              { id: 'analytics', name: '분석', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'pools' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 투자 풀</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPools}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">투자 가능 풀</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.availablePools}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 투자자</p>
                    <p className="text-2xl font-bold text-gray-900">155</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">평균 수익률</p>
                    <p className="text-2xl font-bold text-gray-900">7.2%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="투자 풀 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">모든 위험도</option>
                    <option value="low">낮은 위험도</option>
                    <option value="medium">보통 위험도</option>
                    <option value="high">높은 위험도</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    필터
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    새 투자
                  </Button>
                </div>
              </div>
            </div>

            {/* Investment Pools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPools.map((pool) => (
                <div key={pool.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{pool.name}</h3>
                      <p className="text-gray-600 text-sm">{pool.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(pool.riskLevel)}`}>
                      {getRiskText(pool.riskLevel)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">총 가치</p>
                      <p className="text-lg font-semibold text-gray-900">{pool.totalValue}원</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">투자 가능</p>
                      <p className="text-lg font-semibold text-gray-900">{pool.availableAmount}원</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">예상 수익률</p>
                      <p className="text-lg font-semibold text-green-600">{pool.expectedReturn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">실제 수익률</p>
                      <p className="text-lg font-semibold text-green-600">{pool.actualReturn}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">투자자 수:</span>
                      <span className="font-medium">{pool.totalInvestors}명</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">투자 기간:</span>
                      <span className="font-medium">{pool.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">최소 투자:</span>
                      <span className="font-medium">{pool.minInvestment}원</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedPool(pool)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      상세보기
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      disabled={pool.status === 'full'}
                      onClick={() => {
                        setSelectedPool(pool)
                        setShowInvestModal(true)
                      }}
                    >
                      {pool.status === 'full' ? '마감됨' : '투자하기'}
                    </Button>
                  </div>

                  {pool.status === 'full' && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">투자 한도에 도달했습니다</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-investments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">내 투자</h2>
              <Link href="/investment">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  새 투자하기
                </Button>
              </Link>
            </div>

            {/* Investment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-600">총 투자 금액</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvested}원</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-600">총 수익</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalProfit}원</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-600">평균 수익률</p>
                <p className="text-2xl font-bold text-green-600">{stats.averageReturn}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-600">활성 투자</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeInvestments}개</p>
              </div>
            </div>

            {/* Investment List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">투자 내역</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {userInvestments.map((investment) => (
                  <div key={investment.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {pools.find(p => p.id === investment.poolId)?.name}
                        </h4>
                        <p className="text-sm text-gray-600">투자일: {investment.investmentDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">{investment.amount}원</p>
                        <p className="text-sm text-gray-600">지분: {investment.shares}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">현재 가치</p>
                        <p className="font-semibold text-gray-900">{investment.currentValue}원</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">수익</p>
                        <p className="font-semibold text-green-600">{investment.profit}원</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">수익률</p>
                        <p className="font-semibold text-green-600">{investment.profitPercentage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">상태</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          investment.status === 'active' ? 'bg-green-100 text-green-800' :
                          investment.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {investment.status === 'active' ? '활성' :
                           investment.status === 'completed' ? '완료' : '대기중'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">투자 분석</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">수익률 추이</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">차트가 여기에 표시됩니다</p>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">위험도 분석</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">낮은 위험도</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-24 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">보통 위험도</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-16 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">50%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">높은 위험도</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-8 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">시장 인사이트</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">시장 성장률</h4>
                  <p className="text-2xl font-bold text-green-600">+15.2%</p>
                  <p className="text-sm text-gray-600">전년 대비</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">안정성 지수</h4>
                  <p className="text-2xl font-bold text-blue-600">8.7/10</p>
                  <p className="text-sm text-gray-600">높은 안정성</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">투자자 만족도</h4>
                  <p className="text-2xl font-bold text-purple-600">94%</p>
                  <p className="text-sm text-gray-600">매우 만족</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investment Modal */}
      {showInvestModal && selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">투자하기</h3>
            <p className="text-gray-600 mb-4">{selectedPool.name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투자 금액 (KRW)
                </label>
                <input
                  type="text"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="50,000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  최소: {selectedPool.minInvestment}원 ~ 최대: {selectedPool.maxInvestment}원
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">예상 수익률:</span>
                  <span className="font-medium text-green-600">{selectedPool.expectedReturn}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">투자 기간:</span>
                  <span className="font-medium">{selectedPool.duration}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowInvestModal(false)}
              >
                취소
              </Button>
              <Button className="flex-1">
                투자하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
