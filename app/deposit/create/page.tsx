'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useContractWrite } from 'wagmi'
import { 
  ArrowLeft, 
  Home, 
  User, 
  Calendar, 
  MapPin, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { CONTRACT_ADDRESSES, TRANSACTION_LIMITS } from '@/lib/config'

interface FormData {
  landlordAddress: string
  depositAmount: string
  startDate: string
  endDate: string
  propertyId: string
  propertyAddress: string
  enableInvestment: boolean
  investmentPercentage: number
}

interface ValidationErrors {
  landlordAddress?: string
  depositAmount?: string
  startDate?: string
  endDate?: string
  propertyId?: string
  propertyAddress?: string
}

export default function CreateDepositPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [formData, setFormData] = useState<FormData>({
    landlordAddress: '',
    depositAmount: '',
    startDate: '',
    endDate: '',
    propertyId: '',
    propertyAddress: '',
    enableInvestment: true,
    investmentPercentage: 20
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form')
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'failed'>('pending')

  // Mock KYC verification
  useEffect(() => {
    const timer = setTimeout(() => {
      setKycStatus('verified')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Landlord address validation
    if (!formData.landlordAddress) {
      newErrors.landlordAddress = '임대인 주소를 입력해주세요'
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.landlordAddress)) {
      newErrors.landlordAddress = '올바른 이더리움 주소를 입력해주세요'
    }

    // Deposit amount validation
    const amount = parseFloat(formData.depositAmount.replace(/,/g, ''))
    if (!formData.depositAmount) {
      newErrors.depositAmount = '보증금 금액을 입력해주세요'
    } else if (amount < 1000000) {
      newErrors.depositAmount = '최소 보증금은 1,000,000원입니다'
    } else if (amount > 10000000000) {
      newErrors.depositAmount = '최대 보증금은 10,000,000,000원입니다'
    }

    // Date validation
    const today = new Date()
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    
    if (!formData.startDate) {
      newErrors.startDate = '시작일을 선택해주세요'
    } else if (startDate < today) {
      newErrors.startDate = '시작일은 오늘 이후여야 합니다'
    }

    if (!formData.endDate) {
      newErrors.endDate = '만료일을 선택해주세요'
    } else if (endDate <= startDate) {
      newErrors.endDate = '만료일은 시작일 이후여야 합니다'
    } else if (endDate.getTime() - startDate.getTime() < 365 * 24 * 60 * 60 * 1000) {
      newErrors.endDate = '최소 계약 기간은 1년입니다'
    }

    // Property validation
    if (!formData.propertyId) {
      newErrors.propertyId = '부동산 ID를 입력해주세요'
    }
    if (!formData.propertyAddress) {
      newErrors.propertyAddress = '부동산 주소를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    if (numericValue) {
      return parseInt(numericValue).toLocaleString()
    }
    return ''
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    
    // Simulate contract interaction
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setStep('success')
    setIsSubmitting(false)
  }

  const handleReview = () => {
    if (validateForm()) {
      setStep('review')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">지갑을 연결해주세요</h2>
          <p className="text-gray-600 mb-6">보증금을 예치하려면 지갑을 연결해야 합니다.</p>
          <Link href="/">
            <Button>
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (kycStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC 인증이 필요합니다</h2>
          <p className="text-gray-600 mb-6">보증금을 예치하려면 KYC 인증을 완료해야 합니다.</p>
          <Link href="/dashboard">
            <Button>
              대시보드로 이동
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">보증금 예치 완료!</h2>
          <p className="text-gray-600 mb-6">보증금이 성공적으로 예치되었습니다.</p>
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button>
                대시보드로 이동
              </Button>
            </Link>
            <Link href="/deposit/create">
              <Button variant="outline">
                다른 보증금 예치하기
              </Button>
            </Link>
          </div>
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
                <h1 className="text-3xl font-bold text-gray-900">보증금 예치</h1>
                <p className="text-gray-600 mt-1">새로운 전세 보증금을 안전하게 예치하세요</p>
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

      {/* KYC Status */}
      {kycStatus === 'pending' && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-800">KYC 인증을 확인하고 있습니다...</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {step === 'form' && (
            <div className="space-y-8">
              {/* Form */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">보증금 정보</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Landlord Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      임대인 주소 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.landlordAddress}
                        onChange={(e) => handleInputChange('landlordAddress', e.target.value)}
                        placeholder="0x..."
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.landlordAddress ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.landlordAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.landlordAddress}</p>
                    )}
                  </div>

                  {/* Deposit Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      보증금 금액 (KRW) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.depositAmount}
                        onChange={(e) => handleInputChange('depositAmount', formatAmount(e.target.value))}
                        placeholder="1,000,000"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.depositAmount ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.depositAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.depositAmount}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      최소: 1,000,000원 ~ 최대: 10,000,000,000원
                    </p>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.startDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      만료일 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.endDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>

                  {/* Property ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      부동산 ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.propertyId}
                      onChange={(e) => handleInputChange('propertyId', e.target.value)}
                      placeholder="PROP-001"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.propertyId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.propertyId && (
                      <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>
                    )}
                  </div>

                  {/* Property Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      부동산 주소 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.propertyAddress}
                        onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                        placeholder="서울특별시 강남구..."
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.propertyAddress ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.propertyAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.propertyAddress}</p>
                    )}
                  </div>
                </div>

                {/* Investment Options */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">투자 옵션</h3>
                      <p className="text-gray-600 mb-4">
                        보증금의 일부를 투자 풀에 활용하여 추가 수익을 창출할 수 있습니다.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="enableInvestment"
                            checked={formData.enableInvestment}
                            onChange={(e) => handleInputChange('enableInvestment', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor="enableInvestment" className="text-sm font-medium text-gray-900">
                            투자 풀 활성화
                          </label>
                        </div>
                        
                        {formData.enableInvestment && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              투자 비율: {formData.investmentPercentage}%
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="30"
                              value={formData.investmentPercentage}
                              onChange={(e) => handleInputChange('investmentPercentage', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>10%</span>
                              <span>20%</span>
                              <span>30%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              예상 연수익률: 6.2% (투자 금액 기준)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">보안 정보</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 모든 거래는 블록체인에 기록되어 투명하게 관리됩니다</li>
                      <li>• 스마트 컨트랙트가 자동으로 보증금을 보호합니다</li>
                      <li>• KYC 인증을 통해 안전한 거래 환경을 제공합니다</li>
                      <li>• 분쟁 발생 시 중재 시스템을 통해 해결됩니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline">
                    취소
                  </Button>
                </Link>
                <Button onClick={handleReview} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    '다음 단계'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-8">
              {/* Review Summary */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">거래 검토</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">보증금 정보</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">임대인:</span>
                          <span className="font-medium">{formData.landlordAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">보증금:</span>
                          <span className="font-medium">{formData.depositAmount}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">계약 기간:</span>
                          <span className="font-medium">{formData.startDate} ~ {formData.endDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">부동산:</span>
                          <span className="font-medium">{formData.propertyAddress}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">투자 정보</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">투자 활성화:</span>
                          <span className="font-medium">{formData.enableInvestment ? '예' : '아니오'}</span>
                        </div>
                        {formData.enableInvestment && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">투자 비율:</span>
                              <span className="font-medium">{formData.investmentPercentage}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">투자 금액:</span>
                              <span className="font-medium">
                                {parseInt(formData.depositAmount.replace(/,/g, '')) * formData.investmentPercentage / 100}원
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">예상 연수익:</span>
                              <span className="font-medium text-green-600">
                                {parseInt(formData.depositAmount.replace(/,/g, '')) * formData.investmentPercentage / 100 * 0.062}원
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fees */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">수수료 정보</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">에스크로 수수료 (0.1%):</span>
                        <span className="font-medium">
                          {parseInt(formData.depositAmount.replace(/,/g, '')) * 0.001}원
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 예치 금액:</span>
                        <span className="font-medium text-lg">
                          {parseInt(formData.depositAmount.replace(/,/g, '')) + parseInt(formData.depositAmount.replace(/,/g, '')) * 0.001}원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setStep('form')}>
                  수정하기
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      예치 중...
                    </>
                  ) : (
                    '보증금 예치하기'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
