# Configuración de Oracle Autonomous Database

Este documento te guía paso a paso para configurar Oracle Autonomous Database con tu aplicación Ueta Travel Access.

## Paso 1: Crear Autonomous Database en Oracle Cloud

1. Inicia sesión en [Oracle Cloud Console](https://cloud.oracle.com)
2. Ve a **Menú** → **Oracle Database** → **Autonomous Database**
3. Click en **"Create Autonomous Database"**
4. Configura los siguientes parámetros:

   - **Display name**: `ueta-travel-db`
   - **Database name**: `uetatraveldb`
   - **Workload type**: Transaction Processing
   - **Deployment type**: Serverless
   - **Database version**: 19c o 23ai (recomendado)
   - **OCPU count**: 1 (Always Free si aplica)
   - **Storage (TB)**: 0.02 (20 GB - Always Free si aplica)
   - **Auto scaling**: Habilitado (opcional)
   - **Password**: Crea una contraseña segura para el usuario ADMIN
     - Ejemplo: `MySecureP@ssw0rd123`
     - **GUARDA ESTA CONTRASEÑA** - la necesitarás más tarde
   - **Access type**: Secure access from everywhere
   - **License type**: License Included

5. Click **"Create Autonomous Database"**
6. Espera aproximadamente 2-3 minutos hasta que el estado cambie a **AVAILABLE** (verde)

## Paso 2: Descargar el Wallet de Conexión

1. En la página de detalles de tu Autonomous Database, click en **"Database Connection"**
2. Click en **"Download Wallet"**
3. Crea un password para el wallet (puede ser diferente del password de ADMIN)
   - **GUARDA ESTE PASSWORD** - lo necesitarás en el archivo `.env`
4. Click **"Download"** y guarda el archivo `Wallet_uetatraveldb.zip`

## Paso 3: Extraer y Configurar el Wallet

### En tu máquina local:

```bash
# 1. Crear carpeta para el wallet en el proyecto
cd ~/projects/ueta-travel-acces/Ueta-Travel-Access
mkdir wallet

# 2. Extraer el wallet
unzip ~/Downloads/Wallet_uetatraveldb.zip -d wallet/

# 3. Verificar que se extrajeron los archivos
ls wallet/
# Deberías ver: cwallet.sso, ewallet.p12, keystore.jks, ojdbc.properties, sqlnet.ora, tnsnames.ora, truststore.jks
```

## Paso 4: Obtener el Connection String

1. Abre el archivo `wallet/tnsnames.ora`
2. Busca la línea que contiene tu nombre de base de datos, algo como:

```
uetatraveldb_high = (description= (retry_count=20)(retry_delay=3)...
```

3. Copia el nombre del servicio (ejemplo: `uetatraveldb_high`)
   - `_high`: Máxima prioridad, mejor para transacciones
   - `_medium`: Prioridad media
   - `_low`: Prioridad baja, mejor para reportes

## Paso 5: Configurar Variables de Entorno

### En desarrollo local:

```bash
# Crear archivo .env.local
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Oracle Autonomous Database Configuration
DB_USER=ADMIN
DB_PASSWORD=MySecureP@ssw0rd123  # La contraseña de ADMIN que creaste
DB_CONNECT_STRING=uetatraveldb_high  # El nombre del servicio del tnsnames.ora

# Wallet Configuration
WALLET_LOCATION=/absolute/path/to/your/project/wallet
WALLET_PASSWORD=tu_password_del_wallet

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**IMPORTANTE**: Reemplaza `/absolute/path/to/your/project/wallet` con la ruta absoluta a tu carpeta wallet.

Ejemplo:
```
WALLET_LOCATION=/home/angel-nereira/projects/ueta-travel-acces/Ueta-Travel-Access/wallet
```

## Paso 6: Ejecutar el Schema SQL

Hay dos formas de ejecutar el schema:

### Opción A: Desde Oracle Cloud Console (Recomendado para principiantes)

1. Ve a tu Autonomous Database en Oracle Cloud Console
2. Click en **"Database Actions"** → **"SQL"**
3. Inicia sesión con el usuario **ADMIN** y tu contraseña
4. Copia y pega el contenido del archivo `lib/db/schema.sql`
5. Click en el botón **"Run Script"** (play verde)
6. Verifica que todas las tablas se crearon correctamente

### Opción B: Desde SQL*Plus o SQL Developer (Avanzado)

```bash
sqlplus admin@uetatraveldb_high
# Ingresa tu contraseña de ADMIN

SQL> @lib/db/schema.sql
```

## Paso 7: Verificar la Conexión

```bash
# Inicia el servidor de desarrollo
npm run dev

# Abre tu navegador y ve a:
http://localhost:3000/api/health
```

Deberías ver una respuesta como:

```json
{
  "success": true,
  "database": "connected",
  "data": {
    "MESSAGE": "Database connection successful!",
    "SERVER_TIME": "2025-11-14T17:45:00.000Z"
  },
  "timestamp": "2025-11-14T17:45:00.123Z"
}
```

## Paso 8: Desplegar en Producción

### Configurar en el servidor Oracle Cloud:

```bash
# 1. Conectarse al servidor
ssh oracle-ueta

# 2. Subir el wallet al servidor (desde tu máquina local)
# En tu máquina local:
scp -r wallet/ oracle-ueta:~/Ueta-Travel-Access/

# 3. En el servidor, crear archivo .env
ssh oracle-ueta
cd ~/Ueta-Travel-Access
nano .env
```

Agrega las siguientes variables en `.env`:

```env
DB_USER=ADMIN
DB_PASSWORD=MySecureP@ssw0rd123
DB_CONNECT_STRING=uetatraveldb_high
WALLET_LOCATION=/home/opc/Ueta-Travel-Access/wallet
WALLET_PASSWORD=tu_password_del_wallet
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://149.130.188.231:3000
```

```bash
# 4. Instalar Oracle Instant Client en el servidor
sudo dnf install -y oracle-instantclient-release-el9
sudo dnf install -y oracle-instantclient-basic

# 5. Actualizar dependencias e rebuil
d npm install
npm run build

# 6. Reiniciar la aplicación
pm2 restart ueta-travel-access
pm2 save

# 7. Verificar que funciona
curl http://149.130.188.231:3000/api/health
```

## Endpoints API Disponibles

Una vez configurado, tendrás estos endpoints:

- `GET /api/health` - Verificar conexión a la base de datos
- `GET /api/products` - Listar productos
- `GET /api/products?category=paquetes-viaje` - Filtrar por categoría
- `GET /api/products?featured=true` - Productos destacados
- `GET /api/products/[id]` - Obtener producto por ID o slug
- `POST /api/products` - Crear producto
- `PUT /api/products/[id]` - Actualizar producto
- `DELETE /api/products/[id]` - Eliminar producto (soft delete)

## Solución de Problemas

### Error: "DPI-1047: Cannot locate a 64-bit Oracle Client library"

Necesitas instalar Oracle Instant Client:

**En Ubuntu/Debian:**
```bash
sudo apt-get install alien libaio1
wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-21.12.0.0.0dbru.zip
unzip instantclient-basic-linux.x64-21.12.0.0.0dbru.zip
sudo mv instantclient_21_12 /opt/oracle/
echo "/opt/oracle/instantclient_21_12" | sudo tee /etc/ld.so.conf.d/oracle-instantclient.conf
sudo ldconfig
```

**En Oracle Linux:**
```bash
sudo dnf install -y oracle-instantclient-release-el9
sudo dnf install -y oracle-instantclient-basic
```

### Error: "NJS-516: connection pool is not open"

Verifica que las variables de entorno estén configuradas correctamente y reinicia el servidor.

### Error de autenticación

Verifica que la contraseña de ADMIN y el WALLET_PASSWORD sean correctos en tu archivo `.env`.

## Recursos Adicionales

- [Oracle node-oracledb Documentation](https://node-oracledb.readthedocs.io/)
- [Oracle Autonomous Database Documentation](https://docs.oracle.com/en/cloud/paas/autonomous-database/)
- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
