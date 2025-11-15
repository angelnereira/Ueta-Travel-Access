# 🚀 Instrucciones Rápidas de Despliegue

## Índice Rápido

- [Conexión SSH](#conexión-ssh)
- [Acceso a la App](#acceso-a-la-app)
- [Despliegue Automático con GitHub](#despliegue-automático-con-github)
- [Despliegue Manual](#despliegue-manual)

---

## Conexión SSH

### 1. Obtener IP de la Instancia

**Desde OCI Console:**
```
Menu → Compute → Instances → [Tu Instancia] → Copiar Public IP
```

**Desde Cloud Shell:**
```bash
oci compute instance list-vnics \
  --instance-id <INSTANCE_OCID> \
  --query 'data[0]."public-ip"' \
  --raw-output
```

### 2. Configurar SSH (Primera Vez)

```bash
# Copiar tu llave privada
cp /ruta/a/llave-privada.pem ~/.ssh/oci_compute_key
chmod 600 ~/.ssh/oci_compute_key

# Crear configuración SSH
nano ~/.ssh/config
```

Agregar:
```
Host ueta-travel
    HostName <TU_IP_PUBLICA>
    User opc
    IdentityFile ~/.ssh/oci_compute_key
```

### 3. Conectarse

```bash
ssh ueta-travel
```

---

## Acceso a la App

### Desde Navegador

```
http://<IP_PUBLICA>:3000
```

### Con Dominio (Opcional)

1. Comprar dominio (Namecheap, GoDaddy, etc.)
2. Configurar DNS tipo A apuntando a tu IP
3. Configurar Nginx en el servidor
4. Instalar SSL con Let's Encrypt:

```bash
ssh ueta-travel
sudo certbot --nginx -d app.tudominio.com
```

Acceso final:
```
https://app.tudominio.com
```

---

## Despliegue Automático con GitHub

### Configuración Inicial (Solo una vez)

#### 1. Generar Llave SSH para GitHub Actions

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy
```

#### 2. Agregar Llave Pública al Servidor

```bash
cat ~/.ssh/github_actions_deploy.pub
# Copiar el output

ssh ueta-travel
echo "ssh-ed25519 AAA... github-actions" >> ~/.ssh/authorized_keys
```

#### 3. Configurar GitHub Secrets

Ve a tu repositorio → Settings → Secrets and variables → Actions

Crear estos secrets:

| Nombre | Valor |
|--------|-------|
| `SSH_PRIVATE_KEY` | Contenido de `~/.ssh/github_actions_deploy` |
| `SERVER_HOST` | Tu IP pública (ej: 150.230.45.123) |
| `SERVER_USER` | `opc` |

#### 4. Habilitar GitHub Actions

El workflow ya está creado en `.github/workflows/deploy.yml`

### Uso Diario

```bash
# 1. Hacer cambios en tu código
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Push a GitHub (esto dispara el despliegue automático)
git push origin main

# 3. Ver progreso en GitHub
# Ir a: Repositorio → Actions → Ver el workflow corriendo
```

**¡Eso es todo!** El despliegue es 100% automático:
- ✅ Build
- ✅ Tests
- ✅ Deploy a Oracle Cloud
- ✅ Reinicio automático con PM2
- ✅ Health check

---

## Despliegue Manual

### Opción 1: Script Automático

```bash
npm run deploy
```

Este comando:
1. Compila la aplicación
2. Crea paquete optimizado
3. Lo sube al servidor
4. Crea backup automático
5. Despliega y reinicia
6. Verifica el estado

### Opción 2: Paso a Paso

```bash
# 1. Build local
npm run build

# 2. Crear paquete
tar -czf deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  .

# 3. Subir al servidor
scp -i ~/.ssh/oci_compute_key deploy.tar.gz opc@<IP>:/tmp/

# 4. Conectar y desplegar
ssh ueta-travel

# En el servidor:
cd /home/opc/ueta-travel-access
tar -xzf /tmp/deploy.tar.gz
npm ci --production
pm2 reload ecosystem.config.js
```

---

## Comandos Útiles

### Ver Estado de la App

```bash
npm run monitor
```

o manualmente:

```bash
ssh ueta-travel "pm2 status"
```

### Ver Logs en Tiempo Real

```bash
ssh ueta-travel "pm2 logs ueta-travel-access"
```

### Reiniciar Aplicación

```bash
ssh ueta-travel "pm2 reload ueta-travel-access"
```

### Rollback a Versión Anterior

```bash
npm run rollback
```

Esto te mostrará los backups disponibles y te permitirá elegir a cuál versión volver.

### Health Check

```bash
curl http://<IP>:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "uptime": 12345,
  "services": {
    "api": "running",
    "database": "connected"
  },
  "responseTime": 45
}
```

---

## Solución de Problemas Comunes

### No puedo conectarme vía SSH

```bash
# Verificar permisos de la llave
chmod 600 ~/.ssh/oci_compute_key

# Verificar que la instancia está corriendo
oci compute instance list --query 'data[*].{Name:"display-name", State:"lifecycle-state"}'

# Verificar Security List (puerto 22 debe estar abierto)
# OCI Console → Networking → VCN → Security Lists
```

### La app no responde

```bash
# 1. Verificar que PM2 está corriendo
ssh ueta-travel "pm2 status"

# 2. Ver logs de errores
ssh ueta-travel "pm2 logs ueta-travel-access --err --lines 50"

# 3. Reiniciar
ssh ueta-travel "pm2 reload ueta-travel-access"

# 4. Si nada funciona, iniciar desde cero
ssh ueta-travel
cd /home/opc/ueta-travel-access
pm2 delete ueta-travel-access
pm2 start ecosystem.config.js
```

### Error 502 Bad Gateway (Nginx)

```bash
ssh ueta-travel

# Verificar que Next.js está corriendo
pm2 status

# Verificar configuración de Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### GitHub Actions falla

1. Verificar secrets en GitHub (Settings → Secrets)
2. Ver logs detallados en GitHub Actions
3. Verificar que la llave SSH está en el servidor:
   ```bash
   ssh ueta-travel "cat ~/.ssh/authorized_keys"
   ```

---

## Arquitectura de Despliegue

```
┌─────────────────┐
│   Desarrollador │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│     GitHub      │
│   Repository    │
└────────┬────────┘
         │ trigger
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   (CI/CD)       │
└────────┬────────┘
         │ SSH
         ▼
┌─────────────────────────────┐
│   Oracle Cloud Instance     │
│  ┌──────────────────────┐   │
│  │   PM2 (Cluster)      │   │
│  │  ┌────────┬────────┐ │   │
│  │  │ Next.js│ Next.js│ │   │
│  │  │ :3000  │ :3000  │ │   │
│  │  └────────┴────────┘ │   │
│  └──────────────────────┘   │
│            ▲                 │
│  ┌─────────┴──────────┐     │
│  │   Nginx (Proxy)    │     │
│  │      :80, :443     │     │
│  └────────────────────┘     │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Oracle Autonomous Database │
└─────────────────────────────┘
```

---

## Checklist de Primera Configuración

- [ ] Obtener IP pública de la instancia
- [ ] Configurar llave SSH local
- [ ] Conectarse vía SSH
- [ ] Instalar Node.js, npm, PM2 en el servidor
- [ ] Clonar o transferir código al servidor
- [ ] Configurar variables de entorno (.env.production)
- [ ] Instalar dependencias (`npm ci`)
- [ ] Hacer build (`npm run build`)
- [ ] Configurar PM2 (`pm2 start ecosystem.config.js`)
- [ ] Configurar Nginx
- [ ] Abrir puertos en Security List (80, 443, 3000)
- [ ] Configurar firewall (`sudo firewall-cmd`)
- [ ] Generar llave SSH para GitHub Actions
- [ ] Configurar GitHub Secrets
- [ ] Probar despliegue automático
- [ ] Configurar dominio (opcional)
- [ ] Instalar certificado SSL (opcional)

---

## Documentación Completa

Para información más detallada, consulta:

- 📘 [GUIA_CONEXION_SSH_DEPLOY.md](GUIA_CONEXION_SSH_DEPLOY.md) - Guía completa de conexión y despliegue
- 📗 [GUIA_CLOUD_SHELL.md](GUIA_CLOUD_SHELL.md) - Comandos de Cloud Shell
- 📕 [GUIA_OCI_INTEGRACION.md](GUIA_OCI_INTEGRACION.md) - Integración con OCI
- 📙 [ARQUITECTURA_SQL.md](ARQUITECTURA_SQL.md) - Arquitectura de base de datos
- 📄 [README.md](README.md) - Documentación general del proyecto

---

## URLs Importantes

```
Aplicación:           http://<IP>:3000
Health Check:         http://<IP>:3000/api/health
OCI Console:          https://cloud.oracle.com
GitHub Repository:    https://github.com/<usuario>/<repo>
GitHub Actions:       https://github.com/<usuario>/<repo>/actions
```

---

**¿Necesitas ayuda?** Revisa la documentación completa o los logs de error en el servidor.
