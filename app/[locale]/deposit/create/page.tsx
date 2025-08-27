'use client'

import { CreateDepositForm } from '@/components/deposit/CreateDepositForm'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

export default function CreateDepositPage() {
  const { addToast } = useToast()
  const router = useRouter()

  const handleSuccess = (status: string) => {
    addToast({
      message: 'Depósito creado exitosamente',
      variant: 'success'
    })
    router.push('/dashboard')
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <CreateDepositForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}
