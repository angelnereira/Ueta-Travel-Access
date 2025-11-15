# Guía de Integración con Oracle Cloud Infrastructure (OCI)

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura en OCI](#arquitectura-en-oci)
3. [Autonomous Database](#autonomous-database)
4. [Object Storage](#object-storage)
5. [Compute Instance](#compute-instance)
6. [Networking](#networking)
7. [Seguridad](#seguridad)
8. [Monitoreo y Logs](#monitoreo-y-logs)
9. [Backup y Recuperación](#backup-y-recuperación)
10. [Costos y Optimización](#costos-y-optimización)

---

## Visión General

### Servicios de OCI Utilizados

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│            ORACLE CLOUD INFRASTRUCTURE              │
│                                                     │
│  ┌──────────────┐      ┌──────────────┐           │
│  │  Compute     │      │  Autonomous  │           │
│  │  Instance    │◄────►│  Database    │           │
│  │  (Next.js)   │      │  (ATP 19c)   │           │
│  └──────┬───────┘      └──────────────┘           │
│         │                                          │
│         │                                          │
│         ▼                                          │
│  ┌──────────────┐      ┌──────────────┐           │
│  │  Object      │      │  Virtual     │           │
│  │  Storage     │      │  Cloud       │           │
│  │  (Images)    │      │  Network     │           │
│  └──────────────┘      └──────────────┘           │
│                                                     │
│  ┌──────────────┐      ┌──────────────┐           │
│  │  API         │      │  Logging     │           │
│  │  Gateway     │      │  Service     │           │
│  └──────────────┘      └──────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Región y Disponibilidad
- **Región Principal**: `sa-bogota-1` (Bogotá, Colombia)
- **Zonas de Disponibilidad**: 1 AD (Availability Domain)
- **Latencia**: <10ms dentro de la región

---

## Autonomous Database

### Configuración Actual

**Nombre**: `ueta-travel-db`
**Tipo**: ATP (Autonomous Transaction Processing)
**Versión**: Oracle Database 19c Enterprise Edition
**Workload**: OLTP (Online Transaction Processing)

#### Especificaciones

```yaml
Deployment:
  Type: Shared Infrastructure
  OCPU Count: 1
  Storage: 1 TB
  Auto Scaling: Enabled

Network:
  Access Type: Secure access from everywhere
  TLS: Mutual TLS (mTLS) required
  Wallet: Instance Wallet

Backup:
  Automatic: Enabled
  Retention: 60 days
  Point-in-time Recovery: Enabled
```

### Connection String

```bash
# Formato de conexión
(description=(retry_count=20)(retry_delay=3)
  (address=(protocol=tcps)(port=1522)
    (host=adb.sa-bogota-1.oraclecloud.com))
  (connect_data=(service_name=xxxxx_uetatraveldb_tp.adb.oraclecloud.com))
  (security=(ssl_server_dn_match=yes)))
```

### Wallet Configuration

**Ubicación**: `~/wallets/ueta-travel-db/`

**Archivos del Wallet**:
```
cwallet.sso          # Auto-login wallet
ewallet.p12          # PKCS12 wallet
tnsnames.ora         # Network service names
sqlnet.ora           # SQL*Net configuration
truststore.jks       # Java truststore
keystore.jks         # Java keystore
ojdbc.properties     # JDBC properties
```

**sqlnet.ora**:
```
WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY="/path/to/wallet")))
SSL_SERVER_DN_MATCH=yes
```

**tnsnames.ora** (extracto):
```
uetatraveldb_tp = (description=(retry_count=20)(retry_delay=3)
  (address=(protocol=tcps)(port=1522)(host=adb.sa-bogota-1.oraclecloud.com))
  (connect_data=(service_name=xxxxx_uetatraveldb_tp.adb.oraclecloud.com))
  (security=(ssl_server_dn_match=yes)))
```

### Node.js Integration

**lib/db/oracledb.ts**:
```typescript
import oracledb from 'oracledb';

const getPoolConfig = (): oracledb.PoolAttributes => ({
  user: process.env.DB_USER || 'ADMIN',
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  queueMax: 500,
  queueTimeout: 60000,
  enableStatistics: true,
  // Wallet configuration
  walletLocation: process.env.WALLET_LOCATION,
  walletPassword: process.env.WALLET_PASSWORD
});

// Thin mode - No Oracle Client required
oracledb.initOracleClient({ libDir: undefined });
```

### Database Operations

#### Query Execution
```typescript
export async function executeQuery<T>(
  sql: string,
  binds: any = {},
  options: any = {}
): Promise<{ rows: T[] }> {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options
    });
    return { rows: result.rows as T[] };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
```

#### Transaction Support
```typescript
export async function executeTransaction(
  statements: Array<{ sql: string; binds: any }>
): Promise<void> {
  let connection;
  try {
    connection = await getConnection();

    for (const stmt of statements) {
      await connection.execute(stmt.sql, stmt.binds);
    }

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
```

### Performance Monitoring

**OCI Console → Autonomous Database → Performance Hub**

Métricas monitoreadas:
- Average Active Sessions
- CPU Utilization
- Storage Utilization
- SQL Execution Time
- Connection Pool Statistics

**Query para estadísticas del pool**:
```sql
SELECT
    pool_name,
    pool_status,
    connections_open,
    connections_busy,
    connections_available
FROM v$pool;
```

---

## Object Storage

### Bucket Configuration

**Nombre**: `ueta-travel-images`
**Región**: `sa-bogota-1`
**Tier**: Standard
**Visibilidad**: Public

#### Estructura de Carpetas

```
ueta-travel-images/
├── products/          # Imágenes de productos
│   ├── prod-001.jpg
│   ├── prod-002.png
│   └── ...
├── avatars/           # Avatares de usuarios
│   ├── user-001.jpg
│   └── ...
├── promotions/        # Banners promocionales
│   ├── promo-001.jpg
│   └── ...
└── temp/              # Archivos temporales
    └── ...
```

### OCI SDK Integration

**lib/storage/object-storage.ts**:
```typescript
import common from 'oci-common';
import objectstorage from 'oci-objectstorage';

class ObjectStorageService {
  private client: objectstorage.ObjectStorageClient;
  private namespace: string;
  private bucketName: string;

  constructor() {
    // Configuración de autenticación
    const provider = new common.ConfigFileAuthenticationDetailsProvider();

    this.client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider
    });

    this.namespace = process.env.OCI_NAMESPACE!;
    this.bucketName = process.env.OCI_BUCKET_NAME || 'ueta-travel-images';
  }

  async uploadImage(
    buffer: Buffer,
    fileName: string,
    folder: string = 'products'
  ): Promise<{ url: string; objectName: string }> {
    const objectName = `${folder}/${Date.now()}-${fileName}`;

    const putObjectRequest = {
      namespaceName: this.namespace,
      bucketName: this.bucketName,
      putObjectBody: buffer,
      objectName,
      contentType: this.getContentType(fileName)
    };

    await this.client.putObject(putObjectRequest);

    const url = `https://objectstorage.${process.env.OCI_REGION}.oraclecloud.com/n/${this.namespace}/b/${this.bucketName}/o/${objectName}`;

    return { url, objectName };
  }

  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp'
    };
    return types[ext || ''] || 'application/octet-stream';
  }
}
```

### Pre-Authenticated Requests (PAR)

```typescript
async createPreAuthenticatedRequest(
  objectName: string,
  hours: number = 24
): Promise<string> {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + hours);

  const createPreauthenticatedRequestDetails = {
    name: `par-${Date.now()}`,
    accessType: 'ObjectRead',
    timeExpires: expirationTime,
    objectName
  };

  const request = {
    namespaceName: this.namespace,
    bucketName: this.bucketName,
    createPreauthenticatedRequestDetails
  };

  const response = await this.client.createPreauthenticatedRequest(request);

  return `https://objectstorage.${process.env.OCI_REGION}.oraclecloud.com${response.preauthenticatedRequest.accessUri}`;
}
```

### Lifecycle Policy

```json
{
  "rules": [
    {
      "name": "delete-temp-files",
      "action": "DELETE",
      "isEnabled": true,
      "objectNameFilter": {
        "inclusionPrefixes": ["temp/"]
      },
      "timeAmount": 7,
      "timeUnit": "DAYS"
    },
    {
      "name": "archive-old-images",
      "action": "ARCHIVE",
      "isEnabled": true,
      "objectNameFilter": {
        "inclusionPrefixes": ["products/"]
      },
      "timeAmount": 90,
      "timeUnit": "DAYS"
    }
  ]
}
```

---

## Compute Instance

### Instance Specification

**Shape**: VM.Standard.E4.Flex
**OCPU**: 1
**Memory**: 4 GB
**Boot Volume**: 50 GB
**OS**: Oracle Linux 8

### Software Stack

```bash
# Node.js
node --version
# v20.x.x

# npm
npm --version
# 10.x.x

# PM2 (Process Manager)
pm2 --version
# 5.x.x

# Nginx (Reverse Proxy)
nginx -v
# nginx/1.20.x
```

### Deployment Architecture

```
Internet
    │
    ▼
┌────────────────┐
│  Load Balancer │ (Port 443 - HTTPS)
└────────┬───────┘
         │
         ▼
┌────────────────┐
│     Nginx      │ (Port 80 - HTTP)
│  Reverse Proxy │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│      PM2       │ (Process Manager)
│                │
│  ┌──────────┐  │
│  │ Next.js  │  │ (Port 3000)
│  │ App #1   │  │
│  └──────────┘  │
│                │
│  ┌──────────┐  │
│  │ Next.js  │  │ (Port 3001)
│  │ App #2   │  │
│  └──────────┘  │
└────────────────┘
```

### PM2 Configuration

**ecosystem.config.js**:
```javascript
module.exports = {
  apps: [{
    name: 'ueta-travel-access',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/ueta-travel/error.log',
    out_file: '/var/log/ueta-travel/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

### Nginx Configuration

**/etc/nginx/conf.d/ueta-travel.conf**:
```nginx
upstream nextjs {
    least_conn;
    server 127.0.0.1:3000 weight=1;
    server 127.0.0.1:3001 weight=1;
}

server {
    listen 80;
    server_name ueta-travel.com www.ueta-travel.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ueta-travel.com www.ueta-travel.com;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/ueta-travel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ueta-travel.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Static files
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API routes
    location /api {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # All other routes
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Systemd Service

**/etc/systemd/system/ueta-travel.service**:
```ini
[Unit]
Description=Ueta Travel Access Next.js Application
After=network.target

[Service]
Type=forking
User=opc
WorkingDirectory=/home/opc/ueta-travel-access
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/local/bin/pm2 start ecosystem.config.js
ExecReload=/usr/local/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/local/bin/pm2 stop ecosystem.config.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

## Networking

### Virtual Cloud Network (VCN)

**CIDR Block**: 10.0.0.0/16

#### Subnets

```
┌─────────────────────────────────────┐
│     VCN: ueta-travel-vcn            │
│     CIDR: 10.0.0.0/16               │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Public Subnet               │   │
│  │  CIDR: 10.0.1.0/24           │   │
│  │  - Compute Instance          │   │
│  │  - Load Balancer             │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Private Subnet              │   │
│  │  CIDR: 10.0.2.0/24           │   │
│  │  - Autonomous Database       │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Security Lists

**Public Subnet Security List**:
```yaml
Ingress Rules:
  - Source: 0.0.0.0/0
    Protocol: TCP
    Port: 443
    Description: HTTPS from Internet

  - Source: 0.0.0.0/0
    Protocol: TCP
    Port: 80
    Description: HTTP from Internet (redirect to HTTPS)

  - Source: 0.0.0.0/0
    Protocol: TCP
    Port: 22
    Description: SSH from trusted IPs only

Egress Rules:
  - Destination: 0.0.0.0/0
    Protocol: All
    Description: Allow all outbound
```

**Private Subnet Security List**:
```yaml
Ingress Rules:
  - Source: 10.0.1.0/24
    Protocol: TCP
    Port: 1522
    Description: Oracle DB from Public Subnet

Egress Rules:
  - Destination: 0.0.0.0/0
    Protocol: All
    Description: Allow all outbound
```

### Network Security Groups (NSG)

**Compute NSG**:
- Allow HTTPS (443) from Internet
- Allow HTTP (80) from Internet
- Allow SSH (22) from specific IPs
- Allow outbound to Autonomous Database

**Database NSG**:
- Allow TCP 1522 from Compute NSG
- Deny all other inbound

---

## Seguridad

### Identity and Access Management (IAM)

#### Políticas de Acceso

```
Allow group Developers to manage autonomous-databases in compartment ueta-travel
Allow group Developers to manage object-family in compartment ueta-travel
Allow group Developers to manage instances in compartment ueta-travel
Allow group Developers to read metrics in compartment ueta-travel
Allow group Developers to read logs in compartment ueta-travel
```

### Secrets Management

**OCI Vault** para almacenar:
- Database passwords
- API keys
- Encryption keys
- OAuth credentials

**Acceso desde aplicación**:
```typescript
import common from 'oci-common';
import secrets from 'oci-secrets';

async function getSecret(secretId: string): Promise<string> {
  const provider = new common.ConfigFileAuthenticationDetailsProvider();
  const client = new secrets.SecretsClient({ authenticationDetailsProvider: provider });

  const request = { secretId };
  const response = await client.getSecretBundle(request);

  const base64Content = response.secretBundle.secretBundleContent.content;
  return Buffer.from(base64Content, 'base64').toString('utf-8');
}

// Uso
const dbPassword = await getSecret('ocid1.vaultsecret.oc1...');
```

### SSL/TLS

**Let's Encrypt** con certbot:
```bash
# Instalación de certbot
sudo dnf install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d ueta-travel.com -d www.ueta-travel.com

# Auto-renovación (cron)
0 12 * * * /usr/bin/certbot renew --quiet
```

### Web Application Firewall (WAF)

**OCI WAF** configurado con:
- OWASP Top 10 protection
- Rate limiting (100 req/min por IP)
- Geo-blocking
- Bot management

---

## Monitoreo y Logs

### OCI Monitoring

**Métricas clave**:
```
Compute Instance:
  - CPU Utilization
  - Memory Utilization
  - Disk I/O
  - Network I/O

Autonomous Database:
  - CPU Utilization
  - Storage Utilization
  - Failed Connections
  - Average Active Sessions

Object Storage:
  - Total Objects
  - Storage Usage
  - Request Count
```

### OCI Logging

**Log Groups**:
```
ueta-travel-logs/
├── compute/
│   ├── system.log
│   ├── application.log
│   └── nginx-access.log
├── database/
│   ├── audit.log
│   └── alert.log
└── api/
    ├── requests.log
    └── errors.log
```

### Application Performance Monitoring (APM)

**OCI APM configurado para**:
- Trace distributed transactions
- Monitor API response times
- Detect performance bottlenecks
- Alert on errors

---

## Backup y Recuperación

### Autonomous Database Backup

**Automatic Backups**:
- Retention: 60 days
- Frequency: Daily
- Type: Incremental

**Manual Backup**:
```sql
BEGIN
  DBMS_CLOUD_ADMIN.CREATE_BACKUP(
    backup_name => 'manual_backup_20251114',
    retention_days => 90
  );
END;
/
```

**Point-in-Time Recovery**:
```bash
# OCI CLI
oci db autonomous-database restore \
  --autonomous-database-id <OCID> \
  --timestamp "2025-11-14T10:00:00Z"
```

### Compute Instance Backup

**Boot Volume Backups**:
- Policy: Weekly full + daily incremental
- Retention: 30 days

**Custom Images**:
```bash
# Crear custom image
oci compute image create \
  --compartment-id <COMPARTMENT_OCID> \
  --instance-id <INSTANCE_OCID> \
  --display-name "ueta-travel-backup-20251114"
```

---

## Costos y Optimización

### Estimación de Costos Mensuales

| Servicio | Configuración | Costo USD/mes |
|----------|---------------|---------------|
| Autonomous Database ATP | 1 OCPU, 1 TB | ~$180 |
| Compute Instance | 1 OCPU, 4 GB RAM | ~$40 |
| Object Storage | 100 GB | ~$2.5 |
| Load Balancer | 1 instance | ~$30 |
| Data Transfer | 100 GB outbound | ~$10 |
| **Total Estimado** | | **~$262.50** |

### Free Tier (Always Free)

Si usas Always Free Tier:
- 2 Autonomous Databases (20 GB each)
- 2 Compute instances (1/8 OCPU each)
- 20 GB Object Storage
- 10 GB Archive Storage

**Costo con Free Tier**: $0/mes

### Optimización de Costos

**Auto Scaling**:
```yaml
Autonomous Database:
  Auto Scaling: Enabled
  Min OCPU: 1
  Max OCPU: 3
  # Escala automáticamente según demanda
```

**Lifecycle Policies**:
```
Object Storage:
  - Delete temp files after 7 days
  - Archive old images after 90 days
  - Transition to Infrequent Access after 30 days
```

**Compute Schedule**:
```bash
# Apagar instancia en horarios no productivos
# Cron job para apagar a las 10 PM
0 22 * * * oci compute instance action --instance-id <OCID> --action STOP

# Encender a las 6 AM
0 6 * * * oci compute instance action --instance-id <OCID> --action START
```

---

**Última actualización**: 14 de Noviembre, 2025
**Versión**: 1.7
**Región**: sa-bogota-1
