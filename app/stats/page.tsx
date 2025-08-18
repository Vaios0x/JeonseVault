'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Home,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface MarketStats {
  totalValueLocked: string
  totalDeposits: number
  totalInvestors: number
  averageReturn: string
  fraudCases: number
  fraudPrevented: number
  marketGrowth: string
  activeContracts: number
}

interface RegionalStats {
  region: string
  totalValue: string
  depositCount: number
  averageReturn: string
  growth: string
}

interface TimeSeriesData {
  date: string
  value: number
  deposits: number
  investors: number
}

export default function StatsPage() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'overview' | 'regional' | 'trends' | 'security'>('overview')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalValueLocked: '7,500,000,000,000',
    totalDeposits: 15420,
    totalInvestors: 8920,
    averageReturn: '6.8%',
    fraudCases: 0,
    fraudPrevented: 4120,
    marketGrowth: '+15.2%',
    activeContracts: 12340
  })

  const [regionalStats, setRegionalStats] = useState<RegionalStats[]>([
    {
      region: '강남구',
      totalValue: '2,100,000,000,000',
      depositCount: 4320,
      averageReturn: '7.2%',
      growth: '+18.5%'
    },
    {
      region: '서초구',
      totalValue: '1,800,000,000,000',
      depositCount: 3890,
      averageReturn: '6.9%',
      growth: '+16.2%'
    },
    {
      region: '마포구',
      totalValue: '1,200,000,000,000',
      depositCount: 2560,
      averageReturn: '6.5%',
      growth: '+12.8%'
    },
    {
      region: '송파구',
      totalValue: '1,500,000,000,000',
      depositCount: 3120,
      averageReturn: '6.7%',
      growth: '+14.3%'
    },
    {
      region: '영등포구',
      totalValue: '900,000,000,000',
      depositCount: 1530,
      averageReturn: '6.3%',
      growth: '+11.5%'
    }
  ])

  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([
    { date: '2024-01', value: 6500000000000, deposits: 12000, investors: 7500 },
    { date: '2024-02', value: 6800000000000, deposits: 12500, investors: 7800 },
    { date: '2024-03', value: 7200000000000, deposits: 13200, investors: 8200 },
    { date: '2024-04', value: 7500000000000, deposits: 13800, investors: 8500 },
    { date: '2024-05', value: 7800000000000, deposits: 14200, investors: 8700 },
    { date: '2024-06', value: 8200000000000, deposits: 14800, investors: 8900 },
    { date: '2024-07', value: 8500000000000, deposits: 15200, investors: 9100 },
    { date: '2024-08', value: 8900000000000, deposits: 15600, investors: 9300 },
    { date: '2024-09', value: 9200000000000, deposits: 16000, investors: 9500 },
    { date: '2024-10', value: 9500000000000, deposits: 16400, investors: 9700 },
    { date: '2024-11', value: 9800000000000, deposits: 16800, investors: 9900 },
    { date: '2024-12', value: 10200000000000, deposits: 17200, investors: 10100 }
  ])

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000000) {
      return (num / 1000000000000).toFixed(1) + '조'
    } else if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + '십억'
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + '백만'
    }
    return num.toLocaleString()
  }

  const getGrowthColor = (growth: string) => {
    return growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (growth: string) => {
    return growth.startsWith('+') ? TrendingUp : TrendingDown
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
                <h1 className="text-3xl font-bold text-gray-900">시장 통계</h1>
                <p className="text-gray-600 mt-1">JeonseVault 플랫폼의 실시간 시장 데이터</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                내보내기
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
              { id: 'regional', name: '지역별', icon: MapPin },
              { id: 'trends', name: '트렌드', icon: TrendingUp },
              { id: 'security', name: '보안', icon: Shield }
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 예치 가치</p>
                    <p className="text-2xl font-bold text-gray-900">{marketStats.totalValueLocked}원</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">{marketStats.marketGrowth}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 보증금</p>
                    <p className="text-2xl font-bold text-gray-900">{marketStats.totalDeposits.toLocaleString()}건</p>
                    <p className="text-sm text-gray-600 mt-1">활성 계약: {marketStats.activeContracts.toLocaleString()}건</p>
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
                    <p className="text-2xl font-bold text-gray-900">{marketStats.totalInvestors.toLocaleString()}명</p>
                    <p className="text-sm text-gray-600 mt-1">평균 수익률: {marketStats.averageReturn}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">사기 방지</p>
                    <p className="text-2xl font-bold text-gray-900">{marketStats.fraudPrevented}건</p>
                    <p className="text-sm text-green-600 mt-1">사기 발생: {marketStats.fraudCases}건</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">시장 성장 추이</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">차트가 여기에 표시됩니다</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">투자자 분포</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">개인 투자자</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-24 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">기관 투자자</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-16 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">기타</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-8 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
              <div className="space-y-4">
                {[
                  { type: 'deposit', message: '새로운 보증금 500,000,000원이 등록되었습니다', time: '2분 전', icon: CheckCircle, color: 'text-green-600' },
                  { type: 'investment', message: '투자 풀에 100,000,000원이 투자되었습니다', time: '5분 전', icon: TrendingUp, color: 'text-blue-600' },
                  { type: 'fraud', message: '사기 시도가 성공적으로 차단되었습니다', time: '10분 전', icon: Shield, color: 'text-red-600' },
                  { type: 'return', message: '투자 수익 6,800,000원이 분배되었습니다', time: '15분 전', icon: DollarSign, color: 'text-green-600' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'regional' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">지역별 통계</h2>
              <div className="flex items-center space-x-3">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>서울특별시</option>
                  <option>부산광역시</option>
                  <option>대구광역시</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {regionalStats.map((region, index) => {
                const GrowthIcon = getGrowthIcon(region.growth)
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{region.region}</h3>
                        <p className="text-gray-600">총 {region.depositCount.toLocaleString()}건의 보증금</p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center ${getGrowthColor(region.growth)}`}>
                          <GrowthIcon className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">{region.growth}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">총 가치</p>
                        <p className="text-lg font-semibold text-gray-900">{region.totalValue}원</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">평균 수익률</p>
                        <p className="text-lg font-semibold text-green-600">{region.averageReturn}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">시장 점유율</span>
                        <span className="font-medium">{((parseInt(region.totalValue.replace(/,/g, '')) / 7500000000000) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${(parseInt(region.totalValue.replace(/,/g, '')) / 7500000000000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">시장 트렌드</h2>
              <div className="flex items-center space-x-2">
                {['7d', '30d', '90d', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as any)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range === '7d' ? '7일' : range === '30d' ? '30일' : range === '90d' ? '90일' : '1년'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">TVL 추이</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">TVL 차트가 여기에 표시됩니다</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">투자자 증가율</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">투자자 증가율 차트가 여기에 표시됩니다</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 성과</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">월</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">TVL</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">보증금</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">투자자</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">성장률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSeriesData.slice(-6).map((data, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{data.date}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{formatNumber(data.value)}원</td>
                        <td className="py-3 px-4 text-right text-gray-900">{data.deposits.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{data.investors.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-green-600">
                          {index > 0 ? `+${((data.value / timeSeriesData[timeSeriesData.length - 7 + index - 1].value - 1) * 100).toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">보안 통계</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">사기 방지율</p>
                    <p className="text-2xl font-bold text-green-600">100%</p>
                    <p className="text-sm text-gray-600 mt-1">4,120건 방지</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">사기 발생</p>
                    <p className="text-2xl font-bold text-red-600">0건</p>
                    <p className="text-sm text-gray-600 mt-1">전년 대비 -100%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">KYC 인증</p>
                    <p className="text-2xl font-bold text-blue-600">98.5%</p>
                    <p className="text-sm text-gray-600 mt-1">8,920명 인증</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">보안 이벤트</h3>
                <div className="space-y-4">
                  {[
                    { type: 'success', message: '스마트 컨트랙트 감사 완료', time: '2024-01-15', icon: CheckCircle },
                    { type: 'success', message: 'KYC 시스템 업그레이드', time: '2024-01-10', icon: Shield },
                    { type: 'warning', message: '의심스러운 거래 탐지', time: '2024-01-08', icon: AlertTriangle },
                    { type: 'success', message: '보안 패치 적용', time: '2024-01-05', icon: CheckCircle }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <event.icon className={`w-5 h-5 ${
                        event.type === 'success' ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{event.message}</p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">보안 점수</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">스마트 컨트랙트 보안</span>
                      <span className="font-medium">95/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">KYC/AML 준수</span>
                      <span className="font-medium">98/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">사용자 데이터 보호</span>
                      <span className="font-medium">92/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">시스템 가용성</span>
                      <span className="font-medium">99/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">종합 점수</span>
                    <span className="text-2xl font-bold text-green-600">96/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
