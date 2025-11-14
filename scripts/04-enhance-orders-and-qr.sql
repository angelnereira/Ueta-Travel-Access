-- ================================================
-- Ueta Travel Access - Orders Enhancement & QR Codes
-- Adds detailed order tracking and customer QR codes
-- ================================================

-- ================================================
-- ENHANCE ORDERS TABLE
-- Add more detailed fields for complete order tracking
-- ================================================

-- Add customer information fields
ALTER TABLE orders ADD (
    customer_name VARCHAR2(200),
    customer_email VARCHAR2(200),
    customer_phone VARCHAR2(50),
    customer_passport VARCHAR2(50),
    customer_nationality VARCHAR2(50)
);

-- Add flight information
ALTER TABLE orders ADD (
    flight_number VARCHAR2(20),
    flight_date TIMESTAMP,
    departure_airport VARCHAR2(10),
    arrival_airport VARCHAR2(10)
);

-- Add payment and discount information
ALTER TABLE orders ADD (
    subtotal NUMBER(10,2) DEFAULT 0,
    tax_amount NUMBER(10,2) DEFAULT 0,
    discount_amount NUMBER(10,2) DEFAULT 0,
    coupon_code VARCHAR2(50),
    payment_status VARCHAR2(20) DEFAULT 'pending',
    payment_method VARCHAR2(50)
);

-- Add order fulfillment tracking
ALTER TABLE orders ADD (
    pickup_location VARCHAR2(200),
    pickup_instructions CLOB,
    collected_at TIMESTAMP,
    collected_by VARCHAR2(200),
    notes CLOB
);

-- Add constraints for new fields
ALTER TABLE orders ADD CONSTRAINT chk_payment_status
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));

-- Add indexes for better query performance
CREATE INDEX idx_order_flight ON orders(flight_number, flight_date);
CREATE INDEX idx_order_payment_status ON orders(payment_status);
CREATE INDEX idx_order_pickup_time ON orders(pickup_time);
CREATE INDEX idx_order_qr ON orders(qr_code);

-- Add comments
COMMENT ON COLUMN orders.customer_name IS 'Customer full name';
COMMENT ON COLUMN orders.customer_email IS 'Customer email for notifications';
COMMENT ON COLUMN orders.customer_phone IS 'Customer contact phone';
COMMENT ON COLUMN orders.customer_passport IS 'Customer passport number for verification';
COMMENT ON COLUMN orders.flight_number IS 'Associated flight number';
COMMENT ON COLUMN orders.flight_date IS 'Flight departure date/time';
COMMENT ON COLUMN orders.subtotal IS 'Total before tax and discounts';
COMMENT ON COLUMN orders.tax_amount IS 'Tax amount applied';
COMMENT ON COLUMN orders.discount_amount IS 'Total discount applied';
COMMENT ON COLUMN orders.coupon_code IS 'Applied coupon code';
COMMENT ON COLUMN orders.payment_status IS 'Payment processing status';
COMMENT ON COLUMN orders.pickup_location IS 'Specific pickup point within terminal';
COMMENT ON COLUMN orders.collected_at IS 'Timestamp when order was collected';
COMMENT ON COLUMN orders.collected_by IS 'Staff member who processed collection';

-- ================================================
-- CREATE CUSTOMER QR CODES TABLE
-- Store customer identification QR codes
-- ================================================

CREATE TABLE customer_qr_codes (
    id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50) NOT NULL,
    qr_code VARCHAR2(500) UNIQUE NOT NULL,
    qr_data CLOB NOT NULL,
    type VARCHAR2(20) DEFAULT 'customer',
    purpose VARCHAR2(100),
    flight_id VARCHAR2(50),
    active NUMBER(1) DEFAULT 1,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_qr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_qr_flight FOREIGN KEY (flight_id) REFERENCES flight_info(id),
    CONSTRAINT chk_qr_type CHECK (type IN ('customer', 'boarding', 'loyalty', 'order'))
);

COMMENT ON TABLE customer_qr_codes IS 'Customer identification and order QR codes';
COMMENT ON COLUMN customer_qr_codes.qr_code IS 'Unique QR code identifier';
COMMENT ON COLUMN customer_qr_codes.qr_data IS 'JSON data encoded in QR (customer info, flight, etc)';
COMMENT ON COLUMN customer_qr_codes.type IS 'Type of QR code (customer ID, order, boarding pass)';
COMMENT ON COLUMN customer_qr_codes.purpose IS 'Specific purpose or description';
COMMENT ON COLUMN customer_qr_codes.flight_id IS 'Associated flight for boarding pass QR codes';
COMMENT ON COLUMN customer_qr_codes.active IS 'Whether QR code is currently active';
COMMENT ON COLUMN customer_qr_codes.expires_at IS 'Expiration timestamp for temporary QR codes';

-- Create indexes
CREATE INDEX idx_customer_qr_user ON customer_qr_codes(user_id);
CREATE INDEX idx_customer_qr_code ON customer_qr_codes(qr_code);
CREATE INDEX idx_customer_qr_flight ON customer_qr_codes(flight_id);
CREATE INDEX idx_customer_qr_active ON customer_qr_codes(active);
CREATE INDEX idx_customer_qr_type ON customer_qr_codes(type);

-- ================================================
-- CREATE ORDER STATUS HISTORY TABLE
-- Track all status changes for orders
-- ================================================

CREATE TABLE order_status_history (
    id VARCHAR2(50) PRIMARY KEY,
    order_id VARCHAR2(50) NOT NULL,
    previous_status VARCHAR2(20),
    new_status VARCHAR2(20) NOT NULL,
    changed_by VARCHAR2(50),
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT chk_history_prev_status CHECK (previous_status IN ('pending', 'ready', 'completed', 'cancelled')),
    CONSTRAINT chk_history_new_status CHECK (new_status IN ('pending', 'ready', 'completed', 'cancelled'))
);

COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';
COMMENT ON COLUMN order_status_history.changed_by IS 'User ID or system identifier who made the change';

CREATE INDEX idx_order_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_history_created ON order_status_history(created_at);

-- ================================================
-- CREATE ORDER QR SCANS TABLE
-- Track QR code scans for order pickup
-- ================================================

CREATE TABLE order_qr_scans (
    id VARCHAR2(50) PRIMARY KEY,
    order_id VARCHAR2(50) NOT NULL,
    qr_code VARCHAR2(500) NOT NULL,
    scanned_by VARCHAR2(50),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scan_location VARCHAR2(200),
    terminal VARCHAR2(10),
    device_id VARCHAR2(100),
    result VARCHAR2(20) DEFAULT 'success',
    notes CLOB,
    CONSTRAINT fk_qr_scan_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT chk_scan_result CHECK (result IN ('success', 'failed', 'invalid', 'expired'))
);

COMMENT ON TABLE order_qr_scans IS 'Track all QR code scans for order pickup verification';
COMMENT ON COLUMN order_qr_scans.scanned_by IS 'Staff member who scanned the QR code';
COMMENT ON COLUMN order_qr_scans.scan_location IS 'Physical location within terminal';
COMMENT ON COLUMN order_qr_scans.result IS 'Scan validation result';

CREATE INDEX idx_qr_scan_order ON order_qr_scans(order_id);
CREATE INDEX idx_qr_scan_time ON order_qr_scans(scanned_at);
CREATE INDEX idx_qr_scan_code ON order_qr_scans(qr_code);

-- ================================================
-- CREATE CUSTOMER LOYALTY CARDS TABLE
-- Digital loyalty cards with QR codes
-- ================================================

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loyalty_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_loyalty_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    CONSTRAINT chk_loyalty_status CHECK (status IN ('active', 'suspended', 'expired', 'cancelled'))
);

COMMENT ON TABLE loyalty_cards IS 'Digital loyalty cards with QR codes for quick scanning';
COMMENT ON COLUMN loyalty_cards.card_number IS 'Unique card number (visible on card)';
COMMENT ON COLUMN loyalty_cards.qr_code IS 'QR code for quick card identification';
COMMENT ON COLUMN loyalty_cards.points IS 'Current available points';
COMMENT ON COLUMN loyalty_cards.points_lifetime IS 'Total points earned (never decreases)';

CREATE INDEX idx_loyalty_user ON loyalty_cards(user_id);
CREATE INDEX idx_loyalty_card_number ON loyalty_cards(card_number);
CREATE INDEX idx_loyalty_qr ON loyalty_cards(qr_code);
CREATE INDEX idx_loyalty_tier ON loyalty_cards(tier);

-- ================================================
-- CREATE LOYALTY TRANSACTIONS TABLE
-- Track all loyalty point transactions
-- ================================================

CREATE TABLE loyalty_transactions (
    id VARCHAR2(50) PRIMARY KEY,
    loyalty_card_id VARCHAR2(50) NOT NULL,
    order_id VARCHAR2(50),
    type VARCHAR2(20) NOT NULL,
    points NUMBER(10,0) NOT NULL,
    balance_after NUMBER(10,0) NOT NULL,
    description VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loyalty_trans_card FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id),
    CONSTRAINT fk_loyalty_trans_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT chk_loyalty_type CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted', 'bonus'))
);

COMMENT ON TABLE loyalty_transactions IS 'All loyalty point transactions history';
COMMENT ON COLUMN loyalty_transactions.type IS 'Type of transaction (earned from purchase, redeemed, etc)';
COMMENT ON COLUMN loyalty_transactions.points IS 'Points added (positive) or deducted (negative)';
COMMENT ON COLUMN loyalty_transactions.balance_after IS 'Point balance after this transaction';

CREATE INDEX idx_loyalty_trans_card ON loyalty_transactions(loyalty_card_id);
CREATE INDEX idx_loyalty_trans_order ON loyalty_transactions(order_id);
CREATE INDEX idx_loyalty_trans_created ON loyalty_transactions(created_at);

COMMIT;

-- Display success message
SELECT 'Orders and QR Code tables enhanced successfully!' AS status FROM dual;
