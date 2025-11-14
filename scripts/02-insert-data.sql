-- ================================================
-- Ueta Travel Access - Sample Data
-- Oracle Autonomous Database
-- ================================================

-- ================================================
-- 1. INSERT CATEGORIES
-- ================================================
INSERT INTO categories (id, name_en, name_es, icon) VALUES
('perfumes', 'Perfumes & Fragrances', 'Perfumes y Fragancias', 'sparkles');

INSERT INTO categories (id, name_en, name_es, icon) VALUES
('alcohol', 'Alcohol & Spirits', 'Alcohol y Licores', 'wine');

INSERT INTO categories (id, name_en, name_es, icon) VALUES
('electronics', 'Electronics', 'Electrónica', 'device');

INSERT INTO categories (id, name_en, name_es, icon) VALUES
('confectionery', 'Confectionery', 'Confitería', 'candy');

INSERT INTO categories (id, name_en, name_es, icon) VALUES
('cosmetics', 'Cosmetics & Skincare', 'Cosméticos y Cuidado de la Piel', 'heart');

INSERT INTO categories (id, name_en, name_es, icon) VALUES
('accessories', 'Fashion Accessories', 'Accesorios de Moda', 'bag');

-- ================================================
-- 2. INSERT SUBCATEGORIES
-- ================================================
-- Perfumes subcategories
INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('women', 'perfumes', 'Women', 'Mujeres');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('men', 'perfumes', 'Men', 'Hombres');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('unisex', 'perfumes', 'Unisex', 'Unisex');

-- Alcohol subcategories
INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('whisky', 'alcohol', 'Whisky', 'Whisky');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('champagne', 'alcohol', 'Champagne', 'Champán');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('cognac', 'alcohol', 'Cognac', 'Coñac');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('vodka', 'alcohol', 'Vodka', 'Vodka');

-- Electronics subcategories
INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('audio', 'electronics', 'Audio', 'Audio');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('cameras', 'electronics', 'Cameras', 'Cámaras');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('elec_accessories', 'electronics', 'Accessories', 'Accesorios');

-- Confectionery subcategories
INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('chocolate', 'confectionery', 'Chocolate', 'Chocolate');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('candy', 'confectionery', 'Candy', 'Dulces');

-- Cosmetics subcategories
INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('skincare', 'cosmetics', 'Skincare', 'Cuidado de la Piel');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('makeup', 'cosmetics', 'Makeup', 'Maquillaje');

-- Accessories subcategories
INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('sunglasses', 'accessories', 'Sunglasses', 'Gafas de Sol');

INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES
('watches', 'accessories', 'Watches', 'Relojes');

-- ================================================
-- 3. INSERT PRODUCTS
-- ================================================

-- Perfumes
INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-001', 'chanel-no-5-eau-de-parfum', 'Chanel No. 5 Eau de Parfum 100ml', 'Chanel No. 5 Eau de Parfum 100ml', 'The legendary fragrance by Chanel. A timeless floral bouquet composed around May Rose and Jasmine.', 'La legendaria fragancia de Chanel. Un bouquet floral atemporal compuesto alrededor de Rosa de Mayo y Jazmín.', 125.00, 165.00, 24, 'perfumes', 'women', 'Chanel', '/images/products/chanel-no5.jpg', 15, 'T1', 1, 4.9, 342);

INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-002', 'dior-sauvage-edp', 'Dior Sauvage Eau de Parfum 100ml', 'Dior Sauvage Eau de Parfum 100ml', 'A creation inspired by wide-open spaces. A composition distinguished by a raw freshness.', 'Una creación inspirada en espacios abiertos. Una composición distinguida por una frescura cruda.', 98.50, 135.00, 27, 'perfumes', 'men', 'Dior', '/images/products/dior-sauvage.jpg', 22, 'T1', 1, 4.8, 287);

-- Alcohol
INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-003', 'johnnie-walker-blue-label', 'Johnnie Walker Blue Label 750ml', 'Johnnie Walker Blue Label 750ml', 'Premium Scotch whisky with an exquisitely smooth taste and a luxuriously long finish.', 'Whisky escocés premium con un sabor exquisitamente suave y un final lujosamente largo.', 189.99, 249.99, 24, 'alcohol', 'whisky', 'Johnnie Walker', '/images/products/jw-blue.jpg', 8, 'T1', 1, 4.9, 156);

INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-004', 'moet-chandon-imperial', 'Moët & Chandon Impérial Brut 750ml', 'Moët & Chandon Impérial Brut 750ml', 'The House iconic champagne since 1869. Vibrant, generous, and seductive.', 'El champagne icónico de la casa desde 1869. Vibrante, generoso y seductor.', 52.00, 75.00, 31, 'alcohol', 'champagne', 'Moët & Chandon', '/images/products/moet.jpg', 18, 'T1', 1, 4.7, 203);

-- Electronics
INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-005', 'sony-wh1000xm5', 'Sony WH-1000XM5 Wireless Headphones', 'Sony WH-1000XM5 Audífonos Inalámbricos', 'Industry-leading noise canceling with premium sound quality and up to 30-hour battery life.', 'Cancelación de ruido líder en la industria con calidad de sonido premium y hasta 30 horas de batería.', 349.99, 399.99, 13, 'electronics', 'audio', 'Sony', '/images/products/sony-xm5.jpg', 12, 'T2', 1, 4.8, 421);

INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-006', 'bose-qc45', 'Bose QuietComfort 45 Headphones', 'Bose QuietComfort 45 Audífonos', 'Legendary noise cancellation and premium comfort for the long haul.', 'Cancelación de ruido legendaria y comodidad premium para largos viajes.', 279.00, 329.00, 15, 'electronics', 'audio', 'Bose', '/images/products/bose-qc45.jpg', 10, 'T2', 0, 4.7, 312);

-- Confectionery
INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-007', 'lindt-excellence-gift-box', 'Lindt Excellence Gift Box 400g', 'Lindt Excellence Caja de Regalo 400g', 'Premium Swiss chocolate collection with intense dark chocolate varieties.', 'Colección de chocolate suizo premium con variedades de chocolate negro intenso.', 24.99, 32.00, 22, 'confectionery', 'chocolate', 'Lindt', '/images/products/lindt-box.jpg', 45, 'T1', 0, 4.8, 167);

INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-008', 'godiva-assorted-chocolates', 'Godiva Assorted Chocolates 500g', 'Godiva Chocolates Surtidos 500g', 'Exquisite Belgian chocolate assortment crafted by master chocolatiers.', 'Exquisito surtido de chocolate belga elaborado por maestros chocolateros.', 45.00, 60.00, 25, 'confectionery', 'chocolate', 'Godiva', '/images/products/godiva.jpg', 30, 'T2', 1, 4.9, 234);

-- Cosmetics
INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-009', 'estee-lauder-advanced-night-repair', 'Estée Lauder Advanced Night Repair 50ml', 'Estée Lauder Advanced Night Repair 50ml', 'Renowned night serum that reduces visible signs of aging while you sleep.', 'Reconocido sérum nocturno que reduce los signos visibles del envejecimiento mientras duermes.', 89.00, 120.00, 26, 'cosmetics', 'skincare', 'Estée Lauder', '/images/products/estee-night.jpg', 25, 'T1', 1, 4.8, 567);

INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-010', 'lancome-genifique-serum', 'Lancôme Génifique Youth Activating Serum 50ml', 'Lancôme Génifique Sérum Activador de Juventud 50ml', 'Advanced youth-activating concentrate for radiant, youthful-looking skin.', 'Concentrado avanzado activador de juventud para una piel radiante y de aspecto joven.', 95.00, 115.00, 17, 'cosmetics', 'skincare', 'Lancôme', '/images/products/lancome-genifique.jpg', 18, 'T1', 0, 4.7, 389);

-- Accessories
INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-011', 'ray-ban-aviator-classic', 'Ray-Ban Aviator Classic Sunglasses', 'Ray-Ban Aviator Gafas de Sol Clásicas', 'Iconic teardrop shape with superior sun protection and timeless style.', 'Forma icónica de lágrima con protección solar superior y estilo atemporal.', 154.00, 195.00, 21, 'accessories', 'sunglasses', 'Ray-Ban', '/images/products/rayban-aviator.jpg', 20, 'T2', 1, 4.8, 456);

INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count) VALUES
('prod-012', 'michael-kors-lexington-watch', 'Michael Kors Lexington Chronograph Watch', 'Michael Kors Lexington Reloj Cronógrafo', 'Luxury stainless steel watch with chronograph functionality and sophisticated design.', 'Reloj de lujo de acero inoxidable con funcionalidad de cronógrafo y diseño sofisticado.', 198.00, 275.00, 28, 'accessories', 'watches', 'Michael Kors', '/images/products/mk-lexington.jpg', 8, 'T2', 0, 4.6, 178);

-- ================================================
-- 4. INSERT PRODUCT IMAGES
-- ================================================
INSERT INTO product_images (id, product_id, image_url, display_order) VALUES
('img-001', 'prod-001', '/images/products/chanel-no5.jpg', 1);

INSERT INTO product_images (id, product_id, image_url, display_order) VALUES
('img-002', 'prod-001', '/images/products/chanel-no5-2.jpg', 2);

INSERT INTO product_images (id, product_id, image_url, display_order) VALUES
('img-003', 'prod-003', '/images/products/jw-blue.jpg', 1);

INSERT INTO product_images (id, product_id, image_url, display_order) VALUES
('img-004', 'prod-003', '/images/products/jw-blue-2.jpg', 2);

-- ================================================
-- 5. INSERT SAMPLE USER
-- ================================================
INSERT INTO users (id, first_name, last_name, email, phone, language, currency, loyalty_tier, loyalty_points, theme) VALUES
('user-001', 'John', 'Smith', 'john.smith@example.com', '+1-305-555-0123', 'en', 'USD', 'gold', 12450, 'light');

INSERT INTO users (id, first_name, last_name, email, phone, language, currency, loyalty_tier, loyalty_points, theme) VALUES
('user-002', 'María', 'García', 'maria.garcia@example.com', '+57-301-555-0456', 'es', 'USD', 'silver', 5230, 'dark');

-- ================================================
-- 6. INSERT FLIGHT INFORMATION
-- ================================================
INSERT INTO flight_info (id, user_id, flight_number, airline, departure_airport, departure_city, departure_terminal, departure_date, departure_gate, arrival_airport, arrival_city, arrival_terminal, arrival_date, class, seat, status) VALUES
('flight-001', 'user-001', 'AA1523', 'American Airlines', 'BOG', 'Bogotá', 'T1', TO_TIMESTAMP('2025-11-20 14:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'A12', 'MIA', 'Miami', '3', TO_TIMESTAMP('2025-11-20 18:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'Business', '2A', 'upcoming');

INSERT INTO flight_info (id, user_id, flight_number, airline, departure_airport, departure_city, departure_terminal, departure_date, departure_gate, arrival_airport, arrival_city, arrival_terminal, arrival_date, class, seat, status) VALUES
('flight-002', 'user-002', 'AV102', 'Avianca', 'BOG', 'Bogotá', 'T1', TO_TIMESTAMP('2025-11-18 09:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'B8', 'JFK', 'New York', '4', TO_TIMESTAMP('2025-11-18 16:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Economy Plus', '15C', 'upcoming');

-- ================================================
-- 7. INSERT PAYMENT METHODS
-- ================================================
INSERT INTO payment_methods (id, user_id, type, brand, last4, expiry_month, expiry_year, is_default) VALUES
('pay-001', 'user-001', 'credit', 'Visa', '4532', 8, 2027, 1);

INSERT INTO payment_methods (id, user_id, type, brand, last4, expiry_month, expiry_year, is_default) VALUES
('pay-002', 'user-001', 'credit', 'Mastercard', '5123', 3, 2026, 0);

INSERT INTO payment_methods (id, user_id, type, brand, last4, expiry_month, expiry_year, is_default) VALUES
('pay-003', 'user-002', 'debit', 'Visa', '4916', 12, 2025, 1);

-- ================================================
-- 8. INSERT TERMINALS
-- ================================================
INSERT INTO terminals (id, code, name_en, name_es, airport, pickup_time_en, pickup_time_es) VALUES
('term-001', 'T1', 'Terminal 1 - El Dorado International', 'Terminal 1 - El Dorado Internacional', 'BOG', 'Allow 2-3 hours before departure', 'Permita 2-3 horas antes de la salida');

INSERT INTO terminals (id, code, name_en, name_es, airport, pickup_time_en, pickup_time_es) VALUES
('term-002', 'T2', 'Terminal 2 - El Dorado International', 'Terminal 2 - El Dorado Internacional', 'BOG', 'Allow 2-3 hours before departure', 'Permita 2-3 horas antes de la salida');

-- ================================================
-- 9. INSERT TERMINAL STORES
-- ================================================
INSERT INTO terminal_stores (id, terminal_id, name, location, hours) VALUES
('store-001', 'term-001', 'Duty Free Americas', 'Gate A12-A20', '05:00 - 23:00');

INSERT INTO terminal_stores (id, terminal_id, name, location, hours) VALUES
('store-002', 'term-001', 'Ueta Travel Luxury', 'Main Hall', '06:00 - 22:00');

INSERT INTO terminal_stores (id, terminal_id, name, location, hours) VALUES
('store-003', 'term-002', 'Premium Selection', 'Gate B5-B15', '05:30 - 23:30');

-- ================================================
-- 10. INSERT TERMINAL STORE CATEGORIES
-- ================================================
INSERT INTO terminal_store_categories (store_id, category_id) VALUES ('store-001', 'perfumes');
INSERT INTO terminal_store_categories (store_id, category_id) VALUES ('store-001', 'alcohol');
INSERT INTO terminal_store_categories (store_id, category_id) VALUES ('store-001', 'confectionery');
INSERT INTO terminal_store_categories (store_id, category_id) VALUES ('store-002', 'perfumes');
INSERT INTO terminal_store_categories (store_id, category_id) VALUES ('store-002', 'cosmetics');
INSERT INTO terminal_store_categories (store_id, category_id) VALUES ('store-002', 'accessories');
INSERT INTO terminal_store_categories (store_id, category_id) VALUES ('store-003', 'electronics');
INSERT INTO terminal_store_categories (store_id, category_id) VALUES ('store-003', 'accessories');

-- ================================================
-- 11. INSERT TERMINAL FEATURES
-- ================================================
INSERT INTO terminal_features (id, terminal_id, feature_en, feature_es, display_order) VALUES
('feat-001', 'term-001', 'QR Code Express Pickup', 'Recogida Express con Código QR', 1);

INSERT INTO terminal_features (id, terminal_id, feature_en, feature_es, display_order) VALUES
('feat-002', 'term-001', 'Tax-Free Shopping', 'Compras Libres de Impuestos', 2);

INSERT INTO terminal_features (id, terminal_id, feature_en, feature_es, display_order) VALUES
('feat-003', 'term-001', 'Loyalty Points Redemption', 'Canje de Puntos de Lealtad', 3);

INSERT INTO terminal_features (id, terminal_id, feature_en, feature_es, display_order) VALUES
('feat-004', 'term-002', 'Click & Reserve Available', 'Click & Reserve Disponible', 1);

INSERT INTO terminal_features (id, terminal_id, feature_en, feature_es, display_order) VALUES
('feat-005', 'term-002', 'Premium Product Selection', 'Selección Premium de Productos', 2);

-- ================================================
-- 12. INSERT COUPONS
-- ================================================
INSERT INTO coupons (id, code, type, value, description_en, description_es, min_purchase, max_discount, active, expiry_date, usage_limit) VALUES
('coup-001', 'WELCOME20', 'percentage', 20, 'Welcome discount - 20% off your first purchase', 'Descuento de bienvenida - 20% de descuento en tu primera compra', 50, 100, 1, TO_TIMESTAMP('2025-12-31 23:59:59', 'YYYY-MM-DD HH24:MI:SS'), 1000);

INSERT INTO coupons (id, code, type, value, description_en, description_es, min_purchase, max_discount, active, expiry_date, usage_limit, loyalty_tier_required) VALUES
('coup-002', 'GOLD50', 'fixed', 50, 'Exclusive $50 discount for Gold members', 'Descuento exclusivo de $50 para miembros Gold', 200, 50, 1, TO_TIMESTAMP('2025-12-31 23:59:59', 'YYYY-MM-DD HH24:MI:SS'), 500, 'gold');

INSERT INTO coupons (id, code, type, value, description_en, description_es, min_purchase, max_discount, active, expiry_date) VALUES
('coup-003', 'PERFUME15', 'percentage', 15, '15% off all perfumes and fragrances', '15% de descuento en todos los perfumes y fragancias', 0, 75, 1, TO_TIMESTAMP('2025-11-30 23:59:59', 'YYYY-MM-DD HH24:MI:SS'));

-- ================================================
-- 13. INSERT COUPON CATEGORIES
-- ================================================
INSERT INTO coupon_categories (coupon_id, category_id) VALUES ('coup-003', 'perfumes');

-- ================================================
-- 14. INSERT PROMOTIONS
-- ================================================
INSERT INTO promotions (id, type, title_en, title_es, subtitle_en, subtitle_es, image, cta_en, cta_es, link, coupon_code, active, priority, start_date, end_date) VALUES
('promo-001', 'banner', 'Black Friday Sale', 'Venta Black Friday', 'Up to 40% off on selected items', 'Hasta 40% de descuento en artículos seleccionados', '/images/promotions/black-friday.jpg', 'Shop Now', 'Comprar Ahora', '/shop', NULL, 1, 1, TO_TIMESTAMP('2025-11-15 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-30 23:59:59', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO promotions (id, type, title_en, title_es, subtitle_en, subtitle_es, cta_en, cta_es, link, coupon_code, active, priority, start_date, end_date) VALUES
('promo-002', 'flash', 'Flash Deal: Premium Perfumes', 'Oferta Flash: Perfumes Premium', 'Extra 15% off with code PERFUME15', '15% extra de descuento con código PERFUME15', 'Get Code', 'Obtener Código', '/shop/perfumes', 'PERFUME15', 1, 2, TO_TIMESTAMP('2025-11-14 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-21 23:59:59', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO promotions (id, type, title_en, title_es, subtitle_en, subtitle_es, image, cta_en, cta_es, link, active, priority, start_date, end_date) VALUES
('promo-003', 'deal', 'Holiday Travel Essentials', 'Esenciales para Viajes de Vacaciones', 'Best deals on electronics and beauty', 'Las mejores ofertas en electrónica y belleza', '/images/promotions/holiday-travel.jpg', 'Explore', 'Explorar', '/shop', 1, 3, TO_TIMESTAMP('2025-11-10 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-25 23:59:59', 'YYYY-MM-DD HH24:MI:SS'));

-- ================================================
-- 15. INSERT REVIEWS
-- ================================================
INSERT INTO reviews (id, product_id, user_id, rating, title_en, title_es, comment_en, comment_es, verified, helpful_count) VALUES
('rev-001', 'prod-001', 'user-001', 5, 'Timeless Classic', 'Clásico Atemporal', 'Absolutely love this fragrance. It''s elegant and long-lasting. Perfect for special occasions.', 'Me encanta absolutamente esta fragancia. Es elegante y duradera. Perfecta para ocasiones especiales.', 1, 45);

INSERT INTO reviews (id, product_id, user_id, rating, title_en, title_es, comment_en, comment_es, verified, helpful_count) VALUES
('rev-002', 'prod-003', 'user-002', 5, 'Exceptional Quality', 'Calidad Excepcional', 'Smooth and rich. The Blue Label never disappoints. Worth every penny for special celebrations.', 'Suave y rico. El Blue Label nunca decepciona. Vale cada centavo para celebraciones especiales.', 1, 32);

INSERT INTO reviews (id, product_id, user_id, rating, title_en, title_es, comment_en, comment_es, verified, helpful_count) VALUES
('rev-003', 'prod-005', 'user-001', 5, 'Best Noise Cancelling', 'Mejor Cancelación de Ruido', 'These headphones are incredible for travel. The noise cancellation is industry-leading.', 'Estos audífonos son increíbles para viajar. La cancelación de ruido es líder en la industria.', 1, 67);

-- ================================================
-- 16. INSERT SAMPLE ORDERS
-- ================================================
INSERT INTO orders (id, user_id, total, items_count, status, qr_code, payment_method_id, terminal, pickup_time) VALUES
('order-001', 'user-001', 223.50, 2, 'completed', 'ORDER-001-QR', 'pay-001', 'T1', TO_TIMESTAMP('2025-11-10 13:30:00', 'YYYY-MM-DD HH24:MI:SS'));

-- ================================================
-- 17. INSERT ORDER ITEMS
-- ================================================
INSERT INTO order_items (id, order_id, product_id, quantity, price, subtotal) VALUES
('item-001', 'order-001', 'prod-001', 1, 125.00, 125.00);

INSERT INTO order_items (id, order_id, product_id, quantity, price, subtotal) VALUES
('item-002', 'order-001', 'prod-002', 1, 98.50, 98.50);

-- ================================================
-- 18. INSERT WISHLIST
-- ================================================
INSERT INTO wishlist (id, user_id, product_id) VALUES
('wish-001', 'user-001', 'prod-005');

INSERT INTO wishlist (id, user_id, product_id) VALUES
('wish-002', 'user-001', 'prod-009');

INSERT INTO wishlist (id, user_id, product_id) VALUES
('wish-003', 'user-002', 'prod-003');

-- ================================================
-- Commit all changes
-- ================================================
COMMIT;

-- ================================================
-- Verification Queries
-- ================================================
SELECT 'Categories' AS table_name, COUNT(*) AS row_count FROM categories
UNION ALL
SELECT 'Subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Terminals', COUNT(*) FROM terminals
UNION ALL
SELECT 'Coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'Promotions', COUNT(*) FROM promotions
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
ORDER BY table_name;
