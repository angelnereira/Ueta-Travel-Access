#!/bin/bash

###############################################################################
# Script de Despliegue Manual a Oracle Cloud
# Proyecto: Ueta Travel Access
# Descripción: Despliega la aplicación Next.js a Oracle Cloud Compute Instance
###############################################################################

set -e  # Salir si hay errores

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Configuración del servidor (ajusta estos valores)
SERVER_HOST="${SERVER_HOST:-150.230.45.123}"  # Cambia a tu IP pública
SERVER_USER="${SERVER_USER:-opc}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/oci_compute_key}"
REMOTE_DIR="/home/opc/ueta-travel-access"

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ============================================================================
# COLORES PARA OUTPUT
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCIONES
# ============================================================================

log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================================================
# VALIDACIONES PREVIAS
# ============================================================================

log_step "🔍 Validando configuración"

# Verificar que estamos en el directorio correcto
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    log_error "No se encontró package.json. ¿Estás en el directorio correcto?"
    exit 1
fi

# Verificar que existe la llave SSH
if [ ! -f "$SSH_KEY" ]; then
    log_error "Llave SSH no encontrada: $SSH_KEY"
    log_info "Crea la llave o ajusta la variable SSH_KEY"
    exit 1
fi

# Verificar permisos de la llave SSH
if [ "$(stat -c %a "$SSH_KEY" 2>/dev/null || stat -f %A "$SSH_KEY" 2>/dev/null)" != "600" ]; then
    log_warning "Permisos incorrectos en la llave SSH. Corrigiendo..."
    chmod 600 "$SSH_KEY"
fi

log_success "Configuración válida"

# ============================================================================
# VERIFICAR CONEXIÓN
# ============================================================================

log_step "🔌 Verificando conexión al servidor"

if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" "echo 'Conexión exitosa'" > /dev/null 2>&1; then
    log_error "No se pudo conectar al servidor $SERVER_HOST"
    log_info "Verifica que:"
    log_info "  - La IP sea correcta"
    log_info "  - La instancia esté corriendo"
    log_info "  - Los puertos estén abiertos"
    log_info "  - La llave SSH sea la correcta"
    exit 1
fi

log_success "Conexión al servidor exitosa"

# ============================================================================
# BUILD LOCAL
# ============================================================================

log_step "🏗️  Compilando aplicación"

cd "$PROJECT_DIR"

# Verificar si ya existe un build
if [ -d "$PROJECT_DIR/.next" ]; then
    log_info "Build existente encontrado"
    read -p "¿Quieres hacer un build nuevo? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        log_info "Eliminando build anterior..."
        rm -rf .next
        log_info "Ejecutando build..."
        npm run build
    fi
else
    log_info "No se encontró build. Compilando..."
    npm run build
fi

if [ ! -d "$PROJECT_DIR/.next" ]; then
    log_error "Build falló - el directorio .next no existe"
    exit 1
fi

log_success "Build completado"

# ============================================================================
# CREAR PAQUETE DE DESPLIEGUE
# ============================================================================

log_step "📦 Creando paquete de despliegue"

DEPLOY_PACKAGE="/tmp/ueta-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

log_info "Empaquetando archivos..."

tar -czf "$DEPLOY_PACKAGE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.github' \
    --exclude='.next/cache' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.env.development' \
    --exclude='coverage' \
    --exclude='*.md' \
    .

PACKAGE_SIZE=$(du -h "$DEPLOY_PACKAGE" | cut -f1)
log_success "Paquete creado: $DEPLOY_PACKAGE ($PACKAGE_SIZE)"

# ============================================================================
# TRANSFERIR AL SERVIDOR
# ============================================================================

log_step "📤 Transfiriendo paquete al servidor"

log_info "Subiendo archivo..."

if scp -i "$SSH_KEY" "$DEPLOY_PACKAGE" "$SERVER_USER@$SERVER_HOST:/tmp/ueta-deploy.tar.gz"; then
    log_success "Transferencia completada"
else
    log_error "Fallo en la transferencia"
    rm "$DEPLOY_PACKAGE"
    exit 1
fi

# Limpiar paquete local
rm "$DEPLOY_PACKAGE"

# ============================================================================
# DESPLEGAR EN EL SERVIDOR
# ============================================================================

log_step "🚀 Desplegando en Oracle Cloud"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e

    # Colores en el servidor remoto
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    CYAN='\033[0;36m'
    NC='\033[0m'

    echo -e "${CYAN}📍 Trabajando en el servidor...${NC}"

    # Crear backup del despliegue actual
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BACKUP_DIR="/home/opc/backups/ueta-$TIMESTAMP"

    echo -e "${CYAN}💾 Creando backup...${NC}"
    mkdir -p /home/opc/backups

    if [ -d "/home/opc/ueta-travel-access" ]; then
        cp -r /home/opc/ueta-travel-access "$BACKUP_DIR"
        echo -e "${GREEN}✅ Backup creado: $BACKUP_DIR${NC}"
    else
        echo -e "${YELLOW}⚠️  No hay instalación previa, saltando backup${NC}"
    fi

    # Extraer nuevo código
    echo -e "${CYAN}📂 Extrayendo código...${NC}"
    mkdir -p /home/opc/ueta-travel-access
    cd /home/opc/ueta-travel-access
    tar -xzf /tmp/ueta-deploy.tar.gz
    echo -e "${GREEN}✅ Código extraído${NC}"

    # Verificar si existe .env.production, si no, copiar de backup
    if [ ! -f ".env.production" ] && [ -f "$BACKUP_DIR/.env.production" ]; then
        echo -e "${YELLOW}⚠️  Copiando .env.production del backup${NC}"
        cp "$BACKUP_DIR/.env.production" .env.production
    fi

    # Instalar dependencias
    echo -e "${CYAN}📥 Instalando dependencias...${NC}"
    npm ci --production --quiet
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"

    # Reiniciar aplicación con PM2
    echo -e "${CYAN}🔄 Reiniciando aplicación...${NC}"

    if pm2 describe ueta-travel-access > /dev/null 2>&1; then
        # La app ya existe, recargar
        pm2 reload ecosystem.config.js --update-env
        echo -e "${GREEN}✅ Aplicación recargada${NC}"
    else
        # Primera instalación, iniciar
        pm2 start ecosystem.config.js
        echo -e "${GREEN}✅ Aplicación iniciada${NC}"
    fi

    # Guardar configuración de PM2
    pm2 save > /dev/null 2>&1

    # Limpiar archivo temporal
    rm /tmp/ueta-deploy.tar.gz

    # Mantener solo los últimos 5 backups
    cd /home/opc/backups
    BACKUP_COUNT=$(ls -1 | wc -l)
    if [ "$BACKUP_COUNT" -gt 5 ]; then
        echo -e "${CYAN}🗄️  Limpiando backups antiguos...${NC}"
        ls -t | tail -n +6 | xargs rm -rf
        echo -e "${GREEN}✅ Backups antiguos eliminados${NC}"
    fi

    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
ENDSSH

if [ $? -eq 0 ]; then
    log_success "Despliegue en servidor completado"
else
    log_error "Error durante el despliegue"
    exit 1
fi

# ============================================================================
# VERIFICAR DESPLIEGUE
# ============================================================================

log_step "🔍 Verificando despliegue"

log_info "Estado de PM2:"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "pm2 status"

echo ""
log_info "Últimos logs:"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "pm2 logs ueta-travel-access --lines 15 --nostream"

# ============================================================================
# HEALTH CHECK
# ============================================================================

log_step "🏥 Health Check"

log_info "Esperando que la aplicación inicie..."
sleep 5

HEALTH_URL="http://$SERVER_HOST:3000/api/health"
log_info "Verificando: $HEALTH_URL"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

if [ "$RESPONSE" = "200" ]; then
    log_success "Health check exitoso (HTTP $RESPONSE)"
else
    log_warning "Health check falló (HTTP $RESPONSE)"
    log_info "La aplicación podría estar iniciándose todavía"
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DESPLIEGUE COMPLETADO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌐 URL de la aplicación:${NC}"
echo -e "   http://$SERVER_HOST:3000"
echo ""
echo -e "${CYAN}📊 Comandos útiles:${NC}"
echo -e "   Ver logs:    ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 logs ueta-travel-access'"
echo -e "   Ver estado:  ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 status'"
echo -e "   Reiniciar:   ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 reload ueta-travel-access'"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
