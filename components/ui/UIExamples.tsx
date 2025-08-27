'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'
import { Modal, ConfirmModal, AlertModal } from './Modal'
import { Loading, LoadingState, Skeleton, SkeletonGroup, ButtonLoading, TableLoading, CardLoading } from './Loading'
import { useToast, useToastHelpers } from './Toast'

export function UIExamples() {
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [numberValue, setNumberValue] = useState('')
  const [searchValue, setSearchValue] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  const { addToast } = useToast()
  const { success, error, warning, info } = useToastHelpers()

  const selectOptions = [
    { value: 'option1', label: 'Opción 1' },
    { value: 'option2', label: 'Opción 2' },
    { value: 'option3', label: 'Opción 3', disabled: true },
    { value: 'option4', label: 'Opción 4' },
    { value: 'option5', label: 'Opción 5' }
  ]

  const handleSearch = (query: string) => {
    console.log('Búsqueda:', query)
    info(`Buscando: ${query}`)
  }

  const handleLoadingTest = () => {
    setLoadingState('loading')
    setTimeout(() => {
      setLoadingState('success')
      setTimeout(() => setLoadingState('idle'), 2000)
    }, 3000)
  }

  const handleErrorTest = () => {
    setLoadingState('loading')
    setTimeout(() => {
      setLoadingState('error')
      setTimeout(() => setLoadingState('idle'), 2000)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Componentes UI - Ejemplos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Botones */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Botones</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm">Primario Pequeño</Button>
                <Button variant="primary" size="md">Primario</Button>
                <Button variant="primary" size="lg">Primario Grande</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary">Secundario</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Peligro</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" disabled>Deshabilitado</Button>
                <Button variant="primary" isLoading>Cargando</Button>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Inputs</h2>
            <div className="space-y-4">
              <Input
                label="Input básico"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe algo..."
                helperText="Este es un texto de ayuda"
              />
              
              <Input
                label="Input con error"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                error="Este campo es requerido"
                placeholder="Input con error"
              />
              
              <Input
                label="Input con éxito"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="¡Perfecto! El valor es válido"
                placeholder="Input con éxito"
              />
              
              <Input
                label="Input con iconos"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                leftIcon={<span>🔍</span>}
                rightIcon={<span>✓</span>}
                placeholder="Con iconos"
              />
            </div>
          </div>

          {/* Select */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Select</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select básico</label>
                <Select
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="Selecciona una opción"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select con búsqueda</label>
                <Select
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                searchable
                placeholder="Busca y selecciona"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select con limpieza</label>
                <Select
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                clearable
                placeholder="Selecciona (se puede limpiar)"
                />
              </div>
            </div>
          </div>

          {/* Inputs especializados */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Inputs Especializados</h2>
            <div className="space-y-4">
              <Input
                label="Búsqueda"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar..."
                leftIcon={<span>🔍</span>}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchValue)
                  }
                }}
              />
              
              <Input
                label="Contraseña"
                type="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="Ingresa tu contraseña"
                rightIcon={<span>👁️</span>}
              />
              
              <Input
                label="Número"
                type="number"
                value={numberValue}
                onChange={(e) => setNumberValue(e.target.value)}
                min={0}
                max={100}
                step={5}
                placeholder="0-100"
              />
            </div>
          </div>

          {/* Loading */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Loading</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Loading variant="spinner" size="sm" />
                <Loading variant="dots" size="md" />
                <Loading variant="pulse" size="lg" />
                <Loading variant="bars" size="md" />
                <Loading variant="ripple" size="lg" />
              </div>
              
              <LoadingState
                state={loadingState}
                text="Procesando datos..."
              />
              
              <div className="flex gap-4">
                <Button onClick={handleLoadingTest} variant="primary">
                  Probar Loading
                </Button>
                <Button onClick={handleErrorTest} variant="danger">
                  Probar Error
                </Button>
              </div>
            </div>
          </div>

          {/* Skeleton */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Skeleton</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Skeleton variant="text" width="200px" />
                <Skeleton variant="circular" width="40px" height="40px" />
                <Skeleton variant="rounded" width="100px" height="32px" />
              </div>
              
              <SkeletonGroup
                count={3}
                variant="text"
                spacing="sm"
              />
              
              <CardLoading variant="simple" />
            </div>
          </div>

          {/* Modales */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Modales</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsModalOpen(true)} variant="primary">
                  Abrir Modal
                </Button>
                <Button onClick={() => setIsConfirmModalOpen(true)} variant="outline">
                  Confirmar
                </Button>
                <Button onClick={() => setIsAlertModalOpen(true)} variant="secondary">
                  Alerta
                </Button>
              </div>
            </div>
          </div>

          {/* Toast */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Toast</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => success('¡Operación exitosa!')}
                  variant="primary"
                  size="sm"
                >
                  Éxito
                </Button>
                <Button
                  onClick={() => error('Algo salió mal')}
                  variant="danger"
                  size="sm"
                >
                  Error
                </Button>
                <Button
                  onClick={() => warning('Ten cuidado')}
                  variant="outline"
                  size="sm"
                >
                  Advertencia
                </Button>
                <Button
                  onClick={() => info('Información importante')}
                  variant="secondary"
                  size="sm"
                >
                  Info
                </Button>
              </div>
              
              <Button
                onClick={() => addToast({
                  title: 'Toast personalizado',
                  message: 'Este es un toast con acción personalizada',
                  variant: 'info',
                  action: {
                    label: 'Acción',
                    onClick: () => console.log('Acción ejecutada')
                  }
                })}
                variant="outline"
                size="sm"
              >
                Toast con Acción
              </Button>
            </div>
          </div>
        </div>

        {/* Modales */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modal de Ejemplo"
          size="lg"
        >
          <div className="space-y-4">
            <p>Este es un modal de ejemplo con contenido personalizado.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Aceptar
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => {
            setIsConfirmModalOpen(false)
            success('Acción confirmada')
          }}
          title="Confirmar Acción"
          message="¿Estás seguro de que quieres realizar esta acción? Esta operación no se puede deshacer."
          confirmText="Confirmar"
          cancelText="Cancelar"
          variant="warning"
        />

        <AlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          title="Información"
          message="Este es un mensaje informativo importante que requiere tu atención."
          buttonText="Entendido"
          variant="info"
        />
      </div>
    </div>
  )
}
