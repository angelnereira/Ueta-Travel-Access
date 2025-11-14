# Ueta Travel Access - API Documentation

## Base URL
```
http://localhost:3000/api (development)
https://your-domain.com/api (production)
```

## Authentication

### Register
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Smith",
  "language": "en"
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
      "loyaltyTier": "bronze",
      "loyaltyPoints": 0
    },
    "sessionToken": "base64_encoded_token"
  }
}
```

### Login
Create a session for a user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
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

### Change Password
Update user password.

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Cookie: session=your_session_token
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
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

## Orders

### Get User Orders
Retrieve all orders for the authenticated user.

**Endpoint:** `GET /api/orders`

**Headers:**
```
Cookie: session=your_session_token
```

**Query Parameters:**
- `limit` (number, optional, default: 20): Maximum number of results
- `offset` (number, optional, default: 0): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-001",
      "userId": "user-001",
      "terminal": "T1",
      "totalAmount": 250.00,
      "status": "completed",
      "items": [
        {
          "productId": "prod-001",
          "quantity": 2,
          "price": 125.00
        }
      ],
      "createdAt": "2025-11-14T10:30:00Z"
    }
  ]
}
```

### Create Order
Create a new order.

**Endpoint:** `POST /api/orders`

**Headers:**
```
Cookie: session=your_session_token
```

**Request Body:**
```json
{
  "terminal": "T1",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "price": 125.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-001",
    "userId": "user-001",
    "terminal": "T1",
    "totalAmount": 250.00,
    "status": "pending",
    "items": [...],
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

### Get Order by ID
Retrieve a specific order.

**Endpoint:** `GET /api/orders/[id]`

**Headers:**
```
Cookie: session=your_session_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-001",
    "userId": "user-001",
    "terminal": "T1",
    "totalAmount": 250.00,
    "status": "completed",
    "items": [...],
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

### Update Order Status
Update the status of an order.

**Endpoint:** `PATCH /api/orders/[id]`

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order updated successfully"
}
```

### Cancel Order
Cancel an order.

**Endpoint:** `DELETE /api/orders/[id]`

**Headers:**
```
Cookie: session=your_session_token
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

## Reviews

### Create Review
Create a product review.

**Endpoint:** `POST /api/reviews`

**Headers:**
```
Cookie: session=your_session_token
```

**Request Body:**
```json
{
  "productId": "prod-001",
  "rating": 5,
  "comment": "Excellent product! Highly recommended."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review-001",
    "userId": "user-001",
    "productId": "prod-001",
    "rating": 5,
    "comment": "Excellent product! Highly recommended.",
    "helpful": 0,
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

### Get Product Reviews
Get all reviews for a product with statistics.

**Endpoint:** `GET /api/products/[id]/reviews`

**Query Parameters:**
- `limit` (number, optional, default: 10): Maximum number of reviews
- `offset` (number, optional, default: 0): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review-001",
        "userId": "user-001",
        "userName": "John Smith",
        "rating": 5,
        "comment": "Excellent product!",
        "helpful": 12,
        "createdAt": "2025-11-14T10:30:00Z"
      }
    ],
    "stats": {
      "averageRating": 4.8,
      "totalReviews": 342,
      "distribution": {
        "5": 280,
        "4": 45,
        "3": 10,
        "2": 5,
        "1": 2
      }
    },
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 342
    }
  }
}
```

### Mark Review as Helpful
Mark a review as helpful.

**Endpoint:** `POST /api/reviews/[id]/helpful`

**Headers:**
```
Cookie: session=your_session_token
```

**Response:**
```json
{
  "success": true,
  "message": "Review marked as helpful"
}
```

## Coupons

### Get Active Coupons
Get all active coupons, optionally filtered by user tier.

**Endpoint:** `GET /api/coupons`

**Query Parameters:**
- `userTier` (string, optional): Filter by loyalty tier (bronze, silver, gold, platinum)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "coupon-001",
      "code": "WELCOME20",
      "type": "percentage",
      "value": 20,
      "description": {
        "en": "20% off your first purchase",
        "es": "20% de descuento en tu primera compra"
      },
      "minPurchase": 50.00,
      "maxDiscount": 100.00,
      "active": true,
      "expiryDate": "2025-12-31T23:59:59Z",
      "usageLimit": 1000,
      "usageCount": 234,
      "loyaltyTierRequired": "bronze"
    }
  ]
}
```

### Validate Coupon
Validate a coupon code for a cart.

**Endpoint:** `POST /api/coupons/validate`

**Headers:**
```
Cookie: session=your_session_token
```

**Request Body:**
```json
{
  "code": "WELCOME20",
  "cartTotal": 150.00,
  "categories": ["perfumes", "cosmetics"],
  "userTier": "gold"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": 30.00,
    "finalTotal": 120.00
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Minimum purchase of $50.00 required"
}
```

### Apply Coupon
Apply a coupon to an order.

**Endpoint:** `POST /api/coupons/apply`

**Headers:**
```
Cookie: session=your_session_token
```

**Request Body:**
```json
{
  "code": "WELCOME20",
  "orderId": "order-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully"
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

## Security

### Password Hashing
- All passwords are hashed using **bcrypt** with SALT_ROUNDS = 10
- Minimum password length: 8 characters
- Passwords are never stored in plain text

### Session Management
- Sessions are stored in HTTP-only cookies
- Session tokens are valid for 7 days
- Automatic session cleanup on logout

### Authorization
- All protected endpoints require valid session tokens
- Order and review endpoints verify resource ownership
- Coupon validation checks user tier requirements

## Next Steps

1. **Authentication Enhancement**:
   - ✅ Implement password hashing with bcrypt (COMPLETED)
   - Add OAuth 2.0 / OpenID Connect
   - Integrate Oracle IDCS/IAM

2. **Business Features**:
   - ✅ Order management system (COMPLETED)
   - ✅ Product review system (COMPLETED)
   - ✅ Coupon and discount system (COMPLETED)
   - Add wishlist functionality
   - Implement payment processing integration
   - Add inventory management

3. **API Gateway**:
   - Deploy API Gateway on OCI
   - Add request validation
   - Implement API versioning

4. **Monitoring**:
   - Add APM (Application Performance Monitoring)
   - Implement logging with Oracle Logging Service
   - Set up alerts for errors

5. **Security**:
   - Add CORS configuration
   - Implement request signing
   - Add input validation middleware
   - Implement rate limiting

---

Last Updated: November 14, 2025
