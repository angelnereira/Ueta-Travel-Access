#!/usr/bin/env node

/**
 * Script para poblar la base de datos con el catálogo completo de productos UETA
 * 52 productos en 7 categorías
 */

const path = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env.local')
});

const oracledb = require('oracledb');

// Configuración de Oracle para modo Thin
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    configDir: process.env.WALLET_LOCATION,
    walletLocation: process.env.WALLET_LOCATION,
    walletPassword: process.env.WALLET_PASSWORD
  });
}

const categories = [
  {
    name: 'Licores y Bebidas Espirituosas',
    slug: 'licores-bebidas',
    description: 'Whisky, vodka, gin, ron, tequila, cognac y licores premium duty-free'
  },
  {
    name: 'Perfumes y Fragancias',
    slug: 'perfumes-fragancias',
    description: 'Perfumes y fragancias de lujo para hombre y mujer de marcas reconocidas'
  },
  {
    name: 'Chocolates y Confitería',
    slug: 'chocolates-confiteria',
    description: 'Chocolates premium y confitería de marcas europeas de lujo'
  },
  {
    name: 'Relojes y Accesorios',
    slug: 'relojes-accesorios',
    description: 'Relojes de marcas reconocidas y accesorios de moda'
  },
  {
    name: 'Gafas de Sol',
    slug: 'gafas-sol',
    description: 'Gafas de sol de diseñador con protección UV'
  },
  {
    name: 'Cosméticos y Belleza',
    slug: 'cosmeticos-belleza',
    description: 'Productos de belleza, maquillaje y cuidado de la piel de marcas premium'
  },
  {
    name: 'Bolsos y Accesorios de Lujo',
    slug: 'bolsos-lujo',
    description: 'Bolsos, carteras y accesorios de marcas de lujo'
  }
];

const products = [
  // CATEGORÍA 1: LICORES Y BEBIDAS ESPIRITUOSAS
  {
    category_slug: 'licores-bebidas',
    name: 'Chivas Regal 12 Years Old Blended Scotch Whisky 1L',
    slug: 'chivas-regal-12-years-1l',
    description: 'Whisky escocés mezclado madurado durante al menos 12 años. Mezcla rica y suave que equilibra estilo con sustancia. Color ámbar cálido. Aroma de hierbas silvestres, brezo, miel y frutas de huerto. Sabor cremoso con miel, peras maduras, vainilla, avellana y notas de caramelo.',
    price: 49.00,
    stock_quantity: 50,
    image_url: '/images/products/chivas-12-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Chivas Regal',
      model: '12 Year Old Blended',
      volume: '1000 ml',
      weight: '1.93 kg',
      alcohol: '40% ABV / 80 Proof',
      origin: 'Scotland',
      sku: 'CHV-12Y-1L',
      type: 'Scotch Whisky',
      age: '12 años'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Chivas Regal 12 Years Old 500ml',
    slug: 'chivas-regal-12-years-500ml',
    description: 'Whisky escocés mezclado premium en presentación de 500ml. Perfecto para regalo o viaje.',
    price: 31.00,
    stock_quantity: 40,
    image_url: '/images/products/chivas-12-500ml.jpg',
    specifications: JSON.stringify({
      brand: 'Chivas Regal',
      volume: '500 ml',
      weight: '1.0 kg',
      alcohol: '40% ABV',
      origin: 'Scotland',
      sku: 'CHV-12Y-500ML'
    }),
    is_featured: 0
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Chivas Regal 12 Years Old 4.5L',
    slug: 'chivas-regal-12-years-4-5l',
    description: 'Botella extra grande Magnum de Chivas Regal 12 años. Ideal para celebraciones especiales.',
    price: 227.00,
    stock_quantity: 10,
    image_url: '/images/products/chivas-12-4-5l.jpg',
    specifications: JSON.stringify({
      brand: 'Chivas Regal',
      volume: '4500 ml (4.5L)',
      weight: '8.5 kg',
      alcohol: '40% ABV',
      origin: 'Scotland',
      sku: 'CHV-12Y-4.5L',
      presentation: 'Magnum'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Glenlivet 12 Year Old Single Malt Scotch Whisky 1L',
    slug: 'glenlivet-12-year-1l',
    description: 'Single malt Scotch de Speyside con notas frutales distintivas. Aromas a frutas de huerto, vainilla y miel. Sabor suave con toques cítricos.',
    price: 68.00,
    stock_quantity: 35,
    image_url: '/images/products/glenlivet-12-1l.jpg',
    specifications: JSON.stringify({
      brand: 'The Glenlivet',
      volume: '1000 ml',
      weight: '1.85 kg',
      alcohol: '40% ABV',
      origin: 'Scotland (Speyside)',
      sku: 'GLV-12Y-1L',
      type: 'Single Malt'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: "Ballantine's Finest 1L",
    slug: 'ballantines-finest-1l',
    description: 'Scotch whisky accesible y bien balanceado. Excelente relación calidad-precio.',
    price: 17.00,
    stock_quantity: 60,
    image_url: '/images/products/ballantines-1l.jpg',
    specifications: JSON.stringify({
      brand: "Ballantine's",
      volume: '1000 ml',
      weight: '1.8 kg',
      alcohol: '40% ABV',
      origin: 'Scotland',
      sku: 'BAL-FINEST-1L'
    }),
    is_featured: 0
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Canadian Club Whisky 1L 80P',
    slug: 'canadian-club-1l',
    description: 'Whisky canadiense suave y versátil. Ideal para mezclas o solo.',
    price: 16.00,
    stock_quantity: 55,
    image_url: '/images/products/canadian-club-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Canadian Club',
      volume: '1000 ml',
      weight: '1.75 kg',
      alcohol: '40% ABV / 80 Proof',
      origin: 'Canada',
      sku: 'CC-CLASSIC-1L'
    }),
    is_featured: 0
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Crown Royal Whisky 750ml Special Reserve',
    slug: 'crown-royal-special-reserve-750ml',
    description: 'Whisky canadiense premium en icónica bolsa morada. Regalo distinguido.',
    price: 40.00,
    stock_quantity: 30,
    image_url: '/images/products/crown-royal-750ml.jpg',
    specifications: JSON.stringify({
      brand: 'Crown Royal',
      volume: '750 ml',
      weight: '1.5 kg',
      alcohol: '40% ABV',
      origin: 'Canada',
      sku: 'CR-SR-750ML',
      presentation: 'Bolsa morada de terciopelo'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Fireball Cinnamon Whisky 1L',
    slug: 'fireball-cinnamon-1l',
    description: 'Whisky con sabor intenso a canela. Experiencia única y picante.',
    price: 19.00,
    stock_quantity: 45,
    image_url: '/images/products/fireball-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Fireball',
      volume: '1000 ml',
      weight: '1.7 kg',
      alcohol: '33% ABV',
      origin: 'Canada',
      sku: 'FRB-CIN-1L',
      flavor: 'Cinnamon'
    }),
    is_featured: 0
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Absolut Blue Vodka 1L',
    slug: 'absolut-blue-vodka-1l',
    description: 'Vodka sueco elaborado exclusivamente con ingredientes naturales, sin azúcar añadido. Rico, con cuerpo completo y complejo, pero suave con carácter distintivo de grano y toque de fruta seca.',
    price: 22.00,
    stock_quantity: 70,
    image_url: '/images/products/absolut-blue-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Absolut',
      volume: '1000 ml',
      weight: '1.758 kg',
      alcohol: '40% ABV',
      origin: 'Sweden (Åhus)',
      sku: 'ABS-BLUE-1L',
      type: 'Vodka',
      bottle: 'Diseño icónico transparente'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Absolut Elyx 1L',
    slug: 'absolut-elyx-1l',
    description: 'Vodka premium artesanal de lujo en botella de cobre. Destilado en alambique vintage.',
    price: 45.00,
    stock_quantity: 25,
    image_url: '/images/products/absolut-elyx-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Absolut',
      model: 'Elyx Premium',
      volume: '1000 ml',
      weight: '1.85 kg',
      alcohol: '40% ABV',
      origin: 'Sweden',
      sku: 'ABS-ELYX-1L',
      presentation: 'Botella de cobre'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Grey Goose Vodka 1L',
    slug: 'grey-goose-vodka-1l',
    description: 'Vodka francés ultra premium. Suavidad excepcional y pureza inigualable.',
    price: 45.00,
    stock_quantity: 40,
    image_url: '/images/products/grey-goose-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Grey Goose',
      volume: '1000 ml',
      weight: '1.8 kg',
      alcohol: '40% ABV',
      origin: 'France',
      sku: 'GG-ORIG-1L'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Bombay Sapphire Gin 1L',
    slug: 'bombay-sapphire-gin-1l',
    description: 'Gin londinense con 10 botánicos. Botella azul icónica.',
    price: 30.00,
    stock_quantity: 50,
    image_url: '/images/products/bombay-sapphire-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Bombay Sapphire',
      volume: '1000 ml',
      weight: '1.7 kg',
      alcohol: '40% ABV',
      origin: 'England',
      sku: 'BOM-SAPH-1L',
      botanicals: '10 botánicos'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Beefeater 24 Gin 1L',
    slug: 'beefeater-24-gin-1l',
    description: 'Gin premium con infusión de té. Perfil aromático único.',
    price: 30.00,
    stock_quantity: 40,
    image_url: '/images/products/beefeater-24-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Beefeater',
      model: '24 Premium',
      volume: '1000 ml',
      weight: '1.75 kg',
      alcohol: '40% ABV',
      origin: 'England',
      sku: 'BEE-24-1L',
      infusion: 'Té japonés y chino'
    }),
    is_featured: 0
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Bacardi Gold Rum 1L',
    slug: 'bacardi-gold-rum-1l',
    description: 'Ron dorado premium de Puerto Rico. Suave y aromático.',
    price: 18.00,
    stock_quantity: 60,
    image_url: '/images/products/bacardi-gold-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Bacardi',
      model: 'Gold (Oro)',
      volume: '1000 ml',
      weight: '1.7 kg',
      alcohol: '40% ABV',
      origin: 'Puerto Rico',
      sku: 'BAC-GOLD-1L'
    }),
    is_featured: 0
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Captain Morgan Spiced Rum 1L',
    slug: 'captain-morgan-spiced-1l',
    description: 'Ron especiado con sabor distintivo a vainilla y especias caribeñas.',
    price: 20.00,
    stock_quantity: 55,
    image_url: '/images/products/captain-morgan-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Captain Morgan',
      model: 'Original Spiced',
      volume: '1000 ml',
      weight: '1.75 kg',
      alcohol: '35% ABV',
      origin: 'Jamaica',
      sku: 'CM-SPICED-1L'
    }),
    is_featured: 0
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Don Julio Reposado 750ml',
    slug: 'don-julio-reposado-750ml',
    description: 'Tequila reposado premium de Jalisco, México. Suave y equilibrado.',
    price: 55.00,
    stock_quantity: 30,
    image_url: '/images/products/don-julio-reposado.jpg',
    specifications: JSON.stringify({
      brand: 'Don Julio',
      model: 'Reposado',
      volume: '750 ml',
      weight: '1.6 kg',
      alcohol: '40% ABV',
      origin: 'Mexico (Jalisco)',
      sku: 'DJ-REP-750ML',
      aging: 'Reposado en barrica'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Hennessy VS Cognac 700ml',
    slug: 'hennessy-vs-cognac-700ml',
    description: 'Cognac Very Special de Hennessy. Elegancia francesa en cada copa.',
    price: 45.00,
    stock_quantity: 35,
    image_url: '/images/products/hennessy-vs-700ml.jpg',
    specifications: JSON.stringify({
      brand: 'Hennessy',
      model: 'VS (Very Special)',
      volume: '700 ml',
      weight: '1.5 kg',
      alcohol: '40% ABV',
      origin: 'France (Cognac)',
      sku: 'HEN-VS-700ML'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Martell VSOP Red Barrels 1L',
    slug: 'martell-vsop-red-barrels-1l',
    description: 'Cognac VSOP envejecido en barricas rojas. Sabor complejo y refinado.',
    price: 75.00,
    stock_quantity: 20,
    image_url: '/images/products/martell-vsop-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Martell',
      model: 'VSOP Red Barrels',
      volume: '1000 ml',
      weight: '1.9 kg',
      alcohol: '40% ABV',
      origin: 'France',
      sku: 'MAR-VSOP-1L'
    }),
    is_featured: 1
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Baileys Irish Cream 1L',
    slug: 'baileys-irish-cream-1l',
    description: 'Licor de crema irlandesa original. Perfecto para postres o solo.',
    price: 28.00,
    stock_quantity: 50,
    image_url: '/images/products/baileys-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Baileys',
      model: 'Original Irish Cream',
      volume: '1000 ml',
      weight: '1.8 kg',
      alcohol: '17% ABV',
      origin: 'Ireland',
      sku: 'BAI-ORIG-1L'
    }),
    is_featured: 0
  },
  {
    category_slug: 'licores-bebidas',
    name: 'Jägermeister 1L',
    slug: 'jagermeister-1l',
    description: 'Licor de hierbas alemán con 56 ingredientes botánicos. Sabor único e inconfundible.',
    price: 30.00,
    stock_quantity: 45,
    image_url: '/images/products/jagermeister-1l.jpg',
    specifications: JSON.stringify({
      brand: 'Jägermeister',
      volume: '1000 ml',
      weight: '1.85 kg',
      alcohol: '35% ABV',
      origin: 'Germany',
      sku: 'JAG-ORIG-1L',
      ingredients: '56 hierbas y especias'
    }),
    is_featured: 0
  },

  // CATEGORÍA 2: PERFUMES Y FRAGANCIAS
  {
    category_slug: 'perfumes-fragancias',
    name: 'Carolina Herrera Good Girl EDP 80ml',
    slug: 'carolina-herrera-good-girl-80ml',
    description: 'Fragancia sensual que captura la dualidad de la mujer moderna. Fresca y luminosa, oscura y tormentosa. Notas de almendra, jazmín sambac, tuberosa, haba tonka y cacao. Botella icónica en forma de tacón de stiletto.',
    price: 109.00,
    stock_quantity: 40,
    image_url: '/images/products/ch-good-girl-80ml.jpg',
    specifications: JSON.stringify({
      brand: 'Carolina Herrera',
      model: 'Good Girl',
      volume: '80 ml',
      weight: '0.367 kg',
      type: 'Eau de Parfum',
      gender: 'Femenino',
      origin: 'Spain/France',
      sku: 'CH-GG-EDP-80ML',
      notes: {
        top: 'Almendra',
        middle: 'Jazmín Sambac, Tuberosa',
        base: 'Haba Tonka, Cacao'
      },
      bottle: 'Forma de tacón stiletto'
    }),
    is_featured: 1
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Carolina Herrera Good Girl EDP 50ml',
    slug: 'carolina-herrera-good-girl-50ml',
    description: 'Good Girl en presentación de 50ml. Perfecto para viajes.',
    price: 86.00,
    stock_quantity: 50,
    image_url: '/images/products/ch-good-girl-50ml.jpg',
    specifications: JSON.stringify({
      brand: 'Carolina Herrera',
      volume: '50 ml',
      weight: '0.25 kg',
      type: 'Eau de Parfum',
      gender: 'Femenino',
      sku: 'CH-GG-EDP-50ML'
    }),
    is_featured: 0
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Carolina Herrera 212 VIP Rose EDP 80ml',
    slug: 'carolina-herrera-212-vip-rose-80ml',
    description: 'Fragancia juvenil y chic. Explosión de frutas y flores vibrantes.',
    price: 121.00,
    stock_quantity: 35,
    image_url: '/images/products/ch-212-vip-rose-80ml.jpg',
    specifications: JSON.stringify({
      brand: 'Carolina Herrera',
      model: '212 VIP Rose',
      volume: '80 ml',
      weight: '0.35 kg',
      type: 'Eau de Parfum',
      gender: 'Femenino',
      sku: 'CH-212VR-80ML'
    }),
    is_featured: 1
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Carolina Herrera Bad Boy EDT 100ml',
    slug: 'carolina-herrera-bad-boy-100ml',
    description: 'Fragancia masculina audaz y rebelde. Contraste entre elegancia y rebeldía.',
    price: 95.00,
    stock_quantity: 40,
    image_url: '/images/products/ch-bad-boy-100ml.jpg',
    specifications: JSON.stringify({
      brand: 'Carolina Herrera',
      model: 'Bad Boy',
      volume: '100 ml',
      weight: '0.40 kg',
      type: 'Eau de Toilette',
      gender: 'Masculino',
      sku: 'CH-BB-EDT-100ML'
    }),
    is_featured: 1
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Dior Sauvage EDT 100ml',
    slug: 'dior-sauvage-edt-100ml',
    description: 'Fragancia masculina salvaje y fresca. Bergamota de Calabria, pimienta de Sichuan y Ambroxan.',
    price: 95.00,
    stock_quantity: 55,
    image_url: '/images/products/dior-sauvage-100ml.jpg',
    specifications: JSON.stringify({
      brand: 'Christian Dior',
      model: 'Sauvage',
      volume: '100 ml',
      weight: '0.45 kg',
      type: 'Eau de Toilette',
      gender: 'Masculino',
      origin: 'France',
      sku: 'DIO-SAU-EDT-100ML',
      notes: 'Bergamota de Calabria, Pimienta de Sichuan, Ambroxan'
    }),
    is_featured: 1
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Chanel No. 5 EDP 100ml',
    slug: 'chanel-no5-edp-100ml',
    description: 'Icónico perfume floral aldehídico. Elegancia atemporal de Chanel.',
    price: 135.00,
    stock_quantity: 30,
    image_url: '/images/products/chanel-no5-100ml.jpg',
    specifications: JSON.stringify({
      brand: 'Chanel',
      model: 'No. 5',
      volume: '100 ml',
      weight: '0.50 kg',
      type: 'Eau de Parfum',
      gender: 'Femenino',
      origin: 'France',
      sku: 'CHA-N5-EDP-100ML'
    }),
    is_featured: 1
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Calvin Klein CK One EDT 200ml',
    slug: 'calvin-klein-ck-one-200ml',
    description: 'Fragancia unisex icónica. Fresca, limpia y universal.',
    price: 65.00,
    stock_quantity: 60,
    image_url: '/images/products/ck-one-200ml.jpg',
    specifications: JSON.stringify({
      brand: 'Calvin Klein',
      model: 'CK One',
      volume: '200 ml',
      weight: '0.60 kg',
      type: 'Eau de Toilette',
      gender: 'Unisex',
      origin: 'USA',
      sku: 'CK-ONE-200ML'
    }),
    is_featured: 0
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Calvin Klein Eternity EDP 100ml',
    slug: 'calvin-klein-eternity-100ml',
    description: 'Fragancia femenina romántica y sofisticada. Floral clásica.',
    price: 75.00,
    stock_quantity: 45,
    image_url: '/images/products/ck-eternity-100ml.jpg',
    specifications: JSON.stringify({
      brand: 'Calvin Klein',
      model: 'Eternity',
      volume: '100 ml',
      weight: '0.45 kg',
      type: 'Eau de Parfum',
      gender: 'Femenino',
      sku: 'CK-ETER-100ML'
    }),
    is_featured: 0
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Giorgio Armani Acqua Di Gio EDT 100ml',
    slug: 'armani-acqua-di-gio-100ml',
    description: 'Fragancia acuática marina. Frescura mediterránea en una botella.',
    price: 90.00,
    stock_quantity: 50,
    image_url: '/images/products/armani-acqua-100ml.jpg',
    specifications: JSON.stringify({
      brand: 'Giorgio Armani',
      model: 'Acqua Di Gio',
      volume: '100 ml',
      weight: '0.45 kg',
      type: 'Eau de Toilette',
      gender: 'Masculino',
      origin: 'Italy',
      sku: 'ARM-ADG-100ML',
      family: 'Acuática'
    }),
    is_featured: 1
  },
  {
    category_slug: 'perfumes-fragancias',
    name: 'Hugo Boss Bottled EDT 100ml',
    slug: 'hugo-boss-bottled-100ml',
    description: 'Fragancia masculina elegante y refinada. Clasicismo moderno.',
    price: 75.00,
    stock_quantity: 55,
    image_url: '/images/products/hugo-boss-bottled-100ml.jpg',
    specifications: JSON.stringify({
      brand: 'Hugo Boss',
      model: 'Boss Bottled',
      volume: '100 ml',
      weight: '0.45 kg',
      type: 'Eau de Toilette',
      gender: 'Masculino',
      origin: 'Germany',
      sku: 'HB-BOT-100ML'
    }),
    is_featured: 0
  },

  // CATEGORÍA 3: CHOCOLATES Y CONFITERÍA
  {
    category_slug: 'chocolates-confiteria',
    name: 'Ferrero Rocher T30 375g',
    slug: 'ferrero-rocher-t30-375g',
    description: '30 pralinés premium de chocolate con avellanas en empaque transparente sofisticado. Chocolate con leche (30%), avellanas (28.5%). Perfecto para regalo.',
    price: 27.50,
    stock_quantity: 100,
    image_url: '/images/products/ferrero-t30.jpg',
    specifications: JSON.stringify({
      brand: 'Ferrero',
      model: 'Rocher T30',
      weight: '375g',
      quantity: '30 piezas',
      origin: 'Italy',
      sku: 'FER-T30-375G',
      ingredients: 'Chocolate con leche 30%, Avellanas 28.5%',
      allergens: 'Leche, Avellanas, Trigo, Soya',
      dimensions: '24 x 20 x 4 cm'
    }),
    is_featured: 1
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Ferrero Rocher T48 600g',
    slug: 'ferrero-rocher-t48-600g',
    description: 'Pack World Traveller de 48 piezas. Ideal para viajeros internacionales.',
    price: 45.00,
    stock_quantity: 80,
    image_url: '/images/products/ferrero-t48.jpg',
    specifications: JSON.stringify({
      brand: 'Ferrero',
      model: 'World Traveller T48',
      weight: '600g',
      quantity: '48 piezas',
      origin: 'Italy',
      sku: 'FER-T48-600G'
    }),
    is_featured: 1
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Ferrero Rocher T16 200g',
    slug: 'ferrero-rocher-t16-200g',
    description: 'Caja de 16 piezas. Tamaño perfecto para regalo personal.',
    price: 15.00,
    stock_quantity: 120,
    image_url: '/images/products/ferrero-t16.jpg',
    specifications: JSON.stringify({
      brand: 'Ferrero',
      weight: '200g',
      quantity: '16 piezas',
      origin: 'Italy',
      sku: 'FER-T16-200G'
    }),
    is_featured: 0
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Ferrero Golden Gallery Signature 8 piezas',
    slug: 'ferrero-golden-gallery-8pc',
    description: 'Colección premium de chocolates finos con variedad de sabores gourmet.',
    price: 15.00,
    stock_quantity: 70,
    image_url: '/images/products/ferrero-gallery-8pc.jpg',
    specifications: JSON.stringify({
      brand: 'Ferrero',
      model: 'Golden Gallery Signature',
      quantity: '8 piezas',
      origin: 'Italy',
      sku: 'FER-GG-8PC',
      variety: 'Surtido premium'
    }),
    is_featured: 0
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Godiva Chocolates 8-Piece Gift Box',
    slug: 'godiva-8-piece-gift-box',
    description: 'Surtido de chocolates belgas premium con ganaches sedosos, pralinés cremosos y caramelos. Caja dorada elegante con lazo rojo.',
    price: 27.50,
    stock_quantity: 60,
    image_url: '/images/products/godiva-8pc.jpg',
    specifications: JSON.stringify({
      brand: 'Godiva',
      model: 'Belgian Heritage Collection',
      quantity: '8 piezas',
      weight: '100-120g',
      origin: 'Belgium',
      sku: 'GOD-8PC-BOX',
      varieties: 'Chocolate negro, blanco y con leche',
      presentation: 'Caja dorada con lazo rojo'
    }),
    is_featured: 1
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Godiva Chocolates 18-Piece Gift Box',
    slug: 'godiva-18-piece-gift-box',
    description: 'Surtido de 18 chocolates belgas en caja dorada elegante.',
    price: 45.00,
    stock_quantity: 50,
    image_url: '/images/products/godiva-18pc.jpg',
    specifications: JSON.stringify({
      brand: 'Godiva',
      quantity: '18 piezas',
      weight: '200g',
      origin: 'Belgium',
      sku: 'GOD-18PC-BOX'
    }),
    is_featured: 1
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Godiva Chocolates 36-Piece Holiday Box',
    slug: 'godiva-36-piece-holiday-box',
    description: 'Edición limitada navideña con diseño festivo rojo, dorado y verde. 36 chocolates premium.',
    price: 77.50,
    stock_quantity: 40,
    image_url: '/images/products/godiva-36pc-holiday.jpg',
    specifications: JSON.stringify({
      brand: 'Godiva',
      model: 'Limited Edition Holiday',
      quantity: '36 piezas',
      weight: '400g',
      origin: 'Belgium',
      sku: 'GOD-36PC-HOLIDAY',
      dimensions: '31.7 x 22.8 x 3.3 cm',
      edition: 'Limitada - Holiday'
    }),
    is_featured: 1
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Lindt Lindor Truffles Gift Box 200g',
    slug: 'lindt-lindor-200g',
    description: 'Trufas suizas con centro cremoso que se derrite. Surtido de chocolate con leche, negro y blanco.',
    price: 13.50,
    stock_quantity: 90,
    image_url: '/images/products/lindt-lindor-200g.jpg',
    specifications: JSON.stringify({
      brand: 'Lindt',
      model: 'Lindor Assorted Truffles',
      weight: '200g',
      origin: 'Switzerland',
      sku: 'LIN-LINDOR-200G',
      varieties: 'Chocolate con leche, negro y blanco'
    }),
    is_featured: 0
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Lindt Excellence Sea Salt & Caramel 100g',
    slug: 'lindt-excellence-sea-salt-caramel-100g',
    description: 'Barra de chocolate negro (47% cacao) con trozos crujientes de caramelo y cristales de sal marina.',
    price: 4.50,
    stock_quantity: 150,
    image_url: '/images/products/lindt-sea-salt-100g.jpg',
    specifications: JSON.stringify({
      brand: 'Lindt',
      model: 'Excellence Caramel Sea Salt',
      weight: '100g',
      origin: 'Switzerland',
      sku: 'LIN-EXC-CARA-100G',
      cacao: '47% minimum',
      type: 'Dark Chocolate'
    }),
    is_featured: 0
  },
  {
    category_slug: 'chocolates-confiteria',
    name: 'Toblerone Milk Chocolate 360g',
    slug: 'toblerone-milk-360g',
    description: 'Icónico chocolate suizo triangular con miel y almendras. Empaque amarillo característico.',
    price: 9.00,
    stock_quantity: 100,
    image_url: '/images/products/toblerone-360g.jpg',
    specifications: JSON.stringify({
      brand: 'Toblerone',
      model: 'Swiss Milk Chocolate with Honey & Almond Nougat',
      weight: '360g',
      origin: 'Switzerland',
      sku: 'TOB-MILK-360G',
      shape: 'Triangular icónico'
    }),
    is_featured: 0
  },

  // CATEGORÍA 4: RELOJES Y ACCESORIOS
  {
    category_slug: 'relojes-accesorios',
    name: 'Guess Multi-Function Stainless Steel Watch',
    slug: 'guess-multi-function-watch',
    description: 'Reloj multifunción de acero inoxidable. Cronógrafo con resistencia al agua de 100m. Diseño masculino elegante.',
    price: 120.00,
    stock_quantity: 25,
    image_url: '/images/products/guess-watch.jpg',
    specifications: JSON.stringify({
      brand: 'Guess',
      model: 'U1249G2',
      case_diameter: '46mm',
      case_material: 'Acero inoxidable',
      strap_material: 'Acero inoxidable',
      color: 'Azul',
      gender: 'Masculino',
      origin: 'Switzerland/USA',
      sku: 'GUE-U1249G2',
      functions: 'Cronógrafo multi-función',
      water_resistance: '100m',
      warranty: '2 años internacional'
    }),
    is_featured: 1
  },
  {
    category_slug: 'relojes-accesorios',
    name: 'Adidas Santiago Watch',
    slug: 'adidas-santiago-watch',
    description: 'Reloj deportivo unisex digital/analógico. Resistencia al agua 50m.',
    price: 60.00,
    stock_quantity: 40,
    image_url: '/images/products/adidas-santiago.jpg',
    specifications: JSON.stringify({
      brand: 'Adidas',
      model: 'Santiago',
      case_diameter: '42mm',
      material: 'Silicona/Plástico',
      gender: 'Unisex',
      sku: 'ADI-SANT-42',
      water_resistance: '50m',
      type: 'Deportivo'
    }),
    is_featured: 0
  },
  {
    category_slug: 'relojes-accesorios',
    name: 'Adidas Duramo Watch',
    slug: 'adidas-duramo-watch',
    description: 'Reloj deportivo de resina. Diseño casual y funcional.',
    price: 55.00,
    stock_quantity: 35,
    image_url: '/images/products/adidas-duramo.jpg',
    specifications: JSON.stringify({
      brand: 'Adidas',
      model: 'Duramo',
      case_diameter: '44mm',
      material: 'Resina',
      gender: 'Unisex',
      sku: 'ADI-DUR-44'
    }),
    is_featured: 0
  },
  {
    category_slug: 'relojes-accesorios',
    name: 'Michael Kors Runway Watch',
    slug: 'michael-kors-runway-watch',
    description: 'Reloj de cuarzo femenino en acero inoxidable dorado. Elegancia y sofisticación.',
    price: 185.00,
    stock_quantity: 20,
    image_url: '/images/products/mk-runway.jpg',
    specifications: JSON.stringify({
      brand: 'Michael Kors',
      model: 'Runway',
      case_diameter: '38mm',
      case_material: 'Acero inoxidable dorado',
      gender: 'Femenino',
      origin: 'Switzerland',
      sku: 'MK-RUN-38',
      water_resistance: '100m',
      movement: 'Cuarzo'
    }),
    is_featured: 1
  },

  // CATEGORÍA 5: GAFAS DE SOL
  {
    category_slug: 'gafas-sol',
    name: 'Ray-Ban Aviator Classic RB3025',
    slug: 'ray-ban-aviator-rb3025',
    description: 'Gafas aviador clásicas con montura de metal y lentes verdes G-15. Protección UV 100%. Incluye estuche rígido y paño de limpieza.',
    price: 145.00,
    stock_quantity: 50,
    image_url: '/images/products/rayban-aviator.jpg',
    specifications: JSON.stringify({
      brand: 'Ray-Ban',
      model: 'Aviator Classic RB3025',
      lens_size: '58mm',
      frame_material: 'Metal',
      lens_color: 'Verde clásico G-15',
      uv_protection: '100% UV400',
      origin: 'Italy',
      sku: 'RB-3025-58',
      includes: 'Estuche rígido, paño de limpieza',
      warranty: '2 años'
    }),
    is_featured: 1
  },
  {
    category_slug: 'gafas-sol',
    name: 'Ray-Ban Wayfarer Classic RB2140',
    slug: 'ray-ban-wayfarer-rb2140',
    description: 'Gafas Wayfarer originales en acetato negro brillante. Diseño icónico atemporal.',
    price: 155.00,
    stock_quantity: 45,
    image_url: '/images/products/rayban-wayfarer.jpg',
    specifications: JSON.stringify({
      brand: 'Ray-Ban',
      model: 'Original Wayfarer RB2140',
      lens_size: '50mm',
      frame_material: 'Acetato',
      color: 'Negro brillante',
      origin: 'Italy',
      sku: 'RB-2140-50',
      uv_protection: '100% UV400'
    }),
    is_featured: 1
  },

  // CATEGORÍA 6: COSMÉTICOS Y BELLEZA
  {
    category_slug: 'cosmeticos-belleza',
    name: 'MAC Studio Fix Fluid Foundation SPF 15 30ml',
    slug: 'mac-studio-fix-fluid-30ml',
    description: 'Base líquida de cobertura media a completa con SPF 15. Acabado natural mate. 67 tonos disponibles.',
    price: 32.00,
    stock_quantity: 80,
    image_url: '/images/products/mac-studio-fix.jpg',
    specifications: JSON.stringify({
      brand: 'MAC Cosmetics',
      model: 'Studio Fix Fluid SPF 15',
      volume: '30 ml',
      weight: '80g',
      origin: 'Canada/USA',
      sku: 'MAC-SFF-30ML',
      type: 'Base líquida',
      spf: '15',
      coverage: 'Media a completa',
      finish: 'Natural mate',
      shades: '67 tonos'
    }),
    is_featured: 0
  },
  {
    category_slug: 'cosmeticos-belleza',
    name: 'Lancôme La Vie Est Belle EDP 100ml',
    slug: 'lancome-la-vie-est-belle-100ml',
    description: 'Eau de Parfum femenina con notas de iris, pachulí y vainilla gourmand. Fragancia de felicidad.',
    price: 95.00,
    stock_quantity: 45,
    image_url: '/images/products/lancome-lveb.jpg',
    specifications: JSON.stringify({
      brand: 'Lancôme',
      model: 'La Vie Est Belle',
      volume: '100 ml',
      weight: '0.45 kg',
      type: 'Eau de Parfum',
      gender: 'Femenino',
      origin: 'France',
      sku: 'LAN-LVEB-100ML',
      notes: 'Iris, Pachulí, Vainilla gourmand'
    }),
    is_featured: 1
  },
  {
    category_slug: 'cosmeticos-belleza',
    name: "L'Occitane Shea Butter Hand Cream 150ml",
    slug: 'loccitane-shea-butter-150ml',
    description: 'Crema de manos ultra nutritiva con 20% de karité. Hidratación profunda y protección.',
    price: 29.00,
    stock_quantity: 70,
    image_url: '/images/products/loccitane-shea.jpg',
    specifications: JSON.stringify({
      brand: "L'Occitane",
      model: 'Shea Butter Hand Cream',
      volume: '150 ml',
      weight: '180g',
      origin: 'France',
      sku: 'LOC-SHE-150ML',
      shea_butter: '20%',
      type: 'Crema de manos'
    }),
    is_featured: 0
  },
  {
    category_slug: 'cosmeticos-belleza',
    name: 'Clinique Moisture Surge 72-Hour 75ml',
    slug: 'clinique-moisture-surge-75ml',
    description: 'Hidratante facial gel-crema con tecnología de auto-relleno. Hidratación continua por 72 horas.',
    price: 45.00,
    stock_quantity: 60,
    image_url: '/images/products/clinique-moisture-surge.jpg',
    specifications: JSON.stringify({
      brand: 'Clinique',
      model: 'Moisture Surge 72-Hour Auto-Replenishing Hydrator',
      volume: '75 ml',
      weight: '150g',
      origin: 'USA',
      sku: 'CLI-MS72-75ML',
      type: 'Hidratante facial gel-crema',
      benefit: 'Hidratación 72 horas'
    }),
    is_featured: 0
  },

  // CATEGORÍA 7: BOLSOS Y ACCESORIOS DE LUJO
  {
    category_slug: 'bolsos-lujo',
    name: 'Longchamp Le Pliage Tote Bag Medium',
    slug: 'longchamp-le-pliage-medium',
    description: 'Bolso tote plegable de nylon con asas de cuero. Diseño icónico francés. Capacidad 13L. Disponible en varios colores.',
    price: 125.00,
    stock_quantity: 30,
    image_url: '/images/products/longchamp-tote.jpg',
    specifications: JSON.stringify({
      brand: 'Longchamp',
      model: 'Le Pliage Medium Tote',
      dimensions: '30 x 28 x 20 cm',
      weight: '250g',
      material: 'Nylon plegable con asas de cuero',
      origin: 'France',
      sku: 'LON-LP-MED',
      colors: 'Negro, Navy, Rojo, Beige',
      capacity: '13L'
    }),
    is_featured: 1
  },
  {
    category_slug: 'bolsos-lujo',
    name: 'Coach Signature Canvas Crossbody',
    slug: 'coach-signature-crossbody',
    description: 'Bolso crossbody en canvas con firma Coach y detalles de cuero. Correa ajustable y múltiples compartimentos.',
    price: 195.00,
    stock_quantity: 25,
    image_url: '/images/products/coach-crossbody.jpg',
    specifications: JSON.stringify({
      brand: 'Coach',
      model: 'Signature Canvas Crossbody',
      dimensions: '25 x 16 x 6 cm',
      weight: '400g',
      material: 'Canvas con detalles de cuero',
      origin: 'USA',
      sku: 'COA-SIG-CROSS',
      features: 'Correa ajustable, múltiples compartimentos'
    }),
    is_featured: 1
  }
];

async function seedDatabase() {
  let connection;

  try {
    console.log('🔄 Conectando a la base de datos Oracle...\n');
    connection = await getConnection();
    console.log('✅ Conexión establecida\n');

    // 1. Limpiar datos existentes (opcional - comentado por defecto)
    // console.log('🗑️  Limpiando datos existentes...');
    // await connection.execute('DELETE FROM products');
    // await connection.execute('DELETE FROM categories');
    // await connection.commit();
    // console.log('✅ Datos anteriores eliminados\n');

    // 2. Insertar categorías
    console.log('📁 Insertando categorías...');
    const categoryIds = {};

    for (const category of categories) {
      // Generar ID único
      const categoryId = category.slug.toUpperCase().replace(/-/g, '_');

      try {
        await connection.execute(
          `INSERT INTO categories (id, name_en, name_es, icon)
           VALUES (:id, :name_en, :name_es, :icon)`,
          {
            id: categoryId,
            name_en: category.name,
            name_es: category.name,
            icon: category.slug.split('-')[0]
          },
          { autoCommit: false }
        );
        categoryIds[category.slug] = categoryId;
        console.log(`  ✓ ${category.name} (ID: ${categoryId})`);
      } catch (error) {
        if (error.errorNum === 1) {
          // Categoría ya existe
          categoryIds[category.slug] = categoryId;
          console.log(`  ⚠️  ${category.name} ya existe (ID: ${categoryId})`);
        } else {
          throw error;
        }
      }
    }

    await connection.commit();
    console.log(`\n✅ ${categories.length} categorías procesadas\n`);

    // 3. Insertar productos
    console.log('📦 Insertando productos...\n');
    let productCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const categoryId = categoryIds[product.category_slug];

      if (!categoryId) {
        console.error(`❌ Categoría no encontrada: ${product.category_slug}`);
        continue;
      }

      // Parsear specifications
      const specs = JSON.parse(product.specifications);
      const productId = product.slug.toUpperCase().replace(/-/g, '_').substring(0, 50);

      try {
        await connection.execute(
          `INSERT INTO products (
            id, slug, name_en, name_es, description_en, description_es,
            price, currency, original_price, discount, category_id,
            brand, image, stock, terminal, featured, active
          ) VALUES (
            :id, :slug, :name_en, :name_es, :description_en, :description_es,
            :price, :currency, :original_price, :discount, :category_id,
            :brand, :image, :stock, :terminal, :featured, :active
          )`,
          {
            id: productId,
            slug: product.slug,
            name_en: product.name,
            name_es: product.name,
            description_en: product.description,
            description_es: product.description,
            price: product.price,
            currency: 'USD',
            original_price: product.discount_price || product.price,
            discount: product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0,
            category_id: categoryId,
            brand: specs.brand || 'N/A',
            image: product.image_url,
            stock: product.stock_quantity,
            terminal: 'BOG',
            featured: product.is_featured,
            active: 1
          },
          { autoCommit: false }
        );

        productCount++;

        if (productCount % 10 === 0) {
          console.log(`  ✓ ${productCount} productos insertados...`);
        }

      } catch (error) {
        if (error.errorNum === 1) {
          // Producto ya existe
          skippedCount++;
        } else {
          console.error(`❌ Error al insertar ${product.name}:`, error.message);
          throw error;
        }
      }
    }

    await connection.commit();
    console.log(`\n✅ ${productCount} productos insertados exitosamente`);
    if (skippedCount > 0) {
      console.log(`⚠️  ${skippedCount} productos ya existían\n`);
    }

    // 4. Resumen
    console.log('📊 RESUMEN DE LA BASE DE DATOS:\n');
    console.log('━'.repeat(60));

    const categoryStats = await connection.execute(
      `SELECT c.name_en as name, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.name_en
       ORDER BY c.name_en`
    );

    console.log('\n📁 Productos por categoría:\n');
    categoryStats.rows.forEach(row => {
      console.log(`  ${row.NAME.padEnd(35)} ${row.PRODUCT_COUNT} productos`);
    });

    const featuredCount = await connection.execute(
      `SELECT COUNT(*) as count FROM products WHERE featured = 1`
    );

    console.log('\n⭐ Productos destacados:', featuredCount.rows[0].COUNT);

    const totalValue = await connection.execute(
      `SELECT SUM(price * stock) as total FROM products WHERE active = 1`
    );

    console.log('💰 Valor total del inventario: $' + totalValue.rows[0].TOTAL.toFixed(2), 'USD');

    console.log('\n' + '━'.repeat(60));
    console.log('\n✅ ¡Base de datos poblada exitosamente!\n');
    console.log('🌐 Puedes verificar en:');
    console.log('   http://localhost:3000/api/categories');
    console.log('   http://localhost:3000/api/products\n');

  } catch (error) {
    console.error('\n❌ Error al poblar la base de datos:');
    console.error(error);

    if (connection) {
      try {
        await connection.rollback();
        console.log('↩️  Cambios revertidos (rollback)');
      } catch (rollbackError) {
        console.error('❌ Error al hacer rollback:', rollbackError);
      }
    }

    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Conexión cerrada\n');
      } catch (closeError) {
        console.error('❌ Error al cerrar conexión:', closeError);
      }
    }
  }
}

// Ejecutar el script
seedDatabase();
