#!/bin/bash

###############################################################################
# Script de Configuración Inicial del Servidor Oracle Cloud
# Proyecto: Ueta Travel Access
# Descripción: Prepara el servidor Oracle Cloud para recibir la aplicación
###############################################################################

set -e

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
# BANNER
# ============================================================================

echo -e "${BLUE}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        CONFIGURACIÓN INICIAL - ORACLE CLOUD SERVER             ║
║                  Ueta Travel Access                            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log_warning "Este script debe ejecutarse EN EL SERVIDOR ORACLE CLOUD"
log_warning "NO lo ejecutes en tu máquina local"
echo ""
read -p "¿Estás en el servidor Oracle Cloud? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_info "Script cancelado. Ejecuta este script en el servidor Oracle Cloud."
    exit 0
fi

# ============================================================================
# 1. ACTUALIZAR SISTEMA
# ============================================================================

log_step "1. Actualizando Sistema Operativo"

log_info "Actualizando repositorios..."
sudo yum update -y

log_success "Sistema actualizado"

# ============================================================================
# 2. INSTALAR NODE.JS
# ============================================================================

log_step "2. Instalando Node.js 18 LTS"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    log_warning "Node.js ya está instalado: $NODE_VERSION"
    read -p "¿Quieres reinstalarlo? (yes/no): " reinstall
    if [ "$reinstall" != "yes" ]; then
        log_info "Saltando instalación de Node.js"
    else
        log_info "Instalando Node.js 18..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
        log_success "Node.js instalado: $(node -v)"
    fi
else
    log_info "Instalando Node.js 18..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
    log_success "Node.js instalado: $(node -v)"
fi

# ============================================================================
# 3. INSTALAR PM2
# ============================================================================

log_step "3. Instalando PM2"

if command -v pm2 &> /dev/null; then
    log_warning "PM2 ya está instalado: $(pm2 -v)"
else
    log_info "Instalando PM2 globalmente..."
    sudo npm install -g pm2

    # Configurar PM2 para iniciar al boot
    log_info "Configurando PM2 startup..."
    pm2 startup | grep -E "^sudo" | bash

    log_success "PM2 instalado: $(pm2 -v)"
fi

# ============================================================================
# 4. INSTALAR NGINX
# ============================================================================

log_step "4. Instalando Nginx"

if command -v nginx &> /dev/null; then
    log_warning "Nginx ya está instalado"
else
    log_info "Instalando Nginx..."
    sudo yum install -y nginx

    # Iniciar y habilitar Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx

    log_success "Nginx instalado y corriendo"
fi

# ============================================================================
# 5. CONFIGURAR FIREWALL
# ============================================================================

log_step "5. Configurando Firewall"

log_info "Abriendo puertos necesarios..."

# HTTP (80)
sudo firewall-cmd --permanent --add-port=80/tcp
# HTTPS (443)
sudo firewall-cmd --permanent --add-port=443/tcp
# Next.js (3000)
sudo firewall-cmd --permanent --add-port=3000/tcp

# Recargar firewall
sudo firewall-cmd --reload

log_success "Puertos abiertos: 80, 443, 3000"

# ============================================================================
# 6. CREAR DIRECTORIOS
# ============================================================================

log_step "6. Creando Estructura de Directorios"

log_info "Creando directorios necesarios..."

mkdir -p /home/opc/ueta-travel-access
mkdir -p /home/opc/logs
mkdir -p /home/opc/backups
mkdir -p /home/opc/wallet

log_success "Directorios creados"

# ============================================================================
# 7. INSTALAR GIT
# ============================================================================

log_step "7. Instalando Git"

if command -v git &> /dev/null; then
    log_warning "Git ya está instalado: $(git --version)"
else
    log_info "Instalando Git..."
    sudo yum install -y git
    log_success "Git instalado: $(git --version)"
fi

# ============================================================================
# 8. CONFIGURAR NGINX PARA NEXT.JS
# ============================================================================

log_step "8. Configurando Nginx"

NGINX_CONF="/etc/nginx/conf.d/ueta-travel.conf"

if [ -f "$NGINX_CONF" ]; then
    log_warning "Configuración de Nginx ya existe"
else
    log_info "Creando configuración de Nginx..."

    sudo tee "$NGINX_CONF" > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logs
    access_log /var/log/nginx/ueta-access.log;
    error_log /var/log/nginx/ueta-error.log;
}
NGINXCONF

    # Verificar configuración
    sudo nginx -t

    # Reiniciar Nginx
    sudo systemctl restart nginx

    log_success "Nginx configurado"
fi

# ============================================================================
# 9. INSTALAR CERTBOT (Para SSL)
# ============================================================================

log_step "9. Instalando Certbot (SSL/TLS)"

if command -v certbot &> /dev/null; then
    log_warning "Certbot ya está instalado"
else
    log_info "Instalando Certbot..."
    sudo yum install -y certbot python3-certbot-nginx
    log_success "Certbot instalado"
    log_info "Para obtener SSL, ejecuta: sudo certbot --nginx -d tudominio.com"
fi

# ============================================================================
# 10. RESUMEN
# ============================================================================

log_step "✅ CONFIGURACIÓN COMPLETADA"

echo -e "${GREEN}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                     CONFIGURACIÓN EXITOSA                      ║
╚════════════════════════════════════════════════════════════════╝

Servicios instalados:
  ✅ Node.js ($(node -v))
  ✅ npm ($(npm -v))
  ✅ PM2
  ✅ Nginx
  ✅ Git
  ✅ Certbot

Directorios creados:
  ✅ /home/opc/ueta-travel-access
  ✅ /home/opc/logs
  ✅ /home/opc/backups
  ✅ /home/opc/wallet

Puertos abiertos:
  ✅ 80 (HTTP)
  ✅ 443 (HTTPS)
  ✅ 3000 (Next.js)

PRÓXIMOS PASOS:

1. Copiar el wallet de Oracle DB a /home/opc/wallet:
   scp -i ~/.ssh/key wallet.zip opc@IP:/home/opc/
   unzip /home/opc/wallet.zip -d /home/opc/wallet

2. Desplegar la aplicación:
   Opción A: Desde local ejecutar: npm run deploy
   Opción B: Clonar repo: git clone <repo> /home/opc/ueta-travel-access

3. Configurar variables de entorno:
   cd /home/opc/ueta-travel-access
   cp .env.example .env.production
   nano .env.production

4. Instalar dependencias y hacer build:
   npm ci --production
   npm run build

5. Iniciar con PM2:
   pm2 start ecosystem.config.js
   pm2 save

6. Verificar:
   curl http://localhost:3000/api/health

EOF
echo -e "${NC}"

log_success "Servidor Oracle Cloud está listo para recibir la aplicación!"
