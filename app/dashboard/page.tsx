'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Home, 
  Clock, 
  AlertTriangle,
  Plus,
  Eye,
  BarChart3,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Deposit {
  id: string
  amount: string
  status: 'active' | 'completed' | 'disputed' | 'pending'
  startDate: string
  endDate: string
  propertyAddress: string
  landlord: string
  investmentEnabled: boolean
  investmentReturn: string
}

interface Investment {
  id: string
  amount: string
  poolId: string
  expectedReturn: string
  status: 'active' | 'completed' | 'pending'
  startDate: string
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'investments' | 'settings'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - En producción esto vendría de los smart contracts
  const [deposits, setDeposits] = useState<Deposit[]>([
    {
      id: '1',
      amount: '500,000,000',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      propertyAddress: '서울특별시 강남구 역삼동 123-45',
      landlord: '0x1234...5678',
      investmentEnabled: true,
      investmentReturn: '6.2%'
    },
    {
      id: '2',
      amount: '300,000,000',
      status: 'pending',
      startDate: '2024-02-01',
      endDate: '2025-02-01',
      propertyAddress: '서울특별시 서초구 서초동 67-89',
      landlord: '0x8765...4321',
      investmentEnabled: false,
      investmentReturn: '0%'
    }
  ])

  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: '1',
      amount: '50,000,000',
      poolId: 'POOL-001',
      expectedReturn: '6.5%',
      status: 'active',
      startDate: '2024-01-20'
    }
  ])

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const stats = {
    totalDeposits: '800,000,000',
    activeDeposits: '1',
    totalInvestments: '50,000,000',
    totalReturns: '3,100,000',
    averageReturn: '6.2%'
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">지갑을 연결해주세요</h2>
          <p className="text-gray-600 mb-6">대시보드를 보려면 지갑을 연결해야 합니다.</p>
          <Button onClick={() => window.location.href = '/'}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
              <p className="text-gray-600 mt-1">
                안녕하세요! {address?.slice(0, 6)}...{address?.slice(-4)}님
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">잔액</p>
                <p className="text-lg font-semibold text-gray-900">
                  {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 KAIA'}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                설정
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: '개요', icon: BarChart3 },
              { id: 'deposits', name: '보증금', icon: Home },
              { id: 'investments', name: '투자', icon: TrendingUp },
              { id: 'settings', name: '설정', icon: Settings }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 보증금</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDeposits}원</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 투자</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalInvestments}원</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 수익</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReturns}원</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">평균 수익률</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageReturn}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/deposit/create">
                  <Button className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    새 보증금 예치
                  </Button>
                </Link>
                <Link href="/investment">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    투자 기회 보기
                  </Button>
                </Link>
                <Link href="/stats">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    통계 보기
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
              <div className="space-y-4">
                {deposits.slice(0, 3).map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        deposit.status === 'active' ? 'bg-green-500' :
                        deposit.status === 'pending' ? 'bg-yellow-500' :
                        deposit.status === 'disputed' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {deposit.amount}원 보증금 {deposit.status === 'active' ? '활성화' : '대기중'}
                        </p>
                        <p className="text-sm text-gray-600">{deposit.propertyAddress}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{deposit.startDate}</p>
                      <p className="text-xs text-gray-500">{deposit.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">내 보증금</h2>
              <Link href="/deposit/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  새 보증금 예치
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {deposit.amount}원
                      </h3>
                      <p className="text-sm text-gray-600">{deposit.propertyAddress}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      deposit.status === 'active' ? 'bg-green-100 text-green-800' :
                      deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      deposit.status === 'disputed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {deposit.status === 'active' ? '활성' :
                       deposit.status === 'pending' ? '대기중' :
                       deposit.status === 'disputed' ? '분쟁' : '완료'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">시작일:</span>
                      <span className="text-gray-900">{deposit.startDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">만료일:</span>
                      <span className="text-gray-900">{deposit.endDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">투자 수익률:</span>
                      <span className="text-green-600 font-medium">{deposit.investmentReturn}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      상세보기
                    </Button>
                    {deposit.status === 'active' && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        분쟁 신고
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'investments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">내 투자</h2>
              <Link href="/investment">
                <Button>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  새 투자하기
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {investments.map((investment) => (
                <div key={investment.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {investment.amount}원
                      </h3>
                      <p className="text-sm text-gray-600">Pool: {investment.poolId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      investment.status === 'active' ? 'bg-green-100 text-green-800' :
                      investment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {investment.status === 'active' ? '활성' :
                       investment.status === 'pending' ? '대기중' : '완료'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">예상 수익률:</span>
                      <span className="text-green-600 font-medium">{investment.expectedReturn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">시작일:</span>
                      <span className="text-gray-900">{investment.startDate}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      상세보기
                    </Button>
                    {investment.status === 'active' && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        수익 확인
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">설정</h2>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    지갑 주소
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={address}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                    <Button variant="outline" size="sm">
                      복사
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    잔액
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 KAIA'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">이메일 알림</p>
                    <p className="text-sm text-gray-600">중요한 거래 알림을 이메일로 받습니다</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">푸시 알림</p>
                    <p className="text-sm text-gray-600">브라우저 푸시 알림을 받습니다</p>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">보안</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  KYC 인증 상태 확인
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  거래 한도 설정
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  지갑 연결 해제
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
