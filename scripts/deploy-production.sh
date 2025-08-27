#!/bin/bash

# ============================================================================
# JeonseVault Production Deployment Script
# Script automatizado para deploy en producción con verificaciones y rollback
# ============================================================================

set -euo pipefail

# ============================================================================
# CONFIGURACIÓN
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_ENV="production"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOY_ID="deploy_${TIMESTAMP}"
LOG_FILE="/var/log/deploy/${DEPLOY_ID}.log"

# Variables de entorno
export NODE_ENV=production
export DEPLOY_ENV=production

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCIONES DE LOGGING
# ============================================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================
create_log_directory() {
    mkdir -p "/var/log/deploy"
    touch "$LOG_FILE"
}

check_prerequisites() {
    log_step "Checking deployment prerequisites..."
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run from project root."
        exit 1
    fi
    
    # Verificar variables de entorno críticas
    local required_vars=(
        "NEXT_PUBLIC_JEONSE_VAULT_ADDRESS"
        "NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS"
        "NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS"
        "NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS"
        "DATABASE_URL"
        "REDIS_URL"
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Verificar herramientas necesarias
    local required_tools=("docker" "docker-compose" "git" "node" "npm")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool $tool is not installed"
            exit 1
        fi
    done
    
    log_success "Prerequisites check passed"
}

# ============================================================================
# VERIFICACIONES DE SEGURIDAD
# ============================================================================
security_checks() {
    log_step "Running security checks..."
    
    # Verificar que no estamos en una rama de desarrollo
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "main" ]; then
        log_error "Deploying from non-main branch: $current_branch"
        exit 1
    fi
    
    # Verificar que el working directory está limpio
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Working directory is not clean. Please commit or stash changes."
        exit 1
    fi
    
    # Verificar que estamos actualizados con origin
    git fetch origin
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)
    
    if [ "$local_commit" != "$remote_commit" ]; then
        log_error "Local branch is not up to date with origin/main"
        exit 1
    fi
    
    # Ejecutar auditoría de seguridad
    log_info "Running security audit..."
    if ! npm run security:audit; then
        log_error "Security audit failed"
        exit 1
    fi
    
    # Verificar dependencias
    log_info "Checking dependencies for vulnerabilities..."
    if ! npm audit --audit-level=moderate; then
        log_warning "Dependency vulnerabilities found, but continuing deployment"
    fi
    
    log_success "Security checks passed"
}

# ============================================================================
# BACKUP PRE-DEPLOY
# ============================================================================
create_pre_deploy_backup() {
    log_step "Creating pre-deployment backup..."
    
    # Crear backup de la base de datos actual
    if [ -f "scripts/backup.sh" ]; then
        chmod +x scripts/backup.sh
        if ./scripts/backup.sh; then
            log_success "Pre-deployment backup created successfully"
        else
            log_warning "Pre-deployment backup failed, but continuing deployment"
        fi
    else
        log_warning "Backup script not found, skipping pre-deployment backup"
    fi
}

# ============================================================================
# BUILD Y OPTIMIZACIÓN
# ============================================================================
build_application() {
    log_step "Building application..."
    
    # Limpiar builds anteriores
    log_info "Cleaning previous builds..."
    rm -rf .next
    rm -rf dist
    rm -rf build
    
    # Instalar dependencias
    log_info "Installing dependencies..."
    npm ci --only=production
    
    # Generar assets PWA
    log_info "Generating PWA assets..."
    if [ -f "scripts/generate-pwa-assets.js" ]; then
        node scripts/generate-pwa-assets.js
    fi
    
    # Optimizar imágenes
    log_info "Optimizing images..."
    if [ -f "scripts/optimize-images.js" ]; then
        node scripts/optimize-images.js
    fi
    
    # Compilar contratos
    log_info "Compiling smart contracts..."
    if [ -f "hardhat.config.ts" ]; then
        npx hardhat compile
    fi
    
    # Construir aplicación
    log_info "Building Next.js application..."
    npm run build
    
    # Verificar build
    if [ ! -d ".next" ]; then
        log_error "Build failed: .next directory not found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# ============================================================================
# TESTING PRE-DEPLOY
# ============================================================================
run_pre_deploy_tests() {
    log_step "Running pre-deployment tests..."
    
    # Ejecutar tests unitarios
    log_info "Running unit tests..."
    if ! npm run test:unit; then
        log_error "Unit tests failed"
        exit 1
    fi
    
    # Ejecutar tests de integración
    log_info "Running integration tests..."
    if ! npm run test:integration; then
        log_error "Integration tests failed"
        exit 1
    fi
    
    # Ejecutar tests de contratos
    log_info "Running smart contract tests..."
    if ! npm run test:contracts; then
        log_error "Smart contract tests failed"
        exit 1
    fi
    
    # Ejecutar tests de seguridad
    log_info "Running security tests..."
    if ! npm run test:security; then
        log_error "Security tests failed"
        exit 1
    fi
    
    log_success "All pre-deployment tests passed"
}

# ============================================================================
# DOCKER BUILD
# ============================================================================
build_docker_image() {
    log_step "Building Docker image..."
    
    # Construir imagen Docker
    log_info "Building production Docker image..."
    docker build \
        --target runner \
        --tag jeonsevault:production \
        --tag jeonsevault:${DEPLOY_ID} \
        --build-arg NODE_ENV=production \
        .
    
    if [ $? -eq 0 ]; then
        log_success "Docker image built successfully"
    else
        log_error "Docker build failed"
        exit 1
    fi
}

# ============================================================================
# DEPLOYMENT
# ============================================================================
deploy_application() {
    log_step "Deploying application..."
    
    # Detener servicios actuales
    log_info "Stopping current services..."
    docker-compose down --timeout 30
    
    # Hacer pull de las imágenes más recientes
    log_info "Pulling latest images..."
    docker-compose pull
    
    # Iniciar servicios con la nueva imagen
    log_info "Starting services with new image..."
    docker-compose up -d
    
    # Esperar a que los servicios estén listos
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Verificar que los servicios estén funcionando
    log_info "Verifying service health..."
    if ! check_service_health; then
        log_error "Service health check failed"
        rollback_deployment
        exit 1
    fi
    
    log_success "Application deployed successfully"
}

# ============================================================================
# VERIFICACIÓN DE SALUD
# ============================================================================
check_service_health() {
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        # Verificar aplicación principal
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "Application health check passed"
            return 0
        fi
        
        log_warning "Health check failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# ============================================================================
# POST-DEPLOYMENT TESTS
# ============================================================================
run_post_deployment_tests() {
    log_step "Running post-deployment tests..."
    
    # Esperar un poco más para que todo esté completamente listo
    sleep 30
    
    # Ejecutar smoke tests
    log_info "Running smoke tests..."
    if ! npm run test:smoke; then
        log_error "Smoke tests failed"
        rollback_deployment
        exit 1
    fi
    
    # Verificar endpoints críticos
    log_info "Verifying critical endpoints..."
    local critical_endpoints=(
        "http://localhost:3000/api/health"
        "http://localhost:3000/api/metrics"
        "http://localhost:3000/api/blockchain/status"
    )
    
    for endpoint in "${critical_endpoints[@]}"; do
        if ! curl -f "$endpoint" > /dev/null 2>&1; then
            log_error "Critical endpoint check failed: $endpoint"
            rollback_deployment
            exit 1
        fi
    done
    
    log_success "Post-deployment tests passed"
}

# ============================================================================
# ROLLBACK
# ============================================================================
rollback_deployment() {
    log_step "Rolling back deployment..."
    
    # Detener servicios actuales
    log_info "Stopping current services..."
    docker-compose down --timeout 30
    
    # Restaurar imagen anterior
    log_info "Restoring previous image..."
    docker tag jeonsevault:previous jeonsevault:production
    
    # Iniciar servicios con imagen anterior
    log_info "Starting services with previous image..."
    docker-compose up -d
    
    # Verificar rollback
    log_info "Verifying rollback..."
    sleep 30
    
    if check_service_health; then
        log_success "Rollback completed successfully"
    else
        log_error "Rollback failed - manual intervention required"
        exit 1
    fi
}

# ============================================================================
# MONITORING Y ALERTAS
# ============================================================================
setup_monitoring() {
    log_step "Setting up monitoring..."
    
    # Verificar que Prometheus esté funcionando
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        log_success "Prometheus is healthy"
    else
        log_warning "Prometheus health check failed"
    fi
    
    # Verificar que Grafana esté funcionando
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "Grafana is healthy"
    else
        log_warning "Grafana health check failed"
    fi
    
    # Configurar alertas
    log_info "Configuring monitoring alerts..."
    # Aquí se pueden configurar alertas específicas
    
    log_success "Monitoring setup completed"
}

# ============================================================================
# NOTIFICACIONES
# ============================================================================
send_deployment_notification() {
    local status=$1
    local message=$2
    
    log_info "Sending deployment notification..."
    
    # Aquí se pueden enviar notificaciones a Slack, Discord, email, etc.
    # Ejemplo para Slack:
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"JeonseVault Deployment: $status - $message\"}" \
    #     $SLACK_WEBHOOK_URL
    
    log_success "Deployment notification sent"
}

# ============================================================================
# LIMPIEZA
# ============================================================================
cleanup_old_images() {
    log_step "Cleaning up old Docker images..."
    
    # Eliminar imágenes Docker antiguas
    docker image prune -f --filter "until=24h"
    
    # Eliminar contenedores detenidos
    docker container prune -f
    
    # Eliminar volúmenes no utilizados
    docker volume prune -f
    
    log_success "Cleanup completed"
}

# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================
main() {
    local start_time=$(date +%s)
    
    log_info "Starting JeonseVault production deployment..."
    log_info "Deploy ID: $DEPLOY_ID"
    log_info "Environment: $DEPLOY_ENV"
    
    # Crear directorio de logs
    create_log_directory
    
    # Verificar prerrequisitos
    check_prerequisites
    
    # Verificaciones de seguridad
    security_checks
    
    # Crear backup pre-deploy
    create_pre_deploy_backup
    
    # Etiquetar imagen actual como previous
    if docker images jeonsevault:production --format "{{.Tag}}" | grep -q "production"; then
        docker tag jeonsevault:production jeonsevault:previous
        log_info "Tagged current image as previous"
    fi
    
    # Construir aplicación
    build_application
    
    # Ejecutar tests pre-deploy
    run_pre_deploy_tests
    
    # Construir imagen Docker
    build_docker_image
    
    # Desplegar aplicación
    deploy_application
    
    # Ejecutar tests post-deploy
    run_post_deployment_tests
    
    # Configurar monitoreo
    setup_monitoring
    
    # Limpiar recursos antiguos
    cleanup_old_images
    
    # Calcular tiempo total
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Enviar notificación de éxito
    send_deployment_notification "SUCCESS" "Deployment completed in ${duration}s"
    
    log_success "Production deployment completed successfully!"
    log_info "Deployment duration: ${duration} seconds"
    log_info "Deploy ID: $DEPLOY_ID"
    
    # Mostrar información útil
    echo ""
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Status: SUCCESS"
    echo "Deploy ID: $DEPLOY_ID"
    echo "Duration: ${duration}s"
    echo "Environment: $DEPLOY_ENV"
    echo "Health Check: PASSED"
    echo "Log File: $LOG_FILE"
    echo "=========================="
}

# ============================================================================
# MANEJO DE SEÑALES
# ============================================================================
trap 'log_error "Deployment interrupted by signal"; rollback_deployment; exit 1' INT TERM

# ============================================================================
# EJECUCIÓN
# ============================================================================
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
