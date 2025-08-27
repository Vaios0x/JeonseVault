'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { Button } from './Button'

interface ContractStatus {
  name: string
  address: string
  isDeployed: boolean
  isVerified?: boolean
}

export function ContractStatus() {
  const [contracts, setContracts] = useState<ContractStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkContracts = () => {
      const contractList: ContractStatus[] = [
        {
          name: 'JeonseVault',
          address: CONTRACT_ADDRESSES.JEONSE_VAULT,
          isDeployed: Boolean(CONTRACT_ADDRESSES.JEONSE_VAULT),
        },
        {
          name: 'InvestmentPool',
          address: CONTRACT_ADDRESSES.INVESTMENT_POOL,
          isDeployed: Boolean(CONTRACT_ADDRESSES.INVESTMENT_POOL),
        },
        {
          name: 'PropertyOracle',
          address: CONTRACT_ADDRESSES.PROPERTY_ORACLE,
          isDeployed: Boolean(CONTRACT_ADDRESSES.PROPERTY_ORACLE),
        },
        {
          name: 'ComplianceModule',
          address: CONTRACT_ADDRESSES.COMPLIANCE_MODULE,
          isDeployed: Boolean(CONTRACT_ADDRESSES.COMPLIANCE_MODULE),
        },
      ]

      setContracts(contractList)
      setIsLoading(false)
    }

    checkContracts()
  }, [])

  const deployedCount = contracts.filter(c => c.isDeployed).length
  const totalCount = contracts.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">컨트랙트 상태 확인 중...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">스마트 컨트랙트 상태</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {deployedCount}/{totalCount} 배포됨
          </span>
          <div className={`w-2 h-2 rounded-full ${
            deployedCount === totalCount ? 'bg-green-500' : 
            deployedCount > 0 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
        </div>
      </div>

      <div className="space-y-3">
        {contracts.map((contract) => (
          <div
            key={contract.name}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {contract.isDeployed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">{contract.name}</h4>
                {contract.isDeployed && (
                  <p className="text-sm text-gray-500 font-mono">
                    {contract.address.slice(0, 8)}...{contract.address.slice(-6)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {contract.isDeployed ? (
                <span className="text-sm text-green-600 font-medium">배포됨</span>
              ) : (
                <span className="text-sm text-red-600 font-medium">미배포</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {deployedCount < totalCount && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">배포 필요</h4>
              <p className="text-sm text-yellow-700">
                일부 스마트 컨트랙트가 배포되지 않았습니다. 
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-700 underline p-0 h-auto"
                  onClick={() => window.open('/docs/deployment', '_blank')}
                >
                  배포 가이드
                </Button>
                를 참조하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
