#!/bin/bash

###############################################################################
# Script de Monitoreo Post-Despliegue
# Proyecto: Ueta Travel Access
# Descripción: Monitorea el estado de la aplicación después del despliegue
###############################################################################

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
MAGENTA='\033[0;35m'
NC='\033[0m'

# ============================================================================
# BANNER
# ============================================================================

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   📊 MONITOR DE DESPLIEGUE - UETA TRAVEL ACCESS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# ============================================================================
# PM2 STATUS
# ============================================================================

echo -e "${CYAN}🔹 Estado de PM2${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "pm2 status" 2>/dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al conectar con PM2${NC}"
else
    echo -e "${GREEN}✅ Conexión a PM2 exitosa${NC}"
fi

# ============================================================================
# PM2 INFO DETALLADA
# ============================================================================

echo -e "\n${CYAN}🔹 Información Detallada de la Aplicación${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    # Colores en servidor remoto
    CYAN='\033[0;36m'
    YELLOW='\033[1;33m'
    NC='\033[0m'

    if pm2 describe ueta-travel-access > /dev/null 2>&1; then
        echo -e "${CYAN}Nombre:${NC}      $(pm2 describe ueta-travel-access | grep 'name' | head -1 | awk '{print $3}')"
        echo -e "${CYAN}PID:${NC}         $(pm2 describe ueta-travel-access | grep 'pid' | head -1 | awk '{print $3}')"
        echo -e "${CYAN}Uptime:${NC}      $(pm2 describe ueta-travel-access | grep 'uptime' | head -1 | awk '{$1=$2=""; print $0}' | xargs)"
        echo -e "${CYAN}Reinicios:${NC}   $(pm2 describe ueta-travel-access | grep 'restarts' | head -1 | awk '{print $3}')"
        echo -e "${CYAN}Memoria:${NC}     $(pm2 describe ueta-travel-access | grep 'memory' | head -1 | awk '{print $3}')"
        echo -e "${CYAN}CPU:${NC}         $(pm2 describe ueta-travel-access | grep 'cpu' | head -1 | awk '{print $3}')"
    else
        echo -e "${YELLOW}⚠️  Aplicación no encontrada en PM2${NC}"
    fi
ENDSSH

# ============================================================================
# LOGS RECIENTES
# ============================================================================

echo -e "\n${CYAN}🔹 Logs Recientes (últimas 30 líneas)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "pm2 logs ueta-travel-access --lines 30 --nostream" 2>/dev/null | tail -30

# ============================================================================
# HEALTH CHECK
# ============================================================================

echo -e "\n${CYAN}🔹 Health Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEALTH_URL="http://$SERVER_HOST:3000/api/health"
echo -e "${CYAN}URL:${NC} $HEALTH_URL"

RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: Healthy (HTTP $HTTP_CODE)${NC}"
    echo -e "${CYAN}Response:${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Status: Unhealthy (HTTP $HTTP_CODE)${NC}"
    if [ -n "$BODY" ]; then
        echo -e "${CYAN}Response:${NC}"
        echo "$BODY"
    fi
fi

# ============================================================================
# ENDPOINTS CHECK
# ============================================================================

echo -e "\n${CYAN}🔹 Verificación de Endpoints${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint() {
    local endpoint=$1
    local url="http://$SERVER_HOST:3000$endpoint"

    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅${NC} $endpoint ${GREEN}(HTTP $response)${NC}"
    elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${YELLOW}🔒${NC} $endpoint ${YELLOW}(HTTP $response - Auth required)${NC}"
    else
        echo -e "${RED}❌${NC} $endpoint ${RED}(HTTP $response)${NC}"
    fi
}

check_endpoint "/"
check_endpoint "/api/health"
check_endpoint "/api/products"
check_endpoint "/api/categories"

# ============================================================================
# RECURSOS DEL SISTEMA
# ============================================================================

echo -e "\n${CYAN}🔹 Uso de Recursos del Sistema${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    # Colores
    CYAN='\033[0;36m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    NC='\033[0m'

    # Memoria
    echo -e "${CYAN}💾 Memoria:${NC}"
    MEM_INFO=$(free -h | grep Mem)
    MEM_TOTAL=$(echo $MEM_INFO | awk '{print $2}')
    MEM_USED=$(echo $MEM_INFO | awk '{print $3}')
    MEM_PERCENT=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')

    echo "   Total: $MEM_TOTAL | Usado: $MEM_USED | Porcentaje: ${MEM_PERCENT}%"

    if (( $(echo "$MEM_PERCENT > 80" | bc -l) )); then
        echo -e "   ${RED}⚠️  Uso de memoria alto!${NC}"
    elif (( $(echo "$MEM_PERCENT > 60" | bc -l) )); then
        echo -e "   ${YELLOW}⚠️  Uso de memoria moderado${NC}"
    else
        echo -e "   ${GREEN}✅ Uso de memoria normal${NC}"
    fi

    # Disco
    echo -e "\n${CYAN}💿 Disco:${NC}"
    DISK_INFO=$(df -h / | tail -1)
    DISK_SIZE=$(echo $DISK_INFO | awk '{print $2}')
    DISK_USED=$(echo $DISK_INFO | awk '{print $3}')
    DISK_PERCENT=$(echo $DISK_INFO | awk '{print $5}' | sed 's/%//')

    echo "   Total: $DISK_SIZE | Usado: $DISK_USED | Porcentaje: ${DISK_PERCENT}%"

    if [ "$DISK_PERCENT" -gt 80 ]; then
        echo -e "   ${RED}⚠️  Espacio en disco bajo!${NC}"
    elif [ "$DISK_PERCENT" -gt 60 ]; then
        echo -e "   ${YELLOW}⚠️  Espacio en disco moderado${NC}"
    else
        echo -e "   ${GREEN}✅ Espacio en disco adecuado${NC}"
    fi

    # CPU Load
    echo -e "\n${CYAN}⚡ Carga de CPU:${NC}"
    LOAD=$(uptime | awk -F'load average:' '{print $2}')
    echo "   Load Average:$LOAD"

    # Procesos Node.js
    echo -e "\n${CYAN}🔧 Procesos Node.js:${NC}"
    NODE_PROCS=$(ps aux | grep node | grep -v grep | wc -l)
    echo "   Procesos activos: $NODE_PROCS"
ENDSSH

# ============================================================================
# NGINX STATUS
# ============================================================================

echo -e "\n${CYAN}🔹 Estado de Nginx${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    NC='\033[0m'

    if sudo systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx está corriendo${NC}"

        # Verificar configuración
        if sudo nginx -t > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Configuración de Nginx válida${NC}"
        else
            echo -e "${RED}❌ Error en configuración de Nginx${NC}"
        fi
    else
        echo -e "${RED}❌ Nginx no está corriendo${NC}"
    fi
ENDSSH

# ============================================================================
# ÚLTIMOS DESPLIEGUES (BACKUPS)
# ============================================================================

echo -e "\n${CYAN}🔹 Últimos Despliegues (Backups)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    if [ -d "/home/opc/backups" ]; then
        echo "Últimos 5 backups:"
        ls -lt /home/opc/backups | grep '^d' | head -5 | awk '{print "  " $6, $7, $8, $9}'
    else
        echo "  No hay backups disponibles"
    fi
ENDSSH

# ============================================================================
# CONECTIVIDAD DE BASE DE DATOS
# ============================================================================

echo -e "\n${CYAN}🔹 Conectividad de Base de Datos${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Intentar hacer una petición a un endpoint que use la DB
DB_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:3000/api/products?limit=1" 2>/dev/null)

if [ "$DB_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Conexión a base de datos funcional${NC}"
elif [ "$DB_CHECK" = "500" ]; then
    echo -e "${RED}❌ Error de servidor - posible problema con BD${NC}"
else
    echo -e "${YELLOW}⚠️  Estado incierto (HTTP $DB_CHECK)${NC}"
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}📊 RESUMEN DE MONITOREO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌐 URL de la aplicación:${NC} http://$SERVER_HOST:3000"
echo -e "${CYAN}📅 Fecha de monitoreo:${NC} $(date '+%Y-%m-%d %H:%M:%S')"

# Comando para monitoreo continuo
echo -e "\n${CYAN}💡 Para monitoreo en tiempo real:${NC}"
echo -e "   ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 logs ueta-travel-access'"
echo -e "   ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 monit'"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
