#!/usr/bin/env node

/**
 * Script para convertir automáticamente archivos SVG a PNG
 * Requiere: npm install sharp
 * 
 * @author JeonseVault Team
 * @version 1.0.0
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

console.log('🔄 Convirtiendo archivos SVG a PNG...\n');

// Configuración de conversión
const conversionConfig = {
  inputDir: './public',
  outputDir: './public',
  files: [
    {
      input: 'screenshot-desktop.svg',
      output: 'screenshot-desktop.png',
      width: 1280,
      height: 720
    },
    {
      input: 'screenshot-mobile.svg',
      output: 'screenshot-mobile.png',
      width: 390,
      height: 844
    }
  ]
};

// Función para convertir SVG a PNG
async function convertSvgToPng(inputPath, outputPath, width, height) {
  try {
    console.log(`🔄 Convirtiendo ${inputPath} a ${outputPath}...`);
    
    await sharp(inputPath)
      .resize(width, height)
      .png({ quality: 95 })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`✅ ${outputPath} generado (${sizeKB} KB)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${inputPath}:`, error.message);
    return false;
  }
}

// Función principal
async function main() {
  let successCount = 0;
  const totalFiles = conversionConfig.files.length;
  
  for (const file of conversionConfig.files) {
    const inputPath = path.join(conversionConfig.inputDir, file.input);
    const outputPath = path.join(conversionConfig.outputDir, file.output);
    
    if (fs.existsSync(inputPath)) {
      const success = await convertSvgToPng(
        inputPath,
        outputPath,
        file.width,
        file.height
      );
      
      if (success) {
        successCount++;
      }
    } else {
      console.log(`⚠️  Archivo no encontrado: ${inputPath}`);
    }
  }
  
  console.log(`\n📊 Resumen: ${successCount}/${totalFiles} archivos convertidos`);
  
  if (successCount === totalFiles) {
    console.log('🎉 ¡Conversión completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. ✅ Verifica las capturas PNG generadas');
    console.log('2. 🧪 Prueba la PWA con: npm run build');
    console.log('3. 📱 Verifica la instalación en dispositivos móviles');
  } else {
    console.log('⚠️  Algunos archivos no se convirtieron correctamente');
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  convertSvgToPng,
  conversionConfig
};
