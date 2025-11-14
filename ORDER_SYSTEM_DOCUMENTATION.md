# Sistema de Órdenes y Códigos QR - Documentación

## Resumen

Se ha implementado un sistema completo de gestión de órdenes con códigos QR para identificación de clientes y recolección de pedidos en el aeropuerto.

**Fecha de implementación**: 14 de Noviembre, 2025

---

## 📦 Nuevas Tablas de Base de Datos

### 1. Mejoras a la Tabla `ORDERS`

Se agregaron los siguientes campos a la tabla existente de órdenes:

#### Información del Cliente
- `customer_name` - Nombre completo del cliente
- `customer_email` - Email para notificaciones
- `customer_phone` - Teléfono de contacto
- `customer_passport` - Número de pasaporte para verificación
- `customer_nationality` - Nacionalidad del cliente

#### Información de Vuelo
- `flight_number` - Número de vuelo asociado
- `flight_date` - Fecha/hora del vuelo
- `departure_airport` - Aeropuerto de salida
- `arrival_airport` - Aeropuerto de llegada

#### Pago y Descuentos
- `subtotal` - Total antes de impuestos y descuentos
- `tax_amount` - Monto de impuestos
- `discount_amount` - Total de descuentos aplicados
- `coupon_code` - Código de cupón aplicado
- `payment_status` - Estado del pago (pending, processing, completed, failed, refunded)
- `payment_method` - Método de pago utilizado

#### Recolección
- `pickup_location` - Punto específico de recolección en terminal
- `pickup_instructions` - Instrucciones especiales para recolección
- `collected_at` - Timestamp cuando se recolectó la orden
- `collected_by` - Personal que procesó la recolección
- `notes` - Notas adicionales

### 2. Nueva Tabla: `CUSTOMER_QR_CODES`

Almacena códigos QR para identificación de clientes y órdenes.

```sql
CREATE TABLE customer_qr_codes (
  id VARCHAR2(50) PRIMARY KEY,
  user_id VARCHAR2(50) NOT NULL,
  qr_code VARCHAR2(500) UNIQUE NOT NULL,
  qr_data CLOB NOT NULL,                -- JSON con información del QR
  type VARCHAR2(20) DEFAULT 'customer', -- customer, boarding, loyalty, order
  purpose VARCHAR2(100),
  flight_id VARCHAR2(50),
  active NUMBER(1) DEFAULT 1,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer_qr_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_customer_qr_flight FOREIGN KEY (flight_id) REFERENCES flight_info(id)
);
```

**Tipos de QR Codes**:
- `customer` - Identificación general del cliente
- `boarding` - QR de pase de abordar
- `loyalty` - QR de tarjeta de lealtad
- `order` - QR para recolección de orden

### 3. Nueva Tabla: `ORDER_STATUS_HISTORY`

Rastrea todos los cambios de estado de órdenes.

```sql
CREATE TABLE order_status_history (
  id VARCHAR2(50) PRIMARY KEY,
  order_id VARCHAR2(50) NOT NULL,
  previous_status VARCHAR2(20),
  new_status VARCHAR2(20) NOT NULL,
  changed_by VARCHAR2(50),              -- Usuario/sistema que hizo el cambio
  notes CLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_history_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### 4. Nueva Tabla: `ORDER_QR_SCANS`

Rastrea todos los escaneos de códigos QR para recolección.

```sql
CREATE TABLE order_qr_scans (
  id VARCHAR2(50) PRIMARY KEY,
  order_id VARCHAR2(50) NOT NULL,
  qr_code VARCHAR2(500) NOT NULL,
  scanned_by VARCHAR2(50),              -- Personal que escaneó
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scan_location VARCHAR2(200),          -- Ubicación física en terminal
  terminal VARCHAR2(10),
  device_id VARCHAR2(100),
  result VARCHAR2(20) DEFAULT 'success', -- success, failed, invalid, expired
  notes CLOB,
  CONSTRAINT fk_qr_scan_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### 5. Nueva Tabla: `LOYALTY_CARDS`

Tarjetas de lealtad digitales con códigos QR.

```sql
CREATE TABLE loyalty_cards (
  id VARCHAR2(50) PRIMARY KEY,
  user_id VARCHAR2(50) NOT NULL,
  card_number VARCHAR2(50) UNIQUE NOT NULL,
  qr_code VARCHAR2(500) UNIQUE NOT NULL,
  tier VARCHAR2(20) DEFAULT 'bronze',
  points NUMBER(10,0) DEFAULT 0,
  points_lifetime NUMBER(10,0) DEFAULT 0,
  status VARCHAR2(20) DEFAULT 'active',
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  CONSTRAINT fk_loyalty_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6. Nueva Tabla: `LOYALTY_TRANSACTIONS`

Historial de transacciones de puntos de lealtad.

```sql
CREATE TABLE loyalty_transactions (
  id VARCHAR2(50) PRIMARY KEY,
  loyalty_card_id VARCHAR2(50) NOT NULL,
  order_id VARCHAR2(50),
  type VARCHAR2(20) NOT NULL,           -- earned, redeemed, expired, adjusted, bonus
  points NUMBER(10,0) NOT NULL,
  balance_after NUMBER(10,0) NOT NULL,
  description VARCHAR2(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_loyalty_trans_card FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id),
  CONSTRAINT fk_loyalty_trans_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 🔧 Servicios Implementados

### OrderService (Actualizado)

**Archivo**: [lib/services/order.service.ts](lib/services/order.service.ts)

#### Nuevo método `create()` con todos los campos:

```typescript
static async create(data: {
  userId: string;
  items: { productId: string; quantity: number; price: number; discount?: number }[];
  terminal: string;
  // Customer information
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerPassport?: string;
  customerNationality?: string;
  // Flight information
  flightNumber?: string;
  flightDate?: Date;
  departureAirport?: string;
  arrivalAirport?: string;
  // Payment and discount
  couponCode?: string;
  paymentMethod?: string;
  // Fulfillment
  pickupLocation?: string;
  pickupInstructions?: string;
  notes?: string;
}): Promise<Order>
```

**Características**:
- Cálculo automático de subtotal, descuentos y total
- Generación automática de código QR único
- Soporte para transacciones
- Actualización de inventario de productos

### QRCodeService (Nuevo)

**Archivo**: [lib/services/qr-code.service.ts](lib/services/qr-code.service.ts)

#### Métodos principales:

```typescript
// Generar QR code para cliente
static async generateCustomerQR(data: {
  userId: string;
  type?: 'customer' | 'boarding' | 'loyalty' | 'order';
  purpose?: string;
  flightId?: string;
  qrData: QRCodeData;
  expiresAt?: Date;
}): Promise<CustomerQRCode>

// Generar QR para recolección de orden
static async generateOrderQR(data: {
  userId: string;
  orderId: string;
  customerName: string;
  orderTotal: number;
  terminal: string;
  flightNumber?: string;
}): Promise<CustomerQRCode>

// Validar QR code
static async validateQRCode(qrCode: string): Promise<{
  valid: boolean;
  qr?: CustomerQRCode;
  reason?: string;
}>

// Registrar escaneo de QR
static async recordScan(data: {
  orderId: string;
  qrCode: string;
  scannedBy?: string;
  scanLocation?: string;
  terminal?: string;
  deviceId?: string;
  result?: 'success' | 'failed' | 'invalid' | 'expired';
}): Promise<void>

// Obtener QR codes de usuario
static async getByUserId(userId: string, activeOnly?: boolean): Promise<CustomerQRCode[]>

// Desactivar QR code
static async deactivate(qrId: string): Promise<void>
```

**Estructura de Datos del QR**:

```typescript
interface QRCodeData {
  // Customer information
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  passport?: string;
  nationality?: string;
  // Flight information (if applicable)
  flightNumber?: string;
  flightDate?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  // Order information (if applicable)
  orderId?: string;
  orderTotal?: number;
  // Loyalty information (if applicable)
  loyaltyTier?: string;
  loyaltyPoints?: number;
  cardNumber?: string;
  // Metadata
  generatedAt: string;
  validUntil?: string;
}
```

---

## 🌐 API Endpoints

### Órdenes (Actualizados)

#### POST /api/orders
Crear nueva orden con toda la información detallada.

**Request Body**:
```json
{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "price": 125.00,
      "discount": 10.00
    }
  ],
  "terminal": "T1",
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "customerPhone": "+57 300 123 4567",
  "customerPassport": "AB123456",
  "customerNationality": "USA",
  "flightNumber": "AA123",
  "flightDate": "2025-12-15T14:30:00Z",
  "departureAirport": "BOG",
  "arrivalAirport": "MIA",
  "couponCode": "WELCOME20",
  "paymentMethod": "credit_card",
  "pickupLocation": "Terminal 1, Gate A12",
  "pickupInstructions": "Please call when you arrive",
  "notes": "Gift wrapping requested"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "order-1731614400000",
    "userId": "user-001",
    "total": 240.00,
    "subtotal": 250.00,
    "taxAmount": 0.00,
    "discountAmount": 10.00,
    "itemsCount": 2,
    "status": "pending",
    "paymentStatus": "pending",
    "qrCode": "QR-order-1731614400000-1731614400123",
    "customerName": "John Smith",
    "flightNumber": "AA123",
    "terminal": "T1",
    "pickupQRCode": {
      "id": "qr-1731614400200",
      "qrCode": "UETA-ORDER-qr-1731614400200",
      "qrData": {
        "userId": "user-001",
        "customerName": "John Smith",
        "orderId": "order-1731614400000",
        "orderTotal": 240.00,
        "flightNumber": "AA123",
        "generatedAt": "2025-11-14T20:00:00.000Z",
        "validUntil": "2025-11-21T20:00:00.000Z"
      },
      "type": "order",
      "active": true,
      "expiresAt": "2025-11-21T20:00:00.000Z"
    }
  }
}
```

### Códigos QR (Nuevos)

#### GET /api/qr-codes
Obtener todos los códigos QR del usuario autenticado.

**Query Parameters**:
- `activeOnly` - Solo QR codes activos (default: true)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "qr-001",
      "userId": "user-001",
      "qrCode": "UETA-ORDER-qr-001",
      "qrData": { /* ... */ },
      "type": "order",
      "active": true,
      "expiresAt": "2025-11-21T20:00:00.000Z",
      "createdAt": "2025-11-14T20:00:00.000Z"
    }
  ]
}
```

#### POST /api/qr-codes
Generar nuevo código QR.

**Request Body**:
```json
{
  "type": "customer",
  "purpose": "Customer identification at airport",
  "qrData": {
    "userId": "user-001",
    "customerName": "John Smith",
    "customerEmail": "john@example.com",
    "passport": "AB123456",
    "nationality": "USA",
    "generatedAt": "2025-11-14T20:00:00.000Z"
  },
  "expiresAt": "2025-12-14T20:00:00.000Z"
}
```

#### POST /api/qr-codes/validate
Validar un código QR.

**Request Body**:
```json
{
  "qrCode": "UETA-ORDER-qr-001",
  "orderId": "order-001",
  "scannedBy": "staff-123",
  "scanLocation": "Terminal 1, Pickup Counter",
  "terminal": "T1",
  "deviceId": "scanner-001"
}
```

**Response (Válido)**:
```json
{
  "success": true,
  "valid": true,
  "data": {
    "id": "qr-001",
    "qrCode": "UETA-ORDER-qr-001",
    "qrData": { /* datos del QR */ },
    "type": "order",
    "active": true
  }
}
```

**Response (Inválido)**:
```json
{
  "success": false,
  "valid": false,
  "reason": "QR code has expired"
}
```

#### GET /api/qr-codes/[code]
Obtener información de un código QR específico.

#### DELETE /api/qr-codes/[code]
Desactivar un código QR (requiere ser el propietario).

---

## 📊 Flujo de Trabajo

### Creación de Orden con QR

1. **Cliente crea orden** → POST /api/orders
   - Se crea la orden en la base de datos
   - Se calculan subtotales, impuestos y descuentos
   - Se genera código QR único para la orden
   - Se almacena información del cliente y vuelo

2. **Sistema genera QR code**
   - Tipo: `order`
   - Datos incluidos: customer, order, flight info
   - Validez: 7 días
   - Se almacena en `customer_qr_codes`

3. **Cliente recibe QR**
   - En respuesta del API
   - Por email/notificación
   - Puede mostrar en app móvil

### Recolección en Aeropuerto

1. **Cliente presenta QR** en punto de recolección

2. **Staff escanea QR** → POST /api/qr-codes/validate
   - Se valida el código
   - Se verifica que no haya expirado
   - Se verifica que esté activo

3. **Sistema registra escaneo**
   - En tabla `order_qr_scans`
   - Timestamp, ubicación, staff member
   - Resultado del escaneo

4. **Se actualiza orden** → PATCH /api/orders/[id]
   - Status: `completed`
   - `collected_at`: timestamp
   - `collected_by`: staff member

---

## 🔒 Seguridad

### Validaciones Implementadas

1. **Autenticación**
   - Todos los endpoints requieren sesión válida
   - Verificación de propiedad de recursos

2. **QR Codes**
   - Códigos únicos no predecibles
   - Fecha de expiración
   - Estado activo/inactivo
   - Registro de todos los escaneos

3. **Órdenes**
   - Verificación de usuario antes de acceso
   - Registro de cambios de estado
   - Validación de inventario

### Trazabilidad

- Historial completo de cambios de estado (`order_status_history`)
- Registro de todos los escaneos de QR (`order_qr_scans`)
- Timestamps en todas las operaciones
- Identificación de personal que realiza acciones

---

## 📝 Scripts de Migración

### Ejecutar Migración

```bash
node scripts/run-order-migration.js
```

Este script:
1. ✅ Agrega campos a la tabla `ORDERS`
2. ✅ Crea tabla `CUSTOMER_QR_CODES`
3. ✅ Crea tabla `ORDER_STATUS_HISTORY`
4. ✅ Crea tabla `ORDER_QR_SCANS`
5. ✅ Crea tabla `LOYALTY_CARDS`
6. ✅ Crea tabla `LOYALTY_TRANSACTIONS`
7. ✅ Crea índices para optimización

**Resultado**:
```
Migration Summary:
  ✓ Successfully executed: 17
  ⊘ Skipped (already exists): 3
  ✗ Errors: 0
  Total statements: 20
```

---

## 🎯 Casos de Uso

### 1. Compra Online, Recolección en Aeropuerto

**Flujo**:
1. Cliente hace pedido online antes del viaje
2. Proporciona información de vuelo y pasaporte
3. Recibe QR code por email
4. Al llegar al aeropuerto, escanea QR en punto de recolección
5. Staff verifica y entrega pedido

**Beneficios**:
- Sin contacto físico innecesario
- Proceso rápido de recolección
- Trazabilidad completa
- Verificación de identidad

### 2. Programa de Lealtad

**Flujo**:
1. Usuario se registra en programa de lealtad
2. Recibe tarjeta digital con QR code
3. Presenta QR en cada compra
4. Acumula puntos automáticamente
5. Canjea puntos en compras futuras

**Beneficios**:
- Tarjeta siempre disponible en móvil
- Acumulación automática de puntos
- Historial completo de transacciones
- Diferentes tiers de membresía

### 3. Check-in de Vuelo Integrado

**Flujo**:
1. Usuario ingresa información de vuelo en compra
2. Sistema verifica vuelo con aerolínea
3. Genera QR combinado (pase de abordar + orden)
4. Un solo QR para todo el proceso

**Beneficios**:
- Experiencia unificada
- Menos códigos que gestionar
- Integración con sistemas aeroportuarios

---

## 📈 Próximas Mejoras Sugeridas

### Corto Plazo
- [ ] Notificaciones push cuando orden está lista
- [ ] Generación de QR visual (imagen PNG/SVG)
- [ ] Integración con sistemas de pago
- [ ] Dashboard para staff de recolección

### Mediano Plazo
- [ ] App móvil para escaneo de QR
- [ ] Integración con API de aerolíneas
- [ ] Sistema de colas para recolección
- [ ] Análisis de tiempos de recolección

### Largo Plazo
- [ ] Machine learning para predicción de tiempos
- [ ] Integración con Blockchain para trazabilidad
- [ ] Sistema de recompensas gamificado
- [ ] Realidad aumentada para navegación en terminal

---

## 📚 Archivos Creados/Modificados

### Nuevos Archivos

**Scripts**:
- `scripts/04-enhance-orders-and-qr.sql` - Script SQL de migración
- `scripts/run-order-migration.js` - Ejecutor de migración

**Servicios**:
- `lib/services/qr-code.service.ts` - Servicio de códigos QR

**API Endpoints**:
- `app/api/qr-codes/route.ts` - Lista y creación de QR codes
- `app/api/qr-codes/validate/route.ts` - Validación de QR codes
- `app/api/qr-codes/[code]/route.ts` - Operaciones en QR específico

**Documentación**:
- `ORDER_SYSTEM_DOCUMENTATION.md` - Este documento

### Archivos Modificados

- `lib/services/order.service.ts` - Actualizado con todos los nuevos campos
- `app/api/orders/route.ts` - Actualizado para aceptar nuevos campos y generar QR

---

## 🔍 Testing

### Crear Orden de Prueba

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_TOKEN" \
  -d '{
    "items": [
      {"productId": "prod-001", "quantity": 1, "price": 125.00}
    ],
    "terminal": "T1",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "flightNumber": "TEST123"
  }'
```

### Validar QR Code

```bash
curl -X POST http://localhost:3000/api/qr-codes/validate \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "UETA-ORDER-qr-123456789",
    "orderId": "order-123456789",
    "scannedBy": "staff-001",
    "terminal": "T1"
  }'
```

---

**Última actualización**: 14 de Noviembre, 2025
**Versión**: 1.7 - Sistema de Órdenes y QR Codes
