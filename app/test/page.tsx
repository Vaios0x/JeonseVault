export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          ¡Tailwind CSS está funcionando!
        </h1>
        <p className="text-gray-700 mb-6">
          Si puedes ver este texto con estilos, significa que Tailwind CSS está configurado correctamente.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Estado del Sistema</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Servidor ejecutándose</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Tailwind CSS activo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>PostCSS funcionando</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
