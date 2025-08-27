#!/bin/bash

# ============================================================================
# JeonseVault Automated Backup Script
# Script completo para backup de base de datos, archivos y configuración
# ============================================================================

set -euo pipefail

# ============================================================================
# CONFIGURACIÓN
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="/backups"
LOG_DIR="/var/log/backup"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
COMPRESSION_LEVEL=9
DATE_FORMAT="%Y%m%d_%H%M%S"
TIMESTAMP=$(date +"$DATE_FORMAT")
BACKUP_NAME="jeonsevault_backup_$TIMESTAMP"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCIONES DE LOGGING
# ============================================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/backup.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/backup.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/backup.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/backup.log"
}

# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================
create_directories() {
    log_info "Creating backup directories..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/files"
    mkdir -p "$BACKUP_DIR/config"
    mkdir -p "$BACKUP_DIR/logs"
    mkdir -p "$BACKUP_DIR/contracts"
    
    log_success "Directories created successfully"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    local missing_deps=()
    
    # Verificar comandos necesarios
    for cmd in pg_dump gzip tar openssl; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

# ============================================================================
# BACKUP DE BASE DE DATOS
# ============================================================================
backup_database() {
    log_info "Starting database backup..."
    
    local db_backup_file="$BACKUP_DIR/database/${BACKUP_NAME}_database.sql"
    local db_backup_compressed="$db_backup_file.gz"
    
    # Variables de entorno para PostgreSQL
    export PGPASSWORD="$POSTGRES_PASSWORD"
    
    # Crear backup de PostgreSQL
    pg_dump \
        -h postgres \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --no-owner \
        --no-privileges \
        --format=plain \
        --file="$db_backup_file"
    
    if [ $? -eq 0 ]; then
        log_success "Database backup created: $db_backup_file"
        
        # Comprimir backup
        gzip -$COMPRESSION_LEVEL "$db_backup_file"
        log_success "Database backup compressed: $db_backup_compressed"
        
        # Verificar integridad
        if gzip -t "$db_backup_compressed"; then
            log_success "Database backup integrity verified"
        else
            log_error "Database backup integrity check failed"
            return 1
        fi
    else
        log_error "Database backup failed"
        return 1
    fi
}

# ============================================================================
# BACKUP DE ARCHIVOS
# ============================================================================
backup_files() {
    log_info "Starting files backup..."
    
    local files_backup="$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz"
    
    # Crear backup de archivos importantes
    tar -czf "$files_backup" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='.next' \
        --exclude='*.log' \
        --exclude='*.tmp' \
        --exclude='*.cache' \
        -C /app .
    
    if [ $? -eq 0 ]; then
        log_success "Files backup created: $files_backup"
        
        # Verificar integridad
        if tar -tzf "$files_backup" > /dev/null 2>&1; then
            log_success "Files backup integrity verified"
        else
            log_error "Files backup integrity check failed"
            return 1
        fi
    else
        log_error "Files backup failed"
        return 1
    fi
}

# ============================================================================
# BACKUP DE CONFIGURACIÓN
# ============================================================================
backup_config() {
    log_info "Starting configuration backup..."
    
    local config_backup="$BACKUP_DIR/config/${BACKUP_NAME}_config.tar.gz"
    
    # Crear backup de archivos de configuración
    tar -czf "$config_backup" \
        -C /app \
        .env.example \
        next.config.js \
        tailwind.config.js \
        hardhat.config.ts \
        docker-compose.yml \
        Dockerfile \
        nginx/ \
        monitoring/ \
        scripts/ \
        contracts/
    
    if [ $? -eq 0 ]; then
        log_success "Configuration backup created: $config_backup"
        
        # Verificar integridad
        if tar -tzf "$config_backup" > /dev/null 2>&1; then
            log_success "Configuration backup integrity verified"
        else
            log_error "Configuration backup integrity check failed"
            return 1
        fi
    else
        log_error "Configuration backup failed"
        return 1
    fi
}

# ============================================================================
# BACKUP DE LOGS
# ============================================================================
backup_logs() {
    log_info "Starting logs backup..."
    
    local logs_backup="$BACKUP_DIR/logs/${BACKUP_NAME}_logs.tar.gz"
    
    # Crear backup de logs
    if [ -d "/app/logs" ]; then
        tar -czf "$logs_backup" \
            -C /app logs/
        
        if [ $? -eq 0 ]; then
            log_success "Logs backup created: $logs_backup"
            
            # Verificar integridad
            if tar -tzf "$logs_backup" > /dev/null 2>&1; then
                log_success "Logs backup integrity verified"
            else
                log_error "Logs backup integrity check failed"
                return 1
            fi
        else
            log_error "Logs backup failed"
            return 1
        fi
    else
        log_warning "Logs directory not found, skipping logs backup"
    fi
}

# ============================================================================
# BACKUP DE CONTRATOS
# ============================================================================
backup_contracts() {
    log_info "Starting smart contracts backup..."
    
    local contracts_backup="$BACKUP_DIR/contracts/${BACKUP_NAME}_contracts.tar.gz"
    
    # Crear backup de contratos y artifacts
    tar -czf "$contracts_backup" \
        -C /app \
        contracts/ \
        artifacts/ \
        typechain-types/ \
        cache/
    
    if [ $? -eq 0 ]; then
        log_success "Contracts backup created: $contracts_backup"
        
        # Verificar integridad
        if tar -tzf "$contracts_backup" > /dev/null 2>&1; then
            log_success "Contracts backup integrity verified"
        else
            log_error "Contracts backup integrity check failed"
            return 1
        fi
    else
        log_error "Contracts backup failed"
        return 1
    fi
}

# ============================================================================
# BACKUP DE REDIS
# ============================================================================
backup_redis() {
    log_info "Starting Redis backup..."
    
    local redis_backup="$BACKUP_DIR/database/${BACKUP_NAME}_redis.rdb"
    
    # Crear backup de Redis
    if redis-cli -h redis -a "$REDIS_PASSWORD" BGSAVE; then
        log_success "Redis backup initiated"
        
        # Esperar a que termine el backup
        sleep 10
        
        # Copiar archivo RDB
        if docker cp jeonsevault-redis:/data/dump.rdb "$redis_backup"; then
            log_success "Redis backup created: $redis_backup"
        else
            log_error "Failed to copy Redis backup file"
            return 1
        fi
    else
        log_error "Redis backup failed"
        return 1
    fi
}

# ============================================================================
# CREAR ARCHIVO MANIFEST
# ============================================================================
create_manifest() {
    log_info "Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/${BACKUP_NAME}_manifest.json"
    
    cat > "$manifest_file" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -Iseconds)",
  "version": "1.0.0",
  "components": {
    "database": {
      "file": "${BACKUP_NAME}_database.sql.gz",
      "size": "$(du -h "$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz" | cut -f1)",
      "checksum": "$(sha256sum "$BACKUP_DIR/database/${BACKUP_NAME}_database.sql.gz" | cut -d' ' -f1)"
    },
    "files": {
      "file": "${BACKUP_NAME}_files.tar.gz",
      "size": "$(du -h "$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz" | cut -f1)",
      "checksum": "$(sha256sum "$BACKUP_DIR/files/${BACKUP_NAME}_files.tar.gz" | cut -d' ' -f1)"
    },
    "config": {
      "file": "${BACKUP_NAME}_config.tar.gz",
      "size": "$(du -h "$BACKUP_DIR/config/${BACKUP_NAME}_config.tar.gz" | cut -f1)",
      "checksum": "$(sha256sum "$BACKUP_DIR/config/${BACKUP_NAME}_config.tar.gz" | cut -d' ' -f1)"
    },
    "contracts": {
      "file": "${BACKUP_NAME}_contracts.tar.gz",
      "size": "$(du -h "$BACKUP_DIR/contracts/${BACKUP_NAME}_contracts.tar.gz" | cut -f1)",
      "checksum": "$(sha256sum "$BACKUP_DIR/contracts/${BACKUP_NAME}_contracts.tar.gz" | cut -d' ' -f1)"
    }
  },
  "environment": {
    "postgres_db": "$POSTGRES_DB",
    "postgres_user": "$POSTGRES_USER",
    "backup_retention_days": "$RETENTION_DAYS",
    "compression_level": "$COMPRESSION_LEVEL"
  },
  "system_info": {
    "hostname": "$(hostname)",
    "kernel": "$(uname -r)",
    "disk_usage": "$(df -h /backups | tail -1 | awk '{print $5}')"
  }
}
EOF
    
    log_success "Manifest created: $manifest_file"
}

# ============================================================================
# LIMPIEZA DE BACKUPS ANTIGUOS
# ============================================================================
cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Encontrar y eliminar backups antiguos
    find "$BACKUP_DIR" -name "jeonsevault_backup_*" -type f -mtime +$RETENTION_DAYS -delete
    deleted_count=$?
    
    if [ $deleted_count -eq 0 ]; then
        log_success "Old backups cleaned up successfully"
    else
        log_warning "Some old backups could not be deleted"
    fi
}

# ============================================================================
# VERIFICACIÓN DE ESPACIO EN DISCO
# ============================================================================
check_disk_space() {
    log_info "Checking available disk space..."
    
    local required_space=1024  # 1GB en MB
    local available_space=$(df -m /backups | tail -1 | awk '{print $4}')
    
    if [ "$available_space" -lt "$required_space" ]; then
        log_error "Insufficient disk space. Available: ${available_space}MB, Required: ${required_space}MB"
        return 1
    fi
    
    log_success "Sufficient disk space available: ${available_space}MB"
}

# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================
main() {
    log_info "Starting JeonseVault backup process..."
    
    # Verificar dependencias
    check_dependencies
    
    # Crear directorios
    create_directories
    
    # Verificar espacio en disco
    check_disk_space
    
    # Realizar backups
    local backup_failed=false
    
    if ! backup_database; then
        backup_failed=true
    fi
    
    if ! backup_files; then
        backup_failed=true
    fi
    
    if ! backup_config; then
        backup_failed=true
    fi
    
    if ! backup_logs; then
        backup_failed=true
    fi
    
    if ! backup_contracts; then
        backup_failed=true
    fi
    
    if ! backup_redis; then
        backup_failed=true
    fi
    
    # Crear manifest
    create_manifest
    
    # Limpiar backups antiguos
    cleanup_old_backups
    
    # Resumen final
    if [ "$backup_failed" = true ]; then
        log_error "Backup process completed with errors"
        exit 1
    else
        log_success "Backup process completed successfully"
        
        # Mostrar resumen
        echo ""
        echo "=== BACKUP SUMMARY ==="
        echo "Backup Name: $BACKUP_NAME"
        echo "Timestamp: $(date)"
        echo "Location: $BACKUP_DIR"
        echo "Components: Database, Files, Config, Logs, Contracts, Redis"
        echo "Retention: $RETENTION_DAYS days"
        echo "======================"
    fi
}

# ============================================================================
# MANEJO DE SEÑALES
# ============================================================================
trap 'log_error "Backup interrupted by signal"; exit 1' INT TERM

# ============================================================================
# EJECUCIÓN
# ============================================================================
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
