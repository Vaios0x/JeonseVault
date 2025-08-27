#!/usr/bin/env node

/**
 * Script de Auditoría de Seguridad Automatizada para JeonseVault
 * Analiza el código, detecta vulnerabilidades y genera reportes de seguridad
 * 
 * @author JeonseVault Team
 * @version 2.0.0
 */

const fs = require('fs').promises
const path = require('path')
const { glob } = require('glob')
const crypto = require('crypto')

// ============================================================================
// CONFIGURACIÓN DE AUDITORÍA
// ============================================================================

const AUDIT_CONFIG = {
  // Directorios a analizar
  directories: [
    './app',
    './components',
    './hooks',
    './lib',
    './services',
    './utils'
  ],
  
  // Extensiones de archivo a analizar
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  // Patrones de vulnerabilidades
  vulnerabilityPatterns: {
    // SQL Injection
    sqlInjection: [
      /executeQuery\s*\(\s*[^)]*\+/gi,
      /query\s*\(\s*[^)]*\+/gi,
      /raw\s*\(\s*[^)]*\+/gi
    ],
    
    // XSS (Cross-Site Scripting)
    xss: [
      /innerHTML\s*=\s*[^;]+/gi,
      /outerHTML\s*=\s*[^;]+/gi,
      /document\.write\s*\(\s*[^)]*\+/gi,
      /eval\s*\(\s*[^)]*\+/gi,
      /setTimeout\s*\(\s*[^)]*\+/gi,
      /setInterval\s*\(\s*[^)]*\+/gi
    ],
    
    // Command Injection
    commandInjection: [
      /exec\s*\(\s*[^)]*\+/gi,
      /spawn\s*\(\s*[^)]*\+/gi,
      /execSync\s*\(\s*[^)]*\+/gi
    ],
    
    // Path Traversal
    pathTraversal: [
      /fs\.readFile\s*\(\s*[^)]*\+/gi,
      /fs\.writeFile\s*\(\s*[^)]*\+/gi,
      /path\.join\s*\(\s*[^)]*\+/gi,
      /require\s*\(\s*[^)]*\+/gi
    ],
    
    // Hardcoded Secrets
    hardcodedSecrets: [
      /password\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      /api_key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      /private_key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      /mnemonic\s*[:=]\s*['"`][^'"`]+['"`]/gi
    ],
    
    // Insecure Random
    insecureRandom: [
      /Math\.random\s*\(\s*\)/gi,
      /new Date\s*\(\s*\)\.getTime\s*\(\s*\)/gi
    ],
    
    // Weak Crypto
    weakCrypto: [
      /md5\s*\(\s*[^)]*\)/gi,
      /sha1\s*\(\s*[^)]*\)/gi,
      /createHash\s*\(\s*['"`]md5['"`]/gi,
      /createHash\s*\(\s*['"`]sha1['"`]/gi
    ],
    
    // Missing Input Validation
    missingValidation: [
      /req\.body\.[a-zA-Z_][a-zA-Z0-9_]*\s*[^;]*$/gm,
      /req\.query\.[a-zA-Z_][a-zA-Z0-9_]*\s*[^;]*$/gm,
      /req\.params\.[a-zA-Z_][a-zA-Z0-9_]*\s*[^;]*$/gm
    ],
    
    // Unsafe Deserialization
    unsafeDeserialization: [
      /JSON\.parse\s*\(\s*[^)]*\+/gi,
      /eval\s*\(\s*[^)]*\)/gi,
      /Function\s*\(\s*[^)]*\+/gi
    ],
    
    // Missing CSRF Protection
    missingCSRF: [
      /app\.post\s*\(\s*[^)]*\)/gi,
      /app\.put\s*\(\s*[^)]*\)/gi,
      /app\.delete\s*\(\s*[^)]*\)/gi,
      /router\.post\s*\(\s*[^)]*\)/gi,
      /router\.put\s*\(\s*[^)]*\)/gi,
      /router\.delete\s*\(\s*[^)]*\)/gi
    ],
    
    // Missing Rate Limiting
    missingRateLimit: [
      /app\.(get|post|put|delete)\s*\(\s*[^)]*\)/gi,
      /router\.(get|post|put|delete)\s*\(\s*[^)]*\)/gi
    ],
    
    // Insecure Headers
    insecureHeaders: [
      /Access-Control-Allow-Origin:\s*\*/gi,
      /X-Frame-Options:\s*$/gi,
      /X-Content-Type-Options:\s*$/gi,
      /X-XSS-Protection:\s*$/gi
    ],
    
    // Debug Information
    debugInfo: [
      /console\.log\s*\(\s*[^)]*\)/gi,
      /console\.error\s*\(\s*[^)]*\)/gi,
      /console\.warn\s*\(\s*[^)]*\)/gi,
      /console\.info\s*\(\s*[^)]*\)/gi
    ]
  },
  
  // Patrones de buenas prácticas
  goodPractices: {
    // Validación de inputs
    inputValidation: [
      /validateInput\s*\(\s*[^)]*\)/gi,
      /validateForm\s*\(\s*[^)]*\)/gi,
      /zod\s*\.\s*schema/gi,
      /yup\s*\.\s*schema/gi
    ],
    
    // Sanitización
    sanitization: [
      /sanitize\s*\(\s*[^)]*\)/gi,
      /escape\s*\(\s*[^)]*\)/gi,
      /encodeURIComponent\s*\(\s*[^)]*\)/gi
    ],
    
    // Rate Limiting
    rateLimiting: [
      /rateLimit\s*\(\s*[^)]*\)/gi,
      /express-rate-limit/gi,
      /limiter\s*\(\s*[^)]*\)/gi
    ],
    
    // CSRF Protection
    csrfProtection: [
      /csrf\s*\(\s*[^)]*\)/gi,
      /csrfToken/gi,
      /_csrf/gi
    ],
    
    // Secure Headers
    secureHeaders: [
      /helmet\s*\(\s*[^)]*\)/gi,
      /X-Frame-Options:\s*DENY/gi,
      /X-Content-Type-Options:\s*nosniff/gi,
      /X-XSS-Protection:\s*1/gi
    ],
    
    // Environment Variables
    environmentVariables: [
      /process\.env\.[A-Z_][A-Z0-9_]*/gi,
      /NEXT_PUBLIC_/gi
    ],
    
    // Error Handling
    errorHandling: [
      /try\s*\{/gi,
      /catch\s*\(/gi,
      /ErrorBoundary/gi,
      /error\.js/gi
    ]
  }
}

// ============================================================================
// CLASE DE AUDITORÍA DE SEGURIDAD
// ============================================================================

class SecurityAuditor {
  constructor(config = AUDIT_CONFIG) {
    this.config = config
    this.results = {
      vulnerabilities: [],
      goodPractices: [],
      statistics: {
        filesAnalyzed: 0,
        totalLines: 0,
        vulnerabilitiesFound: 0,
        goodPracticesFound: 0
      },
      recommendations: []
    }
  }

  // ============================================================================
  // MÉTODOS PRINCIPALES
  // ============================================================================

  // Ejecutar auditoría completa
  async runAudit() {
    console.log('🔒 Iniciando auditoría de seguridad...\n')
    
    const startTime = Date.now()
    
    try {
      // Encontrar archivos
      const files = await this.findFiles()
      console.log(`📁 Encontrados ${files.length} archivos para analizar\n`)
      
      // Analizar cada archivo
      for (const file of files) {
        await this.analyzeFile(file)
      }
      
      // Generar estadísticas
      this.generateStatistics()
      
      // Generar recomendaciones
      this.generateRecommendations()
      
      // Mostrar resultados
      this.printResults()
      
      // Generar reporte
      await this.generateReport()
      
      const totalTime = Date.now() - startTime
      console.log(`\n✅ Auditoría completada en ${(totalTime / 1000).toFixed(2)}s`)
      
    } catch (error) {
      console.error('❌ Error durante la auditoría:', error.message)
      process.exit(1)
    }
  }

  // Encontrar archivos para analizar
  async findFiles() {
    const files = []
    
    for (const directory of this.config.directories) {
      try {
        const pattern = path.join(directory, '**/*')
        const matches = await glob(pattern, { nodir: true })
        
        for (const file of matches) {
          const ext = path.extname(file).toLowerCase()
          if (this.config.fileExtensions.includes(ext)) {
            files.push(file)
          }
        }
      } catch (error) {
        console.warn(`⚠️  No se pudo analizar el directorio ${directory}:`, error.message)
      }
    }
    
    return files
  }

  // Analizar archivo individual
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const lines = content.split('\n')
      
      this.results.statistics.filesAnalyzed++
      this.results.statistics.totalLines += lines.length
      
      // Analizar vulnerabilidades
      this.analyzeVulnerabilities(filePath, content, lines)
      
      // Analizar buenas prácticas
      this.analyzeGoodPractices(filePath, content, lines)
      
    } catch (error) {
      console.warn(`⚠️  No se pudo analizar el archivo ${filePath}:`, error.message)
    }
  }

  // Analizar vulnerabilidades
  analyzeVulnerabilities(filePath, content, lines) {
    for (const [vulnType, patterns] of Object.entries(this.config.vulnerabilityPatterns)) {
      for (const pattern of patterns) {
        const matches = content.match(pattern)
        
        if (matches) {
          for (const match of matches) {
            const lineNumber = this.findLineNumber(content, match)
            
            this.results.vulnerabilities.push({
              type: vulnType,
              severity: this.getVulnerabilitySeverity(vulnType),
              file: filePath,
              line: lineNumber,
              code: match.trim(),
              description: this.getVulnerabilityDescription(vulnType),
              recommendation: this.getVulnerabilityRecommendation(vulnType)
            })
            
            this.results.statistics.vulnerabilitiesFound++
          }
        }
      }
    }
  }

  // Analizar buenas prácticas
  analyzeGoodPractices(filePath, content, lines) {
    for (const [practiceType, patterns] of Object.entries(this.config.goodPractices)) {
      for (const pattern of patterns) {
        const matches = content.match(pattern)
        
        if (matches) {
          for (const match of matches) {
            const lineNumber = this.findLineNumber(content, match)
            
            this.results.goodPractices.push({
              type: practiceType,
              file: filePath,
              line: lineNumber,
              code: match.trim(),
              description: this.getGoodPracticeDescription(practiceType)
            })
            
            this.results.statistics.goodPracticesFound++
          }
        }
      }
    }
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  // Encontrar número de línea
  findLineNumber(content, match) {
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1
      }
    }
    return 1
  }

  // Obtener severidad de vulnerabilidad
  getVulnerabilitySeverity(type) {
    const severityMap = {
      sqlInjection: 'critical',
      xss: 'high',
      commandInjection: 'critical',
      pathTraversal: 'high',
      hardcodedSecrets: 'critical',
      insecureRandom: 'medium',
      weakCrypto: 'high',
      missingValidation: 'medium',
      unsafeDeserialization: 'high',
      missingCSRF: 'medium',
      missingRateLimit: 'medium',
      insecureHeaders: 'low',
      debugInfo: 'low'
    }
    
    return severityMap[type] || 'medium'
  }

  // Obtener descripción de vulnerabilidad
  getVulnerabilityDescription(type) {
    const descriptions = {
      sqlInjection: 'Posible inyección SQL detectada',
      xss: 'Posible Cross-Site Scripting (XSS) detectado',
      commandInjection: 'Posible inyección de comandos detectada',
      pathTraversal: 'Posible Path Traversal detectado',
      hardcodedSecrets: 'Secretos hardcodeados detectados',
      insecureRandom: 'Uso de generación de números aleatorios insegura',
      weakCrypto: 'Uso de algoritmos criptográficos débiles',
      missingValidation: 'Falta validación de inputs',
      unsafeDeserialization: 'Deserialización insegura detectada',
      missingCSRF: 'Falta protección CSRF',
      missingRateLimit: 'Falta rate limiting',
      insecureHeaders: 'Headers de seguridad faltantes o inseguros',
      debugInfo: 'Información de debug expuesta'
    }
    
    return descriptions[type] || 'Vulnerabilidad detectada'
  }

  // Obtener recomendación de vulnerabilidad
  getVulnerabilityRecommendation(type) {
    const recommendations = {
      sqlInjection: 'Usar consultas parametrizadas o ORM',
      xss: 'Sanitizar inputs y usar React.createElement en lugar de innerHTML',
      commandInjection: 'Evitar ejecución dinámica de comandos',
      pathTraversal: 'Validar y sanitizar rutas de archivo',
      hardcodedSecrets: 'Usar variables de entorno para secretos',
      insecureRandom: 'Usar crypto.randomBytes() para valores aleatorios',
      weakCrypto: 'Usar algoritmos criptográficos seguros (SHA-256, bcrypt)',
      missingValidation: 'Implementar validación de inputs con Zod o Yup',
      unsafeDeserialization: 'Usar JSON.parse() con validación',
      missingCSRF: 'Implementar tokens CSRF en formularios',
      missingRateLimit: 'Implementar rate limiting en endpoints',
      insecureHeaders: 'Configurar headers de seguridad con Helmet',
      debugInfo: 'Remover logs de debug en producción'
    }
    
    return recommendations[type] || 'Revisar y corregir la vulnerabilidad'
  }

  // Obtener descripción de buena práctica
  getGoodPracticeDescription(type) {
    const descriptions = {
      inputValidation: 'Validación de inputs implementada',
      sanitization: 'Sanitización de datos implementada',
      rateLimiting: 'Rate limiting implementado',
      csrfProtection: 'Protección CSRF implementada',
      secureHeaders: 'Headers de seguridad configurados',
      environmentVariables: 'Uso correcto de variables de entorno',
      errorHandling: 'Manejo de errores implementado'
    }
    
    return descriptions[type] || 'Buena práctica implementada'
  }

  // Generar estadísticas
  generateStatistics() {
    const vulnBySeverity = {}
    for (const vuln of this.results.vulnerabilities) {
      vulnBySeverity[vuln.severity] = (vulnBySeverity[vuln.severity] || 0) + 1
    }
    
    this.results.statistics.vulnerabilitiesBySeverity = vulnBySeverity
  }

  // Generar recomendaciones
  generateRecommendations() {
    const recommendations = []
    
    // Recomendaciones basadas en vulnerabilidades encontradas
    const vulnTypes = [...new Set(this.results.vulnerabilities.map(v => v.type))]
    
    if (vulnTypes.includes('sqlInjection')) {
      recommendations.push('🔴 CRÍTICO: Implementar consultas parametrizadas para prevenir inyección SQL')
    }
    
    if (vulnTypes.includes('xss')) {
      recommendations.push('🔴 ALTO: Implementar sanitización de inputs para prevenir XSS')
    }
    
    if (vulnTypes.includes('hardcodedSecrets')) {
      recommendations.push('🔴 CRÍTICO: Mover todos los secretos a variables de entorno')
    }
    
    if (vulnTypes.includes('missingCSRF')) {
      recommendations.push('🟡 MEDIO: Implementar protección CSRF en todos los formularios')
    }
    
    if (vulnTypes.includes('missingRateLimit')) {
      recommendations.push('🟡 MEDIO: Implementar rate limiting en endpoints críticos')
    }
    
    // Recomendaciones generales
    if (this.results.statistics.vulnerabilitiesFound > 10) {
      recommendations.push('🔴 CRÍTICO: Alto número de vulnerabilidades detectadas. Revisar código urgentemente')
    }
    
    if (this.results.statistics.vulnerabilitiesFound === 0) {
      recommendations.push('✅ EXCELENTE: No se detectaron vulnerabilidades críticas')
    }
    
    this.results.recommendations = recommendations
  }

  // ============================================================================
  // MÉTODOS DE REPORTE
  // ============================================================================

  // Imprimir resultados
  printResults() {
    console.log('📊 RESULTADOS DE LA AUDITORÍA DE SEGURIDAD\n')
    
    // Estadísticas generales
    console.log('📈 ESTADÍSTICAS:')
    console.log(`   • Archivos analizados: ${this.results.statistics.filesAnalyzed}`)
    console.log(`   • Líneas de código: ${this.results.statistics.totalLines.toLocaleString()}`)
    console.log(`   • Vulnerabilidades encontradas: ${this.results.statistics.vulnerabilitiesFound}`)
    console.log(`   • Buenas prácticas encontradas: ${this.results.statistics.goodPracticesFound}`)
    
    // Vulnerabilidades por severidad
    if (this.results.statistics.vulnerabilitiesBySeverity) {
      console.log('\n🚨 VULNERABILIDADES POR SEVERIDAD:')
      for (const [severity, count] of Object.entries(this.results.statistics.vulnerabilitiesBySeverity)) {
        const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🟢'
        console.log(`   • ${icon} ${severity.toUpperCase()}: ${count}`)
      }
    }
    
    // Vulnerabilidades críticas
    const criticalVulns = this.results.vulnerabilities.filter(v => v.severity === 'critical')
    if (criticalVulns.length > 0) {
      console.log('\n🔴 VULNERABILIDADES CRÍTICAS:')
      for (const vuln of criticalVulns.slice(0, 5)) {
        console.log(`   • ${vuln.file}:${vuln.line} - ${vuln.description}`)
      }
      if (criticalVulns.length > 5) {
        console.log(`   • ... y ${criticalVulns.length - 5} más`)
      }
    }
    
    // Vulnerabilidades altas
    const highVulns = this.results.vulnerabilities.filter(v => v.severity === 'high')
    if (highVulns.length > 0) {
      console.log('\n🟠 VULNERABILIDADES ALTAS:')
      for (const vuln of highVulns.slice(0, 5)) {
        console.log(`   • ${vuln.file}:${vuln.line} - ${vuln.description}`)
      }
      if (highVulns.length > 5) {
        console.log(`   • ... y ${highVulns.length - 5} más`)
      }
    }
    
    // Recomendaciones
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMENDACIONES:')
      for (const rec of this.results.recommendations) {
        console.log(`   • ${rec}`)
      }
    }
    
    // Resumen
    console.log('\n📋 RESUMEN:')
    if (criticalVulns.length > 0) {
      console.log(`   🔴 ${criticalVulns.length} vulnerabilidades críticas requieren atención inmediata`)
    }
    if (highVulns.length > 0) {
      console.log(`   🟠 ${highVulns.length} vulnerabilidades altas deben ser corregidas`)
    }
    if (this.results.statistics.vulnerabilitiesFound === 0) {
      console.log('   ✅ No se detectaron vulnerabilidades críticas')
    }
  }

  // Generar reporte HTML
  async generateReport() {
    const reportPath = './security-audit-report.html'
    
    const html = this.generateHTMLReport()
    
    try {
      await fs.writeFile(reportPath, html, 'utf8')
      console.log(`\n📄 Reporte generado: ${reportPath}`)
    } catch (error) {
      console.warn(`⚠️  No se pudo generar el reporte HTML:`, error.message)
    }
  }

  // Generar HTML del reporte
  generateHTMLReport() {
    const criticalVulns = this.results.vulnerabilities.filter(v => v.severity === 'critical')
    const highVulns = this.results.vulnerabilities.filter(v => v.severity === 'high')
    const mediumVulns = this.results.vulnerabilities.filter(v => v.severity === 'medium')
    const lowVulns = this.results.vulnerabilities.filter(v => v.severity === 'low')

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Auditoría de Seguridad - JeonseVault</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #007bff; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .stat-label { color: #6c757d; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .vuln-list { list-style: none; padding: 0; }
        .vuln-item { background: #fff; border: 1px solid #e9ecef; border-radius: 6px; margin-bottom: 10px; padding: 15px; }
        .vuln-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
        .vuln-severity { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .severity-critical { background: #dc3545; color: white; }
        .severity-high { background: #fd7e14; color: white; }
        .severity-medium { background: #ffc107; color: black; }
        .severity-low { background: #28a745; color: white; }
        .vuln-file { font-family: monospace; color: #6c757d; font-size: 0.9em; }
        .vuln-description { color: #333; margin: 5px 0; }
        .vuln-recommendation { background: #e7f3ff; border-left: 4px solid #007bff; padding: 10px; margin-top: 10px; font-size: 0.9em; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; }
        .recommendations h3 { color: #856404; margin-top: 0; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .recommendations li { margin-bottom: 8px; color: #856404; }
        .timestamp { text-align: center; color: #6c757d; margin-top: 30px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Auditoría de Seguridad</h1>
            <p>JeonseVault - Reporte Automatizado</p>
        </div>
        
        <div class="content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${this.results.statistics.filesAnalyzed}</div>
                    <div class="stat-label">Archivos Analizados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.results.statistics.totalLines.toLocaleString()}</div>
                    <div class="stat-label">Líneas de Código</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.results.statistics.vulnerabilitiesFound}</div>
                    <div class="stat-label">Vulnerabilidades</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.results.statistics.goodPracticesFound}</div>
                    <div class="stat-label">Buenas Prácticas</div>
                </div>
            </div>

            ${criticalVulns.length > 0 ? `
            <div class="section">
                <h2>🔴 Vulnerabilidades Críticas (${criticalVulns.length})</h2>
                <ul class="vuln-list">
                    ${criticalVulns.map(vuln => `
                    <li class="vuln-item">
                        <div class="vuln-header">
                            <span class="vuln-severity severity-critical">CRÍTICO</span>
                            <span class="vuln-file">${vuln.file}:${vuln.line}</span>
                        </div>
                        <div class="vuln-description">${vuln.description}</div>
                        <div class="vuln-recommendation">
                            <strong>Recomendación:</strong> ${vuln.recommendation}
                        </div>
                    </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            ${highVulns.length > 0 ? `
            <div class="section">
                <h2>🟠 Vulnerabilidades Altas (${highVulns.length})</h2>
                <ul class="vuln-list">
                    ${highVulns.map(vuln => `
                    <li class="vuln-item">
                        <div class="vuln-header">
                            <span class="vuln-severity severity-high">ALTO</span>
                            <span class="vuln-file">${vuln.file}:${vuln.line}</span>
                        </div>
                        <div class="vuln-description">${vuln.description}</div>
                        <div class="vuln-recommendation">
                            <strong>Recomendación:</strong> ${vuln.recommendation}
                        </div>
                    </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            ${this.results.recommendations.length > 0 ? `
            <div class="recommendations">
                <h3>💡 Recomendaciones Prioritarias</h3>
                <ul>
                    ${this.results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <div class="timestamp">
                Reporte generado el ${new Date().toLocaleString('es-ES')}
            </div>
        </div>
    </div>
</body>
</html>
    `
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  const auditor = new SecurityAuditor()
  
  // Procesar argumentos de línea de comandos
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔒 Auditoría de Seguridad - JeonseVault

Uso: node scripts/security-audit.js [opciones]

Opciones:
  --help, -h       Mostrar esta ayuda
  --quick          Ejecutar auditoría rápida (solo archivos principales)
  --verbose        Mostrar información detallada
  --fix            Generar sugerencias de corrección automática

Ejemplos:
  node scripts/security-audit.js
  node scripts/security-audit.js --quick
  node scripts/security-audit.js --verbose
    `)
    return
  }
  
  // Ejecutar auditoría
  await auditor.runAudit()
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { SecurityAuditor, AUDIT_CONFIG }
