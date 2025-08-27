# 🧪 JeonseVault Frontend Tests

Suite completa de tests frontend para JeonseVault, implementada con Vitest, React Testing Library y mocks avanzados para Web3.

## 📋 Estructura de Tests

```
__tests__/
├── setup.ts                           # Configuración global de tests
├── components/                        # Tests de componentes UI
│   ├── Button.test.tsx               # Tests del componente Button
│   ├── Header.test.tsx               # Tests del componente Header
│   └── SimpleHowItWorks.test.tsx     # Tests del componente SimpleHowItWorks
├── hooks/                            # Tests de hooks personalizados
│   ├── useJeonseVault.test.ts        # Tests del hook useJeonseVault
│   └── useInvestmentPool.test.ts     # Tests del hook useInvestmentPool
├── pages/                            # Tests de páginas completas
│   ├── CreateDeposit.test.tsx        # Tests de creación de depósitos
│   ├── Dashboard.test.tsx            # Tests del dashboard
│   └── InvestmentPool.test.tsx       # Tests de pools de inversión
└── README.md                         # Este archivo
```

## 🚀 Comandos de Testing

### Tests Básicos
```bash
# Ejecutar todos los tests frontend
npm run test:frontend

# Ejecutar tests en modo watch
npm run test:frontend:watch

# Ejecutar tests con coverage
npm run test:frontend:coverage

# Ejecutar tests con UI interactiva
npm run test:frontend:ui
```

### Tests Específicos
```bash
# Tests de componentes
npm run test:frontend:components

# Tests de hooks
npm run test:frontend:hooks

# Tests de páginas
npm run test:frontend:pages

# Tests de utilidades
npm run test:frontend:utils

# Tests de servicios
npm run test:frontend:services
```

### Tests Avanzados
```bash
# Tests de performance
npm run test:frontend:performance

# Tests de seguridad
npm run test:frontend:security

# Tests de accesibilidad
npm run test:frontend:accessibility

# Tests de integración
npm run test:frontend:integration

# Tests E2E
npm run test:frontend:e2e
```

### Suite Completa
```bash
# Ejecutar suite completa con reportes
npm run test:frontend:complete

# Ejecutar todos los tests (contratos + frontend)
npm run test:all
```

## 🛠️ Configuración

### Setup Global (`setup.ts`)

El archivo `setup.ts` configura:

- **Mocks de Web3**: Wagmi, Viem, Ethereum provider
- **Mocks de React**: Next.js, Framer Motion, React Hot Toast
- **Mocks de Hooks**: Todos los hooks personalizados
- **Mocks de Servicios**: Analytics, Compliance, Property Oracle
- **Configuración de DOM**: JSDOM, IntersectionObserver, ResizeObserver
- **Configuración de Testing**: Jest DOM matchers, console mocks

### Configuración de Vitest (`vitest.config.ts`)

- **Environment**: JSDOM para simular navegador
- **Coverage**: V8 provider con thresholds del 80%
- **Reporters**: Verbose, HTML, JSON, LCOV
- **Aliases**: Configuración de paths (@/ -> ./)
- **Timeouts**: 10 segundos para tests y hooks

## 📊 Cobertura de Tests

### Componentes Testeados

#### Button Component
- ✅ Renderizado básico
- ✅ Variantes (primary, secondary, outline, ghost, danger)
- ✅ Tamaños (sm, md, lg, xl)
- ✅ Estados de carga
- ✅ Estados deshabilitados
- ✅ Iconos y contenido
- ✅ Eventos de clic
- ✅ Accesibilidad (ARIA, navegación por teclado)
- ✅ Responsive design

#### Header Component
- ✅ Renderizado del logo y navegación
- ✅ Estado de wallet (conectado/desconectado)
- ✅ Menú móvil y responsive
- ✅ Dropdown de wallet
- ✅ Cambio de red
- ✅ Estados de carga
- ✅ Navegación activa
- ✅ Accesibilidad completa

#### SimpleHowItWorks Component
- ✅ Renderizado de pasos del proceso
- ✅ Interactividad y animaciones
- ✅ Tooltips y detalles expandidos
- ✅ Botones de acción (CTA)
- ✅ Responsive design
- ✅ Navegación por teclado
- ✅ Estados de carga y error

### Hooks Testeados

#### useJeonseVault Hook
- ✅ Estado inicial y carga de datos
- ✅ Creación de depósitos
- ✅ Liberación de depósitos
- ✅ Disputas de depósitos
- ✅ Habilitación de inversión
- ✅ Gestión de transacciones
- ✅ Manejo de errores
- ✅ Estados de carga
- ✅ Validaciones de datos

#### useInvestmentPool Hook
- ✅ Carga de pools de inversión
- ✅ Inversión en pools
- ✅ Retiro de pools
- ✅ Cálculos de retornos
- ✅ Filtros y búsqueda
- ✅ Validaciones de montos
- ✅ Gestión de transacciones
- ✅ Estados de error
- ✅ Performance y cache

### Páginas Testeadas

#### CreateDeposit Page
- ✅ Formulario de creación de depósito
- ✅ Validaciones de campos
- ✅ Verificación de propiedad
- ✅ Compliance checks
- ✅ Cálculo de retornos estimados
- ✅ Estados de envío
- ✅ Manejo de errores
- ✅ Navegación y redirecciones

#### Dashboard Page
- ✅ Renderizado de estadísticas
- ✅ Lista de depósitos del usuario
- ✅ Filtros y búsqueda
- ✅ Acciones rápidas
- ✅ Estados de carga
- ✅ Actualización de datos
- ✅ Responsive design

#### InvestmentPool Page
- ✅ Lista de pools de inversión
- ✅ Calculadora de retornos
- ✅ Estadísticas de inversión
- ✅ Acciones de inversión/retiro
- ✅ Estados de wallet
- ✅ Estados de contratos
- ✅ Responsive design
- ✅ Accesibilidad

## 🔧 Mocks y Stubs

### Web3 Mocks
```typescript
// Mock de wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: '0x1234...',
    isConnected: true,
  })),
  useBalance: vi.fn(() => ({
    data: { value: BigInt('1000000000000000000') },
  })),
  // ... más mocks
}))
```

### Component Mocks
```typescript
// Mock de componentes externos
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}))
```

### Service Mocks
```typescript
// Mock de servicios
vi.mock('@/services/AnalyticsService', () => ({
  analyticsService: {
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
  },
}))
```

## 📈 Métricas de Calidad

### Coverage Targets
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Performance Targets
- **Test Execution**: < 30 segundos para suite completa
- **Memory Usage**: < 512MB
- **Concurrency**: 4 workers máximo

### Security Targets
- **Input Validation**: 100% de campos validados
- **Error Handling**: 100% de errores manejados
- **Accessibility**: WCAG 2.1 AA compliance

## 🧪 Tipos de Tests

### Unit Tests
- Tests de componentes individuales
- Tests de hooks personalizados
- Tests de utilidades y helpers
- Tests de formateo de datos

### Integration Tests
- Tests de flujos completos
- Tests de interacción entre componentes
- Tests de integración con Web3
- Tests de navegación

### E2E Tests
- Tests de flujos de usuario completos
- Tests de creación de depósitos
- Tests de inversión en pools
- Tests de wallet connection

### Accessibility Tests
- Tests de navegación por teclado
- Tests de screen readers
- Tests de contraste de colores
- Tests de ARIA labels

### Performance Tests
- Tests de renderizado
- Tests de memoria
- Tests de re-renders
- Tests de lazy loading

## 🐛 Debugging

### Logs de Tests
```bash
# Ver logs detallados
npm run test:frontend:verbose

# Ver logs en formato JSON
npm run test:frontend:json

# Ver logs en formato HTML
npm run test:frontend:html
```

### Debugging Interactivo
```bash
# Abrir UI interactiva
npm run test:frontend:ui

# Ejecutar tests específicos
npm run test:frontend -- --run Button.test.tsx
```

### Coverage Reports
```bash
# Generar reporte de coverage
npm run test:frontend:coverage

# Ver reporte HTML
open coverage/index.html
```

## 📝 Convenciones

### Naming
- **Archivos de test**: `ComponentName.test.tsx`
- **Describe blocks**: `ComponentName` o `useHookName`
- **Test cases**: Descripción en español, específica y clara

### Estructura
```typescript
describe('ComponentName', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar correctamente', () => {
      // test
    })
  })

  describe('Interactividad', () => {
    it('debe manejar clics', () => {
      // test
    })
  })

  describe('Estados', () => {
    it('debe mostrar loading', () => {
      // test
    })
  })
})
```

### Mocks
```typescript
// Setup de mocks
beforeEach(() => {
  vi.clearAllMocks()
  mockUseWeb3.mockReturnValue(defaultWeb3State)
})

// Cleanup
afterEach(() => {
  vi.restoreAllMocks()
})
```

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Frontend Tests
  run: npm run test:frontend:complete

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/coverage.json
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:frontend:run"
    }
  }
}
```

## 📚 Recursos

### Documentación
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Web3 Testing Best Practices](https://docs.ethers.io/v5/testing/)

### Herramientas
- **Vitest**: Framework de testing
- **React Testing Library**: Testing de componentes React
- **Jest DOM**: Matchers adicionales para DOM
- **MSW**: Mock Service Worker para APIs
- **Testing Playground**: Debugging de queries

### Comunidad
- [Testing Library Discord](https://discord.gg/testing-library)
- [Vitest Discord](https://discord.gg/vitest)
- [Web3 Testing Community](https://discord.gg/ethereum)

---

**¡JeonseVault Frontend Tests - Cobertura completa y calidad garantizada! 🚀**
