import { NextRequest, NextResponse } from 'next/server'
import { securityManager } from '@/lib/security'

// ============================================================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================================================

const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    skipPaths: ['/api/health', '/api/status']
  },
  
  // Headers de seguridad
  securityHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  },
  
  // CORS
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'https://jeonsevault.com',
      'https://www.jeonsevault.com'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true
  },
  
  // IPs bloqueadas
  blockedIPs: [
    '127.0.0.1', // Localhost (para testing)
    // Agregar más IPs según sea necesario
  ],
  
  // User agents sospechosos
  suspiciousUserAgents: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ]
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

// Obtener IP real del cliente
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  )
}

// Verificar si la IP está bloqueada
function isIPBlocked(ip: string): boolean {
  return SECURITY_CONFIG.blockedIPs.includes(ip)
}

// Verificar si el User Agent es sospechoso
function isSuspiciousUserAgent(userAgent: string): boolean {
  return SECURITY_CONFIG.suspiciousUserAgents.some(pattern => pattern.test(userAgent))
}

// Verificar si la ruta debe saltarse el rate limiting
function shouldSkipRateLimit(pathname: string): boolean {
  return SECURITY_CONFIG.rateLimit.skipPaths.some(path => pathname.startsWith(path))
}

// Verificar si la ruta requiere CSRF protection
function requiresCSRFProtection(method: string, pathname: string): boolean {
  const csrfMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
  const csrfPaths = ['/api/deposits', '/api/investments', '/api/transactions']
  
  return csrfMethods.includes(method) && csrfPaths.some(path => pathname.startsWith(path))
}

// Verificar token CSRF
function verifyCSRFToken(request: NextRequest): boolean {
  const csrfToken = request.headers.get('x-csrf-token') || 
                   request.nextUrl.searchParams.get('_csrf')
  
  if (!csrfToken) {
    return false
  }
  
  return securityManager.verifyCSRFToken(csrfToken)
}

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

export async function securityMiddleware(request: NextRequest) {
  const startTime = Date.now()
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const method = request.method
  const pathname = request.nextUrl.pathname
  
  // ============================================================================
  // AUDITORÍA DE SEGURIDAD
  // ============================================================================
  
  const auditMetadata = {
    ip: clientIP,
    userAgent,
    method,
    pathname,
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries())
  }
  
  // ============================================================================
  // VERIFICACIONES DE SEGURIDAD
  // ============================================================================
  
  // 1. Verificar IP bloqueada
  if (isIPBlocked(clientIP)) {
    securityManager.logSuspiciousAccess(clientIP, userAgent, 'IP bloqueada', auditMetadata)
    return new NextResponse('Access Denied', { status: 403 })
  }
  
  // 2. Verificar User Agent sospechoso
  if (isSuspiciousUserAgent(userAgent)) {
    securityManager.logSuspiciousAccess(clientIP, userAgent, 'User Agent sospechoso', auditMetadata)
    // No bloquear, solo registrar
  }
  
  // 3. Rate Limiting
  if (!shouldSkipRateLimit(pathname)) {
    const rateLimitKey = `${clientIP}:${pathname}`
    const rateLimitResult = securityManager.checkRateLimit(rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      securityManager.logSuspiciousAccess(clientIP, userAgent, 'Rate limit exceeded', {
        ...auditMetadata,
        rateLimit: rateLimitResult
      })
      
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(SECURITY_CONFIG.rateLimit.windowMs / 1000).toString(),
          'X-RateLimit-Limit': SECURITY_CONFIG.rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      })
    }
  }
  
  // 4. Verificación CSRF
  if (requiresCSRFProtection(method, pathname)) {
    if (!verifyCSRFToken(request)) {
      securityManager.logSuspiciousAccess(clientIP, userAgent, 'CSRF token inválido', auditMetadata)
      return new NextResponse('Invalid CSRF Token', { status: 403 })
    }
  }
  
  // ============================================================================
  // PROCESAR REQUEST
  // ============================================================================
  
  try {
    // Continuar con el request
    const response = NextResponse.next()
    
    // ============================================================================
    // AGREGAR HEADERS DE SEGURIDAD
    // ============================================================================
    
    // Headers de seguridad básicos
    Object.entries(SECURITY_CONFIG.securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Headers de CORS
    const origin = request.headers.get('origin')
    if (origin && SECURITY_CONFIG.cors.allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', SECURITY_CONFIG.cors.allowedMethods.join(', '))
    response.headers.set('Access-Control-Allow-Headers', SECURITY_CONFIG.cors.allowedHeaders.join(', '))
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    // Headers de rate limiting
    if (!shouldSkipRateLimit(pathname)) {
      const rateLimitKey = `${clientIP}:${pathname}`
      const rateLimitResult = securityManager.checkRateLimit(rateLimitKey)
      
      response.headers.set('X-RateLimit-Limit', SECURITY_CONFIG.rateLimit.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())
    }
    
    // ============================================================================
    // AUDITORÍA EXITOSA
    // ============================================================================
    
    const processingTime = Date.now() - startTime
    
    securityManager.logAudit({
      type: 'access',
      severity: 'low',
      message: 'Request procesado exitosamente',
      metadata: {
        ...auditMetadata,
        processingTime,
        statusCode: response.status,
        securityHeaders: Object.keys(SECURITY_CONFIG.securityHeaders)
      }
    })
    
    return response
    
  } catch (error) {
    // ============================================================================
    // MANEJO DE ERRORES
    // ============================================================================
    
    securityManager.logCriticalError(error as Error, 'Security Middleware Error', clientIP)
    
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// ============================================================================
// MIDDLEWARE PARA API ROUTES
// ============================================================================

export async function apiSecurityMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Solo aplicar a rutas de API
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  return securityMiddleware(request)
}

// ============================================================================
// MIDDLEWARE PARA PÁGINAS
// ============================================================================

export async function pageSecurityMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Solo aplicar a páginas (no API routes)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  return securityMiddleware(request)
}

// ============================================================================
// MIDDLEWARE PRINCIPAL EXPORTADO
// ============================================================================

export default async function middleware(request: NextRequest) {
  // Aplicar middleware de seguridad a todas las rutas
  return securityMiddleware(request)
}

// ============================================================================
// CONFIGURACIÓN DE MIDDLEWARE
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
