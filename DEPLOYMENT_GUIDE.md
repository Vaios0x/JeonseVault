# 🚀 Guía de Deployment y DevOps - JeonseVault

## 📋 Resumen Ejecutivo

Esta guía proporciona instrucciones completas para desplegar JeonseVault en producción con un sistema robusto de CI/CD, monitoreo y backup automatizado.

## 🏗️ Arquitectura de Infraestructura

### Stack Tecnológico
- **Frontend**: Next.js 14 con TypeScript
- **Backend**: Node.js con APIs REST
- **Base de Datos**: PostgreSQL 15
- **Cache**: Redis 7
- **Contenedores**: Docker + Docker Compose
- **Proxy**: Nginx con SSL/TLS
- **Monitoreo**: Prometheus + Grafana + AlertManager
- **Logging**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **CI/CD**: GitHub Actions
- **Seguridad**: Vault para gestión de secretos

### Diagrama de Infraestructura
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN/CloudFlare│    │   DNS Provider  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │        Nginx Proxy        │
                    │     (SSL Termination)     │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    JeonseVault App        │
                    │   (Next.js Container)     │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌───────────▼──────────┐    ┌────────▼────────┐
│   PostgreSQL   │    │       Redis          │    │   Elasticsearch │
│   (Database)   │    │      (Cache)         │    │    (Logging)    │
└────────────────┘    └──────────────────────┘    └─────────────────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Monitoring Stack     │
                    │  Prometheus + Grafana     │
                    └───────────────────────────┘
```

## 🔧 Configuración de Entorno

### Variables de Entorno Requeridas

```bash
# ============================================================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================================================
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# ============================================================================
# CONTRATOS SMART CONTRACTS
# ============================================================================
NEXT_PUBLIC_JEONSE_VAULT_ADDRESS=0x...
NEXT_PUBLIC_INVESTMENT_POOL_ADDRESS=0x...
NEXT_PUBLIC_PROPERTY_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_COMPLIANCE_MODULE_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://...
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_EXPLORER_URL=https://etherscan.io

# ============================================================================
# BASE DE DATOS
# ============================================================================
DATABASE_URL=postgresql://user:password@host:5432/jeonsevault
POSTGRES_DB=jeonsevault
POSTGRES_USER=jeonsevault
POSTGRES_PASSWORD=secure_password_here

# ============================================================================
# REDIS
# ============================================================================
REDIS_URL=redis://:password@host:6379
REDIS_PASSWORD=secure_redis_password

# ============================================================================
# MONITORING
# ============================================================================
GRAFANA_PASSWORD=secure_grafana_password
PROMETHEUS_PASSWORD=secure_prometheus_password

# ============================================================================
# SEGURIDAD
# ============================================================================
VAULT_ROOT_TOKEN=your_vault_root_token
SNYK_TOKEN=your_snyk_token
SENTRY_DSN=your_sentry_dsn

# ============================================================================
# ANALYTICS
# ============================================================================
ANALYTICS_API_KEY=your_analytics_key
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# ============================================================================
# BACKUP
# ============================================================================
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE="0 2 * * *"
```

## 🚀 Proceso de Deployment

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar herramientas adicionales
sudo apt install -y curl wget git htop nginx certbot python3-certbot-nginx
```

### 2. Configuración de SSL/TLS

```bash
# Obtener certificado SSL
sudo certbot --nginx -d jeonsevault.com -d www.jeonsevault.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Configuración de Firewall

```bash
# Configurar UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

### 4. Deployment Automatizado

```bash
# Clonar repositorio
git clone https://github.com/jeonsevault/jeonsevault.git
cd jeonsevault

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las variables de producción

# Ejecutar deployment
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

El pipeline de CI/CD incluye las siguientes etapas:

1. **Security Audit** - Auditoría de seguridad automatizada
2. **Smart Contract Testing** - Tests de contratos inteligentes
3. **Frontend Testing** - Tests unitarios e integración
4. **E2E Testing** - Tests end-to-end con Playwright
5. **Code Quality** - Linting, formatting, type checking
6. **Build & Optimization** - Build optimizado con PWA
7. **Smart Contract Deployment** - Deploy de contratos
8. **Docker Build** - Construcción de imagen Docker
9. **Staging Deployment** - Deploy a staging
10. **Production Deployment** - Deploy a producción
11. **Monitoring Setup** - Configuración de monitoreo
12. **Performance Testing** - Tests de performance
13. **Backup & Recovery** - Backup automatizado

### Configuración de Secrets en GitHub

```bash
# Secrets requeridos en GitHub
DEPLOY_PRIVATE_KEY=your_deploy_private_key
RPC_URL=your_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
SNYK_TOKEN=your_snyk_token

# Secrets de staging
STAGING_HOST=staging.jeonsevault.com
STAGING_USER=deploy
STAGING_SSH_KEY=your_staging_ssh_key

# Secrets de producción
PRODUCTION_HOST=jeonsevault.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=your_production_ssh_key
PRODUCTION_DOMAIN=jeonsevault.com
```

## 📊 Monitoreo y Alertas

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'jeonsevault-app'
    static_configs:
      - targets: ['jeonsevault:3000']
    metrics_path: /api/metrics
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: /nginx_status

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    metrics_path: /metrics

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    metrics_path: /metrics
```

### AlertManager Rules

```yaml
# monitoring/rules/alerts.yml
groups:
  - name: jeonsevault_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.instance }} is down"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

### Grafana Dashboards

Configurar dashboards para:
- **Aplicación**: Métricas de rendimiento, errores, usuarios activos
- **Infraestructura**: CPU, memoria, disco, red
- **Base de Datos**: Conexiones, queries lentas, locks
- **Blockchain**: Transacciones, gas, confirmaciones
- **Seguridad**: Intentos de acceso, vulnerabilidades

## 💾 Backup y Recovery

### Backup Automatizado

```bash
# Ejecutar backup manual
npm run backup

# Configurar backup automático (cron)
crontab -e
# Agregar: 0 2 * * * cd /opt/jeonsevault && npm run backup
```

### Restauración

```bash
# Restaurar desde backup
npm run backup:restore -- --backup-file=jeonsevault_backup_20241201_020000

# Verificar restauración
npm run health
```

## 🔒 Seguridad

### Configuración de Seguridad

1. **Firewall**: Configurar UFW con reglas estrictas
2. **SSL/TLS**: Certificados automáticos con Let's Encrypt
3. **Rate Limiting**: Configurado en Nginx
4. **Headers de Seguridad**: CSP, HSTS, X-Frame-Options
5. **Secretos**: Gestionados con HashiCorp Vault
6. **Auditoría**: Logs de seguridad centralizados

### Monitoreo de Seguridad

```bash
# Verificar configuración de seguridad
npm run security:audit:verbose

# Monitorear logs de seguridad
tail -f logs/security.log

# Verificar certificados SSL
openssl s_client -connect jeonsevault.com:443 -servername jeonsevault.com
```

## 📈 Performance y Optimización

### Optimizaciones Implementadas

1. **Docker Multi-stage Build**: Imágenes optimizadas
2. **Nginx Caching**: Cache de archivos estáticos
3. **Gzip Compression**: Compresión de respuestas
4. **CDN**: Distribución de contenido
5. **Database Indexing**: Índices optimizados
6. **Redis Caching**: Cache de consultas frecuentes

### Métricas de Performance

```bash
# Ejecutar tests de performance
npm run test:performance

# Generar reporte Lighthouse
npm run lighthouse

# Monitorear métricas en tiempo real
curl http://localhost:3000/api/metrics
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Servicio no inicia**
   ```bash
   docker-compose logs jeonsevault
   docker-compose ps
   ```

2. **Base de datos no conecta**
   ```bash
   docker-compose logs postgres
   docker exec -it jeonsevault-postgres psql -U jeonsevault -d jeonsevault
   ```

3. **SSL no funciona**
   ```bash
   sudo certbot certificates
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Monitoreo no funciona**
   ```bash
   docker-compose logs prometheus
   docker-compose logs grafana
   curl http://localhost:9090/-/healthy
   ```

### Logs y Debugging

```bash
# Ver logs de la aplicación
npm run logs

# Ver logs de errores
npm run logs:error

# Ver logs de acceso
npm run logs:access

# Ver logs de Docker
docker-compose logs -f

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 📋 Checklist de Deployment

### Pre-Deployment
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL obtenidos
- [ ] Firewall configurado
- [ ] Base de datos inicializada
- [ ] Contratos desplegados y verificados
- [ ] Tests pasando en CI/CD

### Deployment
- [ ] Backup pre-deployment creado
- [ ] Imagen Docker construida
- [ ] Servicios desplegados
- [ ] Health checks pasando
- [ ] SSL configurado
- [ ] Monitoreo funcionando

### Post-Deployment
- [ ] Smoke tests pasando
- [ ] Performance tests ejecutados
- [ ] Alertas configuradas
- [ ] Backup automatizado configurado
- [ ] Documentación actualizada
- [ ] Equipo notificado

## 🔄 Mantenimiento

### Tareas Diarias
- [ ] Revisar logs de errores
- [ ] Verificar métricas de performance
- [ ] Monitorear alertas
- [ ] Verificar backups

### Tareas Semanales
- [ ] Revisar reportes de seguridad
- [ ] Actualizar dependencias
- [ ] Verificar espacio en disco
- [ ] Revisar métricas de negocio

### Tareas Mensuales
- [ ] Auditoría de seguridad completa
- [ ] Revisión de configuración
- [ ] Actualización de certificados
- [ ] Optimización de performance

## 📞 Soporte y Contacto

### Equipo de DevOps
- **DevOps Lead**: devops@jeonsevault.com
- **Security Team**: security@jeonsevault.com
- **Infrastructure**: infra@jeonsevault.com

### Documentación Adicional
- [Guía de Seguridad](./GUIA_SEGURIDAD.md)
- [Guía de Testing](./TESTING_IMPLEMENTATION_SUMMARY.md)
- [Guía de Optimización](./OPTIMIZATION_GUIDE.md)
- [Guía de Setup](./SETUP_GUIDE.md)

---

**Versión**: 2.0.0  
**Última actualización**: Enero 2024  
**Estado**: ✅ Implementado y Verificado
