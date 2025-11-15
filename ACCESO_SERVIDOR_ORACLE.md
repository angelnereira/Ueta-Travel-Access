# 📋 Resumen de Acceso y Configuración - Servidor Oracle Cloud

**Fecha**: 2025-11-15
**Servidor**: prod-next-ueta-access (149.130.188.231)
**Usuario**: opc

---

## ✅ Acceso SSH Configurado

### Información de Conexión
```bash
Host: oracle-ueta
IP: 149.130.188.231
Usuario: opc
Llave SSH: ~/.ssh/oracle-instance.key
```

### Permisos del Usuario
- **Usuario**: opc
- **Grupos**: opc, adm, systemd-journal
- **Sudo**: ✅ COMPLETO (`NOPASSWD: ALL`)
- **Acceso a archivos**: ✅ Total en /home/opc/

---

## 🗄️ Base de Datos Oracle Autonomous Database

### Información de Conexión
```bash
Tipo: Oracle Autonomous Database (ATP 19c)
Usuario: ADMIN
Password: UetaTravel2025!
Service Name: gd15e31a79422c0_uetatraveldb_high.adb.oraclecloud.com
Host: adb.sa-bogota-1.oraclecloud.com
Puerto: 1522
Protocolo: TCPS (SSL/TLS)
```

### Servicios Disponibles
```bash
✅ uetatraveldb_high      # Alta prioridad (producción)
✅ uetatraveldb_medium    # Media prioridad
✅ uetatraveldb_low       # Baja prioridad
✅ uetatraveldb_tp        # Transaction Processing
✅ uetatraveldb_tpurgent  # TP urgente
```

### Wallet
```bash
Ubicación Local: /home/angel-nereira/projects/ueta-travel-acces/Ueta-Travel-Access/wallet
Ubicación Servidor: /home/opc/wallet
Password: UetaTravel2025!

Archivos:
- cwallet.sso
- ewallet.p12
- ewallet.pem
- keystore.jks
- ojdbc.properties
- README
- sqlnet.ora
- tnsnames.ora
- truststore.jks
```

### Estado de Conexión
```bash
✅ Conectada y funcionando
✅ Pool de conexiones creado exitosamente
✅ Health check: SUCCESS
```

### Acceso Directo a BD
**Desde el servidor** (via node-oracledb):
```javascript
const oracledb = require('oracledb');

const connection = await oracledb.getConnection({
  user: 'ADMIN',
  password: 'UetaTravel2025!',
  connectString: 'uetatraveldb_high',
  configDir: '/home/opc/wallet',
  walletLocation: '/home/opc/wallet',
  walletPassword: 'UetaTravel2025!'
});

// Ejecutar queries
const result = await connection.execute('SELECT * FROM users');
await connection.close();
```

**Limitación**:
- ❌ Oracle Instant Client NO está instalado en el servidor
- ✅ node-oracledb funciona en modo "Thin" (sin librerías nativas)
- ✅ Todas las operaciones SQL funcionan correctamente

---

## 🌐 Oracle Cloud Infrastructure (OCI)

### OCI CLI
```bash
Versión: 3.68.0
Ubicación: /usr/bin/oci
Configuración: /home/opc/.oci/config
```

### Información de la Instancia
```bash
OCID: ocid1.instance.oc1.sa-bogota-1.anrgcljr7po2priczlpmhtdcwuf5ikoedvbz4a3najm75d7rypggua4r6kkq
Región: sa-bogota-1
Compartment: ocid1.tenancy.oc1..aaaaaaaalat6oqhfv7qa4b4m72ieofw36ue72zzaxaz2j5stdpivi6oin3sq
```

### Oracle Object Storage
```bash
Namespace: axcsgjglhfh3
Región: sa-bogota-1
Bucket (configurado): ueta-travel-images
```

**Limitación de Permisos**:
- ❌ Instance Principals NO configurados
- ❌ No se puede crear buckets desde el servidor directamente
- ⚠️ Requiere configurar políticas IAM o API keys

**Solución**:
- Crear buckets desde OCI Console manualmente
- Configurar API keys para el usuario
- O configurar Instance Principal policies

### Metadata Service (IMDS v2)
```bash
✅ Accesible desde el servidor
Endpoint: http://169.254.169.254/opc/v2/

# Obtener información de la instancia
curl -H "Authorization: Bearer Oracle" http://169.254.169.254/opc/v2/instance/
```

---

## 🚀 Aplicación Next.js

### PM2 Status
```bash
Nombre: ueta-travel-access
Estado: ✅ ONLINE
PID: 105478
Memoria: ~80 MB
CPU: 0%
Modo: fork (no cluster)
```

### Ubicación
```bash
Directorio: /home/opc/Ueta-Travel-Access
Branch: claude/ueta-travel-pwa-setup-01N1JMxMmGu9pEcJ79EmuWsC
Commit: 0931c68
```

### Variables de Entorno
```bash
Archivo: /home/opc/Ueta-Travel-Access/.env.production

DB_USER=ADMIN
DB_PASSWORD=UetaTravel2025!
DB_CONNECT_STRING=(...)
WALLET_LOCATION=/home/opc/wallet
WALLET_PASSWORD=UetaTravel2025!
OCI_NAMESPACE=axcsgjglhfh3
OCI_BUCKET_NAME=ueta-travel-images
OCI_REGION=sa-bogota-1
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://149.130.188.231:3000
```

### URLs de Acceso
```bash
Frontend: http://149.130.188.231:3000
API Health: http://149.130.188.231:3000/api/health
API Categories: http://149.130.188.231:3000/api/categories
```

---

## 🔧 Herramientas Instaladas en el Servidor

### Software Base
```bash
✅ Node.js v20.19.5
✅ npm 10.9.2
✅ PM2 (gestor de procesos)
✅ Git
✅ Nginx
✅ Certbot (SSL/TLS)
✅ OCI CLI 3.68.0
✅ Firewalld
```

### Puertos Abiertos
```bash
✅ 22 (SSH)
✅ 80 (HTTP)
✅ 443 (HTTPS)
✅ 3000 (Next.js)
```

---

## 📊 APIs Funcionando

### ✅ Endpoints Operativos
```bash
✅ GET /api/health          # Health check + DB status
✅ GET /api/categories      # Listado de categorías
```

### ⚠️ Endpoints con Errores
```bash
❌ GET /api/products        # Error: Circular structure in JSON
```

**Error Detectado**:
```
TypeError: Converting circular structure to JSON
→ Problema en serialización de objetos complejos
→ Requiere revisión del código en app/api/products/route.ts
```

---

## 🛠️ Operaciones que Puedo Realizar

### ✅ Acceso Completo
1. **SSH al servidor**
   - Ejecutar cualquier comando como sudo
   - Leer/escribir archivos
   - Instalar software
   - Configurar servicios

2. **Base de Datos**
   - Ejecutar queries SQL (via API o scripts)
   - Crear/modificar tablas
   - Insertar/actualizar datos
   - Crear índices y secuencias

3. **Gestión de Aplicación**
   - Desplegar código
   - Reiniciar PM2
   - Ver logs en tiempo real
   - Modificar variables de entorno
   - Hacer rollback a versiones anteriores

4. **Sistema**
   - Configurar Nginx
   - Manejar certificados SSL
   - Configurar firewall
   - Monitorear recursos (CPU, RAM, disco)

5. **Git**
   - Pull/push código
   - Cambiar branches
   - Ver commits
   - Crear tags

### ⚠️ Acceso Limitado

1. **Oracle Object Storage**
   - ❌ No puedo crear buckets directamente
   - ❌ No puedo subir archivos (sin Instance Principal o API keys)
   - ✅ Puedo listar buckets existentes (si se crean desde Console)

2. **OCI Resources**
   - ❌ No puedo crear instancias
   - ❌ No puedo crear bases de datos
   - ✅ Puedo consultar metadata de la instancia actual

### ❌ Sin Acceso
1. **OCI Console Web** (requiere login manual)
2. **Billing y facturación**
3. **IAM Policies** (requiere admin de tenancy)
4. **Creación de recursos OCI** (requiere permisos IAM)

---

## 📝 Tareas Pendientes

### 1. Arreglar Error de Serialización
```bash
Archivo: app/api/products/route.ts
Error: Circular structure in JSON
Solución: Revisar objetos retornados y usar JSON.stringify con replacer
```

### 2. Configurar Object Storage
**Opción A - Manual (Recomendada)**:
1. Ir a OCI Console
2. Storage → Buckets
3. Crear bucket "ueta-travel-images"
4. Configurar como público (si es necesario)

**Opción B - Programática**:
1. Crear API keys en OCI Console
2. Configurar en ~/.oci/config
3. Usar OCI CLI para crear bucket

### 3. Optimizar PM2
```bash
# Cambiar a modo cluster
Modificar ecosystem.config.js:
  instances: 2
  exec_mode: 'cluster'
```

### 4. Configurar SSL/HTTPS
```bash
# Si tienes un dominio
sudo certbot --nginx -d tudominio.com
```

### 5. Crear Tablas en Base de Datos
```bash
# Ejecutar schema SQL
Archivo: lib/db/schema.sql
Contiene definiciones de tablas, índices, etc.
```

---

## 🔐 Credenciales y Accesos

### Base de Datos
```
Usuario: ADMIN
Password: UetaTravel2025!
```

### SSH
```
Usuario: opc
Llave: ~/.ssh/oracle-instance.key
```

### OCI
```
Namespace: axcsgjglhfh3
Tenancy OCID: ocid1.tenancy.oc1..aaaaaaaalat6oqhfv7qa4b4m72ieofw36ue72zzaxaz2j5stdpivi6oin3sq
```

---

## 📚 Documentos Relacionados

- [GUIA_CONEXION_SSH_DEPLOY.md](GUIA_CONEXION_SSH_DEPLOY.md)
- [GUIA_CREAR_INSTANCIA_OCI.md](GUIA_CREAR_INSTANCIA_OCI.md)
- [INSTRUCCIONES_RAPIDAS_DEPLOY.md](INSTRUCCIONES_RAPIDAS_DEPLOY.md)
- [DESPLIEGUE_COMPLETADO.md](DESPLIEGUE_COMPLETADO.md)

---

**Última actualización**: 2025-11-15 19:55 UTC
