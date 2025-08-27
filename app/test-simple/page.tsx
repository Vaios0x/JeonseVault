'use client'

import { useAccount } from 'wagmi'

export default function TestSimplePage() {
  const { address, isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Test Simple Wagmi
        </h1>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg mb-2">
              Estado de conexión:
            </p>
            <p className={`text-xl font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '✅ Conectado' : '❌ No conectado'}
            </p>
          </div>
          
          {isConnected && address && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Dirección:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {address}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">✅ Éxito:</h3>
          <p className="text-sm text-green-700">
            Wagmi está funcionando correctamente. No hay errores de importación.
          </p>
        </div>
      </div>
    </div>
  )
}
