# Guía de Oracle Cloud Shell - Comandos Útiles

## Índice
1. [Introducción a Cloud Shell](#introducción-a-cloud-shell)
2. [Conexión y Configuración Inicial](#conexión-y-configuración-inicial)
3. [Gestión de Compute Instance](#gestión-de-compute-instance)
4. [Administración de Base de Datos](#administración-de-base-de-datos)
5. [Gestión de Object Storage](#gestión-de-object-storage)
6. [Deploy y Actualización de Aplicación](#deploy-y-actualización-de-aplicación)
7. [Monitoreo y Logs](#monitoreo-y-logs)
8. [Troubleshooting](#troubleshooting)
9. [Scripts Útiles](#scripts-útiles)

---

## Introducción a Cloud Shell

### ¿Qué es Oracle Cloud Shell?

Oracle Cloud Shell es una terminal basada en navegador que proporciona:
- ✅ Acceso directo a OCI CLI preconfigurado
- ✅ Almacenamiento persistente de 5 GB en `$HOME`
- ✅ Herramientas preinstaladas (git, kubectl, terraform, ansible)
- ✅ No requiere instalación local
- ✅ Totalmente gratuito

### Acceder a Cloud Shell

1. Inicia sesión en [cloud.oracle.com](https://cloud.oracle.com)
2. Click en el ícono de terminal `>_` en la parte superior derecha
3. Espera 30-60 segundos mientras se inicia la sesión

### Información del Entorno

```bash
# Ver información del sistema
cat /etc/os-release

# Output:
# NAME="Oracle Linux Server"
# VERSION="7.9"

# Ver herramientas disponibles
oci --version        # OCI CLI
git --version        # Git
node --version       # Node.js
python3 --version    # Python 3
```

---

## Conexión y Configuración Inicial

### Configurar OCI CLI

```bash
# Listar compartments disponibles
oci iam compartment list --all

# Exportar OCID del compartment para uso frecuente
export COMPARTMENT_ID="ocid1.compartment.oc1..aaaaaaa..."

# Guardar en .bashrc para persistencia
echo 'export COMPARTMENT_ID="ocid1.compartment.oc1..aaaaaaa..."' >> ~/.bashrc
source ~/.bashrc
```

### Obtener OCIDs Importantes

```bash
# Listar todas las Autonomous Databases
oci db autonomous-database list \
  --compartment-id $COMPARTMENT_ID \
  --query 'data[*].{Name:"display-name",OCID:id,State:"lifecycle-state"}' \
  --output table

# Listar Compute Instances
oci compute instance list \
  --compartment-id $COMPARTMENT_ID \
  --query 'data[*].{Name:"display-name",OCID:id,State:"lifecycle-state"}' \
  --output table

# Guardar OCIDs en variables
export DB_OCID="ocid1.autonomousdatabase.oc1.sa-bogota-1.xxxxx"
export INSTANCE_OCID="ocid1.instance.oc1.sa-bogota-1.xxxxx"
export BUCKET_NAME="ueta-travel-images"
```

---

## Gestión de Compute Instance

### SSH a la Instancia

```bash
# Generar par de llaves SSH (solo primera vez)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/oci_compute_key -N ""

# Copiar llave pública
cat ~/.ssh/oci_compute_key.pub

# Añadir llave pública a la instancia (en OCI Console)

# Conectar por SSH
ssh -i ~/.ssh/oci_compute_key opc@<INSTANCE_PUBLIC_IP>
```

### Obtener IP Pública de la Instancia

```bash
# Método 1: OCI CLI
oci compute instance list-vnics \
  --instance-id $INSTANCE_OCID \
  --query 'data[0]."public-ip"' \
  --raw-output

# Método 2: Guardar en variable
PUBLIC_IP=$(oci compute instance list-vnics \
  --instance-id $INSTANCE_OCID \
  --query 'data[0]."public-ip"' \
  --raw-output)

echo "IP Pública: $PUBLIC_IP"

# SSH usando la variable
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP
```

### Gestión del Estado de la Instancia

```bash
# Ver estado actual
oci compute instance get \
  --instance-id $INSTANCE_OCID \
  --query 'data."lifecycle-state"'

# Detener instancia
oci compute instance action \
  --instance-id $INSTANCE_OCID \
  --action STOP

# Iniciar instancia
oci compute instance action \
  --instance-id $INSTANCE_OCID \
  --action START

# Reiniciar instancia
oci compute instance action \
  --instance-id $INSTANCE_OCID \
  --action RESET

# Ver métricas de CPU
oci monitoring metric-data summarize-metrics-data \
  --namespace oci_computeagent \
  --query-text 'CpuUtilization[1m]{resourceId = "'$INSTANCE_OCID'"}' \
  --start-time "2025-11-14T00:00:00Z" \
  --end-time "2025-11-14T23:59:59Z"
```

---

## Administración de Base de Datos

### Conexión a Autonomous Database

```bash
# Descargar Wallet
oci db autonomous-database generate-wallet \
  --autonomous-database-id $DB_OCID \
  --file ~/wallet.zip \
  --password "WalletPassword123!"

# Descomprimir wallet
unzip ~/wallet.zip -d ~/wallet

# Conectar usando SQLcl (preinstalado en Cloud Shell)
sql admin/<DB_PASSWORD>@uetatraveldb_tp
```

### Ejecutar Queries SQL

```bash
# Método 1: SQLcl interactivo
sql admin/<PASSWORD>@uetatraveldb_tp

SQL> SELECT table_name FROM user_tables;
SQL> SELECT COUNT(*) FROM orders;
SQL> exit

# Método 2: Ejecutar desde archivo
cat > query.sql << 'EOF'
SELECT
    COUNT(*) as total_orders,
    SUM(total) as total_revenue
FROM orders
WHERE status = 'completed';
EOF

sql admin/<PASSWORD>@uetatraveldb_tp @query.sql

# Método 3: Comando inline
echo "SELECT COUNT(*) FROM products;" | sql -s admin/<PASSWORD>@uetatraveldb_tp
```

### Gestión del Estado de la Base de Datos

```bash
# Ver estado
oci db autonomous-database get \
  --autonomous-database-id $DB_OCID \
  --query 'data."lifecycle-state"'

# Detener base de datos (ahorra costos)
oci db autonomous-database stop \
  --autonomous-database-id $DB_OCID

# Iniciar base de datos
oci db autonomous-database start \
  --autonomous-database-id $DB_OCID

# Escalar OCPU (1 a 3)
oci db autonomous-database update \
  --autonomous-database-id $DB_OCID \
  --cpu-core-count 2

# Crear backup manual
oci db autonomous-database create-backup \
  --autonomous-database-id $DB_OCID \
  --display-name "backup-manual-20251114"

# Listar backups
oci db autonomous-database-backup list \
  --autonomous-database-id $DB_OCID \
  --query 'data[*].{Name:"display-name",Date:"time-started",State:"lifecycle-state"}' \
  --output table
```

### Ejecutar Scripts SQL

```bash
# Ejecutar script de migración
sql admin/<PASSWORD>@uetatraveldb_tp @scripts/01-create-tables.sql

# Ejecutar múltiples scripts
for script in scripts/*.sql; do
    echo "Ejecutando: $script"
    sql admin/<PASSWORD>@uetatraveldb_tp @$script
done

# Exportar datos a CSV
echo "SELECT * FROM products;" | \
  sql -s admin/<PASSWORD>@uetatraveldb_tp | \
  sed 's/|/,/g' > products.csv
```

---

## Gestión de Object Storage

### Listar Objetos

```bash
# Listar buckets
oci os bucket list \
  --compartment-id $COMPARTMENT_ID \
  --query 'data[*].name'

# Listar objetos en bucket
oci os object list \
  --bucket-name $BUCKET_NAME \
  --query 'data[*].name'

# Listar con detalles
oci os object list \
  --bucket-name $BUCKET_NAME \
  --query 'data[*].{Name:name,Size:size,Modified:"time-modified"}' \
  --output table

# Contar objetos
oci os object list \
  --bucket-name $BUCKET_NAME \
  --query 'length(data)'
```

### Subir y Descargar Archivos

```bash
# Subir archivo
oci os object put \
  --bucket-name $BUCKET_NAME \
  --file imagen.jpg \
  --name products/producto-001.jpg

# Subir con metadata
oci os object put \
  --bucket-name $BUCKET_NAME \
  --file imagen.jpg \
  --name products/producto-001.jpg \
  --metadata '{"product-id":"prod-001","uploaded-by":"admin"}'

# Descargar archivo
oci os object get \
  --bucket-name $BUCKET_NAME \
  --name products/producto-001.jpg \
  --file downloaded.jpg

# Bulk upload (directorio completo)
oci os object bulk-upload \
  --bucket-name $BUCKET_NAME \
  --src-dir ./images/ \
  --object-prefix products/

# Bulk download
oci os object bulk-download \
  --bucket-name $BUCKET_NAME \
  --download-dir ./downloads/ \
  --prefix products/
```

### Gestión de Pre-Authenticated Requests (PAR)

```bash
# Crear PAR (24 horas)
PAR_URL=$(oci os preauth-request create \
  --bucket-name $BUCKET_NAME \
  --name "par-$(date +%Y%m%d-%H%M%S)" \
  --access-type ObjectRead \
  --object-name products/producto-001.jpg \
  --time-expires "$(date -d '+1 day' -u +%Y-%m-%dT%H:%M:%SZ)" \
  --query 'data."access-uri"' \
  --raw-output)

echo "URL temporal: https://objectstorage.sa-bogota-1.oraclecloud.com$PAR_URL"

# Listar PARs activos
oci os preauth-request list \
  --bucket-name $BUCKET_NAME \
  --query 'data[*].{Name:name,Object:"object-name",Expires:"time-expires"}' \
  --output table

# Eliminar PAR
oci os preauth-request delete \
  --bucket-name $BUCKET_NAME \
  --par-id <PAR_OCID>
```

### Sincronización de Archivos

```bash
# Script de sincronización
cat > sync_images.sh << 'EOF'
#!/bin/bash
BUCKET_NAME="ueta-travel-images"
LOCAL_DIR="./public/images"
REMOTE_PREFIX="products/"

# Subir archivos nuevos o modificados
for file in $LOCAL_DIR/*; do
    filename=$(basename "$file")
    oci os object put \
        --bucket-name $BUCKET_NAME \
        --file "$file" \
        --name "${REMOTE_PREFIX}${filename}" \
        --force
done

echo "Sincronización completada"
EOF

chmod +x sync_images.sh
./sync_images.sh
```

---

## Deploy y Actualización de Aplicación

### Clonar Repositorio

```bash
# Primera vez
cd ~
git clone https://github.com/tu-usuario/ueta-travel-access.git
cd ueta-travel-access

# Configurar credenciales
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Deploy a Compute Instance

```bash
# 1. Construir aplicación localmente en Cloud Shell
npm install
npm run build

# 2. Comprimir archivos
tar -czf build.tar.gz \
    .next \
    node_modules \
    package.json \
    package-lock.json \
    ecosystem.config.js \
    public

# 3. Transferir a instancia
scp -i ~/.ssh/oci_compute_key build.tar.gz opc@$PUBLIC_IP:~/

# 4. SSH a instancia y desplegar
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP << 'ENDSSH'
cd /home/opc/ueta-travel-access

# Backup de versión anterior
if [ -d ".next" ]; then
    tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .next
fi

# Extraer nueva versión
tar -xzf ~/build.tar.gz

# Reiniciar aplicación
pm2 reload ecosystem.config.js

# Verificar estado
pm2 status
pm2 logs --lines 50

exit
ENDSSH

echo "Deploy completado"
```

### Script de Deploy Automatizado

```bash
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

PUBLIC_IP=$(oci compute instance list-vnics \
  --instance-id $INSTANCE_OCID \
  --query 'data[0]."public-ip"' \
  --raw-output)

echo "📦 Construyendo aplicación..."
npm run build

echo "📤 Comprimiendo archivos..."
tar -czf build.tar.gz .next node_modules package*.json ecosystem.config.js public

echo "🚀 Transfiriendo a servidor..."
scp -i ~/.ssh/oci_compute_key build.tar.gz opc@$PUBLIC_IP:~/

echo "🔄 Desplegando en servidor..."
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP << 'ENDSSH'
    cd /home/opc/ueta-travel-access

    # Crear backup
    [ -d ".next" ] && tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .next

    # Extraer y reiniciar
    tar -xzf ~/build.tar.gz
    pm2 reload ecosystem.config.js

    # Limpiar
    rm ~/build.tar.gz
ENDSSH

echo "✅ Deploy completado exitosamente"
echo "🌐 Verificar en: https://$PUBLIC_IP"
EOF

chmod +x deploy.sh
```

### Actualización Rápida (Hot Reload)

```bash
# Solo actualizar código (sin reinstalar dependencias)
cat > quick-update.sh << 'EOF'
#!/bin/bash
PUBLIC_IP=$(oci compute instance list-vnics \
  --instance-id $INSTANCE_OCID \
  --query 'data[0]."public-ip"' \
  --raw-output)

# Solo código fuente
rsync -avz -e "ssh -i ~/.ssh/oci_compute_key" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    ./ opc@$PUBLIC_IP:/home/opc/ueta-travel-access/

ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP \
    "cd /home/opc/ueta-travel-access && npm run build && pm2 reload ecosystem.config.js"
EOF

chmod +x quick-update.sh
```

### Rollback a Versión Anterior

```bash
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP << 'ENDSSH'
cd /home/opc/ueta-travel-access

# Listar backups disponibles
ls -lt backup-*.tar.gz | head -5

# Restaurar último backup
LATEST_BACKUP=$(ls -t backup-*.tar.gz | head -1)
echo "Restaurando: $LATEST_BACKUP"

tar -xzf $LATEST_BACKUP
pm2 reload ecosystem.config.js

echo "Rollback completado"
ENDSSH
```

---

## Monitoreo y Logs

### Ver Logs de Aplicación

```bash
# Ver logs en tiempo real
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "pm2 logs --lines 100"

# Ver logs de errores
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "pm2 logs --err --lines 50"

# Ver logs específicos
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP \
    "tail -f /var/log/ueta-travel/error.log"

# Descargar logs
scp -i ~/.ssh/oci_compute_key \
    opc@$PUBLIC_IP:/var/log/ueta-travel/error.log \
    ./error.log
```

### Monitoreo de Recursos

```bash
# CPU y Memoria en tiempo real
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "top -b -n 1 | head -20"

# Uso de disco
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "df -h"

# Procesos Node.js
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "ps aux | grep node"

# Conexiones activas
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "netstat -an | grep :3000 | wc -l"

# PM2 status
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "pm2 status"
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "pm2 monit"
```

### Métricas con OCI Monitoring

```bash
# CPU Utilization (últimas 24 horas)
oci monitoring metric-data summarize-metrics-data \
  --namespace oci_computeagent \
  --query-text 'CpuUtilization[1m]{resourceId = "'$INSTANCE_OCID'"}' \
  --start-time "$(date -d '24 hours ago' -u +%Y-%m-%dT%H:%M:%SZ)" \
  --end-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Memory Utilization
oci monitoring metric-data summarize-metrics-data \
  --namespace oci_computeagent \
  --query-text 'MemoryUtilization[1m]{resourceId = "'$INSTANCE_OCID'"}' \
  --start-time "$(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ)" \
  --end-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Database CPU
oci monitoring metric-data summarize-metrics-data \
  --namespace oci_autonomous_database \
  --query-text 'CpuUtilization[1m]{resourceId = "'$DB_OCID'"}' \
  --start-time "$(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ)" \
  --end-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

---

## Troubleshooting

### Problemas Comunes

#### 1. Aplicación No Responde

```bash
# Verificar si PM2 está corriendo
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "pm2 status"

# Reiniciar PM2
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "pm2 restart all"

# Si no ayuda, reiniciar instancia completa
oci compute instance action \
  --instance-id $INSTANCE_OCID \
  --action RESET
```

#### 2. Base de Datos No Conecta

```bash
# Verificar estado de BD
oci db autonomous-database get \
  --autonomous-database-id $DB_OCID \
  --query 'data."lifecycle-state"'

# Si está detenida, iniciar
oci db autonomous-database start \
  --autonomous-database-id $DB_OCID

# Probar conexión
sql admin/<PASSWORD>@uetatraveldb_tp <<< "SELECT 1 FROM DUAL;"
```

#### 3. Error 502 Bad Gateway

```bash
# Verificar Nginx
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "sudo systemctl status nginx"

# Ver logs de Nginx
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP \
    "sudo tail -f /var/log/nginx/error.log"

# Reiniciar Nginx
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP \
    "sudo systemctl restart nginx"
```

#### 4. Disco Lleno

```bash
# Ver uso de disco
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "df -h"

# Limpiar logs antiguos
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP << 'ENDSSH'
# Limpiar PM2 logs
pm2 flush

# Limpiar backups antiguos (mantener últimos 5)
cd /home/opc/ueta-travel-access
ls -t backup-*.tar.gz | tail -n +6 | xargs -r rm

# Limpiar cache de npm
npm cache clean --force
ENDSSH
```

### Health Check Script

```bash
cat > healthcheck.sh << 'EOF'
#!/bin/bash
echo "🏥 Ueta Travel Health Check"
echo "=============================="

# 1. Compute Instance
echo -n "✓ Compute Instance: "
STATE=$(oci compute instance get --instance-id $INSTANCE_OCID --query 'data."lifecycle-state"' --raw-output)
echo $STATE

# 2. Database
echo -n "✓ Database: "
DB_STATE=$(oci db autonomous-database get --autonomous-database-id $DB_OCID --query 'data."lifecycle-state"' --raw-output)
echo $DB_STATE

# 3. Application
echo -n "✓ Application HTTP: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$PUBLIC_IP)
echo $HTTP_CODE

# 4. PM2 Status
echo "✓ PM2 Processes:"
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "pm2 jlist" | \
    jq -r '.[] | "\(.name): \(.pm2_env.status)"'

# 5. Disk Space
echo "✓ Disk Usage:"
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "df -h | grep -E '(Filesystem|/dev/sda)'"

echo "=============================="
echo "✅ Health Check Completado"
EOF

chmod +x healthcheck.sh
./healthcheck.sh
```

---

## Scripts Útiles

### 1. Backup Completo

```bash
cat > full-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup-$BACKUP_DATE"

echo "📦 Iniciando backup completo..."

# 1. Backup de Base de Datos
echo "1️⃣ Backup de Base de Datos..."
oci db autonomous-database create-backup \
  --autonomous-database-id $DB_OCID \
  --display-name "auto-backup-$BACKUP_DATE"

# 2. Backup de Object Storage
echo "2️⃣ Backup de Object Storage..."
mkdir -p $BACKUP_DIR/object-storage
oci os object bulk-download \
  --bucket-name $BUCKET_NAME \
  --download-dir $BACKUP_DIR/object-storage/

# 3. Backup de Aplicación
echo "3️⃣ Backup de Aplicación..."
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP \
    "cd /home/opc/ueta-travel-access && tar -czf app-backup-$BACKUP_DATE.tar.gz ."

scp -i ~/.ssh/oci_compute_key \
    opc@$PUBLIC_IP:/home/opc/ueta-travel-access/app-backup-$BACKUP_DATE.tar.gz \
    $BACKUP_DIR/

# 4. Comprimir todo
echo "4️⃣ Comprimiendo backup..."
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "✅ Backup completado: $BACKUP_DIR.tar.gz"
EOF

chmod +x full-backup.sh
```

### 2. Limpieza de Recursos

```bash
cat > cleanup.sh << 'EOF'
#!/bin/bash
echo "🧹 Limpiando recursos..."

# Limpiar Object Storage (archivos temp > 7 días)
echo "1️⃣ Limpiando Object Storage..."
SEVEN_DAYS_AGO=$(date -d '7 days ago' -u +%Y-%m-%dT%H:%M:%SZ)

oci os object list \
  --bucket-name $BUCKET_NAME \
  --prefix temp/ \
  --query "data[?\"time-modified\" < '$SEVEN_DAYS_AGO'].name" \
  --raw-output | \
  while read object; do
    echo "Eliminando: $object"
    oci os object delete --bucket-name $BUCKET_NAME --object-name "$object" --force
  done

# Limpiar backups antiguos de BD (mantener últimos 10)
echo "2️⃣ Limpiando backups antiguos..."
oci db autonomous-database-backup list \
  --autonomous-database-id $DB_OCID \
  --sort-by TIMECREATED \
  --sort-order DESC \
  --query 'data[10:].id' \
  --raw-output | \
  while read backup_id; do
    echo "Eliminando backup: $backup_id"
    oci db autonomous-database-backup delete --autonomous-database-backup-id "$backup_id" --force
  done

echo "✅ Limpieza completada"
EOF

chmod +x cleanup.sh
```

### 3. Monitor de Costos

```bash
cat > cost-monitor.sh << 'EOF'
#!/bin/bash
echo "💰 Monitor de Costos - Ueta Travel"
echo "===================================="

# Fecha actual y mes anterior
START_DATE=$(date -d '1 month ago' +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

# Obtener costos por servicio
oci usage api usage-summary list \
  --compartment-id $COMPARTMENT_ID \
  --time-usage-started $START_DATE \
  --time-usage-ended $END_DATE \
  --query 'data.items[*].{Service:"service",Cost:"computed-amount"}' \
  --output table

echo "===================================="
echo "📊 Reporte generado: $(date)"
EOF

chmod +x cost-monitor.sh
```

---

## Comandos de Referencia Rápida

### Cheat Sheet

```bash
# === COMPUTE ===
# Listar instancias
oci compute instance list -c $COMPARTMENT_ID

# Obtener IP pública
oci compute instance list-vnics --instance-id $INSTANCE_OCID --query 'data[0]."public-ip"'

# Detener/Iniciar
oci compute instance action --instance-id $INSTANCE_OCID --action STOP|START|RESET

# === DATABASE ===
# Estado de BD
oci db autonomous-database get --autonomous-database-id $DB_OCID

# Crear backup
oci db autonomous-database create-backup --autonomous-database-id $DB_OCID --display-name "backup-name"

# Conectar SQL
sql admin/<PASSWORD>@uetatraveldb_tp

# === OBJECT STORAGE ===
# Listar buckets
oci os bucket list -c $COMPARTMENT_ID

# Subir archivo
oci os object put --bucket-name $BUCKET_NAME --file imagen.jpg --name path/imagen.jpg

# Descargar archivo
oci os object get --bucket-name $BUCKET_NAME --name path/imagen.jpg --file imagen.jpg

# === DEPLOY ===
# SSH
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP

# Transferir archivo
scp -i ~/.ssh/oci_compute_key file.txt opc@$PUBLIC_IP:~/

# PM2 (en instancia)
pm2 status
pm2 restart all
pm2 logs
pm2 monit

# === LOGS ===
# Ver logs aplicación
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "pm2 logs --lines 100"

# Ver logs Nginx
ssh -i ~/.ssh/oci_compute_key opc@$PUBLIC_IP "sudo tail -f /var/log/nginx/error.log"
```

---

**Última actualización**: 14 de Noviembre, 2025
**Versión**: 1.7
**Entorno**: Oracle Cloud Shell
