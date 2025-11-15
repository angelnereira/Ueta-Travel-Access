# Ueta Travel Access - PWA 🛍️✈️

Una Aplicación Web Progresiva (PWA) premium para experiencias de compra duty-free sin interrupciones, integrada completamente con Oracle Cloud Infrastructure.

> **Versión**: 1.7 - Sistema de Órdenes y Códigos QR
> **Estado**: Producción
> **Región**: OCI sa-bogota-1 (Bogotá, Colombia)

---

## 🌟 Características Principales

### 🛒 Sistema de Compras
- **Click & Reserve**: Sistema de reservas sin fricción
- **Catálogo Multiidioma**: Soporte completo en Inglés y Español
- **Búsqueda Avanzada**: Filtros por categoría, precio, marca y terminal
- **Carrito Inteligente**: Cálculo automático de descuentos y cupones
- **Códigos QR**: Generación automática para recolección de órdenes

### 🔐 Autenticación y Seguridad
- **Bcrypt Password Hashing**: Seguridad de contraseñas con 10 salt rounds
- **Sesiones Seguras**: HTTP-only cookies con validez de 7 días
- **Validación de Propiedad**: Verificación de recursos por usuario
- **Oracle Wallet**: Conexión segura mTLS a base de datos

### 📊 Sistema de Órdenes Completo
- **Información Detallada**: Cliente, vuelo, pago y recolección
- **QR Codes**: Códigos únicos para pickup en aeropuerto
- **Trazabilidad**: Historial completo de estados y escaneos
- **Transacciones Atómicas**: Consistencia garantizada en operaciones

### 💳 Pagos y Descuentos
- **Sistema de Cupones**: Porcentaje, fijo y envío gratis
- **Validación Inteligente**: Verificación de tier, categorías y montos
- **Programa de Lealtad**: 4 niveles (Bronze, Silver, Gold, Platinum)
- **Descuentos por Producto**: Aplicación flexible de promociones

### 📱 Progressive Web App (PWA)
- **Instalable**: Funciona como app nativa en móviles
- **Modo Offline**: Caché de contenido esencial
- **Responsive**: Optimizado para móvil, tablet y desktop
- **Dark Mode**: Cambio automático de tema

### ☁️ Oracle Cloud Integration
- **Autonomous Database**: ATP 19c con auto-scaling
- **Object Storage**: Almacenamiento de imágenes y archivos
- **Thin Mode**: node-oracledb sin Oracle Instant Client
- **Connection Pooling**: 1-10 conexiones optimizadas

---

## 🏗️ Arquitectura

### Stack Tecnológico

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (Next.js 14)              │
│  TypeScript • Tailwind CSS • Zustand • PWA     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          BACKEND APIS (Next.js Routes)          │
│   Authentication • Orders • Products • QR       │
└──────────────────┬──────────────────────────────┘
                   │
      ┌────────────┴────────────┐
      ▼                         ▼
┌──────────────┐      ┌──────────────────┐
│  Oracle ATP  │      │ Object Storage   │
│   Database   │      │   (Images/QR)    │
│   19c EE     │      │                  │
└──────────────┘      └──────────────────┘
```

### Tecnologías Utilizadas

**Frontend**
- **Framework**: Next.js 14 (App Router) con Server Components
- **Lenguaje**: TypeScript 5+
- **Estilos**: Tailwind CSS 3
- **Estado Global**: Zustand
- **UI Components**: Custom + shadcn/ui
- **Íconos**: Lucide React
- **QR Codes**: qrcode.react

**Backend**
- **Runtime**: Node.js 20+
- **Database**: Oracle Autonomous Database 19c Enterprise Edition
- **ORM/Client**: node-oracledb 6.10+ (Thin mode)
- **Autenticación**: Bcrypt + JWT sessions
- **Caché**: In-memory LRU cache
- **Storage**: Oracle Cloud Object Storage

**DevOps**
- **Cloud**: Oracle Cloud Infrastructure (OCI)
- **Región**: sa-bogota-1 (Bogotá)
- **Deployment**: Compute Instance + PM2 + Nginx
- **CI/CD**: Git + Cloud Shell deploy scripts
- **Monitoreo**: OCI Monitoring + Logging

---

## 📦 Estructura del Proyecto

```
Ueta-Travel-Access/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard principal
│   ├── shop/                     # Catálogo de productos
│   ├── product/[slug]/           # Detalle de producto
│   ├── cart/                     # Carrito de compras
│   ├── checkout/                 # Proceso de pago
│   ├── orders/                   # Historial de órdenes
│   ├── profile/                  # Perfil de usuario
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticación (login, register, logout)
│   │   ├── products/             # Productos y catálogo
│   │   ├── categories/           # Categorías
│   │   ├── orders/               # Gestión de órdenes
│   │   ├── reviews/              # Reseñas de productos
│   │   ├── coupons/              # Cupones y descuentos
│   │   ├── qr-codes/             # Códigos QR
│   │   └── upload/               # Subida de archivos
│   └── api-example/              # Página demo de APIs
│
├── lib/                          # Librerías y utilidades
│   ├── db/
│   │   └── oracledb.ts          # Cliente Oracle DB
│   ├── services/                 # Capa de servicios
│   │   ├── auth.service.ts      # Autenticación y usuarios
│   │   ├── product.service.ts   # Productos
│   │   ├── category.service.ts  # Categorías
│   │   ├── order.service.ts     # Órdenes de compra
│   │   ├── review.service.ts    # Reseñas
│   │   ├── coupon.service.ts    # Cupones
│   │   └── qr-code.service.ts   # Códigos QR
│   ├── storage/
│   │   └── object-storage.ts    # OCI Object Storage
│   ├── cache.ts                 # Sistema de caché LRU
│   └── utils.ts                 # Utilidades generales
│
├── components/                   # Componentes React
│   ├── layout/                  # Layout components
│   ├── product/                 # Product cards, grids
│   ├── cart/                    # Cart components
│   └── ui/                      # UI components reutilizables
│
├── scripts/                      # Scripts de base de datos
│   ├── 01-create-tables.sql     # DDL: 18 tablas
│   ├── 02-insert-data.sql       # Datos de ejemplo
│   ├── 03-add-password-field.sql # Migración: passwords
│   ├── 04-enhance-orders-and-qr.sql # Migración: órdenes y QR
│   ├── execute-ddl.js           # Ejecutor de DDL
│   ├── insert-sample-data.js    # Inserción de datos
│   ├── verify-schema.js         # Verificación de esquema
│   └── run-order-migration.js   # Migración de órdenes
│
├── public/                       # Archivos estáticos
│   ├── images/                  # Imágenes locales
│   ├── icons/                   # Íconos PWA
│   └── manifest.json            # PWA Manifest
│
├── docs/                         # Documentación técnica
│   ├── ARQUITECTURA_SQL.md      # Diseño de base de datos
│   ├── GUIA_OCI_INTEGRACION.md  # Integración con OCI
│   ├── GUIA_CLOUD_SHELL.md      # Comandos Cloud Shell
│   ├── ORDER_SYSTEM_DOCUMENTATION.md # Sistema de órdenes
│   ├── API_DOCUMENTATION.md     # Referencia de APIs
│   ├── OCI_SETUP_GUIDE.md       # Setup de OCI (inglés)
│   ├── DATABASE_SETUP.md        # Setup de BD
│   └── DELIVERABLES.md          # Entregables del proyecto
│
├── .env.example                  # Plantilla de variables de entorno
├── .env.local                    # Variables de entorno (no committed)
├── ecosystem.config.js           # PM2 config para producción
├── next.config.js                # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencias y scripts
```

---

## 🗄️ Arquitectura de Base de Datos

### Tablas Principales (18 tablas)

#### Módulo de Usuarios
- `users` - Usuarios con autenticación bcrypt
- `flight_info` - Información de vuelos
- `payment_methods` - Métodos de pago guardados
- `customer_qr_codes` - Códigos QR para clientes
- `loyalty_cards` - Tarjetas de lealtad digitales
- `loyalty_transactions` - Historial de puntos

#### Módulo de Productos
- `categories` - Categorías principales
- `subcategories` - Subcategorías
- `products` - Catálogo de productos
- `product_images` - Imágenes de productos

#### Módulo de Órdenes
- `orders` - Órdenes de compra con 30+ campos
- `order_items` - Productos en cada orden
- `order_status_history` - Auditoría de estados
- `order_qr_scans` - Registro de escaneos

#### Módulo de Promociones
- `coupons` - Cupones y códigos de descuento
- `coupon_categories` - Relación cupón-categorías
- `promotions` - Promociones generales

#### Módulo de Reviews
- `reviews` - Reseñas de productos
- `wishlist` - Lista de deseos

### Estadísticas
- **Total de índices**: 45+
- **Foreign keys**: 30+
- **Check constraints**: 20+
- **Normalización**: 3NF (Third Normal Form)

Ver documentación completa en: [ARQUITECTURA_SQL.md](ARQUITECTURA_SQL.md)

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 20+ y npm 10+
- Oracle Autonomous Database (ATP o ADW)
- Wallet de Oracle Database
- Cuenta de Oracle Cloud Infrastructure

### Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/tu-usuario/Ueta-Travel-Access.git
cd Ueta-Travel-Access
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
```env
# Oracle Autonomous Database
DB_USER=ADMIN
DB_PASSWORD=tu_password_aqui
DB_CONNECT_STRING=(description=(retry_count=20)...
WALLET_LOCATION=/ruta/absoluta/al/wallet
WALLET_PASSWORD=tu_wallet_password

# Oracle Object Storage
OCI_NAMESPACE=tu_namespace
OCI_BUCKET_NAME=ueta-travel-images
OCI_REGION=sa-bogota-1

# Aplicación
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Crear esquema de base de datos**
```bash
# Crear tablas
node scripts/execute-ddl.js

# Insertar datos de ejemplo
node scripts/insert-sample-data.js

# Ejecutar migraciones
node scripts/run-order-migration.js

# Verificar esquema
node scripts/verify-schema.js
```

5. **Iniciar en desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentación Completa

### Guías Técnicas

1. **[ARQUITECTURA_SQL.md](ARQUITECTURA_SQL.md)**
   - Diseño completo de tablas
   - Relaciones y constraints
   - Índices y optimización
   - Consultas avanzadas SQL
   - Mejores prácticas

2. **[GUIA_OCI_INTEGRACION.md](GUIA_OCI_INTEGRACION.md)**
   - Configuración de servicios OCI
   - Autonomous Database setup
   - Object Storage integration
   - Networking y seguridad
   - Monitoreo y costos

3. **[GUIA_CLOUD_SHELL.md](GUIA_CLOUD_SHELL.md)**
   - Comandos de Cloud Shell
   - Deploy y actualización
   - Gestión de instancias
   - Administración de BD
   - Scripts útiles

4. **[ORDER_SYSTEM_DOCUMENTATION.md](ORDER_SYSTEM_DOCUMENTATION.md)**
   - Sistema de órdenes completo
   - Códigos QR para pickup
   - Flujos de trabajo
   - API endpoints

5. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**
   - Referencia completa de APIs
   - Ejemplos de requests/responses
   - Autenticación
   - Rate limiting

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run start        # Inicia en producción
npm run lint         # Ejecuta linter

# Base de Datos
node scripts/execute-ddl.js              # Crear tablas
node scripts/insert-sample-data.js       # Insertar datos
node scripts/run-order-migration.js      # Migrar órdenes
node scripts/verify-schema.js            # Verificar esquema
node scripts/test-db-connection.js       # Probar conexión

# Testing (próximamente)
npm test            # Ejecutar tests
npm run test:e2e    # Tests end-to-end
```

---

## 🌐 Deploy en Oracle Cloud

### Opción 1: Deploy Manual

```bash
# 1. Construir aplicación
npm run build

# 2. Comprimir archivos
tar -czf build.tar.gz .next node_modules package*.json ecosystem.config.js public

# 3. Subir a instancia
scp -i ~/.ssh/oci_key build.tar.gz opc@<IP_PUBLICA>:~/

# 4. Desplegar en servidor
ssh -i ~/.ssh/oci_key opc@<IP_PUBLICA>
cd /ruta/aplicacion
tar -xzf ~/build.tar.gz
pm2 reload ecosystem.config.js
```

### Opción 2: Deploy con Script

```bash
# Desde Oracle Cloud Shell
./deploy.sh
```

Ver guía completa: [GUIA_CLOUD_SHELL.md](GUIA_CLOUD_SHELL.md#deploy-y-actualización-de-aplicación)

---

## 📊 Características de Producción

### Performance
- ✅ Server-Side Rendering (SSR) con revalidación
- ✅ Static Generation para páginas estáticas
- ✅ Image Optimization con Next.js
- ✅ Code Splitting automático
- ✅ Caché LRU in-memory
- ✅ Connection Pooling (1-10 conexiones)

### Seguridad
- ✅ Bcrypt password hashing (10 rounds)
- ✅ HTTP-only secure cookies
- ✅ mTLS para base de datos
- ✅ Input validation en todos los endpoints
- ✅ CSRF protection
- ✅ Rate limiting (próximamente)

### Monitoring
- ✅ OCI Monitoring para métricas
- ✅ OCI Logging para logs
- ✅ Performance Hub para BD
- ✅ PM2 monitoring para app
- ✅ Nginx access logs

---

## 🤝 Contribuir

Este proyecto es parte de un portafolio técnico. Si encuentras bugs o tienes sugerencias:

1. Abre un issue describiendo el problema
2. Fork el proyecto
3. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la branch (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

---

## 📝 Próximas Mejoras

### Corto Plazo
- [ ] Tests unitarios con Jest
- [ ] Tests E2E con Playwright
- [ ] Integración con pasarela de pagos
- [ ] Notificaciones push

### Mediano Plazo
- [ ] App móvil nativa (React Native)
- [ ] Dashboard de administración
- [ ] Análisis y reportes avanzados
- [ ] Integración con APIs de aerolíneas

### Largo Plazo
- [ ] Machine Learning para recomendaciones
- [ ] Realidad Aumentada para productos
- [ ] Blockchain para trazabilidad
- [ ] Expansión a múltiples aeropuertos

---

## 📄 Licencia

Este proyecto es de código privado y parte de un portafolio profesional.

---

## 👨‍💻 Autor

**Angel Nereira**

- GitHub: [@angel-nereira](https://github.com/angel-nereira)
- LinkedIn: [angel-nereira](https://linkedin.com/in/angel-nereira)
- Email: angel@example.com

---

## 🎯 Demostración para Entrevistas

### Puntos Destacados

1. **Arquitectura SQL Avanzada**
   - 18 tablas normalizadas
   - 45+ índices optimizados
   - Transacciones ACID
   - Consultas complejas con JOINs y agregaciones

2. **Integración Cloud Nativa**
   - Oracle Autonomous Database
   - Object Storage
   - Thin mode (serverless)
   - Auto-scaling

3. **Backend Robusto**
   - 14 endpoints REST
   - Autenticación segura
   - Transaction support
   - Error handling completo

4. **Sistema de Órdenes Completo**
   - 30+ campos por orden
   - QR codes automáticos
   - Trazabilidad completa
   - Auditoría de cambios

5. **Documentación Profesional**
   - Arquitectura detallada
   - Guías de deployment
   - Scripts automatizados
   - Comentarios en código

---

## 📞 Soporte

Para preguntas técnicas o demostración del proyecto:

- 📧 Email: angel@example.com
- 💬 LinkedIn: [angel-nereira](https://linkedin.com/in/angel-nereira)
- 📱 WhatsApp: +57 300 123 4567

---

**Última actualización**: 14 de Noviembre, 2025
**Versión**: 1.7 - Sistema de Órdenes y Códigos QR
**Estado**: ✅ Producción Ready
