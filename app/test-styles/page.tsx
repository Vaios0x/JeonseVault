export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Prueba de Estilos Tailwind CSS</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de prueba */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Card de Prueba</h2>
            <p className="text-gray-600 mb-4">Este es un texto de prueba para verificar que los estilos se están aplicando correctamente.</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Botón de Prueba
            </button>
          </div>
          
          {/* Otro card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Card 2</h2>
            <p className="text-gray-600 mb-4">Si puedes ver este texto con estilos, Tailwind CSS está funcionando correctamente.</p>
            <div className="flex space-x-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Éxito</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Error</span>
            </div>
          </div>
          
          {/* Card con gradiente */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Card con Gradiente</h2>
            <p className="mb-4 opacity-90">Este card tiene un gradiente de fondo para probar los colores.</p>
            <button className="bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
              Botón Blanco
            </button>
          </div>
        </div>
        
        {/* Sección de colores */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Paleta de Colores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-blue-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">Blue</div>
            <div className="bg-green-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">Green</div>
            <div className="bg-red-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">Red</div>
            <div className="bg-yellow-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">Yellow</div>
            <div className="bg-purple-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">Purple</div>
            <div className="bg-pink-500 h-20 rounded-lg flex items-center justify-center text-white font-medium">Pink</div>
          </div>
        </div>
        
        {/* Estado del servidor */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Estado del Servidor</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Servidor ejecutándose en puerto 3000</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Tailwind CSS configurado correctamente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">PostCSS funcionando</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
