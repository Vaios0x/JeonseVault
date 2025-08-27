#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Función para detectar caracteres coreanos
function containsKoreanText(text: string): boolean {
  const koreanRegex = /[가-힣]/;
  return koreanRegex.test(text);
}

// Función para buscar texto coreano en un objeto
function findKoreanInObject(obj: any, path: string = ''): string[] {
  const results: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'string') {
      if (containsKoreanText(value)) {
        results.push(`${currentPath}: "${value}"`);
      }
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && containsKoreanText(item)) {
            results.push(`${currentPath}[${index}]: "${item}"`);
          }
        });
      } else {
        results.push(...findKoreanInObject(value, currentPath));
      }
    }
  }
  
  return results;
}

// Validar archivo en.json
function validateEnglishTranslations() {
  console.log('🔍 Validando traducciones en inglés...\n');
  
  try {
    const enPath = path.join(process.cwd(), 'i18n', 'en.json');
    const enContent = fs.readFileSync(enPath, 'utf8');
    const enData = JSON.parse(enContent);
    
    const koreanTexts = findKoreanInObject(enData);
    
    if (koreanTexts.length > 0) {
      console.log('❌ Se encontró texto coreano en el archivo en.json:');
      koreanTexts.forEach(text => {
        console.log(`   - ${text}`);
      });
      process.exit(1);
    } else {
      console.log('✅ No se encontró texto coreano en el archivo en.json');
    }
    
    // Validar que el JSON sea válido
    console.log('✅ El archivo en.json tiene formato JSON válido');
    
    // Contar el número de claves
    const keyCount = Object.keys(enData).length;
    console.log(`📊 El archivo en.json contiene ${keyCount} secciones principales`);
    
  } catch (error) {
    console.error('❌ Error al validar el archivo en.json:', error);
    process.exit(1);
  }
}

// Validar archivo ko.json
function validateKoreanTranslations() {
  console.log('\n🔍 Validando traducciones en coreano...\n');
  
  try {
    const koPath = path.join(process.cwd(), 'i18n', 'ko.json');
    const koContent = fs.readFileSync(koPath, 'utf8');
    const koData = JSON.parse(koContent);
    
    // Validar que el JSON sea válido
    console.log('✅ El archivo ko.json tiene formato JSON válido');
    
    // Contar el número de claves
    const keyCount = Object.keys(koData).length;
    console.log(`📊 El archivo ko.json contiene ${keyCount} secciones principales`);
    
  } catch (error) {
    console.error('❌ Error al validar el archivo ko.json:', error);
    process.exit(1);
  }
}

// Ejecutar validaciones
validateEnglishTranslations();
validateKoreanTranslations();

console.log('\n🎉 Validación completada exitosamente!');
