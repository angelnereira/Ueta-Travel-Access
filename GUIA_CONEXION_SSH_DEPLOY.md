# Guía de Conexión SSH y Despliegue Automático - Ueta Travel Access

## Tabla de Contenidos

1. [Conexión SSH a Instancia Oracle Cloud](#1-conexión-ssh-a-instancia-oracle-cloud)
2. [Acceso a la Aplicación desde Cualquier Dispositivo](#2-acceso-a-la-aplicación-desde-cualquier-dispositivo)
3. [Despliegue Automático con GitHub Actions](#3-despliegue-automático-con-github-actions)
4. [Scripts de Despliegue](#4-scripts-de-despliegue)
5. [Troubleshooting y Solución de Problemas](#5-troubleshooting-y-solución-de-problemas)

---

## 1. Conexión SSH a Instancia Oracle Cloud

### 1.1 Requisitos Previos

Antes de conectarte vía SSH, necesitas:

- **IP Pública de la Instancia**: Obtenida desde OCI Console
- **Llave SSH Privada**: Archivo `.pem` o `.key` generado al crear la instancia
- **Usuario del Sistema**: Por defecto `opc` para Oracle Linux

### 1.2 Obtener la IP Pública de tu Instancia

#### Opción A: Desde OCI Console (Interfaz Web)

1. Accede a [cloud.oracle.com](https://cloud.oracle.com)
2. Inicia sesión con tus credenciales
3. Ve a **Menu (☰) → Compute → Instances**
4. Selecciona tu instancia (ejemplo: `ueta-travel-instance`)
5. En la sección **Instance Information**, copia la **Public IP Address**

```
Ejemplo de IP Pública: 150.230.45.123
```

#### Opción B: Desde Cloud Shell (CLI)

```bash
# Listar todas las instancias y sus IPs
oci compute instance list \
  --compartment-id <YOUR_COMPARTMENT_OCID> \
  --query 'data[*].{Name:"display-name", State:"lifecycle-state", OCID:id}' \
  --output table

# Guardar el OCID de tu instancia
export INSTANCE_OCID="ocid1.instance.oc1.iad.xxxxxxxxxxxxx"

# Obtener la IP pública
oci compute instance list-vnics \
  --instance-id $INSTANCE_OCID \
  --query 'data[0]."public-ip"' \
  --raw-output
```

### 1.3 Configurar tu Llave SSH Local

#### En Linux/Mac:

```bash
# Crear directorio .ssh si no existe
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Copiar tu llave privada (reemplaza con tu archivo)
cp /ruta/a/tu/llave-privada.pem ~/.ssh/oci_compute_key
chmod 600 ~/.ssh/oci_compute_key

# Verificar que la llave esté correctamente configurada
ls -la ~/.ssh/oci_compute_key
# Debería mostrar: -rw------- 1 usuario usuario 1675 Nov 15 10:00 oci_compute_key
```

#### En Windows (PowerShell):

```powershell
# Crear directorio .ssh
New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh" -Force

# Copiar llave privada
Copy-Item "C:\ruta\a\tu\llave-privada.pem" "$env:USERPROFILE\.ssh\oci_compute_key"

# Configurar permisos (solo para el usuario actual)
icacls "$env:USERPROFILE\.ssh\oci_compute_key" /inheritance:r
icacls "$env:USERPROFILE\.ssh\oci_compute_key" /grant:r "$env:USERNAME:R"
```

### 1.4 Conectarse vía SSH

#### Conexión Básica:

```bash
# Sintaxis básica
ssh -i ~/.ssh/oci_compute_key opc@<IP_PUBLICA>

# Ejemplo con IP real
ssh -i ~/.ssh/oci_compute_key opc@150.230.45.123
```

**Primera Conexión:**

La primera vez que te conectes, verás un mensaje de confirmación:

```
The authenticity of host '150.230.45.123 (150.230.45.123)' can't be established.
ECDSA key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
```

Escribe `yes` y presiona Enter.

#### Conexión con Configuración SSH (Recomendado):

Para evitar escribir la IP y la llave cada vez, crea un archivo de configuración:

```bash
# Editar archivo de configuración SSH
nano ~/.ssh/config
```

Agrega la siguiente configuración:

```
Host ueta-travel
    HostName 150.230.45.123
    User opc
    IdentityFile ~/.ssh/oci_compute_key
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Guarda el archivo (Ctrl+O, Enter, Ctrl+X) y ajusta permisos:

```bash
chmod 600 ~/.ssh/config
```

Ahora puedes conectarte simplemente con:

```bash
ssh ueta-travel
```

### 1.5 Verificar la Conexión y Navegar al Proyecto

```bash
# Conectarse
ssh ueta-travel

# Una vez conectado, verás el prompt:
[opc@ueta-travel-instance ~]$

# Navegar al directorio del proyecto
cd /home/opc/ueta-travel-access

# Verificar archivos del proyecto
ls -la

# Ver el estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs ueta-travel-access
```

### 1.6 Comandos Útiles Post-Conexión

```bash
# Ver información del sistema
uname -a
cat /etc/os-release

# Ver uso de recursos
htop  # o 'top' si htop no está instalado
df -h  # Espacio en disco
free -h  # Memoria RAM

# Ver procesos de Node.js
ps aux | grep node

# Verificar Nginx
sudo systemctl status nginx
sudo nginx -t  # Verificar configuración

# Ver logs del sistema
sudo journalctl -u nginx -n 50 --no-pager
sudo tail -f /var/log/messages
```

---

## 2. Acceso a la Aplicación desde Cualquier Dispositivo

### 2.1 URL de Acceso Público

Tu aplicación estará disponible en:

```
http://<IP_PUBLICA>:3000
```

**Ejemplo:**
```
http://150.230.45.123:3000
```

### 2.2 Configurar Dominio Personalizado (Opcional pero Recomendado)

#### Paso 1: Adquirir un Dominio

Opciones:
- **Namecheap**: ~$10-15/año
- **GoDaddy**: ~$12-20/año
- **Google Domains**: ~$12/año
- **Cloudflare**: ~$9/año (con protección DDoS incluida)

#### Paso 2: Configurar DNS

En tu proveedor de dominio, crea un registro tipo A:

```
Tipo: A
Nombre: @ (o www)
Valor: 150.230.45.123 (tu IP pública)
TTL: 3600
```

**Ejemplo para subdominios:**

```
Tipo: A
Nombre: app
Valor: 150.230.45.123
TTL: 3600
```

Esto permitirá acceder con: `http://app.tudominio.com`

#### Paso 3: Configurar Nginx para el Dominio

Conéctate vía SSH y edita la configuración de Nginx:

```bash
ssh ueta-travel
sudo nano /etc/nginx/conf.d/ueta-travel.conf
```

Contenido:

```nginx
server {
    listen 80;
    server_name app.tudominio.com;

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
    }
}
```

Reinicia Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 2.3 Configurar HTTPS con Let's Encrypt (SSL/TLS Gratuito)

```bash
# Instalar Certbot
sudo yum install -y certbot python3-certbot-nginx

# Obtener certificado SSL (automático)
sudo certbot --nginx -d app.tudominio.com

# Certbot preguntará:
# - Tu email (para notificaciones de renovación)
# - Aceptar términos de servicio
# - Si deseas redirigir HTTP a HTTPS (selecciona "2" para redirigir)

# Verificar renovación automática
sudo certbot renew --dry-run

# Programar renovación automática (ya viene configurado)
sudo systemctl status certbot-renew.timer
```

Ahora tu app estará disponible en:
```
https://app.tudominio.com
```

### 2.4 Abrir Puertos en Oracle Cloud (Security List)

Para que la aplicación sea accesible desde Internet, debes abrir los puertos:

#### Desde OCI Console:

1. Ve a **Menu → Networking → Virtual Cloud Networks**
2. Selecciona tu VCN (ejemplo: `ueta-travel-vcn`)
3. Click en **Security Lists** → Selecciona `Default Security List`
4. Click en **Add Ingress Rules**

**Regla para HTTP (Puerto 80):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 80
Description: HTTP traffic
```

**Regla para HTTPS (Puerto 443):**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 443
Description: HTTPS traffic
```

**Regla para Next.js Dev (Puerto 3000) - Solo para Testing:**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 3000
Description: Next.js application (temporary)
```

#### Desde Cloud Shell (CLI):

```bash
# Obtener OCID de la Security List
export VCN_OCID="ocid1.vcn.oc1.iad.xxxxxxxxxxxxx"

oci network security-list list \
  --compartment-id <COMPARTMENT_OCID> \
  --vcn-id $VCN_OCID \
  --query 'data[0].id' \
  --raw-output

export SECLIST_OCID="<security_list_ocid>"

# Agregar regla para HTTP
oci network security-list update \
  --security-list-id $SECLIST_OCID \
  --ingress-security-rules '[
    {
      "source": "0.0.0.0/0",
      "protocol": "6",
      "tcpOptions": {
        "destinationPortRange": {
          "min": 80,
          "max": 80
        }
      }
    }
  ]'
```

### 2.5 Configurar Firewall en la Instancia

```bash
# Conectarse vía SSH
ssh ueta-travel

# Verificar estado del firewall
sudo firewall-cmd --state

# Abrir puerto 80 (HTTP)
sudo firewall-cmd --permanent --add-port=80/tcp

# Abrir puerto 443 (HTTPS)
sudo firewall-cmd --permanent --add-port=443/tcp

# Abrir puerto 3000 (Next.js)
sudo firewall-cmd --permanent --add-port=3000/tcp

# Aplicar cambios
sudo firewall-cmd --reload

# Verificar reglas activas
sudo firewall-cmd --list-all
```

### 2.6 Acceso desde Diferentes Dispositivos

#### Desde Computadora (Navegador):

```
https://app.tudominio.com
```

#### Desde Smartphone/Tablet:

1. Abre el navegador (Chrome, Safari, Firefox)
2. Ingresa la URL: `https://app.tudominio.com`
3. La PWA se puede instalar:
   - **Android**: Chrome → Menu → "Agregar a pantalla de inicio"
   - **iOS**: Safari → Compartir → "Agregar a pantalla de inicio"

#### Desde Red Local (Mismo WiFi):

Si estás en la misma red que la instancia:
```
http://192.168.1.100:3000  (IP privada de la instancia)
```

---

## 3. Despliegue Automático con GitHub Actions

### 3.1 Arquitectura del Flujo CI/CD

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Developer  │─────▶│    GitHub    │─────▶│GitHub Actions│─────▶│Oracle Cloud  │
│              │ push │  Repository  │trigger│   Runner     │ SSH  │  Instance    │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │  Build & Test│
                                            │  Deploy      │
                                            │  Restart PM2 │
                                            └──────────────┘
```

### 3.2 Configurar SSH Key para GitHub Actions

#### Paso 1: Generar una Nueva Llave SSH (en tu máquina local)

```bash
# Generar llave específica para GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Esto crea dos archivos:
# - github_actions_deploy (privada)
# - github_actions_deploy.pub (pública)
```

#### Paso 2: Agregar la Llave Pública a la Instancia Oracle

```bash
# Copiar el contenido de la llave pública
cat ~/.ssh/github_actions_deploy.pub

# Conectarse a la instancia Oracle
ssh ueta-travel

# Agregar la llave pública al archivo authorized_keys
echo "ssh-ed25519 AAAAC3... github-actions-deploy" >> ~/.ssh/authorized_keys

# Verificar permisos
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

#### Paso 3: Agregar la Llave Privada a GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**

**Secret 1:**
```
Name: SSH_PRIVATE_KEY
Value: [Pega el contenido completo de ~/.ssh/github_actions_deploy]
```

**Secret 2:**
```
Name: SERVER_HOST
Value: 150.230.45.123  (tu IP pública)
```

**Secret 3:**
```
Name: SERVER_USER
Value: opc
```

**Secret 4 (Opcional - si usas variables de entorno):**
```
Name: ENV_FILE
Value: [Contenido de tu archivo .env.production]
```

### 3.3 Crear Workflow de GitHub Actions

Crea el archivo `.github/workflows/deploy.yml`:

```bash
# En tu proyecto local
mkdir -p .github/workflows
```

```yaml
name: Deploy to Oracle Cloud

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:  # Permite ejecución manual

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production

    - name: Run tests
      run: npm test --if-present

    - name: Setup SSH
      uses: webfactory/ssh-agent@v0.9.0
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

    - name: Add server to known hosts
      run: |
        mkdir -p ~/.ssh
        ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts

    - name: Deploy to Oracle Cloud
      run: |
        # Crear directorio temporal para el build
        ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "mkdir -p /tmp/ueta-build"

        # Copiar archivos necesarios
        rsync -avz --delete \
          --exclude 'node_modules' \
          --exclude '.git' \
          --exclude '.next/cache' \
          ./ ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:/tmp/ueta-build/

        # Ejecutar script de despliegue en el servidor
        ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'ENDSSH'
          set -e
          cd /tmp/ueta-build

          # Instalar dependencias
          npm ci --production

          # Build en el servidor
          npm run build

          # Backup del directorio actual
          BACKUP_DIR="/home/opc/backups/ueta-$(date +%Y%m%d-%H%M%S)"
          mkdir -p /home/opc/backups
          cp -r /home/opc/ueta-travel-access $BACKUP_DIR || true

          # Sincronizar archivos
          rsync -av --delete \
            --exclude 'node_modules' \
            --exclude '.env*' \
            /tmp/ueta-build/ /home/opc/ueta-travel-access/

          cd /home/opc/ueta-travel-access

          # Instalar dependencias de producción
          npm ci --production

          # Reiniciar aplicación con PM2
          pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js

          # Limpiar directorio temporal
          rm -rf /tmp/ueta-build

          # Mantener solo los últimos 5 backups
          cd /home/opc/backups
          ls -t | tail -n +6 | xargs -r rm -rf

          echo "Deployment completed successfully!"
        ENDSSH

    - name: Verify deployment
      run: |
        ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "pm2 status && pm2 logs ueta-travel-access --lines 20 --nostream"

    - name: Notify deployment status
      if: always()
      run: |
        if [ ${{ job.status }} == 'success' ]; then
          echo "✅ Deployment successful!"
        else
          echo "❌ Deployment failed!"
        fi

```

### 3.4 Workflow con Verificación de Salud (Health Check)

Para un despliegue más robusto, agrega verificación de salud:

```yaml
    - name: Health Check
      run: |
        max_attempts=10
        attempt=0

        while [ $attempt -lt $max_attempts ]; do
          echo "Health check attempt $((attempt+1))/$max_attempts..."

          response=$(curl -s -o /dev/null -w "%{http_code}" http://${{ secrets.SERVER_HOST }}:3000/api/health || echo "000")

          if [ "$response" = "200" ]; then
            echo "✅ Application is healthy!"
            exit 0
          fi

          attempt=$((attempt+1))
          sleep 10
        done

        echo "❌ Health check failed after $max_attempts attempts"
        exit 1
```

### 3.5 Crear Endpoint de Health Check

Crea el archivo `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db/oracle';

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const connection = await getConnection();
    await connection.execute('SELECT 1 FROM DUAL');
    await connection.close();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}
```

### 3.6 Workflow para Diferentes Ambientes

Si tienes staging y producción:

```yaml
name: Deploy Multi-Environment

on:
  push:
    branches:
      - develop   # Deploy to staging
      - main      # Deploy to production

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Set environment
      id: set-env
      run: |
        if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
          echo "environment=production" >> $GITHUB_OUTPUT
          echo "host=${{ secrets.PROD_HOST }}" >> $GITHUB_OUTPUT
        else
          echo "environment=staging" >> $GITHUB_OUTPUT
          echo "host=${{ secrets.STAGING_HOST }}" >> $GITHUB_OUTPUT
        fi

    - name: Deploy to ${{ steps.set-env.outputs.environment }}
      run: |
        echo "Deploying to ${{ steps.set-env.outputs.environment }}"
        # ... resto del despliegue
```

---

## 4. Scripts de Despliegue

### 4.1 Script de Despliegue Local

Crea `scripts/deploy-to-oracle.sh`:

```bash
#!/bin/bash

# Configuración
SERVER_HOST="150.230.45.123"
SERVER_USER="opc"
SSH_KEY="~/.ssh/oci_compute_key"
REMOTE_DIR="/home/opc/ueta-travel-access"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to Oracle Cloud...${NC}"

# Verificar que el build existe
if [ ! -d "$PROJECT_DIR/.next" ]; then
  echo -e "${YELLOW}⚠️  No build found. Running build...${NC}"
  npm run build

  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
  fi
fi

# Crear archivo temporal con la lista de archivos a transferir
echo -e "${GREEN}📦 Creating deployment package...${NC}"

cd "$PROJECT_DIR"

# Crear tarball excluyendo archivos innecesarios
tar -czf /tmp/ueta-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next/cache' \
  --exclude='*.log' \
  --exclude='.env.local' \
  .

# Transferir al servidor
echo -e "${GREEN}📤 Uploading to server...${NC}"
scp -i "$SSH_KEY" /tmp/ueta-deploy.tar.gz "$SERVER_USER@$SERVER_HOST:/tmp/"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Upload failed!${NC}"
  rm /tmp/ueta-deploy.tar.gz
  exit 1
fi

# Ejecutar despliegue en el servidor
echo -e "${GREEN}🔧 Deploying on server...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
  set -e

  # Backup actual
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  BACKUP_DIR="/home/opc/backups/ueta-$TIMESTAMP"

  echo "Creating backup at $BACKUP_DIR..."
  mkdir -p /home/opc/backups
  if [ -d "/home/opc/ueta-travel-access" ]; then
    cp -r /home/opc/ueta-travel-access "$BACKUP_DIR"
  fi

  # Extraer nuevo código
  echo "Extracting new code..."
  mkdir -p /home/opc/ueta-travel-access
  cd /home/opc/ueta-travel-access
  tar -xzf /tmp/ueta-deploy.tar.gz

  # Instalar dependencias
  echo "Installing dependencies..."
  npm ci --production

  # Reiniciar aplicación
  echo "Restarting application..."
  pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js

  # Limpiar
  rm /tmp/ueta-deploy.tar.gz

  # Mantener solo últimos 5 backups
  cd /home/opc/backups
  ls -t | tail -n +6 | xargs -r rm -rf

  echo "✅ Deployment completed successfully!"
ENDSSH

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  rm /tmp/ueta-deploy.tar.gz

  # Verificar estado
  echo -e "${GREEN}📊 Application status:${NC}"
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "pm2 status"
else
  echo -e "${RED}❌ Deployment failed!${NC}"
  rm /tmp/ueta-deploy.tar.gz
  exit 1
fi
```

Hazlo ejecutable:

```bash
chmod +x scripts/deploy-to-oracle.sh
```

### 4.2 Script de Rollback

Crea `scripts/rollback.sh`:

```bash
#!/bin/bash

SERVER_HOST="150.230.45.123"
SERVER_USER="opc"
SSH_KEY="~/.ssh/oci_compute_key"

echo "🔄 Available backups:"

# Listar backups disponibles
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "ls -lt /home/opc/backups | head -10"

echo ""
read -p "Enter backup directory name to restore (e.g., ueta-20251115-143022): " BACKUP_NAME

if [ -z "$BACKUP_NAME" ]; then
  echo "❌ No backup selected"
  exit 1
fi

echo "⚠️  This will restore from backup: $BACKUP_NAME"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled"
  exit 0
fi

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << ENDSSH
  set -e

  BACKUP_PATH="/home/opc/backups/$BACKUP_NAME"

  if [ ! -d "\$BACKUP_PATH" ]; then
    echo "❌ Backup not found: \$BACKUP_PATH"
    exit 1
  fi

  echo "📦 Restoring from \$BACKUP_PATH..."

  # Backup current state before rollback
  CURRENT_BACKUP="/home/opc/backups/pre-rollback-\$(date +%Y%m%d-%H%M%S)"
  cp -r /home/opc/ueta-travel-access "\$CURRENT_BACKUP"

  # Restore
  rm -rf /home/opc/ueta-travel-access
  cp -r "\$BACKUP_PATH" /home/opc/ueta-travel-access

  # Reinstall dependencies
  cd /home/opc/ueta-travel-access
  npm ci --production

  # Restart
  pm2 reload ecosystem.config.js

  echo "✅ Rollback completed!"
  echo "Current state backed up to: \$CURRENT_BACKUP"
ENDSSH
```

### 4.3 Script de Monitoreo Post-Despliegue

Crea `scripts/monitor-deploy.sh`:

```bash
#!/bin/bash

SERVER_HOST="150.230.45.123"
SERVER_USER="opc"
SSH_KEY="~/.ssh/oci_compute_key"

echo "📊 Monitoring deployment..."

# Verificar PM2
echo -e "\n🔹 PM2 Status:"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "pm2 status"

# Ver logs recientes
echo -e "\n🔹 Recent Logs:"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "pm2 logs ueta-travel-access --lines 30 --nostream"

# Health check
echo -e "\n🔹 Health Check:"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:3000/api/health")

if [ "$RESPONSE" = "200" ]; then
  echo "✅ Application is healthy (HTTP $RESPONSE)"
else
  echo "❌ Health check failed (HTTP $RESPONSE)"
fi

# Uso de recursos
echo -e "\n🔹 Resource Usage:"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
  echo "Memory:"
  free -h | grep Mem
  echo ""
  echo "Disk:"
  df -h | grep -E '(Filesystem|/$)'
  echo ""
  echo "CPU Load:"
  uptime
ENDSSH
```

### 4.4 Agregar Scripts a package.json

Edita `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "deploy": "./scripts/deploy-to-oracle.sh",
    "rollback": "./scripts/rollback.sh",
    "monitor": "./scripts/monitor-deploy.sh",
    "deploy:watch": "./scripts/deploy-to-oracle.sh && ./scripts/monitor-deploy.sh"
  }
}
```

Uso:

```bash
npm run deploy         # Desplegar a Oracle Cloud
npm run rollback       # Revertir a un backup anterior
npm run monitor        # Monitorear estado de la aplicación
npm run deploy:watch   # Desplegar y monitorear
```

---

## 5. Troubleshooting y Solución de Problemas

### 5.1 Problemas de Conexión SSH

#### Error: "Connection refused"

```bash
# Verificar que la instancia esté corriendo
oci compute instance list --query 'data[*].{Name:"display-name", State:"lifecycle-state"}' --output table

# Si está STOPPED, iniciarla
oci compute instance action --action START --instance-id <INSTANCE_OCID>
```

#### Error: "Permission denied (publickey)"

```bash
# Verificar permisos de la llave
ls -la ~/.ssh/oci_compute_key
# Debe mostrar: -rw------- (600)

# Corregir permisos
chmod 600 ~/.ssh/oci_compute_key

# Verificar que estás usando el usuario correcto (opc, no root)
ssh -i ~/.ssh/oci_compute_key opc@<IP>
```

#### Error: "Host key verification failed"

```bash
# Limpiar entrada antigua de known_hosts
ssh-keygen -R <IP_PUBLICA>

# Reconectar
ssh -i ~/.ssh/oci_compute_key opc@<IP>
```

### 5.2 Problemas de Acceso a la Aplicación

#### No se puede acceder desde navegador

```bash
# 1. Verificar que la app esté corriendo
ssh ueta-travel "pm2 status"

# 2. Verificar que escucha en el puerto correcto
ssh ueta-travel "netstat -tlnp | grep 3000"

# 3. Verificar Security List en OCI Console
# Menu → Networking → VCN → Security Lists → Ingress Rules
# Debe tener regla para puerto 80, 443, y 3000

# 4. Verificar firewall local
ssh ueta-travel "sudo firewall-cmd --list-all"

# 5. Probar desde el servidor
ssh ueta-travel "curl -I http://localhost:3000"
```

#### Error 502 Bad Gateway (Nginx)

```bash
# Ver logs de Nginx
ssh ueta-travel "sudo tail -f /var/log/nginx/error.log"

# Verificar configuración
ssh ueta-travel "sudo nginx -t"

# Reiniciar Nginx
ssh ueta-travel "sudo systemctl restart nginx"

# Verificar que Next.js esté corriendo
ssh ueta-travel "pm2 status"
```

### 5.3 Problemas de Despliegue con GitHub Actions

#### Error en GitHub Actions: "SSH connection failed"

1. Verificar que los secrets estén configurados:
   - `SSH_PRIVATE_KEY`
   - `SERVER_HOST`
   - `SERVER_USER`

2. Verificar formato de la llave privada en GitHub Secrets:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...contenido de la llave...
-----END OPENSSH PRIVATE KEY-----
```

3. Verificar que la llave pública esté en el servidor:
```bash
ssh ueta-travel "cat ~/.ssh/authorized_keys"
```

#### Build falla en GitHub Actions

Ver logs completos en GitHub:
- Ve a tu repositorio → Actions → Click en el workflow fallido
- Revisa cada paso para ver dónde falló

Errores comunes:
```bash
# Error de memoria al compilar
# Solución: Aumentar memoria del runner o compilar en el servidor

# Error de dependencias
# Solución: Limpiar caché y reinstalar
npm ci --force
```

### 5.4 Problemas de Base de Datos

#### Error: "Cannot connect to database"

```bash
# Verificar wallet en el servidor
ssh ueta-travel "ls -la /home/opc/wallet"

# Verificar variables de entorno
ssh ueta-travel "cat /home/opc/ueta-travel-access/.env.production | grep DB"

# Probar conexión manualmente
ssh ueta-travel
cd /home/opc/ueta-travel-access
node -e "
const oracledb = require('oracledb');
oracledb.initOracleClient({ configDir: '/home/opc/wallet' });
// ... test connection
"
```

### 5.5 Comandos de Diagnóstico Rápido

```bash
# Script de diagnóstico completo
ssh ueta-travel << 'EOF'
  echo "=== System Info ==="
  uname -a

  echo -e "\n=== PM2 Status ==="
  pm2 status

  echo -e "\n=== Recent Logs ==="
  pm2 logs --lines 20 --nostream

  echo -e "\n=== Nginx Status ==="
  sudo systemctl status nginx --no-pager

  echo -e "\n=== Ports Listening ==="
  sudo netstat -tlnp | grep -E ':(80|443|3000)'

  echo -e "\n=== Disk Usage ==="
  df -h

  echo -e "\n=== Memory Usage ==="
  free -h

  echo -e "\n=== CPU Load ==="
  uptime
EOF
```

---

## Resumen de URLs y Comandos Clave

### URLs de Acceso:

```
Development (local):
http://localhost:3000

Production (IP directa):
http://<IP_PUBLICA>:3000

Production (con dominio):
https://app.tudominio.com

Health Check:
https://app.tudominio.com/api/health

OCI Console:
https://cloud.oracle.com
```

### Comandos SSH Esenciales:

```bash
# Conectar
ssh -i ~/.ssh/oci_compute_key opc@<IP>

# o con alias configurado:
ssh ueta-travel

# Ver logs
ssh ueta-travel "pm2 logs ueta-travel-access"

# Reiniciar app
ssh ueta-travel "pm2 reload ueta-travel-access"

# Ver estado
ssh ueta-travel "pm2 status"
```

### Comandos de Despliegue:

```bash
# Despliegue manual
npm run deploy

# Con GitHub (automático al hacer push)
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main  # Dispara GitHub Actions automáticamente

# Rollback
npm run rollback

# Monitoreo
npm run monitor
```

---

## Checklist de Configuración Inicial

- [ ] Obtener IP pública de la instancia Oracle
- [ ] Configurar llave SSH local
- [ ] Conectarse vía SSH por primera vez
- [ ] Configurar Security List en OCI (puertos 80, 443, 3000)
- [ ] Configurar firewall en la instancia
- [ ] Instalar y configurar Nginx
- [ ] Configurar dominio (opcional)
- [ ] Instalar certificado SSL con Let's Encrypt
- [ ] Configurar PM2 para la aplicación
- [ ] Crear llaves SSH para GitHub Actions
- [ ] Configurar Secrets en GitHub
- [ ] Crear workflow de GitHub Actions
- [ ] Probar despliegue automático
- [ ] Configurar endpoint de health check
- [ ] Crear scripts de despliegue local
- [ ] Documentar y compartir URLs de acceso

---

**¡Felicidades!** Tu aplicación Ueta Travel Access ahora está completamente desplegada en Oracle Cloud con despliegue automático desde GitHub. 🎉

Para soporte adicional, consulta:
- [Documentación de OCI](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
