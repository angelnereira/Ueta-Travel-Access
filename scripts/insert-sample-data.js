#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function insertData() {
  let connection;

  console.log('\n=== Insertando Datos de Prueba ===\n');

  try {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      walletLocation: process.env.WALLET_LOCATION,
      walletPassword: process.env.WALLET_PASSWORD
    };

    console.log('📡 Conectando...\n');
    connection = await oracledb.getConnection(config);

    // Insert categories
    console.log('📦 Insertando categorías...');
    const categories = [
      ['perfumes', 'Perfumes & Fragrances', 'Perfumes y Fragancias', 'sparkles'],
      ['alcohol', 'Alcohol & Spirits', 'Alcohol y Licores', 'wine'],
      ['electronics', 'Electronics', 'Electrónica', 'device'],
      ['confectionery', 'Confectionery', 'Confitería', 'candy'],
      ['cosmetics', 'Cosmetics & Skincare', 'Cosméticos y Cuidado de la Piel', 'heart'],
      ['accessories', 'Fashion Accessories', 'Accesorios de Moda', 'bag']
    ];

    for (const [id, name_en, name_es, icon] of categories) {
      try {
        await connection.execute(
          `INSERT INTO categories (id, name_en, name_es, icon) VALUES (:id, :name_en, :name_es, :icon)`,
          { id, name_en, name_es, icon },
          { autoCommit: true }
        );
      } catch (err) {
        if (!err.message.includes('ORA-00001')) throw err;
      }
    }
    console.log('  ✓ 6 categorías');

    // Insert subcategories
    console.log('📦 Insertando subcategorías...');
    const subcategories = [
      ['women', 'perfumes', 'Women', 'Mujeres'],
      ['men', 'perfumes', 'Men', 'Hombres'],
      ['unisex', 'perfumes', 'Unisex', 'Unisex'],
      ['whisky', 'alcohol', 'Whisky', 'Whisky'],
      ['champagne', 'alcohol', 'Champagne', 'Champán'],
      ['audio', 'electronics', 'Audio', 'Audio'],
      ['chocolate', 'confectionery', 'Chocolate', 'Chocolate'],
      ['skincare', 'cosmetics', 'Skincare', 'Cuidado de la Piel'],
      ['sunglasses', 'accessories', 'Sunglasses', 'Gafas de Sol']
    ];

    for (const [id, category_id, name_en, name_es] of subcategories) {
      try {
        await connection.execute(
          `INSERT INTO subcategories (id, category_id, name_en, name_es) VALUES (:id, :category_id, :name_en, :name_es)`,
          { id, category_id, name_en, name_es },
          { autoCommit: true }
        );
      } catch (err) {
        if (!err.message.includes('ORA-00001')) throw err;
      }
    }
    console.log('  ✓ 9 subcategorías');

    // Insert products
    console.log('📦 Insertando productos...');
    const products = [
      {
        id: 'prod-001',
        slug: 'chanel-no-5-eau-de-parfum',
        name_en: 'Chanel No. 5 Eau de Parfum 100ml',
        name_es: 'Chanel No. 5 Eau de Parfum 100ml',
        description_en: 'The legendary fragrance by Chanel. A timeless floral bouquet.',
        description_es: 'La legendaria fragancia de Chanel. Un bouquet floral atemporal.',
        price: 125.00,
        original_price: 165.00,
        discount: 24,
        category_id: 'perfumes',
        subcategory_id: 'women',
        brand: 'Chanel',
        image: '/images/products/chanel-no5.jpg',
        stock: 15,
        terminal: 'T1',
        featured: 1,
        rating: 4.9,
        reviews_count: 342
      },
      {
        id: 'prod-002',
        slug: 'dior-sauvage-edp',
        name_en: 'Dior Sauvage Eau de Parfum 100ml',
        name_es: 'Dior Sauvage Eau de Parfum 100ml',
        description_en: 'A creation inspired by wide-open spaces.',
        description_es: 'Una creación inspirada en espacios abiertos.',
        price: 98.50,
        original_price: 135.00,
        discount: 27,
        category_id: 'perfumes',
        subcategory_id: 'men',
        brand: 'Dior',
        image: '/images/products/dior-sauvage.jpg',
        stock: 22,
        terminal: 'T1',
        featured: 1,
        rating: 4.8,
        reviews_count: 287
      },
      {
        id: 'prod-003',
        slug: 'johnnie-walker-blue-label',
        name_en: 'Johnnie Walker Blue Label 750ml',
        name_es: 'Johnnie Walker Blue Label 750ml',
        description_en: 'Premium Scotch whisky with an exquisitely smooth taste.',
        description_es: 'Whisky escocés premium con un sabor exquisitamente suave.',
        price: 189.99,
        original_price: 249.99,
        discount: 24,
        category_id: 'alcohol',
        subcategory_id: 'whisky',
        brand: 'Johnnie Walker',
        image: '/images/products/jw-blue.jpg',
        stock: 8,
        terminal: 'T1',
        featured: 1,
        rating: 4.9,
        reviews_count: 156
      },
      {
        id: 'prod-004',
        slug: 'moet-chandon-imperial',
        name_en: 'Moët & Chandon Impérial Brut 750ml',
        name_es: 'Moët & Chandon Impérial Brut 750ml',
        description_en: 'The House iconic champagne since 1869.',
        description_es: 'El champagne icónico de la casa desde 1869.',
        price: 52.00,
        original_price: 75.00,
        discount: 31,
        category_id: 'alcohol',
        subcategory_id: 'champagne',
        brand: 'Moët & Chandon',
        image: '/images/products/moet.jpg',
        stock: 18,
        terminal: 'T1',
        featured: 1,
        rating: 4.7,
        reviews_count: 203
      },
      {
        id: 'prod-005',
        slug: 'sony-wh1000xm5',
        name_en: 'Sony WH-1000XM5 Wireless Headphones',
        name_es: 'Sony WH-1000XM5 Audífonos Inalámbricos',
        description_en: 'Industry-leading noise canceling with premium sound quality.',
        description_es: 'Cancelación de ruido líder en la industria con calidad de sonido premium.',
        price: 349.99,
        original_price: 399.99,
        discount: 13,
        category_id: 'electronics',
        subcategory_id: 'audio',
        brand: 'Sony',
        image: '/images/products/sony-xm5.jpg',
        stock: 12,
        terminal: 'T2',
        featured: 1,
        rating: 4.8,
        reviews_count: 421
      }
    ];

    for (const p of products) {
      try {
        await connection.execute(
          `INSERT INTO products (id, slug, name_en, name_es, description_en, description_es, price, original_price, discount, category_id, subcategory_id, brand, image, stock, terminal, featured, rating, reviews_count)
           VALUES (:id, :slug, :name_en, :name_es, :description_en, :description_es, :price, :original_price, :discount, :category_id, :subcategory_id, :brand, :image, :stock, :terminal, :featured, :rating, :reviews_count)`,
          p,
          { autoCommit: true }
        );
      } catch (err) {
        if (!err.message.includes('ORA-00001')) throw err;
      }
    }
    console.log('  ✓ 5 productos');

    // Insert users
    console.log('📦 Insertando usuarios...');
    try {
      await connection.execute(
        `INSERT INTO users (id, first_name, last_name, email, phone, language, loyalty_tier, loyalty_points)
         VALUES ('user-001', 'John', 'Smith', 'john.smith@example.com', '+1-305-555-0123', 'en', 'gold', 12450)`,
        {},
        { autoCommit: true }
      );
    } catch (err) {
      if (!err.message.includes('ORA-00001')) throw err;
    }
    console.log('  ✓ 1 usuario');

    // Insert terminals
    console.log('📦 Insertando terminales...');
    const terminals = [
      ['term-001', 'T1', 'Terminal 1 - El Dorado International', 'Terminal 1 - El Dorado Internacional', 'BOG', 'Allow 2-3 hours before departure', 'Permita 2-3 horas antes de la salida'],
      ['term-002', 'T2', 'Terminal 2 - El Dorado International', 'Terminal 2 - El Dorado Internacional', 'BOG', 'Allow 2-3 hours before departure', 'Permita 2-3 horas antes de la salida']
    ];

    for (const [id, code, name_en, name_es, airport, pickup_time_en, pickup_time_es] of terminals) {
      try {
        await connection.execute(
          `INSERT INTO terminals (id, code, name_en, name_es, airport, pickup_time_en, pickup_time_es)
           VALUES (:id, :code, :name_en, :name_es, :airport, :pickup_time_en, :pickup_time_es)`,
          { id, code, name_en, name_es, airport, pickup_time_en, pickup_time_es },
          { autoCommit: true }
        );
      } catch (err) {
        if (!err.message.includes('ORA-00001')) throw err;
      }
    }
    console.log('  ✓ 2 terminales');

    // Insert coupons
    console.log('📦 Insertando cupones...');
    try {
      await connection.execute(
        `INSERT INTO coupons (id, code, type, value, description_en, description_es, min_purchase, max_discount, active, expiry_date, usage_limit)
         VALUES ('coup-001', 'WELCOME20', 'percentage', 20, 'Welcome discount - 20% off', 'Descuento de bienvenida - 20% de descuento', 50, 100, 1, TO_TIMESTAMP('2025-12-31 23:59:59', 'YYYY-MM-DD HH24:MI:SS'), 1000)`,
        {},
        { autoCommit: true }
      );
    } catch (err) {
      if (!err.message.includes('ORA-00001')) throw err;
    }
    console.log('  ✓ 1 cupón');

    // Insert promotions
    console.log('📦 Insertando promociones...');
    try {
      await connection.execute(
        `INSERT INTO promotions (id, type, title_en, title_es, subtitle_en, subtitle_es, active, priority, start_date, end_date)
         VALUES ('promo-001', 'banner', 'Black Friday Sale', 'Venta Black Friday', 'Up to 40% off', 'Hasta 40% de descuento', 1, 1, TO_TIMESTAMP('2025-11-15 00:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-11-30 23:59:59', 'YYYY-MM-DD HH24:MI:SS'))`,
        {},
        { autoCommit: true }
      );
    } catch (err) {
      if (!err.message.includes('ORA-00001')) throw err;
    }
    console.log('  ✓ 1 promoción');

    console.log('\n✅ Todos los datos insertados exitosamente!\n');

    // Verify
    console.log('📊 Verificando datos:\n');
    const result = await connection.execute(`SELECT COUNT(*) FROM categories`);
    console.log(`  Categories: ${result.rows[0][0]}`);

    const result2 = await connection.execute(`SELECT COUNT(*) FROM products`);
    console.log(`  Products: ${result2.rows[0][0]}`);

    const result3 = await connection.execute(`SELECT COUNT(*) FROM users`);
    console.log(`  Users: ${result3.rows[0][0]}\n`);

    await connection.close();
    console.log('✅ Proceso completado\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (connection) await connection.close();
    process.exit(1);
  }
}

insertData();
