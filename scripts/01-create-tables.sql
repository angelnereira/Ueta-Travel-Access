-- ================================================
-- Ueta Travel Access - Database Schema
-- Oracle Autonomous Database
-- ================================================

-- ================================================
-- 1. CATEGORIES TABLE
-- ================================================
CREATE TABLE categories (
    id VARCHAR2(50) PRIMARY KEY,
    name_en VARCHAR2(200) NOT NULL,
    name_es VARCHAR2(200) NOT NULL,
    icon VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categories IS 'Product categories (e.g., Perfumes, Alcohol, Electronics)';

-- ================================================
-- 2. SUBCATEGORIES TABLE
-- ================================================
CREATE TABLE subcategories (
    id VARCHAR2(50) PRIMARY KEY,
    category_id VARCHAR2(50) NOT NULL,
    name_en VARCHAR2(200) NOT NULL,
    name_es VARCHAR2(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subcat_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

COMMENT ON TABLE subcategories IS 'Product subcategories';

-- ================================================
-- 3. PRODUCTS TABLE
-- ================================================
CREATE TABLE products (
    id VARCHAR2(50) PRIMARY KEY,
    slug VARCHAR2(200) UNIQUE NOT NULL,
    name_en VARCHAR2(500) NOT NULL,
    name_es VARCHAR2(500) NOT NULL,
    description_en CLOB,
    description_es CLOB,
    price NUMBER(10,2) NOT NULL,
    currency VARCHAR2(3) DEFAULT 'USD',
    original_price NUMBER(10,2),
    discount NUMBER(3,0) DEFAULT 0,
    category_id VARCHAR2(50) NOT NULL,
    subcategory_id VARCHAR2(50),
    brand VARCHAR2(200),
    image VARCHAR2(500),
    stock NUMBER(10,0) DEFAULT 0,
    terminal VARCHAR2(10),
    featured NUMBER(1) DEFAULT 0,
    rating NUMBER(2,1) DEFAULT 0,
    reviews_count NUMBER(10,0) DEFAULT 0,
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_product_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
    CONSTRAINT chk_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT chk_discount CHECK (discount >= 0 AND discount <= 100)
);

COMMENT ON TABLE products IS 'Duty-free products catalog';

-- Create index for faster searches
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_subcategory ON products(subcategory_id);
CREATE INDEX idx_product_slug ON products(slug);
CREATE INDEX idx_product_featured ON products(featured);

-- ================================================
-- 4. PRODUCT IMAGES TABLE
-- ================================================
CREATE TABLE product_images (
    id VARCHAR2(50) PRIMARY KEY,
    product_id VARCHAR2(50) NOT NULL,
    image_url VARCHAR2(500) NOT NULL,
    display_order NUMBER(3,0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

COMMENT ON TABLE product_images IS 'Additional product images';

CREATE INDEX idx_product_images ON product_images(product_id);

-- ================================================
-- 5. USERS TABLE
-- ================================================
CREATE TABLE users (
    id VARCHAR2(50) PRIMARY KEY,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(200) UNIQUE NOT NULL,
    phone VARCHAR2(50),
    language VARCHAR2(2) DEFAULT 'en',
    currency VARCHAR2(3) DEFAULT 'USD',
    loyalty_tier VARCHAR2(20) DEFAULT 'bronze',
    loyalty_points NUMBER(10,0) DEFAULT 0,
    theme VARCHAR2(10) DEFAULT 'light',
    notifications_enabled NUMBER(1) DEFAULT 1,
    email_updates_enabled NUMBER(1) DEFAULT 1,
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_language CHECK (language IN ('en', 'es')),
    CONSTRAINT chk_loyalty_tier CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    CONSTRAINT chk_theme CHECK (theme IN ('light', 'dark'))
);

COMMENT ON TABLE users IS 'User accounts and profiles';

CREATE INDEX idx_user_email ON users(email);

-- ================================================
-- 6. FLIGHT INFORMATION TABLE
-- ================================================
CREATE TABLE flight_info (
    id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) NOT NULL,
    flight_number VARCHAR2(20) NOT NULL,
    airline VARCHAR2(100) NOT NULL,
    departure_airport VARCHAR2(10) NOT NULL,
    departure_city VARCHAR2(100) NOT NULL,
    departure_terminal VARCHAR2(10),
    departure_date TIMESTAMP NOT NULL,
    departure_gate VARCHAR2(10),
    arrival_airport VARCHAR2(10) NOT NULL,
    arrival_city VARCHAR2(100) NOT NULL,
    arrival_terminal VARCHAR2(10),
    arrival_date TIMESTAMP NOT NULL,
    class VARCHAR2(20),
    seat VARCHAR2(10),
    status VARCHAR2(20) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flight_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_flight_status CHECK (status IN ('upcoming', 'completed', 'cancelled'))
);

COMMENT ON TABLE flight_info IS 'User flight information';

CREATE INDEX idx_flight_user ON flight_info(user_id);
CREATE INDEX idx_flight_date ON flight_info(departure_date);

-- ================================================
-- 7. PAYMENT METHODS TABLE
-- ================================================
CREATE TABLE payment_methods (
    id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) NOT NULL,
    type VARCHAR2(20) NOT NULL,
    brand VARCHAR2(50) NOT NULL,
    last4 VARCHAR2(4) NOT NULL,
    expiry_month NUMBER(2,0) NOT NULL,
    expiry_year NUMBER(4,0) NOT NULL,
    is_default NUMBER(1) DEFAULT 0,
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_payment_type CHECK (type IN ('credit', 'debit'))
);

COMMENT ON TABLE payment_methods IS 'User saved payment methods';

CREATE INDEX idx_payment_user ON payment_methods(user_id);

-- ================================================
-- 8. ORDERS TABLE
-- ================================================
CREATE TABLE orders (
    id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) NOT NULL,
    total NUMBER(10,2) NOT NULL,
    items_count NUMBER(5,0) NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending',
    qr_code VARCHAR2(500),
    payment_method_id VARCHAR2(50),
    terminal VARCHAR2(10),
    pickup_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_order_payment FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    CONSTRAINT chk_order_status CHECK (status IN ('pending', 'ready', 'completed', 'cancelled'))
);

COMMENT ON TABLE orders IS 'Customer orders';

CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_created ON orders(created_at);

-- ================================================
-- 9. ORDER ITEMS TABLE
-- ================================================
CREATE TABLE order_items (
    id VARCHAR2(50) PRIMARY KEY,
    order_id VARCHAR2(50) NOT NULL,
    product_id VARCHAR2(50) NOT NULL,
    quantity NUMBER(5,0) NOT NULL,
    price NUMBER(10,2) NOT NULL,
    discount_applied NUMBER(10,2) DEFAULT 0,
    subtotal NUMBER(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(id)
);

COMMENT ON TABLE order_items IS 'Individual items in orders';

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ================================================
-- 10. REVIEWS TABLE
-- ================================================
CREATE TABLE reviews (
    id VARCHAR2(50) PRIMARY KEY,
    product_id VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(50) NOT NULL,
    rating NUMBER(1,0) NOT NULL,
    title_en VARCHAR2(200),
    title_es VARCHAR2(200),
    comment_en CLOB,
    comment_es CLOB,
    verified NUMBER(1) DEFAULT 0,
    helpful_count NUMBER(10,0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5)
);

COMMENT ON TABLE reviews IS 'Product reviews and ratings';

CREATE INDEX idx_review_product ON reviews(product_id);
CREATE INDEX idx_review_user ON reviews(user_id);

-- ================================================
-- 11. COUPONS TABLE
-- ================================================
CREATE TABLE coupons (
    id VARCHAR2(50) PRIMARY KEY,
    code VARCHAR2(50) UNIQUE NOT NULL,
    type VARCHAR2(20) NOT NULL,
    value NUMBER(10,2) NOT NULL,
    description_en VARCHAR2(500),
    description_es VARCHAR2(500),
    min_purchase NUMBER(10,2) DEFAULT 0,
    max_discount NUMBER(10,2),
    active NUMBER(1) DEFAULT 1,
    expiry_date TIMESTAMP,
    usage_limit NUMBER(10,0),
    usage_count NUMBER(10,0) DEFAULT 0,
    loyalty_tier_required VARCHAR2(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_coupon_type CHECK (type IN ('percentage', 'fixed', 'shipping')),
    CONSTRAINT chk_coupon_tier CHECK (loyalty_tier_required IS NULL OR loyalty_tier_required IN ('bronze', 'silver', 'gold', 'platinum'))
);

COMMENT ON TABLE coupons IS 'Discount coupons and promo codes';

CREATE INDEX idx_coupon_code ON coupons(code);
CREATE INDEX idx_coupon_active ON coupons(active);

-- ================================================
-- 12. COUPON CATEGORIES TABLE (Many-to-Many)
-- ================================================
CREATE TABLE coupon_categories (
    coupon_id VARCHAR2(50) NOT NULL,
    category_id VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (coupon_id, category_id),
    CONSTRAINT fk_coupon_cat_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    CONSTRAINT fk_coupon_cat_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

COMMENT ON TABLE coupon_categories IS 'Categories applicable for each coupon';

-- ================================================
-- 13. TERMINALS TABLE
-- ================================================
CREATE TABLE terminals (
    id VARCHAR2(50) PRIMARY KEY,
    code VARCHAR2(10) UNIQUE NOT NULL,
    name_en VARCHAR2(200) NOT NULL,
    name_es VARCHAR2(200) NOT NULL,
    airport VARCHAR2(10) NOT NULL,
    pickup_time_en VARCHAR2(200),
    pickup_time_es VARCHAR2(200),
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE terminals IS 'Airport terminals with duty-free shops';

CREATE INDEX idx_terminal_code ON terminals(code);

-- ================================================
-- 14. TERMINAL STORES TABLE
-- ================================================
CREATE TABLE terminal_stores (
    id VARCHAR2(50) PRIMARY KEY,
    terminal_id VARCHAR2(50) NOT NULL,
    name VARCHAR2(200) NOT NULL,
    location VARCHAR2(200),
    hours VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_terminal FOREIGN KEY (terminal_id) REFERENCES terminals(id) ON DELETE CASCADE
);

COMMENT ON TABLE terminal_stores IS 'Stores within each terminal';

CREATE INDEX idx_store_terminal ON terminal_stores(terminal_id);

-- ================================================
-- 15. TERMINAL STORE CATEGORIES TABLE (Many-to-Many)
-- ================================================
CREATE TABLE terminal_store_categories (
    store_id VARCHAR2(50) NOT NULL,
    category_id VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, category_id),
    CONSTRAINT fk_store_cat_store FOREIGN KEY (store_id) REFERENCES terminal_stores(id) ON DELETE CASCADE,
    CONSTRAINT fk_store_cat_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

COMMENT ON TABLE terminal_store_categories IS 'Categories available in each store';

-- ================================================
-- 16. TERMINAL FEATURES TABLE
-- ================================================
CREATE TABLE terminal_features (
    id VARCHAR2(50) PRIMARY KEY,
    terminal_id VARCHAR2(50) NOT NULL,
    feature_en VARCHAR2(200) NOT NULL,
    feature_es VARCHAR2(200) NOT NULL,
    display_order NUMBER(3,0) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feature_terminal FOREIGN KEY (terminal_id) REFERENCES terminals(id) ON DELETE CASCADE
);

COMMENT ON TABLE terminal_features IS 'Features and amenities of each terminal';

CREATE INDEX idx_feature_terminal ON terminal_features(terminal_id);

-- ================================================
-- 17. PROMOTIONS TABLE
-- ================================================
CREATE TABLE promotions (
    id VARCHAR2(50) PRIMARY KEY,
    type VARCHAR2(20) NOT NULL,
    title_en VARCHAR2(200) NOT NULL,
    title_es VARCHAR2(200) NOT NULL,
    subtitle_en VARCHAR2(500),
    subtitle_es VARCHAR2(500),
    image VARCHAR2(500),
    cta_en VARCHAR2(100),
    cta_es VARCHAR2(100),
    link VARCHAR2(500),
    coupon_code VARCHAR2(50),
    active NUMBER(1) DEFAULT 1,
    priority NUMBER(3,0) DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_promo_type CHECK (type IN ('banner', 'flash', 'deal')),
    CONSTRAINT fk_promo_coupon FOREIGN KEY (coupon_code) REFERENCES coupons(code)
);

COMMENT ON TABLE promotions IS 'Marketing promotions and banners';

CREATE INDEX idx_promo_active ON promotions(active);
CREATE INDEX idx_promo_dates ON promotions(start_date, end_date);

-- ================================================
-- 18. WISHLIST TABLE
-- ================================================
CREATE TABLE wishlist (
    id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) NOT NULL,
    product_id VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uk_wishlist UNIQUE (user_id, product_id)
);

COMMENT ON TABLE wishlist IS 'User favorite/wishlist products';

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);

-- ================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ================================================

-- Categories
CREATE OR REPLACE TRIGGER trg_categories_update
BEFORE UPDATE ON categories
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Subcategories
CREATE OR REPLACE TRIGGER trg_subcategories_update
BEFORE UPDATE ON subcategories
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Products
CREATE OR REPLACE TRIGGER trg_products_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Users
CREATE OR REPLACE TRIGGER trg_users_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Flight Info
CREATE OR REPLACE TRIGGER trg_flight_info_update
BEFORE UPDATE ON flight_info
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Payment Methods
CREATE OR REPLACE TRIGGER trg_payment_methods_update
BEFORE UPDATE ON payment_methods
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Orders
CREATE OR REPLACE TRIGGER trg_orders_update
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Reviews
CREATE OR REPLACE TRIGGER trg_reviews_update
BEFORE UPDATE ON reviews
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Coupons
CREATE OR REPLACE TRIGGER trg_coupons_update
BEFORE UPDATE ON coupons
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Terminals
CREATE OR REPLACE TRIGGER trg_terminals_update
BEFORE UPDATE ON terminals
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Terminal Stores
CREATE OR REPLACE TRIGGER trg_terminal_stores_update
BEFORE UPDATE ON terminal_stores
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Promotions
CREATE OR REPLACE TRIGGER trg_promotions_update
BEFORE UPDATE ON promotions
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- ================================================
-- SEQUENCES FOR ID GENERATION (Optional)
-- ================================================
CREATE SEQUENCE seq_product_img_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_order_item_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_store_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_feature_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_wishlist_id START WITH 1 INCREMENT BY 1;

-- ================================================
-- GRANT PERMISSIONS (if using specific database user)
-- ================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO ueta_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON products TO ueta_app_user;
-- ... (repeat for all tables as needed)

COMMIT;
