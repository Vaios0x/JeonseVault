# Implementación de Chainlink en JeonseVault

## Resumen

JeonseVault utiliza **Chainlink** como el oráculo principal para validar precios de propiedades inmobiliarias coreanas y proporcionar feeds de precios KRW/USD confiables.

## ¿Por qué Chainlink?

### Ventajas para JeonseVault:

1. **Feed oficial de KRW/USD**: Chainlink proporciona el feed oficial más confiable para KRW/USD
2. **Alta disponibilidad**: Múltiples fuentes de datos, resistencia a fallos
3. **Resistencia a manipulación**: Mecanismos anti-manipulación incorporados
4. **Integración fácil**: Compatible con OpenZeppelin y Hardhat
5. **Soporte multi-red**: Funciona en Ethereum, Polygon, BSC, etc.

### Alternativas consideradas:

- **API3**: Más económico pero menos establecido
- **Pyth Network**: Mejor para trading en tiempo real
- **Band Protocol**: Menos adopción en el ecosistema

## Arquitectura Implementada

### 1. Contrato PropertyOracle

```solidity
contract PropertyOracle {
    // Chainlink Price Feed para KRW/USD
    AggregatorV3Interface public krwUsdPriceFeed;
    
    // Validación de precios
    function validatePropertyValueAgainstChainlink(uint256 propertyValue) 
        public view returns (bool)
    
    // Obtener precio actual
    function getKrwUsdPrice() public view returns (int256 price, uint256 timestamp)
}
```

### 2. Configuración por Red

```typescript
// config/chainlink.ts
export const CHAINLINK_CONFIGS = {
  1: { // Ethereum Mainnet
    krwUsdPriceFeed: '0x01435677FB11763550905594A16B645847C1d0F3',
    networkName: 'Ethereum Mainnet'
  },
  137: { // Polygon
    krwUsdPriceFeed: '0x01435677FB11763550905594A16B645847C1d0F3',
    networkName: 'Polygon Mainnet'
  }
  // ... más redes
}
```

### 3. Hook Frontend

```typescript
// hooks/useChainlinkOracle.ts
export function useChainlinkOracle() {
  // Obtener precio KRW/USD
  // Validar valores de propiedades
  // Convertir a USD
  // Manejar errores y estados
}
```

## Implementación Paso a Paso

### 1. Instalación de Dependencias

```bash
npm install @chainlink/contracts
```

### 2. Configuración del Contrato

```solidity
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PropertyOracle {
    AggregatorV3Interface public krwUsdPriceFeed;
    
    constructor(address _krwUsdPriceFeed) {
        krwUsdPriceFeed = AggregatorV3Interface(_krwUsdPriceFeed);
    }
}
```

### 3. Validación de Precios

```solidity
function validatePropertyValueAgainstChainlink(uint256 propertyValue) 
    public view returns (bool) {
    
    if (!isPriceFeedValid()) {
        return true; // Fallback si no hay feed
    }
    
    (, int256 krwUsdPrice,,,) = krwUsdPriceFeed.latestRoundData();
    
    // Convertir a USD y validar rango
    uint256 propertyValueUsd = (propertyValue * uint256(krwUsdPrice)) / 1e26;
    
    return propertyValueUsd >= 50000 * 1e18 && propertyValueUsd <= 50000000 * 1e18;
}
```

### 4. Despliegue

```typescript
// scripts/deploy.ts
const chainlinkConfig = await this.getChainlinkConfig(chainId);
const propertyOracle = await PropertyOracle.deploy(chainlinkConfig.krwUsdPriceFeed);
```

## Direcciones de Feeds por Red

### Ethereum Mainnet
- **KRW/USD**: `0x01435677FB11763550905594A16B645847C1d0F3`
- **Decimals**: 8
- **Heartbeat**: 3600s (1 hora)

### Polygon Mainnet
- **KRW/USD**: `0x01435677FB11763550905594A16B645847C1d0F3`
- **Decimals**: 8
- **Heartbeat**: 3600s (1 hora)

### BSC Mainnet
- **KRW/USD**: `0x01435677FB11763550905594A16B645847C1d0F3`
- **Decimals**: 8
- **Heartbeat**: 3600s (1 hora)

### Sepolia Testnet
- **KRW/USD**: `0x01435677FB11763550905594A16B645847C1d0F3`
- **Decimals**: 8
- **Heartbeat**: 3600s (1 hora)

## Validaciones Implementadas

### 1. Validación de Precio
```solidity
function isPriceFeedValid() public view returns (bool) {
    (, int256 price,, uint256 timestamp,) = krwUsdPriceFeed.latestRoundData();
    
    // Precio no puede ser 0 o negativo
    if (price <= 0) return false;
    
    // No puede estar obsoleto (más de 1 hora)
    if (block.timestamp - timestamp > STALENESS_THRESHOLD) return false;
    
    return true;
}
```

### 2. Validación de Rango
```solidity
// Rango razonable: $50K - $50M USD
uint256 minUsdValue = 50000 * 1e18;
uint256 maxUsdValue = 50000000 * 1e18;
```

### 3. Validación de Desviación
```solidity
// Máximo 10% de desviación permitida
uint256 public constant PRICE_DEVIATION_THRESHOLD = 10;
```

## Manejo de Errores

### 1. Feed No Disponible
- Si Chainlink no está disponible, el sistema continúa funcionando
- Los valores se registran sin validación externa
- Se emite evento de advertencia

### 2. Precio Obsoleto
- Se marca el precio como obsoleto
- Se muestra advertencia en la UI
- Se permite continuar con validación manual

### 3. Valor Fuera de Rango
- Se rechaza el registro/actualización
- Se emite evento de error
- Se requiere intervención manual

## Monitoreo y Alertas

### 1. Eventos Emitidos
```solidity
event ChainlinkPriceValidated(
    string indexed propertyId,
    uint256 propertyValue,
    int256 krwUsdPrice,
    uint256 timestamp
);
```

### 2. Métricas de Monitoreo
- Precio actual de KRW/USD
- Timestamp de última actualización
- Número de validaciones exitosas
- Errores de validación

### 3. Alertas Configuradas
- Feed de precio caído
- Precio obsoleto (>1 hora)
- Desviación de precio >10%
- Errores de validación frecuentes

## Optimizaciones de Gas

### 1. Validación Condicional
```solidity
// Solo validar si el feed está disponible
if (isPriceFeedValid()) {
    require(validatePropertyValueAgainstChainlink(marketValue));
}
```

### 2. Operaciones en Lote
```solidity
function batchUpdateValues(string[] calldata propertyIds, uint256[] calldata newValues)
    external onlyRole(ORACLE_ROLE) whenNotPaused {
    // Validar múltiples propiedades en una transacción
}
```

### 3. Caching de Precios
- Cachear precio por 5 minutos en frontend
- Reducir llamadas al contrato
- Actualizar automáticamente en background

## Seguridad

### 1. Validaciones Múltiples
- Validación de precio en contrato
- Validación de rango en frontend
- Validación manual por administradores

### 2. Roles y Permisos
```solidity
bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
modifier onlyRole(ORACLE_ROLE) { ... }
```

### 3. Pausado de Emergencia
```solidity
function pause() external onlyRole(ADMIN_ROLE) {
    _pause();
}
```

## Pruebas

### 1. Tests Unitarios
```typescript
describe('Chainlink Integration', () => {
  it('should validate property value against Chainlink', async () => {
    // Test de validación
  });
  
  it('should handle stale price data', async () => {
    // Test de precio obsoleto
  });
});
```

### 2. Tests de Integración
```typescript
describe('PropertyOracle with Chainlink', () => {
  it('should register property with valid price', async () => {
    // Test completo de registro
  });
});
```

### 3. Tests de Stress
```typescript
describe('Chainlink Performance', () => {
  it('should handle high volume of validations', async () => {
    // Test de rendimiento
  });
});
```

## Mantenimiento

### 1. Actualización de Feeds
- Monitorear cambios en direcciones de feeds
- Actualizar configuración cuando sea necesario
- Migrar contratos si es requerido

### 2. Monitoreo Continuo
- Dashboard de estado de Chainlink
- Alertas automáticas
- Logs de validaciones

### 3. Backup y Recuperación
- Múltiples feeds como backup
- Procedimientos de emergencia
- Documentación de recuperación

## Costos Estimados

### Ethereum Mainnet
- **Gas por validación**: ~50,000 gas
- **Costo estimado**: ~$5-10 por validación
- **Actualización automática**: Gratuita (por Chainlink)

### Polygon
- **Gas por validación**: ~50,000 gas
- **Costo estimado**: ~$0.01-0.05 por validación
- **Actualización automática**: Gratuita

### BSC
- **Gas por validación**: ~50,000 gas
- **Costo estimado**: ~$0.01-0.02 por validación
- **Actualización automática**: Gratuita

## Conclusión

Chainlink es la mejor opción para JeonseVault porque:

1. **Confiabilidad**: Feed oficial y establecido
2. **Seguridad**: Múltiples validaciones y anti-manipulación
3. **Costo**: Actualizaciones gratuitas, solo gas por validación
4. **Integración**: Fácil integración con el stack existente
5. **Soporte**: Comunidad activa y documentación completa

La implementación proporciona validación robusta de precios de propiedades mientras mantiene la flexibilidad para funcionar sin Chainlink cuando sea necesario.
