'use client'

import { Button } from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function TestWalletButton() {
  const t = useTranslations('wallet')

  const handleClick = () => {
    console.log('Botón clickeado!')
    alert('¡Botón funcionando! Ahora puedes probar la conexión de wallet.')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
      onClick={handleClick}
      type="button"
    >
      <AlertCircle className="w-4 h-4 mr-2" />
      {t('switchNetwork')}
    </Button>
  )
}
