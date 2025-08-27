'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Wallet } from 'lucide-react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'

export default function TestWalletPage() {
  const [logs, setLogs] = useState<string[]>([])
  const { connect, connectors, isPending, error } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleConnect = () => {
    addLog('Intentando conectar...')
    addLog(`Connectors disponibles: ${connectors.length}`)
    
    connectors.forEach((connector, index) => {
      addLog(`Conector ${index}: ${connector.name} - Ready: ${connector.ready}`)
    })

    const availableConnector = connectors.find(c => c.ready)
    if (availableConnector) {
      addLog(`Conectando con: ${availableConnector.name}`)
      connect({ connector: availableConnector })
    } else {
      addLog('No hay conectores disponibles')
    }
  }

  const handleDisconnect = () => {
    addLog('Desconectando...')
    disconnect()
  }

  if (error) {
    addLog(`Error: ${error.message}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Prueba de Wallet</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Estado</h2>
          <div className="space-y-2">
            <p><strong>Conectado:</strong> {isConnected ? 'Sí' : 'No'}</p>
            <p><strong>Dirección:</strong> {address || 'No conectado'}</p>
            <p><strong>Conectores:</strong> {connectors.length}</p>
            <p><strong>Conectores listos:</strong> {connectors.filter(c => c.ready).length}</p>
            <p><strong>Conectando:</strong> {isPending ? 'Sí' : 'No'}</p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleConnect}
              disabled={isPending || isConnected}
              className="w-full"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isPending ? 'Conectando...' : 'Conectar Wallet'}
            </Button>

            {isConnected && (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full"
              >
                Desconectar
              </Button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
