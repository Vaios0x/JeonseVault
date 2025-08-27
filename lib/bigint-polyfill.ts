// Polyfill para BigInt en navegadores que no lo soportan completamente
export function setupBigIntPolyfill(): boolean {
  if (typeof window === 'undefined') return false

  // Verificar si BigInt está disponible
  if (typeof BigInt === 'undefined') {
    console.warn('BigInt no está soportado en este navegador')
    return false
  }

  // Polyfill para Math.pow con BigInt
  try {
    // @ts-ignore
    Math.pow(BigInt(2), BigInt(3))
  } catch (error) {
    console.warn('Math.pow no funciona con BigInt - aplicando polyfill')
    
                        const originalMathPow = Math.pow
                    ;(Math as any).pow = function(base: any, exponent: any) {
                      if (typeof base === 'bigint' || typeof exponent === 'bigint') {
                        // Convertir a números para Math.pow
                        const baseNum = typeof base === 'bigint' ? Number(base) : base
                        const exponentNum = typeof exponent === 'bigint' ? Number(exponent) : exponent
                        
                        // Verificar límites seguros
                        if (baseNum > Number.MAX_SAFE_INTEGER || exponentNum > Number.MAX_SAFE_INTEGER) {
                          throw new Error('Valores demasiado grandes para Math.pow con BigInt')
                        }
                        
                        return BigInt(Math.floor(originalMathPow(baseNum, exponentNum)))
                      }
                      return originalMathPow(base, exponent)
                    }
  }

  // Polyfill para Number() con BigInt
  try {
    Number(BigInt(123))
  } catch (error) {
    console.warn('Number() no funciona con BigInt - aplicando polyfill')
    
    const originalNumber = Number
    Number = function(value: any) {
      if (typeof value === 'bigint') {
        // Verificar si el valor es seguro para Number
        if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
          throw new Error('BigInt value too large for Number conversion')
        }
        return Number(value.toString())
      }
      return originalNumber(value)
    } as any
  }

  // Polyfill para operaciones mixtas de BigInt y Number
  if (!(BigInt as any).prototype.toNumber) {
    (BigInt as any).prototype.toNumber = function() {
      try {
        return Number(this)
      } catch {
        return 0
      }
    }
  }

  // Polyfill para conversiones seguras
  if (!(BigInt as any).safeFrom) {
    (BigInt as any).safeFrom = function(value: any): bigint {
      try {
        if (typeof value === 'bigint') return value
        if (typeof value === 'number') return BigInt(Math.floor(value))
        if (typeof value === 'string') return BigInt(value)
        return BigInt(0)
      } catch {
        return BigInt(0)
      }
    }
  }

  // Polyfill para operaciones aritméticas mixtas
  const originalBigInt = BigInt
  const BigIntConstructor = function(value: any): bigint {
    try {
      if (typeof value === 'bigint') return value
      if (typeof value === 'number') return originalBigInt(Math.floor(value))
      if (typeof value === 'string') return originalBigInt(value)
      return originalBigInt(0)
    } catch {
      return originalBigInt(0)
    }
  }

  // Copiar propiedades estáticas
  Object.setPrototypeOf(BigIntConstructor, originalBigInt)
  Object.assign(BigIntConstructor, originalBigInt)

  // Reemplazar BigInt global si es necesario
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).BigInt = BigIntConstructor
  }
  if (typeof window !== 'undefined') {
    (window as any).BigInt = BigIntConstructor
  }

  console.log('✅ Polyfill de BigInt configurado correctamente')
  return true
}

// Función para verificar compatibilidad
export function isBigIntSupported(): boolean {
  try {
    return typeof BigInt !== 'undefined' && 
           typeof BigInt(1) === 'bigint' &&
           BigInt(1) + BigInt(1) === BigInt(2)
  } catch {
    return false
  }
}

// Función para convertir BigInt a número de forma segura
export function safeBigIntToNumber(value: bigint): number {
  try {
    return Number(value)
  } catch {
    return 0
  }
}

// Función para convertir número a BigInt de forma segura
export function safeNumberToBigInt(value: number): bigint {
  try {
    return BigInt(Math.floor(value))
  } catch {
    return BigInt(0)
  }
}

// Función para convertir cualquier valor a BigInt de forma segura
export function safeToBigInt(value: any): bigint {
  try {
    if (typeof value === 'bigint') return value
    if (typeof value === 'number') return BigInt(Math.floor(value))
    if (typeof value === 'string') return BigInt(value)
    return BigInt(0)
  } catch {
    return BigInt(0)
  }
}

// Función para convertir cualquier valor a número de forma segura
export function safeToNumber(value: any): number {
  try {
    if (typeof value === 'number') return value
    if (typeof value === 'bigint') return Number(value)
    if (typeof value === 'string') return Number(value)
    return 0
  } catch {
    return 0
  }
}

// Inicializar polyfill automáticamente solo una vez
// Comentado temporalmente para evitar problemas de inicialización
// if (typeof window !== 'undefined' && !(window as any).__bigintPolyfillInitialized) {
//   setupBigIntPolyfill()
//   ;(window as any).__bigintPolyfillInitialized = true
// }
