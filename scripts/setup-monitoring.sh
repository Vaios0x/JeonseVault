#!/bin/bash

# ============================================================================
# Script de Configuración de Monitoreo - JeonseVault
# ============================================================================
# Este script configura el sistema completo de monitoreo incluyendo:
# - Prometheus para recolección de métricas
# - Grafana para visualización
# - AlertManager para alertas
# - ELK Stack para logging
# - Dashboards y reglas de alerta predefinidas
# ============================================================================

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar dependencias
check_dependencies() {
    log_info "Verificando dependencias..."
    
    local deps=("docker" "docker-compose" "curl" "jq")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Dependencias faltantes: ${missing_deps[*]}"
        log_info "Instale las dependencias faltantes antes de continuar"
        exit 1
    fi
    
    log_success "Todas las dependencias están instaladas"
}

# Función para crear directorios necesarios
create_directories() {
    log_info "Creando directorios de monitoreo..."
    
    local dirs=(
        "monitoring/prometheus/data"
        "monitoring/grafana/data"
        "monitoring/alertmanager/data"
        "monitoring/elasticsearch/data"
        "monitoring/logstash/data"
        "monitoring/kibana/data"
        "monitoring/backup"
        "logs"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_info "Creado directorio: $dir"
        fi
    done
    
    log_success "Directorios creados correctamente"
}

# Función para configurar permisos
setup_permissions() {
    log_info "Configurando permisos..."
    
    # Configurar permisos para Prometheus
    if [ -d "monitoring/prometheus/data" ]; then
        chmod 755 monitoring/prometheus/data
        chown -R 65534:65534 monitoring/prometheus/data 2>/dev/null || true
    fi
    
    # Configurar permisos para Grafana
    if [ -d "monitoring/grafana/data" ]; then
        chmod 755 monitoring/grafana/data
        chown -R 472:472 monitoring/grafana/data 2>/dev/null || true
    fi
    
    # Configurar permisos para logs
    if [ -d "logs" ]; then
        chmod 755 logs
    fi
    
    log_success "Permisos configurados correctamente"
}

# Función para generar contraseñas seguras
generate_passwords() {
    log_info "Generando contraseñas seguras..."
    
    # Generar contraseña para Grafana
    if [ ! -f "monitoring/.grafana_password" ]; then
        openssl rand -base64 32 > monitoring/.grafana_password
        log_info "Contraseña de Grafana generada"
    fi
    
    # Generar contraseña para Prometheus
    if [ ! -f "monitoring/.prometheus_password" ]; then
        openssl rand -base64 32 > monitoring/.prometheus_password
        log_info "Contraseña de Prometheus generada"
    fi
    
    # Generar token para AlertManager
    if [ ! -f "monitoring/.alertmanager_token" ]; then
        openssl rand -base64 32 > monitoring/.alertmanager_token
        log_info "Token de AlertManager generado"
    fi
    
    log_success "Contraseñas generadas correctamente"
}

# Función para configurar variables de entorno
setup_environment() {
    log_info "Configurando variables de entorno..."
    
    # Leer contraseñas generadas
    local grafana_password=$(cat monitoring/.grafana_password)
    local prometheus_password=$(cat monitoring/.prometheus_password)
    local alertmanager_token=$(cat monitoring/.alertmanager_token)
    
    # Crear archivo de variables de entorno para monitoreo
    cat > monitoring/.env << EOF
# ============================================================================
# VARIABLES DE ENTORNO PARA MONITOREO - JeonseVault
# ============================================================================

# Grafana
GRAFANA_PASSWORD=$grafana_password
GRAFANA_ADMIN_USER=admin

# Prometheus
PROMETHEUS_PASSWORD=$prometheus_password

# AlertManager
ALERTMANAGER_TOKEN=$alertmanager_token

# Elasticsearch
ELASTIC_PASSWORD=changeme
KIBANA_PASSWORD=changeme

# Logstash
LOGSTASH_PASSWORD=changeme

# Configuración general
MONITORING_DOMAIN=monitoring.jeonsevault.com
ALERT_EMAIL=alerts@jeonsevault.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Retención de datos
PROMETHEUS_RETENTION_DAYS=30
ELASTIC_RETENTION_DAYS=90
BACKUP_RETENTION_DAYS=30
EOF
    
    log_success "Variables de entorno configuradas"
}

# Función para configurar Prometheus
setup_prometheus() {
    log_info "Configurando Prometheus..."
    
    # Verificar que el archivo de configuración existe
    if [ ! -f "monitoring/prometheus.yml" ]; then
        log_error "Archivo monitoring/prometheus.yml no encontrado"
        exit 1
    fi
    
    # Crear archivo de configuración de reglas
    if [ ! -f "monitoring/rules/alerts.yml" ]; then
        log_error "Archivo monitoring/rules/alerts.yml no encontrado"
        exit 1
    fi
    
    log_success "Prometheus configurado correctamente"
}

# Función para configurar Grafana
setup_grafana() {
    log_info "Configurando Grafana..."
    
    # Crear directorio para dashboards
    mkdir -p monitoring/grafana/provisioning/dashboards
    mkdir -p monitoring/grafana/provisioning/datasources
    
    # Configurar datasource de Prometheus
    cat > monitoring/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
    
    # Configurar dashboards
    cat > monitoring/grafana/provisioning/dashboards/dashboards.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF
    
    # Copiar dashboards si existen
    if [ -d "monitoring/grafana/dashboards" ]; then
        cp -r monitoring/grafana/dashboards/* monitoring/grafana/provisioning/dashboards/ 2>/dev/null || true
    fi
    
    log_success "Grafana configurado correctamente"
}

# Función para configurar AlertManager
setup_alertmanager() {
    log_info "Configurando AlertManager..."
    
    # Crear configuración de AlertManager
    cat > monitoring/alertmanager.yml << EOF
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'slack-critical'
    continue: true
  - match:
      severity: warning
    receiver: 'slack-warning'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://127.0.0.1:5001/'

- name: 'slack-critical'
  slack_configs:
  - channel: '#alerts-critical'
    send_resolved: true
    title: '🚨 CRÍTICO: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}\n{{ end }}'

- name: 'slack-warning'
  slack_configs:
  - channel: '#alerts-warning'
    send_resolved: true
    title: '⚠️ ADVERTENCIA: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}\n{{ end }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF
    
    log_success "AlertManager configurado correctamente"
}

# Función para configurar ELK Stack
setup_elk() {
    log_info "Configurando ELK Stack..."
    
    # Crear configuración de Elasticsearch
    cat > monitoring/elasticsearch.yml << EOF
cluster.name: jeonsevault-cluster
node.name: jeonsevault-node-1
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: elastic-certificates.p12
EOF
    
    # Crear configuración de Logstash
    cat > monitoring/logstash.conf << EOF
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "jeonsevault" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "jeonsevault-logs-%{+YYYY.MM.dd}"
    user => "elastic"
    password => "changeme"
  }
}
EOF
    
    log_success "ELK Stack configurado correctamente"
}

# Función para iniciar servicios de monitoreo
start_monitoring() {
    log_info "Iniciando servicios de monitoreo..."
    
    # Verificar que docker-compose.yml existe
    if [ ! -f "docker-compose.yml" ]; then
        log_error "Archivo docker-compose.yml no encontrado"
        exit 1
    fi
    
    # Iniciar servicios de monitoreo
    docker-compose up -d prometheus grafana alertmanager elasticsearch kibana logstash
    
    log_success "Servicios de monitoreo iniciados"
}

# Función para verificar servicios
check_services() {
    log_info "Verificando servicios de monitoreo..."
    
    local services=(
        "prometheus:9090"
        "grafana:3000"
        "alertmanager:9093"
        "elasticsearch:9200"
        "kibana:5601"
    )
    
    local failed_services=()
    
    for service in "${services[@]}"; do
        local host=$(echo "$service" | cut -d: -f1)
        local port=$(echo "$service" | cut -d: -f2)
        
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            log_success "$host está funcionando en puerto $port"
        else
            log_warning "$host no responde en puerto $port"
            failed_services+=("$host")
        fi
    done
    
    if [ ${#failed_services[@]} -ne 0 ]; then
        log_warning "Servicios con problemas: ${failed_services[*]}"
        log_info "Verifique los logs con: docker-compose logs [servicio]"
    else
        log_success "Todos los servicios están funcionando correctamente"
    fi
}

# Función para configurar dashboards iniciales
setup_dashboards() {
    log_info "Configurando dashboards iniciales..."
    
    # Esperar a que Grafana esté listo
    log_info "Esperando a que Grafana esté listo..."
    local grafana_password=$(cat monitoring/.grafana_password)
    
    for i in {1..30}; do
        if curl -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    
    # Importar dashboards si existen
    if [ -f "monitoring/grafana/dashboards/jeonsevault-overview.json" ]; then
        log_info "Importando dashboard principal..."
        curl -X POST \
            -H "Content-Type: application/json" \
            -d @monitoring/grafana/dashboards/jeonsevault-overview.json \
            "http://admin:$grafana_password@localhost:3000/api/dashboards/db" \
            > /dev/null 2>&1 || log_warning "No se pudo importar el dashboard principal"
    fi
    
    log_success "Dashboards configurados"
}

# Función para configurar alertas
setup_alerts() {
    log_info "Configurando alertas..."
    
    # Esperar a que Prometheus esté listo
    log_info "Esperando a que Prometheus esté listo..."
    for i in {1..30}; do
        if curl -s "http://localhost:9090/-/ready" > /dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    
    # Recargar configuración de Prometheus
    curl -X POST "http://localhost:9090/-/reload" > /dev/null 2>&1 || log_warning "No se pudo recargar Prometheus"
    
    log_success "Alertas configuradas"
}

# Función para mostrar información de acceso
show_access_info() {
    log_info "Información de acceso a los servicios de monitoreo:"
    echo
    echo "🌐 Grafana (Dashboards):"
    echo "   URL: http://localhost:3000"
    echo "   Usuario: admin"
    echo "   Contraseña: $(cat monitoring/.grafana_password)"
    echo
    echo "📊 Prometheus (Métricas):"
    echo "   URL: http://localhost:9090"
    echo "   Usuario: admin"
    echo "   Contraseña: $(cat monitoring/.prometheus_password)"
    echo
    echo "🚨 AlertManager (Alertas):"
    echo "   URL: http://localhost:9093"
    echo "   Token: $(cat monitoring/.alertmanager_token)"
    echo
    echo "🔍 Kibana (Logs):"
    echo "   URL: http://localhost:5601"
    echo "   Usuario: elastic"
    echo "   Contraseña: changeme"
    echo
    echo "📈 Elasticsearch (API):"
    echo "   URL: http://localhost:9200"
    echo "   Usuario: elastic"
    echo "   Contraseña: changeme"
    echo
    log_warning "IMPORTANTE: Cambie las contraseñas por defecto en producción"
}

# Función para crear script de mantenimiento
create_maintenance_script() {
    log_info "Creando script de mantenimiento..."
    
    cat > scripts/monitoring-maintenance.sh << 'EOF'
#!/bin/bash

# Script de mantenimiento para monitoreo - JeonseVault

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

case "${1:-}" in
    "status")
        log_info "Estado de servicios de monitoreo:"
        docker-compose ps | grep -E "(prometheus|grafana|alertmanager|elasticsearch|kibana)"
        ;;
    "logs")
        log_info "Mostrando logs de monitoreo:"
        docker-compose logs -f --tail=100 "${2:-}"
        ;;
    "restart")
        log_info "Reiniciando servicios de monitoreo:"
        docker-compose restart prometheus grafana alertmanager elasticsearch kibana
        ;;
    "backup")
        log_info "Creando backup de configuración de monitoreo:"
        tar -czf "monitoring/backup/monitoring-config-$(date +%Y%m%d_%H%M%S).tar.gz" \
            monitoring/prometheus.yml \
            monitoring/alertmanager.yml \
            monitoring/grafana/provisioning/ \
            monitoring/rules/ \
            monitoring/.env
        log_success "Backup creado"
        ;;
    "cleanup")
        log_info "Limpiando datos antiguos:"
        docker-compose exec prometheus wget --post-data="" http://localhost:9090/api/v1/admin/tsdb/clean_tombstones
        log_success "Limpieza completada"
        ;;
    *)
        echo "Uso: $0 {status|logs|restart|backup|cleanup}"
        echo "  status  - Mostrar estado de servicios"
        echo "  logs    - Mostrar logs (opcional: especificar servicio)"
        echo "  restart - Reiniciar servicios"
        echo "  backup  - Crear backup de configuración"
        echo "  cleanup - Limpiar datos antiguos"
        exit 1
        ;;
esac
EOF
    
    chmod +x scripts/monitoring-maintenance.sh
    log_success "Script de mantenimiento creado"
}

# Función principal
main() {
    echo "============================================================================"
    echo "🚀 Configuración de Monitoreo - JeonseVault"
    echo "============================================================================"
    echo
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        log_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
        exit 1
    fi
    
    # Ejecutar funciones en orden
    check_dependencies
    create_directories
    setup_permissions
    generate_passwords
    setup_environment
    setup_prometheus
    setup_grafana
    setup_alertmanager
    setup_elk
    start_monitoring
    
    # Esperar un momento para que los servicios se inicien
    log_info "Esperando a que los servicios se inicien..."
    sleep 30
    
    check_services
    setup_dashboards
    setup_alerts
    create_maintenance_script
    
    echo
    echo "============================================================================"
    log_success "Configuración de monitoreo completada exitosamente!"
    echo "============================================================================"
    echo
    
    show_access_info
    
    echo
    log_info "Comandos útiles:"
    echo "  • Ver estado: ./scripts/monitoring-maintenance.sh status"
    echo "  • Ver logs: ./scripts/monitoring-maintenance.sh logs [servicio]"
    echo "  • Reiniciar: ./scripts/monitoring-maintenance.sh restart"
    echo "  • Backup: ./scripts/monitoring-maintenance.sh backup"
    echo "  • Limpiar: ./scripts/monitoring-maintenance.sh cleanup"
    echo
    log_warning "Recuerde cambiar las contraseñas por defecto en producción"
    log_warning "Configure las alertas de Slack/email según sus necesidades"
}

# Ejecutar función principal
main "$@"
