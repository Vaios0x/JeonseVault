'use client'

import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { Home, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Eye, Edit, Trash2, ExternalLink, Download, Share2, MapPin, Users, BarChart3, FileText, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal, useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatAmount, formatDate, formatPercentage, formatAddress } from '@/utils/formatters'
import { Deposit, DepositStatus, PropertyType } from '@/utils/types'

interface DepositDetailsProps {
  deposit: Deposit
  className?: string
  onEdit?: (depositId: string) => void
  onDelete?: (depositId: string) => void
  onInvest?: (depositId: string) => void
  onViewProperty?: (propertyId: string) => void
  showActions?: boolean
  compact?: boolean
}

export function DepositDetails({
  deposit,
  className,
  onEdit,
  onDelete,
  onInvest,
  onViewProperty,
  showActions = true,
  compact = false
}: DepositDetailsProps) {
  const { open, close } = useModal()
  const { addToast } = useToast()

  // Calcular estadísticas del depósito
  const depositStats = useMemo(() => {
    const totalInvested = Number(deposit.totalInvested || 0)
    const targetAmount = Number(deposit.amount)
    const progress = (totalInvested / targetAmount) * 100
    const remainingAmount = Math.max(0, targetAmount - totalInvested)
    const daysRemaining = deposit.endDate ? Math.max(0, Math.ceil((deposit.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
    const daysElapsed = deposit.startDate ? Math.ceil((Date.now() - deposit.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
    const totalDays = deposit.startDate && deposit.endDate ? Math.ceil((deposit.endDate.getTime() - deposit.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0

    return {
      progress,
      remainingAmount,
      daysRemaining,
      daysElapsed,
      totalDays,
      isFull: progress >= 100,
      isExpired: daysRemaining <= 0,
      isActive: deposit.status === 'active',
      completionPercentage: totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0
    }
  }, [deposit])

  // Configuración del estado del depósito
  const statusConfig = {
    'active': {
      label: 'Activo',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle,
      description: 'El depósito está activo y aceptando inversiones'
    },
    'completed': {
      label: 'Completado',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: CheckCircle,
      description: 'El depósito ha sido completado exitosamente'
    },
    'disputed': {
      label: 'En Disputa',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: AlertCircle,
      description: 'El depósito está en disputa'
    },
    'pending': {
      label: 'Pendiente',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Clock,
      description: 'El depósito está pendiente de activación'
    },
    'cancelled': {
      label: 'Cancelado',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: AlertCircle,
      description: 'El depósito ha sido cancelado'
    }
  }

  const status = statusConfig[deposit.status] || statusConfig['active']
  const StatusIcon = status.icon

  // Configuración del tipo de propiedad
  const propertyTypeConfig = {
    'apartment': { label: 'Apartamento', icon: Home },
    'house': { label: 'Casa', icon: Home },
    'officetel': { label: 'Oficetel', icon: Home },
    'villa': { label: 'Villa', icon: Home },
    'commercial': { label: 'Comercial', icon: Home }
  }

  const propertyType = propertyTypeConfig['apartment'] // Default since Deposit doesn't have propertyType
  const PropertyIcon = propertyType.icon

  const handleEdit = () => {
    if (onEdit) {
      onEdit(deposit.id)
    } else {
      window.location.href = `/deposit/edit/${deposit.id}`
    }
  }

  const handleDelete = () => {
            open()
  }

  const handleInvest = () => {
    if (onInvest) {
      onInvest(deposit.id)
    } else {
      window.location.href = `/investment?deposit=${deposit.id}`
    }
  }

  const handleViewProperty = () => {
    if (onViewProperty) {
      onViewProperty(deposit.propertyId)
    } else {
      window.location.href = `/property/${deposit.propertyId}`
    }
  }

  const handleExportData = () => {
    const data = {
      depositId: deposit.id,
      propertyId: deposit.propertyId,
      propertyAddress: deposit.propertyAddress,
      amount: deposit.amount,
      annualReturn: deposit.annualReturn,
      duration: deposit.duration,
      startDate: deposit.startDate,
      endDate: deposit.endDate,
      status: deposit.status,
      totalInvested: deposit.totalInvested,
      investorCount: deposit.investorCount,
      landlord: deposit.landlord,
      tenant: deposit.tenant,
      createdAt: deposit.createdAt,
      updatedAt: deposit.updatedAt
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deposit-${deposit.id}-data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addToast({
      variant: 'success',
      message: 'Los datos del depósito se han exportado correctamente'
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Depósito Jeonse: ${deposit.propertyAddress}`,
        text: `Mira este depósito Jeonse con ${deposit.annualReturn || 0}% de rendimiento anual`,
        url: `${window.location.origin}/deposit/${deposit.id}`
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/deposit/${deposit.id}`)
      addToast({
        variant: 'success',
        message: 'El enlace del depósito se ha copiado al portapapeles'
      })
    }
  }

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(deposit.id)
    }
            close()
  }

  if (compact) {
    return (
      <div className={clsx('bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PropertyIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{deposit.propertyAddress}</h3>
              <p className="text-sm text-gray-600">{propertyType.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{deposit.annualReturn || 0}%</p>
            <p className="text-xs text-gray-500">Rendimiento anual</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{formatAmount(deposit.amount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{deposit.investorCount}</span>
            </div>
          </div>
          <div className={clsx('px-2 py-1 rounded-full text-xs font-medium', status.bgColor, status.color)}>
            {status.label}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PropertyIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{deposit.propertyAddress}</h2>
                  <p className="text-sm text-gray-600">Depósito de Jeonse</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={clsx('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1', status.bgColor, status.color)}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </div>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{deposit.annualReturn || 0}%</p>
              <p className="text-sm text-gray-600">Rendimiento anual</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatAmount(deposit.amount)}</p>
              <p className="text-sm text-gray-600">Monto objetivo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{deposit.investorCount}</p>
              <p className="text-sm text-gray-600">Inversores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{depositStats.daysRemaining}</p>
              <p className="text-sm text-gray-600">Días restantes</p>
            </div>
          </div>
        </div>

        {/* Progreso del depósito */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso de financiación</span>
              <span className="text-sm text-gray-600">
                {formatAmount(deposit.totalInvested || 0)} / {formatAmount(deposit.amount)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, depositStats.progress)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600">{depositStats.progress.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Financiado</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">{formatAmount(depositStats.remainingAmount)}</p>
              <p className="text-sm text-gray-600">Restante</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-600">{depositStats.completionPercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Tiempo transcurrido</p>
            </div>
          </div>
        </div>

        {/* Información de la propiedad */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Información de la Propiedad
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo de propiedad</label>
                <p className="text-gray-900">{propertyType.label}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Dirección</label>
                <p className="text-gray-900 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {deposit.propertyAddress}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">ID de propiedad</label>
                <p className="text-gray-900 font-mono text-sm">{deposit.propertyId}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Duración</label>
                <p className="text-gray-900">{deposit.duration} meses</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de inicio</label>
                <p className="text-gray-900">{formatDate(deposit.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de finalización</label>
                <p className="text-gray-900">{formatDate(deposit.endDate)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleViewProperty}
              variant="outline"
              size="sm"
              leftIcon={<Eye className="w-4 h-4" />}
            >
              Ver detalles de la propiedad
            </Button>
          </div>
        </div>

        {/* Información del propietario */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Información del Propietario
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Dirección del propietario</label>
              <p className="text-gray-900 font-mono text-sm">{formatAddress(deposit.landlord)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha de creación</label>
              <p className="text-gray-900">{formatDate(deposit.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleViewProperty}
                  variant="outline"
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  Ver Propiedad
                </Button>
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Exportar
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  Compartir
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Removed wallet connection check */}
                {/* Removed investment button */}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={false}
        onClose={() => {}}
        title="Eliminar Depósito"
        size="md"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Estás seguro de que quieres eliminar este depósito?
            </h3>
            <p className="text-gray-600">
              Esta acción es irreversible. Se eliminarán todos los datos del depósito y las inversiones asociadas.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-900 mb-2">Consecuencias de eliminar el depósito:</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Se perderán todas las inversiones activas</li>
              <li>• Los inversores recibirán reembolsos automáticos</li>
              <li>• Se eliminarán todos los datos del depósito</li>
              <li>• No podrás recuperar la información</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
                              onClick={() => close()}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              variant="danger"
              className="flex-1"
            >
              Eliminar Depósito
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
