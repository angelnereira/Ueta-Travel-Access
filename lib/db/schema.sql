-- Schema para Ueta Travel Access
-- Base de datos para gestión de productos de viaje

-- Tabla de Usuarios
CREATE TABLE users (
    user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR2(255) NOT NULL UNIQUE,
    full_name VARCHAR2(255) NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    phone VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active NUMBER(1) DEFAULT 1
);

-- Tabla de Categorías de Productos
CREATE TABLE categories (
    category_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL UNIQUE,
    slug VARCHAR2(100) NOT NULL UNIQUE,
    description VARCHAR2(500),
    image_url VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos (Paquetes de Viaje, Accesorios, etc.)
CREATE TABLE products (
    product_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id NUMBER NOT NULL,
    name VARCHAR2(255) NOT NULL,
    slug VARCHAR2(255) NOT NULL UNIQUE,
    description CLOB,
    price NUMBER(10,2) NOT NULL,
    discount_price NUMBER(10,2),
    stock_quantity NUMBER DEFAULT 0,
    image_url VARCHAR2(500),
    images CLOB, -- JSON array of image URLs
    specifications CLOB, -- JSON object with product specs
    is_featured NUMBER(1) DEFAULT 0,
    is_active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id)
        REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Tabla de Carritos de Compra
CREATE TABLE carts (
    cart_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    session_id VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de Items del Carrito
CREATE TABLE cart_items (
    cart_item_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    quantity NUMBER DEFAULT 1,
    price NUMBER(10,2) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id)
        REFERENCES carts(cart_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id)
        REFERENCES products(product_id) ON DELETE CASCADE
);

-- Tabla de Lista de Deseos
CREATE TABLE wishlists (
    wishlist_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id)
        REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT uk_wishlist_user_product UNIQUE (user_id, product_id)
);

-- Tabla de Órdenes
CREATE TABLE orders (
    order_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER NOT NULL,
    order_number VARCHAR2(50) NOT NULL UNIQUE,
    total_amount NUMBER(10,2) NOT NULL,
    status VARCHAR2(50) DEFAULT 'pending',
    payment_status VARCHAR2(50) DEFAULT 'pending',
    payment_method VARCHAR2(50),
    shipping_address CLOB, -- JSON object with address details
    billing_address CLOB, -- JSON object with address details
    notes VARCHAR2(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de Items de Órdenes
CREATE TABLE order_items (
    order_item_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    product_name VARCHAR2(255) NOT NULL,
    quantity NUMBER NOT NULL,
    unit_price NUMBER(10,2) NOT NULL,
    total_price NUMBER(10,2) NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id)
        REFERENCES products(product_id)
);

-- Tabla de Códigos QR para Acceso
CREATE TABLE qr_codes (
    qr_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id NUMBER NOT NULL,
    qr_code VARCHAR2(255) NOT NULL UNIQUE,
    qr_data CLOB, -- JSON with QR code data
    is_used NUMBER(1) DEFAULT 0,
    used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qr_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Índices para mejor rendimiento
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured, is_active);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_qr_codes_order ON qr_codes(order_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(qr_code);

-- Insertar categorías iniciales
INSERT INTO categories (name, slug, description) VALUES
    ('Paquetes de Viaje', 'paquetes-viaje', 'Paquetes completos de viaje a diferentes destinos'),
    ('Accesorios de Viaje', 'accesorios-viaje', 'Maletas, mochilas y accesorios para viajeros'),
    ('Seguros de Viaje', 'seguros-viaje', 'Seguros y protección para tu viaje'),
    ('Experiencias', 'experiencias', 'Tours y experiencias únicas');

COMMIT;
