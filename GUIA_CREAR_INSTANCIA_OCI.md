# Guía: Crear Instancia Oracle Cloud para Ueta Travel Access

## 📋 Requisitos Previos

- Cuenta de Oracle Cloud (Free Tier o pago)
- Acceso a OCI Console: https://cloud.oracle.com

---

## 🖥️ Paso 1: Crear Compute Instance

### 1.1 Acceder a Compute Instances

1. Inicia sesión en [cloud.oracle.com](https://cloud.oracle.com)
2. Click en el menú **☰** (hamburguesa)
3. Ve a **Compute** → **Instances**
4. Click en **Create Instance**

### 1.2 Configuración Básica

**Name:**
```
ueta-travel-instance
```

**Compartment:**
```
Selecciona tu compartment (root o el que uses para el proyecto)
```

**Placement:**
```
Availability Domain: Selecciona cualquiera disponible (AD-1, AD-2, etc.)
```

### 1.3 Image and Shape

**Image:**
```
✅ Oracle Linux 8 (recomendado)
   - Versión más reciente
   - Completamente compatible con Node.js

Alternativas:
   - Ubuntu 22.04 LTS
   - CentOS Stream 8
```

**Shape:**

Para **Free Tier** (Gratis):
```
Shape: VM.Standard.E2.1.Micro
  - 1 OCPU (AMD)
  - 1 GB RAM
  - Incluido en Free Tier permanentemente

⚠️ Limitación: Solo 2 instancias Micro gratis por cuenta
```

Para **Mejor Performance** (Pago):
```
Shape: VM.Standard.E4.Flex
  - 1 OCPU
  - 4-8 GB RAM
  - Costo: ~$10-20/mes
  - Mucho mejor rendimiento
```

Click en **Change Shape** si quieres modificar

### 1.4 Networking

**Virtual Cloud Network:**
```
Si ya tienes una VCN:
  ✅ Selecciona: <tu-vcn-existente>

Si NO tienes VCN:
  ✅ Selecciona: "Create new virtual cloud network"
  ✅ Name: ueta-travel-vcn
  ✅ "Create new public subnet"
  ✅ "Assign a public IPv4 address": ✅ ACTIVADO
```

**⚠️ IMPORTANTE:** Marca "Assign a public IPv4 address" para poder acceder vía SSH

### 1.5 SSH Keys

**MUY IMPORTANTE - Guarda bien estas llaves:**

Opción A: Generar llaves automáticamente (Recomendado)
```
✅ "Generate a key pair for me"
✅ Click "Save Private Key" → Guarda como: ueta-travel-key.pem
✅ Click "Save Public Key" (opcional, pero recomendado)

⚠️ NO PIERDAS ESTE ARCHIVO - No podrás recuperarlo después
```

Opción B: Usar llaves existentes
```
✅ "Upload public key files (.pub)"
   → Sube tu archivo id_rsa.pub o similar

O

✅ "Paste public keys"
   → Pega el contenido de tu llave pública
```

### 1.6 Boot Volume

```
✅ Usar configuración por defecto
   - 50 GB (suficiente para el proyecto)

Opcional: Aumentar a 100 GB si planeas muchos datos
```

### 1.7 Crear la Instancia

1. Revisa toda la configuración
2. Click en **Create**
3. Espera 1-2 minutos mientras se provisiona

⏳ Estado: **Provisioning** → **Running** (verde)

---

## 📝 Paso 2: Guardar Información Importante

Una vez creada, COPIA y GUARDA:

### IP Pública
```
En la página de la instancia, busca:
"Public IP Address: XXX.XXX.XXX.XXX"

Ejemplo: 150.230.45.123
```

### OCID de la Instancia (opcional, para scripts)
```
En "Instance Information":
OCID: ocid1.instance.oc1.iad.xxxxxxxxxxxxx...
```

### Llave SSH
```
Ubicación del archivo descargado:
~/Downloads/ueta-travel-key.pem
```

---

## 🔐 Paso 3: Configurar Llave SSH en tu Máquina

### En Linux/Mac:

```bash
# 1. Mover la llave a ~/.ssh
mkdir -p ~/.ssh
mv ~/Downloads/ueta-travel-key.pem ~/.ssh/

# 2. Establecer permisos correctos (IMPORTANTE)
chmod 600 ~/.ssh/ueta-travel-key.pem

# 3. Crear alias en SSH config
nano ~/.ssh/config
```

Agregar:
```
Host ueta-travel
    HostName 150.230.45.123
    User opc
    IdentityFile ~/.ssh/ueta-travel-key.pem
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Guardar: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# 4. Establecer permisos del config
chmod 600 ~/.ssh/config
```

### En Windows (PowerShell):

```powershell
# 1. Mover la llave
Move-Item "$env:USERPROFILE\Downloads\ueta-travel-key.pem" "$env:USERPROFILE\.ssh\"

# 2. Configurar permisos
icacls "$env:USERPROFILE\.ssh\ueta-travel-key.pem" /inheritance:r
icacls "$env:USERPROFILE\.ssh\ueta-travel-key.pem" /grant:r "$env:USERNAME:R"

# 3. Crear config
notepad "$env:USERPROFILE\.ssh\config"
```

Agregar el mismo contenido que en Linux/Mac

---

## 🔓 Paso 4: Abrir Puertos en Security List

Para que tu aplicación sea accesible desde Internet:

### 4.1 Ir a Security Lists

1. En OCI Console: **Networking** → **Virtual Cloud Networks**
2. Click en tu VCN: `ueta-travel-vcn`
3. Click en **Security Lists**
4. Click en `Default Security List for ueta-travel-vcn`

### 4.2 Agregar Ingress Rules

Click en **Add Ingress Rules** y agrega CADA UNA de estas:

**Regla 1: HTTP (Puerto 80)**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 80
Description: HTTP traffic
```

**Regla 2: HTTPS (Puerto 443)**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 443
Description: HTTPS traffic
```

**Regla 3: Next.js (Puerto 3000)**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 3000
Description: Next.js application
```

⚠️ **Nota:** El puerto 22 (SSH) ya debería estar abierto por defecto

---

## ✅ Paso 5: Probar Conexión SSH

```bash
# Probar conexión
ssh ueta-travel

# O con comando completo
ssh -i ~/.ssh/ueta-travel-key.pem opc@150.230.45.123

# Primera conexión te preguntará:
# "Are you sure you want to continue connecting (yes/no)?"
# Responde: yes
```

Si ves esto, ¡funcionó! ✅
```
[opc@ueta-travel-instance ~]$
```

---

## 🚀 Paso 6: Configurar el Servidor

Una vez conectado vía SSH, ejecuta:

```bash
# 1. Copiar script de configuración
# (Desde tu máquina local, en otra terminal)
scp -i ~/.ssh/ueta-travel-key.pem scripts/setup-oracle-server.sh opc@<IP>:/tmp/

# 2. En la sesión SSH del servidor, ejecutar:
bash /tmp/setup-oracle-server.sh
```

Este script instalará:
- ✅ Node.js 18
- ✅ PM2
- ✅ Nginx
- ✅ Git
- ✅ Certbot
- ✅ Configurará firewall
- ✅ Creará directorios necesarios

---

## 📦 Paso 7: Desplegar la Aplicación

### Opción A: Desde tu máquina local

```bash
# Configurar variables
export SERVER_HOST="150.230.45.123"  # Tu IP
export SERVER_USER="opc"
export SSH_KEY="$HOME/.ssh/ueta-travel-key.pem"

# Desplegar
npm run deploy
```

### Opción B: Clonar desde GitHub en el servidor

```bash
# Conectar al servidor
ssh ueta-travel

# Clonar repositorio
git clone https://github.com/<TU_USUARIO>/ueta-travel-access.git /home/opc/ueta-travel-access

cd /home/opc/ueta-travel-access

# Configurar variables de entorno
cp .env.example .env.production
nano .env.production  # Editar con credenciales reales

# Instalar dependencias
npm ci --production

# Build
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔍 Paso 8: Verificar que Funciona

```bash
# Health check
curl http://<TU_IP>:3000/api/health

# Desde navegador
http://<TU_IP>:3000
```

Deberías ver tu aplicación funcionando! 🎉

---

## 💰 Costos Estimados

### Free Tier (Gratis para siempre):
```
Compute: VM.Standard.E2.1.Micro  →  $0/mes (2 instancias gratis)
Database: Autonomous DB (20GB)   →  $0/mes (2 bases de datos gratis)
Storage: 200 GB                  →  $0/mes
Bandwidth: 10 TB/mes             →  $0/mes

Total: $0/mes ✅
```

### Performance Tier (Recomendado para producción):
```
Compute: VM.Standard.E4.Flex (1 OCPU, 4GB)  →  ~$15/mes
Database: ATP (1 OCPU)                      →  ~$50/mes
Storage: 100 GB                             →  ~$3/mes
Bandwidth: Incluido                         →  $0

Total: ~$68/mes
```

---

## ❓ Troubleshooting

### Error: "Permission denied (publickey)"
```bash
# Verifica permisos de la llave
chmod 600 ~/.ssh/ueta-travel-key.pem

# Verifica que usas el usuario correcto (opc, no root)
ssh -i ~/.ssh/ueta-travel-key.pem opc@<IP>
```

### Error: "Connection timed out"
```
Problema: Puertos no abiertos en Security List
Solución: Revisa Paso 4 y asegúrate de agregar regla para puerto 22
```

### No puedo acceder a la aplicación desde navegador
```
1. Verifica Security List (Paso 4)
2. Verifica firewall en el servidor:
   sudo firewall-cmd --list-all
3. Verifica que PM2 está corriendo:
   pm2 status
```

---

## 📚 Documentación Relacionada

- [GUIA_CONEXION_SSH_DEPLOY.md](GUIA_CONEXION_SSH_DEPLOY.md) - Conexión y despliegue
- [INSTRUCCIONES_RAPIDAS_DEPLOY.md](INSTRUCCIONES_RAPIDAS_DEPLOY.md) - Referencia rápida
- [scripts/setup-oracle-server.sh](scripts/setup-oracle-server.sh) - Script de configuración

---

¡Listo! Tu instancia Oracle Cloud está creada y lista para recibir la aplicación. 🚀
