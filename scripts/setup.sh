#!/bin/bash

# ============================================================================
# SCRIPT DE CONFIGURACIÓN INICIAL - JEONSEVAULT
# ============================================================================
# Este script configura todo el entorno de desarrollo para JeonseVault
# 
# @author JeonseVault Team
# @version 2.0.0
# ============================================================================

set -e  # Exit on any error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Verificar requisitos del sistema
check_requirements() {
    print_header "Verificando requisitos del sistema"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versión 18+ es requerida. Versión actual: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) - OK"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    print_success "npm $(npm -v) - OK"
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_warning "Git no está instalado. Algunas funcionalidades pueden no funcionar"
    else
        print_success "Git $(git --version) - OK"
    fi
    
    # Verificar Docker (opcional)
    if command -v docker &> /dev/null; then
        print_success "Docker $(docker --version) - OK"
    else
        print_warning "Docker no está instalado. El despliegue local puede requerir Docker"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_header "Instalando dependencias"
    
    print_status "Instalando dependencias de Node.js..."
    npm install
    
    print_status "Instalando dependencias de desarrollo..."
    npm install --save-dev
    
    print_success "Dependencias instaladas correctamente"
}

# Configurar variables de entorno
setup_environment() {
    print_header "Configurando variables de entorno"
    
    if [ ! -f .env.local ]; then
        print_status "Creando archivo .env.local..."
        cp env.example .env.local
        print_success "Archivo .env.local creado"
    else
        print_warning "El archivo .env.local ya existe"
    fi
    
    print_status "Configurando variables de entorno básicas..."
    
    # Generar secretos aleatorios
    JWT_SECRET=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)
    CSRF_SECRET=$(openssl rand -hex 32)
    
    # Actualizar .env.local con secretos generados
    sed -i.bak "s/your-super-secret-jwt-key-here/$JWT_SECRET/g" .env.local
    sed -i.bak "s/your-super-secret-session-key-here/$SESSION_SECRET/g" .env.local
    sed -i.bak "s/your-csrf-secret-key-here/$CSRF_SECRET/g" .env.local
    
    print_success "Variables de entorno configuradas"
    print_warning "IMPORTANTE: Revisa y configura las variables de entorno en .env.local"
}

# Compilar contratos
compile_contracts() {
    print_header "Compilando smart contracts"
    
    print_status "Compilando contratos con Hardhat..."
    npx hardhat compile
    
    print_success "Contratos compilados correctamente"
}

# Configurar base de datos
setup_database() {
    print_header "Configurando base de datos"
    
    # Verificar si Prisma está configurado
    if [ -f "prisma/schema.prisma" ]; then
        print_status "Generando cliente de Prisma..."
        npx prisma generate
        
        print_status "Ejecutando migraciones..."
        npx prisma migrate dev --name init
        
        print_status "Sembrando datos iniciales..."
        npx prisma db seed
        
        print_success "Base de datos configurada correctamente"
    else
        print_warning "Prisma no está configurado. Saltando configuración de base de datos"
    fi
}

# Configurar PWA
setup_pwa() {
    print_header "Configurando PWA"
    
    print_status "Generando assets de PWA..."
    npm run pwa:generate
    
    print_success "PWA configurada correctamente"
}

# Configurar testing
setup_testing() {
    print_header "Configurando testing"
    
    print_status "Ejecutando tests unitarios..."
    npm run test:unit
    
    print_status "Ejecutando auditoría de seguridad..."
    npm run security:audit:quick
    
    print_success "Testing configurado correctamente"
}

# Configurar Git hooks
setup_git_hooks() {
    print_header "Configurando Git hooks"
    
    if [ -d ".git" ]; then
        print_status "Configurando pre-commit hooks..."
        
        # Crear directorio hooks si no existe
        mkdir -p .git/hooks
        
        # Crear pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Linting
npm run lint

# Type checking
npm run type-check

# Tests
npm run test:unit

echo "Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configurados"
    else
        print_warning "No es un repositorio Git. Saltando configuración de hooks"
    fi
}

# Configurar IDE
setup_ide() {
    print_header "Configurando IDE"
    
    # Crear archivo de configuración de VS Code
    if [ ! -d ".vscode" ]; then
        mkdir .vscode
    fi
    
    # Configuración de VS Code
    cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
EOF
    
    # Extensiones recomendadas
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
EOF
    
    print_success "Configuración de IDE completada"
}

# Verificar configuración
verify_setup() {
    print_header "Verificando configuración"
    
    print_status "Verificando compilación..."
    npm run build
    
    print_status "Verificando tipos..."
    npm run type-check
    
    print_status "Verificando linting..."
    npm run lint
    
    print_status "Verificando tests..."
    npm run test:unit
    
    print_success "Configuración verificada correctamente"
}

# Mostrar información final
show_final_info() {
    print_header "Configuración Completada"
    
    echo -e "${GREEN}¡JeonseVault ha sido configurado exitosamente!${NC}"
    echo ""
    echo -e "${CYAN}Próximos pasos:${NC}"
    echo "1. Revisa y configura las variables de entorno en .env.local"
    echo "2. Configura tu Project ID de Reown en .env.local"
    echo "3. Configura tu Project ID de WalletConnect en .env.local"
    echo "4. Despliega los smart contracts: npm run deploy:contracts:testnet"
    echo "5. Inicia el servidor de desarrollo: npm run dev"
    echo ""
    echo -e "${CYAN}Comandos útiles:${NC}"
    echo "• npm run dev          - Iniciar servidor de desarrollo"
    echo "• npm run build        - Construir para producción"
    echo "• npm run test         - Ejecutar tests"
    echo "• npm run security:audit - Auditoría de seguridad"
    echo "• npm run deploy:contracts:testnet - Desplegar contratos"
    echo ""
    echo -e "${YELLOW}IMPORTANTE:${NC}"
    echo "• Configura todas las variables de entorno antes de usar la aplicación"
    echo "• Despliega los smart contracts antes de probar funcionalidades Web3"
    echo "• Revisa la documentación en README.md para más información"
}

# Función principal
main() {
    print_header "Configuración Inicial de JeonseVault"
    
    echo -e "${CYAN}Este script configurará todo el entorno de desarrollo para JeonseVault${NC}"
    echo ""
    
    # Verificar argumentos
    if [[ "$1" == "--help" || "$1" == "-h" ]]; then
        echo "Uso: $0 [opciones]"
        echo ""
        echo "Opciones:"
        echo "  --help, -h     Mostrar esta ayuda"
        echo "  --skip-deps    Saltar instalación de dependencias"
        echo "  --skip-db      Saltar configuración de base de datos"
        echo "  --skip-pwa     Saltar configuración de PWA"
        echo "  --skip-tests   Saltar configuración de testing"
        echo ""
        exit 0
    fi
    
    # Verificar requisitos
    check_requirements
    
    # Instalar dependencias (a menos que se especifique --skip-deps)
    if [[ "$*" != *"--skip-deps"* ]]; then
        install_dependencies
    else
        print_warning "Saltando instalación de dependencias"
    fi
    
    # Configurar variables de entorno
    setup_environment
    
    # Compilar contratos
    compile_contracts
    
    # Configurar base de datos (a menos que se especifique --skip-db)
    if [[ "$*" != *"--skip-db"* ]]; then
        setup_database
    else
        print_warning "Saltando configuración de base de datos"
    fi
    
    # Configurar PWA (a menos que se especifique --skip-pwa)
    if [[ "$*" != *"--skip-pwa"* ]]; then
        setup_pwa
    else
        print_warning "Saltando configuración de PWA"
    fi
    
    # Configurar testing (a menos que se especifique --skip-tests)
    if [[ "$*" != *"--skip-tests"* ]]; then
        setup_testing
    else
        print_warning "Saltando configuración de testing"
    fi
    
    # Configurar Git hooks
    setup_git_hooks
    
    # Configurar IDE
    setup_ide
    
    # Verificar configuración
    verify_setup
    
    # Mostrar información final
    show_final_info
}

# Ejecutar función principal
main "$@"
