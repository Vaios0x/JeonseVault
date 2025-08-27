#!/usr/bin/env node

/**
 * Script profesional para generar automáticamente todos los recursos PWA de JeonseVault
 * Genera iconos, capturas de pantalla, favicon y optimiza para diferentes dispositivos
 * 
 * Requiere: npm install -g pwa-asset-generator sharp
 * 
 * @author JeonseVault Team
 * @version 2.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Generando recursos PWA completos para JeonseVault...\n');

// Configuración profesional de iconos PWA
const pwaConfig = {
  // Iconos principales
  icons: {
    sizes: [16, 32, 48, 72, 96, 144, 192, 256, 384, 512],
    appleTouchIcon: 180,
    favicon: [16, 32, 48],
    maskable: [192, 512],
    outputDir: './public',
    logoPath: './assets/logo.png',
    manifestPath: './public/manifest.json'
  },
  
  // Capturas de pantalla
  screenshots: {
    desktop: { width: 1280, height: 720 },
    mobile: { width: 390, height: 844 },
    tablet: { width: 768, height: 1024 }
  },
  
  // Colores del tema
  colors: {
    primary: '#0052CC',
    secondary: '#1e40af',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    accent: '#3b82f6'
  }
};

// Verificar dependencias
function checkDependencies() {
  try {
    execSync('pwa-asset-generator --version', { stdio: 'ignore' });
    console.log('✅ pwa-asset-generator encontrado');
  } catch (error) {
    console.log('❌ pwa-asset-generator no encontrado');
    console.log('💡 Instala con: npm install -g pwa-asset-generator');
    process.exit(1);
  }
}

// Crear logo base profesional si no existe
function createBaseLogo() {
  if (!fs.existsSync(pwaConfig.icons.logoPath)) {
    console.log('📝 Creando logo base profesional...');
    
    // Crear directorio assets si no existe
    if (!fs.existsSync('./assets')) {
      fs.mkdirSync('./assets');
    }
    
    // Logo SVG profesional para JeonseVault
    const logoSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0052CC;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:0.8" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Fondo con gradiente -->
  <rect width="512" height="512" rx="96" fill="url(#primaryGradient)"/>
  
  <!-- Elemento principal - Casa/Edificio estilizado -->
  <g filter="url(#shadow)">
    <!-- Base del edificio -->
    <rect x="128" y="320" width="256" height="128" rx="16" fill="url(#secondaryGradient)"/>
    
    <!-- Techo -->
    <path d="M128 320 L256 200 L384 320 Z" fill="url(#secondaryGradient)"/>
    
    <!-- Ventanas -->
    <rect x="160" y="240" width="48" height="48" rx="8" fill="#0052CC" opacity="0.8"/>
    <rect x="224" y="240" width="48" height="48" rx="8" fill="#0052CC" opacity="0.8"/>
    <rect x="288" y="240" width="48" height="48" rx="8" fill="#0052CC" opacity="0.8"/>
    
    <!-- Puerta -->
    <rect x="224" y="320" width="64" height="80" rx="8" fill="#0052CC"/>
    
    <!-- Elemento de seguridad/escrow -->
    <circle cx="256" cy="160" r="32" fill="#ffffff" opacity="0.95"/>
    <path d="M240 160 L256 144 L272 160 L256 176 Z" fill="#0052CC"/>
    
    <!-- Símbolo de blockchain -->
    <g transform="translate(400, 112)">
      <circle cx="0" cy="0" r="16" fill="#ffffff" opacity="0.9"/>
      <path d="M-8 0 L0 -8 L8 0 L0 8 Z" fill="#0052CC"/>
    </g>
  </g>
  
  <!-- Texto de marca -->
  <text x="256" y="480" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold" opacity="0.9">JV</text>
</svg>`;
    
    fs.writeFileSync('./assets/logo.svg', logoSvg);
    console.log('✅ Logo SVG profesional creado en: ./assets/logo.svg');
    console.log('💡 Reemplaza este archivo con tu logo real y ejecuta el script nuevamente');
    process.exit(0);
  }
}

// Generar iconos PWA
function generateIcons() {
  console.log('🔧 Generando iconos PWA con pwa-asset-generator...');
  
  try {
    const command = `pwa-asset-generator ${pwaConfig.icons.logoPath} ${pwaConfig.icons.outputDir} \
      --icon-only \
      --favicon \
      --mstile \
      --path "/" \
      --manifest ${pwaConfig.icons.manifestPath} \
      --type png \
      --quality 95 \
      --background "${pwaConfig.colors.background}" \
      --maskable \
      --padding 12% \
      --opaque false`;
    
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Iconos PWA generados exitosamente!');
  } catch (error) {
    console.error('❌ Error generando iconos:', error.message);
    process.exit(1);
  }
}

// Generar capturas de pantalla profesionales
function generateScreenshots() {
  console.log('\n📸 Generando capturas de pantalla profesionales...');
  
  // Captura de pantalla desktop profesional
  const desktopScreenshot = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="1280" height="720" fill="url(#bgGradient)"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="1280" height="80" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="40" y="20" width="200" height="40" rx="8" fill="#0052CC"/>
  <text x="140" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">JeonseVault</text>
  
  <!-- Sidebar -->
  <rect x="0" y="80" width="240" height="640" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="20" y="120" width="200" height="40" rx="6" fill="#f1f5f9"/>
  <text x="120" y="145" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Dashboard</text>
  <rect x="20" y="170" width="200" height="40" rx="6" fill="#0052CC"/>
  <text x="120" y="195" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Depósitos</text>
  <rect x="20" y="220" width="200" height="40" rx="6" fill="#f1f5f9"/>
  <text x="120" y="245" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Inversiones</text>
  <rect x="20" y="270" width="200" height="40" rx="6" fill="#f1f5f9"/>
  <text x="120" y="295" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Compliance</text>
  
  <!-- Contenido principal -->
  <rect x="260" y="100" width="1000" height="600" rx="12" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  
  <!-- Cards de estadísticas -->
  <rect x="280" y="120" width="220" height="120" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="390" y="140" text-anchor="middle" fill="#1e293b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Total Depósitos</text>
  <text x="390" y="180" text-anchor="middle" fill="#0052CC" font-family="Arial, sans-serif" font-size="24" font-weight="bold">₩2.5B</text>
  <text x="390" y="200" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="12">+12.5%</text>
  
  <rect x="520" y="120" width="220" height="120" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="630" y="140" text-anchor="middle" fill="#1e293b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Inversores Activos</text>
  <text x="630" y="180" text-anchor="middle" fill="#0052CC" font-family="Arial, sans-serif" font-size="24" font-weight="bold">1,247</text>
  <text x="630" y="200" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="12">+8.3%</text>
  
  <rect x="760" y="120" width="220" height="120" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="870" y="140" text-anchor="middle" fill="#1e293b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Rendimiento Promedio</text>
  <text x="870" y="180" text-anchor="middle" fill="#0052CC" font-family="Arial, sans-serif" font-size="24" font-weight="bold">6.8%</text>
  <text x="870" y="200" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="12">+0.5%</text>
  
  <rect x="1000" y="120" width="220" height="120" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="1110" y="140" text-anchor="middle" fill="#1e293b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Propiedades Verificadas</text>
  <text x="1110" y="180" text-anchor="middle" fill="#0052CC" font-family="Arial, sans-serif" font-size="24" font-weight="bold">892</text>
  <text x="1110" y="200" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="12">+15.2%</text>
  
  <!-- Tabla de depósitos recientes -->
  <rect x="280" y="260" width="940" height="300" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="300" y="285" fill="#1e293b" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Depósitos Recientes</text>
  
  <!-- Filas de la tabla -->
  <rect x="300" y="300" width="900" height="40" fill="#f8fafc"/>
  <text x="320" y="320" fill="#64748b" font-family="Arial, sans-serif" font-size="12">Gangnam-gu, Seoul</text>
  <text x="500" y="320" fill="#64748b" font-family="Arial, sans-serif" font-size="12">₩500M</text>
  <text x="650" y="320" fill="#64748b" font-family="Arial, sans-serif" font-size="12">85%</text>
  <text x="750" y="320" fill="#10b981" font-family="Arial, sans-serif" font-size="12">Activo</text>
  <text x="900" y="320" fill="#64748b" font-family="Arial, sans-serif" font-size="12">15 días</text>
  
  <rect x="300" y="340" width="900" height="40" fill="white"/>
  <text x="320" y="360" fill="#64748b" font-family="Arial, sans-serif" font-size="12">Mapo-gu, Seoul</text>
  <text x="500" y="360" fill="#64748b" font-family="Arial, sans-serif" font-size="12">₩300M</text>
  <text x="650" y="360" fill="#64748b" font-family="Arial, sans-serif" font-size="12">100%</text>
  <text x="750" y="360" fill="#0052CC" font-family="Arial, sans-serif" font-size="12">Completado</text>
  <text x="900" y="360" fill="#64748b" font-family="Arial, sans-serif" font-size="12">Completado</text>
  
  <rect x="300" y="380" width="900" height="40" fill="#f8fafc"/>
  <text x="320" y="400" fill="#64748b" font-family="Arial, sans-serif" font-size="12">Yongsan-gu, Seoul</text>
  <text x="500" y="400" fill="#64748b" font-family="Arial, sans-serif" font-size="12">₩750M</text>
  <text x="650" y="400" fill="#64748b" font-family="Arial, sans-serif" font-size="12">45%</text>
  <text x="750" y="400" fill="#f59e0b" font-family="Arial, sans-serif" font-size="12">Pendiente</text>
  <text x="900" y="400" fill="#64748b" font-family="Arial, sans-serif" font-size="12">45 días</text>
  
  <!-- Footer -->
  <rect x="280" y="580" width="940" height="40" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="300" y="600" fill="#64748b" font-family="Arial, sans-serif" font-size="12">Mostrando 1-3 de 47 depósitos</text>
</svg>`;
  
  // Captura de pantalla móvil profesional
  const mobileScreenshot = `
<svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mobileBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo -->
  <rect width="390" height="844" fill="url(#mobileBgGradient)"/>
  
  <!-- Header móvil -->
  <rect x="0" y="0" width="390" height="120" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="20" y="40" width="350" height="60" rx="12" fill="#0052CC"/>
  <text x="195" y="75" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">JeonseVault</text>
  
  <!-- Contenido principal -->
  <rect x="20" y="140" width="350" height="600" rx="16" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  
  <!-- Cards de estadísticas móviles -->
  <rect x="40" y="160" width="310" height="80" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="195" y="180" text-anchor="middle" fill="#1e293b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Balance Total</text>
  <text x="195" y="210" text-anchor="middle" fill="#0052CC" font-family="Arial, sans-serif" font-size="20" font-weight="bold">₩125M</text>
  <text x="195" y="225" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="10">+₩2.5M este mes</text>
  
  <rect x="40" y="260" width="310" height="80" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="195" y="280" text-anchor="middle" fill="#1e293b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Depósitos Activos</text>
  <text x="195" y="310" text-anchor="middle" fill="#0052CC" font-family="Arial, sans-serif" font-size="20" font-weight="bold">3</text>
  <text x="195" y="325" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="10">₩85M en total</text>
  
  <!-- Lista de depósitos -->
  <rect x="40" y="360" width="310" height="120" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="60" y="385" fill="#1e293b" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Gangnam-gu, Seoul</text>
  <text x="60" y="405" fill="#64748b" font-family="Arial, sans-serif" font-size="12">₩500M • 85% completado</text>
  <rect x="60" y="415" width="250" height="6" rx="3" fill="#e2e8f0"/>
  <rect x="60" y="415" width="212" height="6" rx="3" fill="#0052CC"/>
  <text x="60" y="435" fill="#10b981" font-family="Arial, sans-serif" font-size="12">15 días restantes</text>
  <text x="320" y="435" fill="#0052CC" font-family="Arial, sans-serif" font-size="12">Activo</text>
  
  <rect x="40" y="500" width="310" height="120" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="60" y="525" fill="#1e293b" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Mapo-gu, Seoul</text>
  <text x="60" y="545" fill="#64748b" font-family="Arial, sans-serif" font-size="12">₩300M • 100% completado</text>
  <rect x="60" y="555" width="250" height="6" rx="3" fill="#e2e8f0"/>
  <rect x="60" y="555" width="250" height="6" rx="3" fill="#0052CC"/>
  <text x="60" y="575" fill="#64748b" font-family="Arial, sans-serif" font-size="12">Completado exitosamente</text>
  <text x="320" y="575" fill="#0052CC" font-family="Arial, sans-serif" font-size="12">Completado</text>
  
  <!-- Navegación inferior -->
  <rect x="0" y="760" width="390" height="84" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="40" y="780" width="60" height="40" rx="8" fill="#0052CC"/>
  <text x="70" y="805" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">🏠</text>
  <text x="70" y="820" text-anchor="middle" fill="#0052CC" font-family="Arial, sans-serif" font-size="8">Inicio</text>
  
  <rect x="110" y="780" width="60" height="40" rx="8" fill="#f1f5f9"/>
  <text x="140" y="805" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="10">💰</text>
  <text x="140" y="820" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="8">Depósitos</text>
  
  <rect x="180" y="780" width="60" height="40" rx="8" fill="#f1f5f9"/>
  <text x="210" y="805" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="10">📈</text>
  <text x="210" y="820" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="8">Inversiones</text>
  
  <rect x="250" y="780" width="60" height="40" rx="8" fill="#f1f5f9"/>
  <text x="280" y="805" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="10">👤</text>
  <text x="280" y="820" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="8">Perfil</text>
  
  <rect x="320" y="780" width="60" height="40" rx="8" fill="#f1f5f9"/>
  <text x="350" y="805" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="10">⚙️</text>
  <text x="350" y="820" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="8">Más</text>
</svg>`;
  
  // Guardar capturas como SVG (se pueden convertir a PNG después)
  fs.writeFileSync('./public/screenshot-desktop.svg', desktopScreenshot);
  fs.writeFileSync('./public/screenshot-mobile.svg', mobileScreenshot);
  
  console.log('✅ Capturas de pantalla SVG generadas');
  console.log('💡 Convierte los archivos .svg a .png usando herramientas como Inkscape o online converters');
}

// Verificar archivos generados
function verifyGeneratedFiles() {
  console.log('\n📋 Verificando archivos generados...');
  
  const expectedFiles = [
    'favicon.ico',
    'apple-touch-icon.png',
    'icon-16x16.png',
    'icon-32x32.png',
    'icon-48x48.png',
    'icon-72x72.png',
    'icon-96x96.png',
    'icon-144x144.png',
    'icon-192x192.png',
    'icon-256x256.png',
    'icon-384x384.png',
    'icon-512x512.png',
    'mstile-150x150.png',
    'screenshot-desktop.svg',
    'screenshot-mobile.svg'
  ];
  
  let successCount = 0;
  let totalSize = 0;
  
  expectedFiles.forEach(file => {
    const filePath = path.join(pwaConfig.icons.outputDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      totalSize += stats.size;
      console.log(`✅ ${file} (${sizeKB} KB)`);
      successCount++;
    } else {
      console.log(`❌ ${file} (no encontrado)`);
    }
  });
  
  console.log(`\n📊 Resumen: ${successCount}/${expectedFiles.length} archivos generados`);
  console.log(`📦 Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  return successCount === expectedFiles.length;
}

// Actualizar manifest.json con nuevos iconos
function updateManifest() {
  console.log('\n📝 Actualizando manifest.json...');
  
  const manifestPath = pwaConfig.icons.manifestPath;
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Actualizar iconos con todos los tamaños disponibles
      manifest.icons = [
        {
          "src": "/icon-16x16.png",
          "sizes": "16x16",
          "type": "image/png"
        },
        {
          "src": "/icon-32x32.png",
          "sizes": "32x32",
          "type": "image/png"
        },
        {
          "src": "/icon-48x48.png",
          "sizes": "48x48",
          "type": "image/png"
        },
        {
          "src": "/icon-72x72.png",
          "sizes": "72x72",
          "type": "image/png"
        },
        {
          "src": "/icon-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        },
        {
          "src": "/icon-144x144.png",
          "sizes": "144x144",
          "type": "image/png"
        },
        {
          "src": "/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "maskable any"
        },
        {
          "src": "/icon-256x256.png",
          "sizes": "256x256",
          "type": "image/png"
        },
        {
          "src": "/icon-384x384.png",
          "sizes": "384x384",
          "type": "image/png"
        },
        {
          "src": "/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable any"
        }
      ];
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('✅ manifest.json actualizado con nuevos iconos');
    } catch (error) {
      console.error('❌ Error actualizando manifest.json:', error.message);
    }
  }
}

// Función principal
function main() {
  console.log('🚀 Iniciando generación de recursos PWA...\n');
  
  checkDependencies();
  createBaseLogo();
  generateIcons();
  generateScreenshots();
  updateManifest();
  
  const success = verifyGeneratedFiles();
  
  if (success) {
    console.log('\n🎉 ¡Generación de recursos PWA completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. ✅ Revisa los iconos generados en ./public/');
    console.log('2. 🔄 Convierte las capturas SVG a PNG usando herramientas online');
    console.log('3. 🧪 Prueba la PWA con: npm run build && npx lighthouse --view');
    console.log('4. 📱 Verifica la instalación en dispositivos móviles');
    console.log('5. 🌐 Prueba en diferentes navegadores');
    console.log('\n💡 Para convertir SVG a PNG:');
    console.log('   - Usa herramientas online como convertio.co o cloudconvert.com');
    console.log('   - O instala Inkscape: inkscape --export-png=screenshot-desktop.png screenshot-desktop.svg');
  } else {
    console.log('\n⚠️  Algunos archivos no se generaron correctamente');
    console.log('💡 Revisa los errores y ejecuta el script nuevamente');
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = {
  pwaConfig,
  generateIcons,
  generateScreenshots,
  updateManifest,
  verifyGeneratedFiles
};
