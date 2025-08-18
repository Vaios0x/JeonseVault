'use client'

import { useState } from 'react'
import { useAccount, useBalance, useContractWrite } from 'wagmi'
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CONTRACT_ADDRESSES } from '@/lib/config'

interface TransactionExampleProps {
  className?: string
}

export function TransactionExample({ className = '' }: TransactionExampleProps) {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState('')

  // Example contract interaction (you would replace this with actual JeonseVault contract)
  const { writeContract, isPending: isWriting } = useContractWrite()

  const handleTransaction = async () => {
    if (!isConnected) {
      alert('지갑을 연결해주세요')
      return
    }

    if (!amount || !recipient) {
      alert('금액과 수신자 주소를 입력해주세요')
      return
    }

    setIsProcessing(true)
    
    try {
      // Example transaction - replace with actual contract call
      await writeContract({
        address: CONTRACT_ADDRESSES.JEONSE_VAULT as `0x${string}`,
        abi: [
          {
            name: 'createDeposit',
            type: 'function',
            stateMutability: 'payable',
            inputs: [],
            outputs: []
          }
        ],
        functionName: 'createDeposit',
        value: amount ? BigInt(amount) : undefined
      })
      setTxHash('Transaction submitted successfully')
    } catch (error) {
      console.error('Transaction failed:', error)
      alert('거래가 실패했습니다')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    if (numericValue) {
      return parseInt(numericValue).toLocaleString()
    }
    return ''
  }

  if (!isConnected) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">지갑 연결 필요</h3>
          <p className="text-gray-600 mb-4">
            거래를 시작하려면 지갑을 연결해주세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-korean rounded-lg flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">거래 예시</h3>
          <p className="text-sm text-gray-600">Reown을 사용한 블록체인 거래</p>
        </div>
      </div>

      {/* Balance Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">현재 잔액</span>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">
              {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 KAIA'}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            수신자 주소
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            금액 (KAIA)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(formatAmount(e.target.value))}
            placeholder="0.1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <Button
          onClick={handleTransaction}
          disabled={!amount || !recipient || isProcessing || isWriting}
          className="w-full"
        >
          {isProcessing || isWriting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              거래 처리 중...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              거래 보내기
            </>
          )}
        </Button>
      </div>

      {/* Transaction Status */}
      {txHash && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">거래 성공!</p>
              <p className="text-xs text-green-600">
                TX Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Network Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">네트워크</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium text-gray-900">Kaia Testnet</span>
          </div>
        </div>
      </div>
    </div>
  )
}
