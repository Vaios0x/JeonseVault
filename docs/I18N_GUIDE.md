# 🌍 Guía de Internacionalización (i18n) - JeonseVault

Esta guía documenta el sistema de internacionalización completo implementado en JeonseVault, que soporta coreano (ko) e inglés (en) con arquitectura escalable para futuros idiomas.

## 📁 Estructura del Sistema

```
i18n/
├── config.ts          # Configuración principal de next-intl
├── locales.ts         # Utilidades y configuración de idiomas
├── ko.json           # Traducciones en coreano
└── en.json           # Traducciones en inglés
```

## 🚀 Configuración Principal

### `i18n/config.ts`
Configuración central del sistema de internacionalización:

```typescript
export const locales = ['ko', 'en'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'ko'
export const localePrefix = 'always'
```

### Características Principales:
- **Detección automática de idioma** del navegador
- **Prefijos de URL obligatorios** (`/ko/`, `/en/`)
- **Configuración de formatos** por idioma (fechas, monedas, números)
- **Validación de idiomas** soportados
- **Metadatos SEO** específicos por idioma

## 🌐 Configuración de Idiomas

### Coreano (ko)
- **Código**: `ko`
- **Nombre**: 한국어
- **Bandera**: 🇰🇷
- **Formato de fecha**: `ko-KR`
- **Moneda**: KRW
- **Zona horaria**: Asia/Seoul

### Inglés (en)
- **Código**: `en`
- **Nombre**: English
- **Bandera**: 🇺🇸
- **Formato de fecha**: `en-US`
- **Moneda**: USD
- **Zona horaria**: UTC

## 📝 Archivos de Traducción

### Estructura de Traducciones
Las traducciones están organizadas en namespaces lógicos:

```json
{
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다"
  },
  "navigation": {
    "home": "홈",
    "dashboard": "대시보드"
  },
  "home": {
    "hero": {
      "title": "한국 전세 시장을 혁신하는",
      "subtitle": "블록체인 에스크로 플랫폼"
    }
  }
}
```

### Namespaces Principales:
- **`common`**: Elementos comunes (botones, estados, etc.)
- **`navigation`**: Navegación y menús
- **`home`**: Página principal
- **`dashboard`**: Panel de control
- **`deposit`**: Funcionalidades de depósito
- **`investment`**: Funcionalidades de inversión
- **`wallet`**: Integración de wallet
- **`errors`**: Mensajes de error
- **`notifications`**: Notificaciones del sistema
- **`footer`**: Pie de página

## 🛠️ Componentes y Hooks

### LanguageSelector
Componente para cambiar idioma con soporte para:
- Dropdown con banderas
- Botones de idioma
- Navegación automática
- Accesibilidad completa

```tsx
import { LanguageSelector } from '@/components/ui/LanguageSelector'

<LanguageSelector 
  variant="dropdown" 
  size="md" 
/>
```

### Hooks Personalizados

#### `useTranslations(namespace?)`
Hook principal con utilidades de formateo:

```tsx
const { t, locale, formatDate, formatCurrency } = useTranslations('home')
```

#### `useFormTranslations(formName)`
Hook especializado para formularios:

```tsx
const { getFieldLabel, getFieldError, getSubmitText } = useFormTranslations('deposit')
```

#### `useErrorTranslations()`
Hook para manejo de errores:

```tsx
const { getErrorMessage, getNetworkError } = useErrorTranslations()
```

### Componentes de Formateo

#### `FormattedValue`
Componente genérico para valores formateados:

```tsx
<FormattedValue 
  value={1000000} 
  type="currency" 
  currency="KRW" 
/>
```

#### `FormattedDate`
Componente específico para fechas:

```tsx
<FormattedDate 
  date={new Date()} 
  format="long" 
/>
```

#### `FormattedCurrency`
Componente para monedas:

```tsx
<FormattedCurrency 
  amount={500000} 
  currency="KRW" 
/>
```

## 🔧 Configuración de Next.js

### `next.config.js`
Configuración del plugin de next-intl:

```javascript
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/config.ts');

module.exports = withNextIntl(nextConfig);
```

### `middleware.ts`
Middleware para manejo de rutas internacionalizadas:

```typescript
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'always'
})
```

## 📱 Estructura de Rutas

### Rutas Internacionalizadas
```
/ko/                    # Página principal (coreano)
/ko/dashboard          # Dashboard (coreano)
/ko/deposit/create     # Crear depósito (coreano)
/en/                   # Página principal (inglés)
/en/dashboard          # Dashboard (inglés)
/en/deposit/create     # Crear depósito (inglés)
```

### Layouts
- **`app/layout.tsx`**: Layout raíz con configuración de idioma
- **`app/[locale]/layout.tsx`**: Layout específico por idioma

## 🎯 Uso en Componentes

### Ejemplo Básico
```tsx
'use client'

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('home')
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  )
}
```

### Ejemplo con Formateo
```tsx
'use client'

import { useTranslations } from '@/hooks/useTranslations'
import { FormattedCurrency } from '@/components/ui/FormattedValue'

export function DepositCard({ amount }: { amount: number }) {
  const { t, formatCurrency } = useTranslations('deposit')
  
  return (
    <div>
      <h3>{t('title')}</h3>
      <p>{formatCurrency(amount, 'KRW')}</p>
    </div>
  )
}
```

### Ejemplo con Parámetros
```tsx
const t = useTranslations('dashboard')
const welcomeMessage = t('welcome', { name: 'John' })
// Resultado: "안녕하세요, John님" (ko) / "Hello, John" (en)
```

## 🔄 Navegación entre Idiomas

### Cambio de Idioma
```tsx
import { useRouter } from 'next/navigation'
import { getPathnameWithoutLocale } from '@/i18n/config'

const router = useRouter()
const pathname = usePathname()

const changeLanguage = (newLocale: string) => {
  const pathWithoutLocale = getPathnameWithoutLocale(pathname)
  const newPath = `/${newLocale}${pathWithoutLocale}`
  router.push(newPath)
}
```

### Enlaces Internacionalizados
```tsx
import { Link } from '@/i18n/locales'

<Link href="/dashboard">Dashboard</Link>
```

## 📊 SEO y Metadatos

### Metadatos por Idioma
```typescript
export const metadataConfig = {
  ko: {
    title: 'JeonseVault - 혁신적인 전세 보증금 스마트 컨트랙트 플랫폼',
    description: '한국의 전세 시스템을 위한 블록체인 기반 에스크로 플랫폼...',
    openGraph: {
      locale: 'ko_KR'
    }
  },
  en: {
    title: 'JeonseVault - Revolutionary Smart Contract Escrow Platform',
    description: 'Blockchain-based escrow platform for Korea\'s Jeonse housing system...',
    openGraph: {
      locale: 'en_US'
    }
  }
}
```

### Enlaces Alternativos
```tsx
import { generateAlternateLinks } from '@/i18n/locales'

const alternateLinks = generateAlternateLinks(pathname, locale, baseUrl)
```

## 🧪 Testing

### Testing de Traducciones
```typescript
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/i18n/ko.json'

const renderWithTranslations = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider messages={messages} locale="ko">
      {component}
    </NextIntlClientProvider>
  )
}
```

### Validación de Claves
```typescript
import { validateTranslationKey } from '@/i18n/locales'

const isValid = validateTranslationKey('home.hero.title')
```

## 🚀 Agregar Nuevos Idiomas

### 1. Actualizar Configuración
```typescript
// i18n/config.ts
export const locales = ['ko', 'en', 'ja'] as const

export const localeConfig = {
  // ... existing configs
  ja: {
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr' as const,
    dateFormat: 'ja-JP',
    currency: 'JPY',
    numberFormat: 'ja-JP'
  }
}
```

### 2. Crear Archivo de Traducción
```json
// i18n/ja.json
{
  "common": {
    "loading": "読み込み中...",
    "error": "エラーが発生しました"
  }
}
```

### 3. Actualizar Middleware
```typescript
// middleware.ts
export default createMiddleware({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko'
})
```

## 🔍 Debugging

### Debug de Idioma
```typescript
import { debugLocale } from '@/i18n/locales'

debugLocale('ko')
// Console: [i18n] Current locale: ko
```

### Verificación de Claves
```typescript
import { validateTranslationKey } from '@/i18n/locales'

const isValid = validateTranslationKey('home.hero.title')
console.log('Key valid:', isValid)
```

## 📈 Rendimiento

### Optimizaciones Implementadas:
- **Carga lazy** de traducciones
- **Caché** de traducciones frecuentes
- **Bundle splitting** por idioma
- **Preload** de idioma detectado

### Monitoreo:
- **Métricas** de uso de idiomas
- **Tiempo de carga** de traducciones
- **Errores** de traducción faltante

## 🔒 Seguridad

### Sanitización de Traducciones
```typescript
import { sanitizeTranslationValue } from '@/i18n/locales'

const safeValue = sanitizeTranslationValue(userInput)
```

### Validación de Contenido
- **Prevención de XSS** en traducciones
- **Validación de formato** de claves
- **Escape de caracteres** especiales

## 📚 Recursos Adicionales

### Documentación:
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)

### Herramientas:
- **i18n Ally**: Extensión VS Code para traducciones
- **Lingui**: Framework alternativo de internacionalización
- **React Intl**: Biblioteca base de next-intl

---

## 🎯 Próximos Pasos

1. **Implementar más idiomas** (japonés, chino)
2. **Agregar RTL support** para idiomas como árabe
3. **Implementar traducciones dinámicas** desde API
4. **Agregar herramientas de gestión** de traducciones
5. **Implementar A/B testing** por idioma

---

**¡El sistema de internacionalización está completamente implementado y listo para producción! 🌍**
