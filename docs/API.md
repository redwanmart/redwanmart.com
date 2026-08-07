# Redwan Mart API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.redwanmart.com` (or `https://redwanmart.com/api`)

## Authentication

All endpoints that require authentication use JWT tokens in the `Authorization` header:

```
Authorization: Bearer <token>
```

Get a token by logging in via `/api/auth/login`.

## API Endpoints

### Products

#### Get Products (Paginated)
```
GET /api/products?limit=20&offset=0&category=audio&featured=false
```

**Query Parameters:**
- `id` - Get single product by ID or slug
- `limit` - Items per page (max 100, default 20)
- `offset` - Pagination offset (default 0)
- `category` - Filter by category
- `featured` - Only featured products (true/false)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_1",
      "name": "Premium Wireless Headphones",
      "slug": "premium-wireless-headphones",
      "price": 199.99,
      "category": "Audio",
      "image_url": "https://assets.redwanmart.com/...",
      "rating": 4.8,
      "reviews_count": 245,
      "in_stock": true,
      "featured": true
    }
  ],
  "total": 20,
  "limit": 20,
  "offset": 0
}
```

#### Create Product
```
POST /api/products
```

**Headers:**
- `Authorization: Bearer <admin-token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "name": "New Product",
  "slug": "new-product",
  "description": "Product description",
  "price": 99.99,
  "category": "Electronics",
  "sku": "SKU-001",
  "in_stock": true,
  "stock_quantity": 50,
  "featured": false,
  "rating": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "prod_new_123",
    "name": "New Product",
    ...
  }
}
```

### Categories

#### Get All Categories
```
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "cat_1",
      "name": "Electronics",
      "slug": "electronics",
      "description": "High-tech gadgets and devices",
      "display_order": 1
    },
    ...
  ]
}
```

### Search

#### Search Products
```
GET /api/search?q=headphones&category=audio&sort=relevance&minPrice=100&maxPrice=300
```

**Query Parameters:**
- `q` - Search query (required, 1-100 chars)
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sort` - Sort by: relevance, price_asc, price_desc, rating, newest (default: relevance)
- `limit` - Results per page (max 100, default 20)
- `offset` - Pagination offset

**Response:**
```json
{
  "success": true,
  "query": "headphones",
  "results": [
    {
      "id": "prod_1",
      "name": "Premium Wireless Headphones",
      ...
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0,
  "filters": {
    "category": "audio",
    "minPrice": "100",
    "maxPrice": "300",
    "sort": "relevance"
  }
}
```

### Reviews

#### Get Product Reviews
```
GET /api/reviews?productId=prod_1&limit=20&offset=0
```

**Query Parameters:**
- `productId` - Product ID (required)
- `limit` - Items per page (max 100, default 20)
- `offset` - Pagination offset

**Response:**
```json
{
  "success": true,
  "productId": "prod_1",
  "reviews": [
    {
      "id": "rev_1",
      "rating": 5,
      "title": "Excellent product!",
      "comment": "Very satisfied with the quality...",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "verified_purchase": true,
      "helpful_count": 42,
      "created_at": "2026-08-01T10:30:00Z"
    }
  ],
  "limit": 20,
  "offset": 0
}
```

#### Create Review
```
POST /api/reviews
```

**Headers:**
- `Authorization: Bearer <user-token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "productId": "prod_1",
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Very satisfied with the quality and performance."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "id": "rev_new_123",
    "productId": "prod_1",
    "rating": 5,
    ...
  }
}
```

### Media Upload

#### Upload Media
```
POST /api/media-upload
```

**Headers:**
- `Authorization: Bearer <admin-token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file` - File to upload (image or video)
- `productId` - Associated product ID
- `type` - Media type: image, video, or thumbnail

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "media": {
    "id": "media_123456",
    "type": "image",
    "url": "https://assets.redwanmart.com/products/prod_1/image-123456.jpg",
    "key": "products/prod_1/image-123456.jpg",
    "productId": "prod_1"
  }
}
```

#### Get Product Media
```
GET /api/media-upload?productId=prod_1
```

**Query Parameters:**
- `productId` - Product ID (required)

**Response:**
```json
{
  "success": true,
  "productId": "prod_1",
  "media": [
    {
      "id": "media_1",
      "type": "image",
      "r2_url": "https://assets.redwanmart.com/...",
      "mime_type": "image/jpeg",
      "created_at": "2026-08-01T10:00:00Z"
    }
  ]
}
```

### Authentication

#### Login
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "admin@redwanmart.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "user_admin_1",
    "email": "admin@redwanmart.com",
    "role": "admin"
  }
}
```

#### Verify Token
```
POST /api/auth/verify
GET /api/auth/verify
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "userId": "user_admin_1",
    "email": "admin@redwanmart.com",
    "role": "admin"
  },
  "expiresIn": 86400
}
```

### Webhooks

#### Higgsfield AI Generation Callback
```
POST /api/webhooks/higgsfield
```

**Payload:**
```json
{
  "jobId": "job_12345",
  "status": "completed",
  "urls": ["https://assets.redwanmart.com/generated/image1.jpg"],
  "productId": "prod_1",
  "mediaType": "image",
  "prompt": "Professional product photography..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generation results saved",
  "jobId": "job_12345",
  "mediaCount": 1,
  "productId": "prod_1"
}
```

#### Check Job Status
```
GET /api/webhooks/higgsfield?jobId=job_12345
```

**Response:**
```json
{
  "success": true,
  "jobId": "job_12345",
  "status": "completed",
  "urls": [...],
  "completedAt": "2026-08-01T10:30:00Z"
}
```

### Analytics

#### Track Event
```
POST /api/analytics
```

**Body:**
```json
{
  "eventType": "product_view",
  "productId": "prod_1",
  "userId": "user_123",
  "eventData": {
    "source": "search",
    "referrer": "google"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event recorded"
}
```

#### Get Analytics Summary
```
GET /api/analytics/summary?days=7
```

**Headers:**
- `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalEvents": 1250,
    "uniqueVisitors": 342,
    "topProducts": [...],
    "topEvents": [...],
    "conversionRate": 0.362,
    "period": {
      "start": "2026-07-31T...",
      "end": "2026-08-07T..."
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error information (optional)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

API endpoints are currently unlimited in development. Production will implement rate limiting:
- Public endpoints: 1000 requests/hour
- Authenticated endpoints: 5000 requests/hour

## Pagination

For list endpoints with pagination:

```
GET /api/products?limit=20&offset=0
```

**Response includes:**
- `limit` - Items per page
- `offset` - Current offset
- `total` - Total available items

## Testing

### cURL Examples

Get all products:
```bash
curl https://redwanmart.com/api/products
```

Get single product:
```bash
curl "https://redwanmart.com/api/products?id=prod_1"
```

Login:
```bash
curl -X POST https://redwanmart.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@redwanmart.com","password":"admin123"}'
```

Create product (requires token):
```bash
curl -X POST https://redwanmart.com/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "slug": "new-product",
    "description": "...",
    "price": 99.99,
    "category": "Electronics"
  }'
```

## SDK/Client Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- REST API Client

## Support

For API support and issues, please contact:
- Email: api-support@redwanmart.com
- Documentation: https://docs.redwanmart.com/api
- GitHub Issues: https://github.com/redwanmart/redwanmart.com/issues
