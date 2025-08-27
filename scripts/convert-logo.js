#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertLogo() {
  try {
    console.log('🔄 Convirtiendo logo SVG a PNG...');
    
    const inputPath = './assets/logo.svg';
    const outputPath = './assets/logo.png';
    
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Logo SVG no encontrado en:', inputPath);
      process.exit(1);
    }
    
    await sharp(inputPath)
      .resize(512, 512)
      .png({ quality: 95 })
      .toFile(outputPath);
    
    console.log('✅ Logo PNG generado en:', outputPath);
    console.log('🎉 Ahora puedes ejecutar: npm run pwa:generate');
    
  } catch (error) {
    console.error('❌ Error convirtiendo logo:', error.message);
    process.exit(1);
  }
}

convertLogo();
