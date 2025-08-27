'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Shield, CheckCircle, AlertCircle, Clock, User, CreditCard, FileText, Phone, Mail, TrendingUp, AlertTriangle, Info, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal, useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useCompliance } from '@/hooks/useCompliance'
import { formatAmount, formatDate } from '@/utils/formatters'

interface ComplianceCheckProps {
  className?: string
  onComplete?: () => void
  showDetails?: boolean
  compact?: boolean
}

export interface ComplianceStatus {
  isVerified: boolean
  level: 'None' | 'Basic' | 'Standard' | 'Premium' | 'Corporate'
  progress: number
  requirements: ComplianceRequirement[]
  limits: ComplianceLimits
  lastUpdate: Date
  nextReview: Date
}

interface ComplianceRequirement {
  id: string
  name: string
  description: string
  status: 'pending' | 'completed' | 'failed' | 'expired'
  required: boolean
  icon: React.ComponentType<any>
  completedAt?: Date
  expiresAt?: Date
}

interface ComplianceLimits {
  transactionLimit: bigint
  monthlyLimit: bigint
  monthlySpent: bigint
  dailyLimit: bigint
  dailySpent: bigint
}

export function ComplianceCheck({ 
  className, 
  onComplete, 
  showDetails = true,
  compact = false 
}: ComplianceCheckProps) {
  const { userCompliance, isVerified, isLoading } = useCompliance()
  const { addToast } = useToast()
  const { isOpen: isDetailsModalOpen, open: openDetailsModal, close: closeDetailsModal } = useModal()
  
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Verificar compliance al cargar
  useEffect(() => {
    if (userCompliance) {
      const status = mapComplianceToStatus(userCompliance)
      setComplianceStatus(status)
      
      if (status.isVerified) {
        addToast({
          message: 'Verificación de compliance completada',
          variant: 'success'
        })
        onComplete?.()
      } else {
        addToast({
          message: 'Compliance incompleto. Completa la verificación para continuar.',
          variant: 'warning'
        })
      }
    }
  }, [userCompliance, addToast, onComplete])

  const checkUserCompliance = async () => {
    try {
      setIsChecking(true)
      
      if (userCompliance) {
        const status = mapComplianceToStatus(userCompliance)
        setComplianceStatus(status)
        
        if (status.isVerified) {
          addToast({
            message: 'Verificación de compliance completada',
            variant: 'success'
          })
          onComplete?.()
        } else {
          addToast({
            message: 'Compliance incompleto. Completa la verificación para continuar.',
            variant: 'warning'
          })
        }
      } else {
        setComplianceStatus(null)
      }
    } catch (err) {
      console.error('Error checking compliance:', err)
      addToast({
        message: 'Error al verificar compliance',
        variant: 'error'
      })
    } finally {
      setIsChecking(false)
    }
  }

  const mapComplianceToStatus = (compliance: any): ComplianceStatus => {
    const requirements: ComplianceRequirement[] = [
      {
        id: 'personal',
        name: 'Información Personal',
        description: 'Nombre real y datos de identificación',
        status: compliance.isVerified ? 'completed' : 'pending',
        required: true,
        icon: User,
        completedAt: compliance.isVerified ? new Date(compliance.verificationDate * 1000) : undefined
      },
      {
        id: 'phone',
        name: 'Verificación de Teléfono',
        description: 'Número de teléfono verificado',
        status: compliance.phoneNumber ? 'completed' : 'pending',
        required: true,
        icon: Phone,
        completedAt: compliance.isVerified ? new Date(compliance.verificationDate * 1000) : undefined
      },
      {
        id: 'bank',
        name: 'Verificación Bancaria',
        description: 'Cuenta bancaria verificada',
        status: compliance.bankAccount ? 'completed' : 'pending',
        required: true,
        icon: CreditCard,
        completedAt: compliance.isVerified ? new Date(compliance.verificationDate * 1000) : undefined
      },
      {
        id: 'documents',
        name: 'Documentos de Identidad',
        description: 'Documentos de identidad subidos y verificados',
        status: compliance.isVerified ? 'completed' : 'pending',
        required: true,
        icon: FileText,
        completedAt: compliance.isVerified ? new Date(compliance.verificationDate * 1000) : undefined
      },
      {
        id: 'email',
        name: 'Verificación de Email',
        description: 'Dirección de email verificada',
        status: 'completed', // Asumimos que está completado si tiene wallet
        required: false,
        icon: Mail,
        completedAt: new Date()
      }
    ]

    const completedRequirements = requirements.filter(req => req.status === 'completed').length
    const progress = (completedRequirements / requirements.filter(req => req.required).length) * 100

    return {
      isVerified: compliance.isVerified,
      level: compliance.level || 'None',
      progress,
      requirements,
      limits: {
        transactionLimit: compliance.transactionLimit || BigInt(0),
        monthlyLimit: compliance.monthlyLimit || BigInt(0),
        monthlySpent: compliance.monthlySpent || BigInt(0),
        dailyLimit: (compliance.transactionLimit || BigInt(0)) / BigInt(30),
        dailySpent: BigInt(0) // Esto vendría de una API separada
      },
      lastUpdate: new Date(compliance.lastUpdate * 1000),
      nextReview: new Date((compliance.verificationDate + 365 * 24 * 60 * 60) * 1000)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Corporate': return 'text-purple-600 bg-purple-100'
      case 'Premium': return 'text-blue-600 bg-blue-100'
      case 'Standard': return 'text-green-600 bg-green-100'
      case 'Basic': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Corporate': return <TrendingUp className="w-4 h-4" />
      case 'Premium': return <Shield className="w-4 h-4" />
      case 'Standard': return <CheckCircle className="w-4 h-4" />
      case 'Basic': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getRequirementStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'expired': return <Clock className="w-4 h-4 text-yellow-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (!userCompliance) {
    return (
      <div className={clsx('bg-yellow-50 border border-yellow-200 rounded-lg p-4', className)}>
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800 font-medium">
            No se encontró información de compliance
          </span>
        </div>
      </div>
    )
  }

  if (isLoading || isChecking) {
    return (
      <div className={clsx('bg-white border border-gray-200 rounded-lg p-4', className)}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Verificando compliance...</span>
        </div>
      </div>
    )
  }

  if (!complianceStatus) {
    return (
      <div className={clsx('bg-red-50 border border-red-200 rounded-lg p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">
              No se encontró información de compliance
            </span>
          </div>
          <Button
            size="sm"
            onClick={checkUserCompliance}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={clsx('space-y-4', className)}>
        {/* Estado general */}
        <div className={clsx(
          'bg-white border border-gray-200 rounded-lg p-4',
          complianceStatus.isVerified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={clsx(
                'p-2 rounded-lg',
                complianceStatus.isVerified ? 'bg-green-100' : 'bg-yellow-100'
              )}>
                {complianceStatus.isVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Estado de Compliance
                </h3>
                <p className="text-sm text-gray-600">
                  {complianceStatus.isVerified 
                    ? 'Verificación completada' 
                    : `${Math.round(complianceStatus.progress)}% completado`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1',
                getLevelColor(complianceStatus.level)
              )}>
                {getLevelIcon(complianceStatus.level)}
                <span>{complianceStatus.level}</span>
              </div>
              
              {showDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openDetailsModal}
                  leftIcon={<Info className="w-4 h-4" />}
                >
                  Detalles
                </Button>
              )}
            </div>
          </div>

          {/* Barra de progreso */}
          {!complianceStatus.isVerified && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso de verificación</span>
                <span>{Math.round(complianceStatus.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${complianceStatus.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Límites de transacción */}
        {complianceStatus.isVerified && !compact && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Límites de Transacción</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Límite por Transacción</div>
                <div className="font-semibold text-gray-900">
                  {formatAmount(complianceStatus.limits.transactionLimit)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Límite Mensual</div>
                <div className="font-semibold text-gray-900">
                  {formatAmount(complianceStatus.limits.monthlyLimit)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Gastado este Mes</div>
                <div className="font-semibold text-orange-600">
                  {formatAmount(complianceStatus.limits.monthlySpent)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Disponible</div>
                <div className="font-semibold text-green-600">
                  {formatAmount(complianceStatus.limits.monthlyLimit - complianceStatus.limits.monthlySpent)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requisitos pendientes */}
        {!complianceStatus.isVerified && !compact && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Requisitos Pendientes</h4>
            <div className="space-y-2">
              {complianceStatus.requirements
                .filter(req => req.status !== 'completed' && req.required)
                .map((requirement) => (
                  <div key={requirement.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getRequirementStatusIcon(requirement.status)}
                      <div>
                        <div className="font-medium text-gray-900">{requirement.name}</div>
                        <div className="text-sm text-gray-600">{requirement.description}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Completar
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        title="Detalles de Compliance"
        size="lg"
      >
        <div className="space-y-6">
          {/* Información general */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Información General</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Estado:</span>
                <div className="font-medium">
                  {complianceStatus.isVerified ? 'Verificado' : 'Pendiente'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Nivel:</span>
                <div className={clsx('font-medium', getLevelColor(complianceStatus.level))}>
                  {complianceStatus.level}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Última actualización:</span>
                <div className="font-medium">
                  {formatDate(complianceStatus.lastUpdate)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Próxima revisión:</span>
                <div className="font-medium">
                  {formatDate(complianceStatus.nextReview)}
                </div>
              </div>
            </div>
          </div>

          {/* Todos los requisitos */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Requisitos de Verificación</h4>
            <div className="space-y-3">
              {complianceStatus.requirements.map((requirement) => (
                <div key={requirement.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={clsx(
                      'p-2 rounded-lg',
                      requirement.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                    )}>
                      <requirement.icon className={clsx(
                        'w-4 h-4',
                        requirement.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                      )} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{requirement.name}</div>
                      <div className="text-sm text-gray-600">{requirement.description}</div>
                      {requirement.completedAt && (
                        <div className="text-xs text-green-600">
                          Completado: {formatDate(requirement.completedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRequirementStatusIcon(requirement.status)}
                    <span className={clsx(
                      'text-sm font-medium',
                      requirement.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                    )}>
                      {requirement.status === 'completed' ? 'Completado' :
                       requirement.status === 'failed' ? 'Fallido' :
                       requirement.status === 'expired' ? 'Expirado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Límites detallados */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Límites de Transacción</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Límite por Transacción</div>
                <div className="text-lg font-semibold text-blue-900">
                  {formatAmount(complianceStatus.limits.transactionLimit)}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">Límite Mensual</div>
                <div className="text-lg font-semibold text-green-900">
                  {formatAmount(complianceStatus.limits.monthlyLimit)}
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-600">Gastado este Mes</div>
                <div className="text-lg font-semibold text-orange-900">
                  {formatAmount(complianceStatus.limits.monthlySpent)}
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600">Disponible</div>
                <div className="text-lg font-semibold text-purple-900">
                  {formatAmount(complianceStatus.limits.monthlyLimit - complianceStatus.limits.monthlySpent)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
