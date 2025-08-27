#!/usr/bin/env node

/**
 * Script para optimizar imágenes automáticamente
 * Convierte imágenes a formatos modernos (WebP, AVIF) y optimiza tamaños
 * 
 * @author JeonseVault Team
 * @version 2.0.0
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// Configuración de optimización
const OPTIMIZATION_CONFIG = {
  // Formatos de salida
  formats: {
    webp: {
      quality: 80,
      effort: 6,
      nearLossless: true
    },
    avif: {
      quality: 75,
      effort: 9,
      chromaSubsampling: '4:2:0'
    },
    jpeg: {
      quality: 85,
      progressive: true,
      mozjpeg: true
    },
    png: {
      compressionLevel: 9,
      adaptiveFiltering: true
    }
  },
  
  // Tamaños responsive
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 200 },
    medium: { width: 600, height: 400 },
    large: { width: 1200, height: 800 },
    hero: { width: 1920, height: 1080 }
  },
  
  // Directorios
  inputDir: './public/images',
  outputDir: './public/images/optimized',
  
  // Extensiones soportadas
  supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
  
  // Configuración de cache
  cacheDir: './.image-cache',
  cacheExpiry: 24 * 60 * 60 * 1000 // 24 horas
};

// Clase para optimización de imágenes
class ImageOptimizer {
  constructor(config = OPTIMIZATION_CONFIG) {
    this.config = config;
    this.stats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      totalSizeBefore: 0,
      totalSizeAfter: 0,
      timeSpent: 0
    };
  }

  // Crear directorios necesarios
  async createDirectories() {
    const dirs = [
      this.config.outputDir,
      this.config.cacheDir,
      path.join(this.config.outputDir, 'webp'),
      path.join(this.config.outputDir, 'avif'),
      path.join(this.config.outputDir, 'responsive')
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ Directorio creado: ${dir}`);
      } catch (error) {
        console.log(`⚠️  Directorio ya existe: ${dir}`);
      }
    }
  }

  // Verificar si la imagen necesita optimización
  async needsOptimization(inputPath, outputPath) {
    try {
      const inputStats = await fs.stat(inputPath);
      const outputStats = await fs.stat(outputPath);
      
      // Si el archivo de salida es más nuevo, no necesita optimización
      if (outputStats.mtime > inputStats.mtime) {
        return false;
      }
      
      return true;
    } catch {
      // Si no existe el archivo de salida, necesita optimización
      return true;
    }
  }

  // Generar hash del archivo para cache
  async generateFileHash(filePath) {
    const crypto = require('crypto');
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // Verificar cache
  async checkCache(filePath, format) {
    const hash = await this.generateFileHash(filePath);
    const cachePath = path.join(this.config.cacheDir, `${hash}-${format}.json`);
    
    try {
      const cacheData = JSON.parse(await fs.readFile(cachePath, 'utf8'));
      
      // Verificar si el cache no ha expirado
      if (Date.now() - cacheData.timestamp < this.config.cacheExpiry) {
        return cacheData.outputPath;
      }
    } catch {
      // Cache no existe o está corrupto
    }
    
    return null;
  }

  // Guardar en cache
  async saveToCache(filePath, format, outputPath) {
    const hash = await this.generateFileHash(filePath);
    const cachePath = path.join(this.config.cacheDir, `${hash}-${format}.json`);
    
    const cacheData = {
      inputPath: filePath,
      outputPath: outputPath,
      format: format,
      timestamp: Date.now()
    };
    
    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2));
  }

  // Optimizar imagen a formato específico
  async optimizeToFormat(inputPath, format, options = {}) {
    const startTime = Date.now();
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const outputDir = path.join(this.config.outputDir, format);
    const outputPath = path.join(outputDir, `${fileName}.${format}`);
    
    // Verificar cache
    const cachedPath = await this.checkCache(inputPath, format);
    if (cachedPath) {
      console.log(`📋 Cache hit: ${fileName}.${format}`);
      return cachedPath;
    }
    
    // Verificar si necesita optimización
    if (!(await this.needsOptimization(inputPath, outputPath))) {
      console.log(`⏭️  Saltando: ${fileName}.${format} (ya optimizado)`);
      this.stats.skipped++;
      return outputPath;
    }
    
    try {
      let pipeline = sharp(inputPath);
      
      // Aplicar configuración específica del formato
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp(this.config.formats.webp);
          break;
        case 'avif':
          pipeline = pipeline.avif(this.config.formats.avif);
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg(this.config.formats.jpeg);
          break;
        case 'png':
          pipeline = pipeline.png(this.config.formats.png);
          break;
      }
      
      // Aplicar opciones adicionales
      if (options.width || options.height) {
        pipeline = pipeline.resize(options.width, options.height, {
          fit: 'cover',
          position: 'center'
        });
      }
      
      // Guardar imagen optimizada
      await pipeline.toFile(outputPath);
      
      // Calcular estadísticas
      const inputStats = await fs.stat(inputPath);
      const outputStats = await fs.stat(outputPath);
      const compressionRatio = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
      
      this.stats.totalSizeBefore += inputStats.size;
      this.stats.totalSizeAfter += outputStats.size;
      this.stats.processed++;
      this.stats.timeSpent += Date.now() - startTime;
      
      // Guardar en cache
      await this.saveToCache(inputPath, format, outputPath);
      
      console.log(`✅ Optimizado: ${fileName}.${format} (${compressionRatio}% reducción)`);
      return outputPath;
      
    } catch (error) {
      console.error(`❌ Error optimizando ${fileName}.${format}:`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  // Generar versiones responsive
  async generateResponsiveVersions(inputPath) {
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const responsiveDir = path.join(this.config.outputDir, 'responsive');
    const results = [];
    
    for (const [sizeName, dimensions] of Object.entries(this.config.sizes)) {
      for (const format of ['webp', 'avif']) {
        const outputPath = path.join(responsiveDir, `${fileName}-${sizeName}.${format}`);
        
        try {
          await this.optimizeToFormat(inputPath, format, dimensions);
          results.push({ size: sizeName, format, path: outputPath });
        } catch (error) {
          console.error(`❌ Error generando ${sizeName}.${format}:`, error.message);
        }
      }
    }
    
    return results;
  }

  // Optimizar imagen individual
  async optimizeImage(inputPath) {
    console.log(`🔄 Procesando: ${path.basename(inputPath)}`);
    
    const results = [];
    
    // Optimizar a formatos modernos
    for (const format of ['webp', 'avif']) {
      const result = await this.optimizeToFormat(inputPath, format);
      if (result) results.push({ format, path: result });
    }
    
    // Generar versiones responsive
    const responsiveResults = await this.generateResponsiveVersions(inputPath);
    results.push(...responsiveResults);
    
    return results;
  }

  // Procesar todas las imágenes
  async processAllImages() {
    console.log('🚀 Iniciando optimización de imágenes...\n');
    
    const startTime = Date.now();
    
    // Crear directorios
    await this.createDirectories();
    
    // Encontrar todas las imágenes
    const pattern = path.join(this.config.inputDir, '**/*');
    const files = await glob(pattern);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return this.config.supportedFormats.includes(ext);
    });
    
    console.log(`📁 Encontradas ${imageFiles.length} imágenes para optimizar\n`);
    
    if (imageFiles.length === 0) {
      console.log('⚠️  No se encontraron imágenes para optimizar');
      return;
    }
    
    // Procesar imágenes
    for (const file of imageFiles) {
      await this.optimizeImage(file);
    }
    
    // Mostrar estadísticas finales
    this.printStats(startTime);
  }

  // Mostrar estadísticas
  printStats(startTime) {
    const totalTime = Date.now() - startTime;
    const totalSizeReduction = this.stats.totalSizeBefore - this.stats.totalSizeAfter;
    const reductionPercentage = ((totalSizeReduction / this.stats.totalSizeBefore) * 100).toFixed(1);
    
    console.log('\n📊 Estadísticas de optimización:');
    console.log(`   • Imágenes procesadas: ${this.stats.processed}`);
    console.log(`   • Imágenes saltadas: ${this.stats.skipped}`);
    console.log(`   • Errores: ${this.stats.errors}`);
    console.log(`   • Tamaño total antes: ${(this.stats.totalSizeBefore / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   • Tamaño total después: ${(this.stats.totalSizeAfter / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   • Reducción total: ${(totalSizeReduction / 1024 / 1024).toFixed(2)} MB (${reductionPercentage}%)`);
    console.log(`   • Tiempo total: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   • Tiempo promedio por imagen: ${(this.stats.timeSpent / this.stats.processed / 1000).toFixed(2)}s`);
  }

  // Limpiar cache
  async clearCache() {
    try {
      await fs.rm(this.config.cacheDir, { recursive: true, force: true });
      console.log('🗑️  Cache limpiado');
    } catch (error) {
      console.log('⚠️  No se pudo limpiar el cache:', error.message);
    }
  }
}

// Función principal
async function main() {
  const optimizer = new ImageOptimizer();
  
  // Procesar argumentos de línea de comandos
  const args = process.argv.slice(2);
  
  if (args.includes('--clear-cache')) {
    await optimizer.clearCache();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🖼️  Optimizador de Imágenes - JeonseVault

Uso: node scripts/optimize-images.js [opciones]

Opciones:
  --clear-cache    Limpiar cache de optimización
  --help, -h       Mostrar esta ayuda

Ejemplos:
  node scripts/optimize-images.js
  node scripts/optimize-images.js --clear-cache
    `);
    return;
  }
  
  // Procesar todas las imágenes
  await optimizer.processAllImages();
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ImageOptimizer, OPTIMIZATION_CONFIG };
