# Ueta Travel Access - API Documentation

## Base URL
```
http://localhost:3000/api (development)
https://your-domain.com/api (production)
```

## Authentication

### Login
Create a session for a user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "language": "en",
      "loyaltyTier": "gold",
      "loyaltyPoints": 12450
    },
    "sessionToken": "base64_encoded_token"
  }
}
```

### Get Current User
Get the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Cookie: session=your_session_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "loyaltyTier": "gold",
    "loyaltyPoints": 12450
  }
}
```

### Update User Preferences
Update user preferences.

**Endpoint:** `PATCH /api/auth/me`

**Request Body:**
```json
{
  "language": "es",
  "theme": "dark",
  "notificationsEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "email": "user@example.com",
    // ... updated user data
  }
}
```

### Logout
End the user session.

**Endpoint:** `POST /api/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Products

### Get All Products
Retrieve a list of products with optional filtering.

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `category` (string, optional): Filter by category ID
- `subcategory` (string, optional): Filter by subcategory ID
- `featured` (boolean, optional): Filter featured products
- `terminal` (string, optional): Filter by terminal code
- `search` (string, optional): Search by name, brand, or description
- `limit` (number, optional, default: 20): Maximum number of results
- `offset` (number, optional, default: 0): Pagination offset

**Examples:**
```
GET /api/products
GET /api/products?category=perfumes
GET /api/products?featured=true&limit=10
GET /api/products?search=chanel&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-001",
      "slug": "chanel-no-5-eau-de-parfum",
      "name": {
        "en": "Chanel No. 5 Eau de Parfum 100ml",
        "es": "Chanel No. 5 Eau de Parfum 100ml"
      },
      "description": {
        "en": "The legendary fragrance by Chanel...",
        "es": "La legendaria fragancia de Chanel..."
      },
      "price": 125.00,
      "currency": "USD",
      "originalPrice": 165.00,
      "discount": 24,
      "category": "perfumes",
      "subCategory": "women",
      "brand": "Chanel",
      "image": "/images/products/chanel-no5.jpg",
      "images": ["/images/products/chanel-no5.jpg"],
      "stock": 15,
      "terminal": "T1",
      "featured": true,
      "rating": 4.9,
      "reviews": 342
    }
  ],
  "count": 1,
  "cached": false
}
```

### Get Product by ID or Slug
Retrieve a single product by its ID or slug.

**Endpoint:** `GET /api/products/[id]`

**Examples:**
```
GET /api/products/prod-001
GET /api/products/chanel-no-5-eau-de-parfum
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod-001",
    "slug": "chanel-no-5-eau-de-parfum",
    "name": {
      "en": "Chanel No. 5 Eau de Parfum 100ml",
      "es": "Chanel No. 5 Eau de Parfum 100ml"
    },
    "price": 125.00,
    // ... full product data
    "images": [
      "/images/products/chanel-no5.jpg",
      "/images/products/chanel-no5-2.jpg"
    ]
  }
}
```

## Categories

### Get All Categories
Retrieve all categories with their subcategories.

**Endpoint:** `GET /api/categories`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "perfumes",
      "name": {
        "en": "Perfumes & Fragrances",
        "es": "Perfumes y Fragancias"
      },
      "icon": "sparkles",
      "subcategories": [
        {
          "id": "women",
          "name": {
            "en": "Women",
            "es": "Mujeres"
          }
        },
        {
          "id": "men",
          "name": {
            "en": "Men",
            "es": "Hombres"
          }
        }
      ],
      "productCount": 15
    }
  ],
  "count": 6
}
```

## File Upload

### Upload Image
Upload an image to Oracle Object Storage.

**Endpoint:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (File, required): The image file to upload
- `folder` (string, optional, default: "products"): Folder in object storage
- `name` (string, optional): Custom file name

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://objectstorage.sa-bogota-1.oraclecloud.com/n/namespace/b/bucket/o/products/1234567890-product.jpg",
    "objectName": "products/1234567890-product.jpg",
    "bucket": "ueta-travel-images"
  }
}
```

### Get Presigned URL
Get a temporary URL for accessing a private object.

**Endpoint:** `GET /api/upload`

**Query Parameters:**
- `object` (string, required): Object name in storage
- `hours` (number, optional, default: 24): Expiration time in hours

**Example:**
```
GET /api/upload?object=products/image.jpg&hours=48
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://objectstorage.sa-bogota-1.oraclecloud.com/p/...",
    "expiresIn": "48 hours"
  }
}
```

### Delete Image
Delete an image from Oracle Object Storage.

**Endpoint:** `DELETE /api/upload`

**Request Body:**
```json
{
  "objectName": "products/1234567890-product.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Caching

The API implements intelligent caching with the following TTL values:
- **Products**: 5 minutes (medium TTL)
- **Categories**: 15 minutes (long TTL)
- **Featured Products**: 5 minutes (medium TTL)
- **User Data**: Not cached

Cache statistics are available on server-rendered pages and can be monitored for optimization.

## Rate Limiting

Currently, there is no rate limiting implemented. In production, consider implementing:
- Rate limiting per IP address
- Rate limiting per user session
- API key authentication for external consumers

## Database Integration

All API endpoints connect to Oracle Autonomous Database using:
- **Connection Pool**: Min 1, Max 10 connections
- **Thin Mode**: No Oracle Client installation required
- **Secure Wallet**: TLS encrypted connections
- **Auto-commit**: Enabled by default for read operations

## Object Storage

Images are stored in Oracle Cloud Object Storage:
- **Bucket**: `ueta-travel-images`
- **Region**: `sa-bogota-1`
- **Access**: Public read, private write
- **Folders**:
  - `products/`: Product images
  - `avatars/`: User avatar images
  - `promotions/`: Promotional banners

## Next Steps

1. **Authentication Enhancement**:
   - Implement password hashing with bcrypt
   - Add OAuth 2.0 / OpenID Connect
   - Integrate Oracle IDCS/IAM

2. **API Gateway**:
   - Deploy API Gateway on OCI
   - Add request validation
   - Implement API versioning

3. **Monitoring**:
   - Add APM (Application Performance Monitoring)
   - Implement logging with Oracle Logging Service
   - Set up alerts for errors

4. **Security**:
   - Add CORS configuration
   - Implement request signing
   - Add input validation middleware

---

Last Updated: November 14, 2025
