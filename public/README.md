# 📱 Recursos PWA - JeonseVault

Esta carpeta contiene todos los recursos necesarios para que JeonseVault funcione como una Progressive Web App (PWA) completa.

## 📁 Estructura de Archivos

```
public/
├── manifest.json              # Manifesto PWA principal
├── sw.js                      # Service Worker
├── robots.txt                 # Configuración SEO
├── sitemap.xml               # Sitemap para SEO
├── .htaccess                 # Configuración Apache
├── web.config                # Configuración IIS
├── favicon.ico               # Favicon del sitio
├── apple-touch-icon.png      # Icono para iOS (180x180)
├── icon-72x72.png           # Icono Android mdpi
├── icon-96x96.png           # Icono Android mdpi
├── icon-144x144.png         # Icono Android hdpi
├── icon-192x192.png         # Icono PWA principal
├── icon-512x512.png         # Icono PWA alta resolución
├── screenshot-desktop.png    # Captura desktop (1280x720)
└── screenshot-mobile.png     # Captura móvil (390x844)
```

## 🎨 Especificaciones de Iconos

### Colores Corporativos
- **Primario**: `#1e40af` (Azul)
- **Secundario**: `#ffffff` (Blanco)
- **Terciario**: `#f3f4f6` (Gris claro)

### Tamaños de Iconos
- **favicon.ico**: 16x16, 32x32, 48x48 píxeles
- **apple-touch-icon.png**: 180x180 píxeles
- **icon-72x72.png**: 72x72 píxeles (Android mdpi)
- **icon-96x96.png**: 96x96 píxeles (Android mdpi)
- **icon-144x144.png**: 144x144 píxeles (Android hdpi)
- **icon-192x192.png**: 192x192 píxeles (PWA estándar)
- **icon-512x512.png**: 512x512 píxeles (PWA alta densidad)

### Capturas de Pantalla
- **screenshot-desktop.png**: 1280x720 píxeles
- **screenshot-mobile.png**: 390x844 píxeles (iPhone 12/13/14)

## 🔧 Configuración PWA

### Service Worker (sw.js)
- **Cache Strategy**: Cache First con fallback a red
- **Versión**: v1.0.0
- **Funcionalidades**:
  - Cache de recursos estáticos
  - Notificaciones push
  - Manejo offline
  - Actualización automática

### Manifest (manifest.json)
- **Nombre**: JeonseVault
- **Descripción**: Plataforma blockchain para depósitos Jeonse
- **Tema**: #1e40af
- **Fondo**: #ffffff
- **Display**: standalone
- **Orientación**: portrait

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 67+
- ✅ Firefox 67+
- ✅ Safari 11.1+
- ✅ Edge 79+

### Sistemas Operativos
- ✅ Android 5.0+
- ✅ iOS 11.3+
- ✅ Windows 10
- ✅ macOS 10.13+
- ✅ Linux

## 🚀 Instalación PWA

### Para Usuarios
1. Abrir JeonseVault en navegador compatible
2. Aparecerá banner de instalación
3. Hacer clic en "Instalar" o "Añadir a pantalla de inicio"
4. La app se instalará como aplicación nativa

### Para Desarrolladores
```bash
# Verificar PWA
npm run build
npx lighthouse --view

# Generar iconos (requiere herramientas adicionales)
npm install -g pwa-asset-generator
pwa-asset-generator logo.png ./public -i ./public/manifest.json
```

## 🔍 SEO y Metadatos

### Robots.txt
- Permite indexación completa
- Bloquea áreas administrativas
- Incluye sitemap

### Sitemap.xml
- URLs principales indexadas
- Frecuencia de actualización configurada
- Prioridades SEO definidas

## 🛡️ Seguridad

### Headers HTTP
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

### Protección de Archivos
- Archivos .env bloqueados
- Archivos .log bloqueados
- Redirección HTTPS forzada

## 📊 Rendimiento

### Optimizaciones
- Compresión GZIP habilitada
- Cache de navegador configurado
- MIME types optimizados
- Compresión de imágenes

### Métricas Objetivo
- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1

## 🔄 Actualización de Recursos

### Proceso de Actualización
1. Generar nuevos iconos con herramientas de diseño
2. Optimizar imágenes para web
3. Actualizar manifest.json si es necesario
4. Incrementar versión del Service Worker
5. Probar en múltiples dispositivos

### Herramientas Recomendadas
- **Generación de iconos**: PWA Asset Generator
- **Optimización de imágenes**: TinyPNG, ImageOptim
- **Testing PWA**: Lighthouse, Chrome DevTools
- **Validación**: PWA Builder, Web App Manifest Validator

## 📝 Notas de Desarrollo

### Consideraciones Técnicas
- Todos los iconos deben tener transparencia
- Las capturas deben mostrar la funcionalidad principal
- El Service Worker debe manejar errores gracefully
- Los metadatos deben ser precisos y actualizados

### Mejores Prácticas
- Mantener consistencia visual en todos los iconos
- Optimizar archivos para tamaño mínimo
- Probar en dispositivos reales
- Documentar cambios en versiones

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Iconos no aparecen**: Verificar rutas en manifest.json
2. **PWA no instala**: Verificar HTTPS y Service Worker
3. **Cache no actualiza**: Incrementar versión del SW
4. **SEO no funciona**: Verificar robots.txt y sitemap.xml

### Debugging
```bash
# Verificar Service Worker
chrome://serviceworker-internals/

# Verificar Manifest
chrome://app-manifest/

# Lighthouse audit
npx lighthouse https://jeonsevault.com --view
```
