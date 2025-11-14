# Ueta Travel Access - PWA

A premium Progressive Web App for seamless duty-free shopping experiences.

## 🚀 Features

- **Click & Reserve**: Effortless shopping with reservation system
- **QR Code Integration**: Loyalty and transaction QR codes
- **Multi-language**: English and Spanish support
- **Dark Mode**: Automatic theme switching
- **Responsive**: Optimized for mobile, tablet, and desktop
- **PWA Ready**: Installable with offline support
- **Oracle Cloud**: Full integration with Oracle Autonomous Database

## 🏗️ Architecture

### Current Phase: Oracle Cloud Integration (Active)
- Oracle Autonomous Database for data persistence
- Oracle Cloud Infrastructure (OCI) deployment
- node-oracledb Thin mode (no Oracle Instant Client required)
- Connection pooling for optimal performance
- Secure wallet-based authentication

### Future Enhancements
- OCI Functions for serverless backend APIs
- Oracle IDCS/IAM authentication for users
- Real-time inventory updates via WebSocket

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Oracle Autonomous Database 19c
- **Database Client**: node-oracledb 6.10+ (Thin mode)
- **Object Storage**: Oracle Cloud Object Storage
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Caching**: In-memory LRU cache
- **QR Codes**: qrcode.react
- **Deployment**: OCI (Oracle Cloud Infrastructure)

## 📦 Project Structure

```
Ueta-Travel-Access/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/Dashboard
│   ├── shop/              # Product catalog
│   ├── product/           # Product details
│   ├── cart/              # Shopping cart
│   └── account/           # User account & QR
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
├── lib/                   # Utilities & logic
│   ├── db/               # Database utilities
│   │   └── oracledb.ts  # Oracle DB connection pool
│   ├── services/         # Business logic services
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   └── auth.service.ts
│   ├── storage/          # Object Storage
│   │   └── object-storage.ts
│   ├── stores/           # Zustand stores
│   ├── cache.ts          # LRU caching layer
│   ├── api.ts            # API abstraction
│   └── i18n.ts           # Internationalization
├── scripts/               # Database scripts
│   ├── 01-create-tables.sql
│   ├── 02-insert-data.sql
│   ├── execute-ddl.js
│   ├── insert-sample-data.js
│   └── verify-schema.js
├── data/                  # Mock data (fallback)
│   ├── products.json
│   ├── user.json
│   └── categories.json
├── wallet/                # Oracle wallet files
│   ├── cwallet.sso
│   └── tnsnames.ora
├── types/                 # TypeScript types
└── public/               # Static assets

## 🚦 Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Oracle Autonomous Database instance
3. Database wallet files downloaded

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Oracle Autonomous Database Configuration
DB_USER=ADMIN
DB_PASSWORD=your_password
DB_CONNECT_STRING=(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=your-host.oraclecloud.com))(connect_data=(service_name=your_service_name))(security=(ssl_server_dn_match=yes)))

# Wallet Configuration
WALLET_LOCATION=/path/to/wallet
WALLET_PASSWORD=your_wallet_password

# Oracle Object Storage Configuration
OCI_NAMESPACE=your_oci_namespace
OCI_BUCKET_NAME=ueta-travel-images
OCI_REGION=sa-bogota-1

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Database Setup

1. **Verify Connection**:
```bash
node test-db-connection.js
```

2. **Create Tables**:
```bash
node scripts/execute-ddl.js
```

3. **Insert Sample Data**:
```bash
node scripts/insert-sample-data.js
```

4. **Verify Schema**:
```bash
node scripts/verify-schema.js
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## 🎨 Design System

### Colors
- **Primary**: Ueta Red (#E60023)
- **Background Light**: #FAFAFA
- **Background Dark**: #1a1a1a
- **Card Light**: #FFFFFF
- **Card Dark**: #2a2a2a

### Typography
- **Font**: Inter (Geist-inspired)
- **Weights**: 300-800

## 🌐 i18n Support

The app supports:
- 🇺🇸 English (EN)
- 🇪🇸 Spanish (ES)

Toggle language using the header button.

## 🗄️ Database Schema

### Tables Overview

The application uses 18 main tables in Oracle Autonomous Database:

#### Core Tables
- **categories**: Product categories (Perfumes, Alcohol, Electronics, etc.)
- **subcategories**: Category subdivisions
- **products**: Product catalog with pricing and inventory
- **product_images**: Multiple product images

#### User Management
- **users**: User profiles and preferences
- **flight_info**: Flight details for travelers
- **payment_methods**: Saved payment cards
- **wishlist**: User favorite products

#### Transactions
- **orders**: Customer orders
- **order_items**: Line items for each order
- **reviews**: Product reviews and ratings

#### Marketing
- **coupons**: Discount codes and promotions
- **coupon_categories**: Coupon applicability
- **promotions**: Banner promotions and deals

#### Locations
- **terminals**: Airport terminals
- **terminal_stores**: Stores within terminals
- **terminal_store_categories**: Store inventory categories
- **terminal_features**: Terminal amenities

### Sample Data

The database comes preloaded with:
- 6 product categories
- 9 subcategories
- 5 sample products (Chanel No. 5, Johnnie Walker Blue, Sony XM5, etc.)
- 2 airport terminals
- 1 sample user
- 1 promotional coupon

### Database Connection

The app uses `node-oracledb` in Thin mode with connection pooling:
- Min connections: 1
- Max connections: 10
- Connection timeout: 60 seconds
- Auto-commit enabled for most operations

Connection module: [lib/db/oracledb.ts](lib/db/oracledb.ts)

## 🌐 API Routes

The application provides REST API endpoints for all major operations:

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update user preferences
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products (with filters: category, featured, search)
- `GET /api/products/[id]` - Get product by ID or slug

### Categories
- `GET /api/categories` - Get all categories with subcategories

### File Upload
- `POST /api/upload` - Upload image to Object Storage
- `GET /api/upload` - Get presigned URL for temporary access
- `DELETE /api/upload` - Delete image from Object Storage

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

## 📦 Services Layer

### Product Service
```typescript
import { ProductService } from '@/lib/services/product.service';

// Get all products
const products = await ProductService.getAll({ category: 'perfumes', limit: 10 });

// Get product by slug
const product = await ProductService.getBySlug('chanel-no-5-eau-de-parfum');

// Search products
const results = await ProductService.search('chanel');
```

### Category Service
```typescript
import { CategoryService } from '@/lib/services/category.service';

// Get all categories
const categories = await CategoryService.getAll();

// Get category by ID
const category = await CategoryService.getById('perfumes');
```

### Auth Service
```typescript
import { AuthService } from '@/lib/services/auth.service';

// Get user by email
const user = await AuthService.getUserByEmail('user@example.com');

// Create new user
const newUser = await AuthService.createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Smith'
});
```

## 🗂️ Object Storage

Images are stored in Oracle Cloud Object Storage with automatic optimization:

```typescript
import { uploadProductImage, uploadUserAvatar } from '@/lib/storage/object-storage';

// Upload product image
const imageUrl = await uploadProductImage(imageBuffer, 'prod-001', 0);

// Upload user avatar
const avatarUrl = await uploadUserAvatar(imageBuffer, 'user-001');
```

**Features:**
- Automatic image format detection (JPEG, PNG, GIF, WebP)
- Unique file naming with timestamps
- Public URLs for images
- Pre-authenticated requests (PAR) for temporary access
- Folder organization (products, avatars, promotions)

## 💾 Caching Strategy

Intelligent LRU (Least Recently Used) caching for optimal performance:

```typescript
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';

// Cache with automatic fetching
const products = await cache.getOrSet(
  CacheKeys.products('filters'),
  async () => await fetchFromDB(),
  CacheTTL.medium
);

// Cache statistics
const stats = cache.getStats();
// { size: 45, hitRate: '87.5%', hits: 350, misses: 50 }
```

**Cache TTLs:**
- Short: 2 minutes
- Medium: 5 minutes
- Long: 15 minutes
- Very Long: 1 hour

## 🔄 State Management

### Stores
- `cart-store`: Shopping cart state
- `favorites-store`: Favorite products
- `order-store`: Order history & QR codes
- `theme-store`: Light/dark theme
- `language-store`: Language preference

All stores persist to localStorage.

## 📱 PWA Features

- Installable on mobile devices
- Offline-ready with service worker
- App shortcuts for quick access
- Native app-like experience

## 🔮 Future Enhancements

1. **Backend APIs**
   - OCI Functions for serverless REST APIs
   - API Gateway for request routing
   - Oracle IDCS/IAM for user authentication

2. **Payment Integration**
   - Credit card processing
   - Digital wallet support (Apple Pay, Google Pay)
   - PCI compliance

3. **Real-time Features**
   - WebSocket for live inventory updates
   - Push notifications for order status
   - Real-time chat support

4. **Advanced Features**
   - Product scanner (camera API)
   - Augmented reality product preview
   - AI-powered personalized recommendations
   - Multi-currency support with real-time rates

5. **Analytics**
   - Oracle Analytics Cloud integration
   - Customer behavior tracking
   - Inventory optimization insights

## 📄 License

Proprietary - Ueta Travel

## 🤝 Contributing

This is a proprietary project. For contributions, please contact the development team.

---

Built with ❤️ for travelers worldwide
