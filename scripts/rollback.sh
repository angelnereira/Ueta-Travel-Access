#!/bin/bash

###############################################################################
# Script de Rollback para Oracle Cloud
# Proyecto: Ueta Travel Access
# Descripción: Revierte a una versión anterior de la aplicación
###############################################################################

set -e

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

SERVER_HOST="${SERVER_HOST:-150.230.45.123}"
SERVER_USER="${SERVER_USER:-opc}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/oci_compute_key}"

# ============================================================================
# COLORES
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

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
# LISTAR BACKUPS DISPONIBLES
# ============================================================================

log_step "🗄️  Backups Disponibles"

log_info "Conectando al servidor..."

BACKUPS=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "ls -lt /home/opc/backups 2>/dev/null | grep '^d' | awk '{print \$9}' | head -20" 2>/dev/null)

if [ -z "$BACKUPS" ]; then
    log_error "No se encontraron backups disponibles"
    exit 1
fi

echo ""
echo "Backups disponibles (más recientes primero):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Mostrar backups con numeración
i=1
declare -a backup_array
while IFS= read -r backup; do
    backup_array+=("$backup")
    # Extraer fecha del nombre del backup (formato: ueta-YYYYMMDD-HHMMSS)
    if [[ $backup =~ ueta-([0-9]{8})-([0-9]{6}) ]]; then
        date_part="${BASH_REMATCH[1]}"
        time_part="${BASH_REMATCH[2]}"

        # Formatear fecha legible
        year="${date_part:0:4}"
        month="${date_part:4:2}"
        day="${date_part:6:2}"
        hour="${time_part:0:2}"
        minute="${time_part:2:2}"
        second="${time_part:4:2}"

        formatted_date="$day/$month/$year $hour:$minute:$second"
        echo -e "${CYAN}$i)${NC} $backup  ${YELLOW}($formatted_date)${NC}"
    else
        echo -e "${CYAN}$i)${NC} $backup"
    fi
    ((i++))
done <<< "$BACKUPS"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ============================================================================
# SELECCIONAR BACKUP
# ============================================================================

echo ""
read -p "Selecciona el número del backup a restaurar (o 'q' para cancelar): " selection

if [[ "$selection" =~ ^[Qq]$ ]]; then
    log_info "Rollback cancelado"
    exit 0
fi

# Validar selección
if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt "${#backup_array[@]}" ]; then
    log_error "Selección inválida"
    exit 1
fi

# Obtener el backup seleccionado (array es 0-indexed)
BACKUP_NAME="${backup_array[$((selection-1))]}"

log_info "Backup seleccionado: $BACKUP_NAME"

# ============================================================================
# CONFIRMAR ROLLBACK
# ============================================================================

log_step "⚠️  Confirmación"

log_warning "Esta operación va a:"
echo "  1. Crear un backup del estado actual"
echo "  2. Restaurar los archivos desde: $BACKUP_NAME"
echo "  3. Reinstalar dependencias"
echo "  4. Reiniciar la aplicación"
echo ""
read -p "¿Estás seguro de continuar? Escribe 'yes' para confirmar: " confirm

if [ "$confirm" != "yes" ]; then
    log_info "Rollback cancelado"
    exit 0
fi

# ============================================================================
# EJECUTAR ROLLBACK
# ============================================================================

log_step "🔄 Ejecutando Rollback"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" bash << ENDSSH
    set -e

    # Colores
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    CYAN='\033[0;36m'
    NC='\033[0m'

    BACKUP_NAME="$BACKUP_NAME"
    BACKUP_PATH="/home/opc/backups/\$BACKUP_NAME"

    # Verificar que el backup existe
    if [ ! -d "\$BACKUP_PATH" ]; then
        echo -e "\${RED}❌ Backup no encontrado: \$BACKUP_PATH\${NC}"
        exit 1
    fi

    echo -e "\${CYAN}📦 Verificando backup...\${NC}"
    echo -e "\${GREEN}✅ Backup encontrado: \$BACKUP_PATH\${NC}"

    # Crear backup del estado actual antes del rollback
    CURRENT_BACKUP="/home/opc/backups/pre-rollback-\$(date +%Y%m%d-%H%M%S)"

    echo -e "\${CYAN}💾 Creando backup del estado actual...\${NC}"
    if [ -d "/home/opc/ueta-travel-access" ]; then
        cp -r /home/opc/ueta-travel-access "\$CURRENT_BACKUP"
        echo -e "\${GREEN}✅ Backup actual guardado en: \$CURRENT_BACKUP\${NC}"
    fi

    # Eliminar instalación actual
    echo -e "\${CYAN}🗑️  Eliminando instalación actual...\${NC}"
    rm -rf /home/opc/ueta-travel-access

    # Restaurar desde backup
    echo -e "\${CYAN}📂 Restaurando desde backup...\${NC}"
    cp -r "\$BACKUP_PATH" /home/opc/ueta-travel-access
    echo -e "\${GREEN}✅ Archivos restaurados\${NC}"

    # Ir al directorio
    cd /home/opc/ueta-travel-access

    # Reinstalar dependencias
    echo -e "\${CYAN}📥 Reinstalando dependencias...\${NC}"
    npm ci --production --quiet
    echo -e "\${GREEN}✅ Dependencias instaladas\${NC}"

    # Reiniciar aplicación
    echo -e "\${CYAN}🔄 Reiniciando aplicación...\${NC}"
    if pm2 describe ueta-travel-access > /dev/null 2>&1; then
        pm2 reload ecosystem.config.js --update-env
        echo -e "\${GREEN}✅ Aplicación reiniciada\${NC}"
    else
        pm2 start ecosystem.config.js
        echo -e "\${GREEN}✅ Aplicación iniciada\${NC}"
    fi

    # Guardar configuración de PM2
    pm2 save > /dev/null 2>&1

    echo -e "\n\${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\${NC}"
    echo -e "\${GREEN}✅ Rollback completado exitosamente!\${NC}"
    echo -e "\${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\${NC}"
    echo -e "\${CYAN}Restaurado desde: \$BACKUP_NAME\${NC}"
    echo -e "\${CYAN}Estado anterior guardado en: \$CURRENT_BACKUP\${NC}"
ENDSSH

if [ $? -eq 0 ]; then
    log_success "Rollback completado"
else
    log_error "Error durante el rollback"
    exit 1
fi

# ============================================================================
# VERIFICAR ESTADO
# ============================================================================

log_step "🔍 Verificando Estado"

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
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

if [ "$RESPONSE" = "200" ]; then
    log_success "Health check exitoso (HTTP $RESPONSE)"
else
    log_warning "Health check falló (HTTP $RESPONSE)"
fi

# ============================================================================
# RESUMEN
# ============================================================================

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ROLLBACK COMPLETADO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌐 URL: http://$SERVER_HOST:3000${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
