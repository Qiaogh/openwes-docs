# OpenWES API Documentation

## 🔐 Authentication

All API requests must include an authentication token in the header:

```http
Authorization: Bearer <your_access_token>
```

### Token Format
- JWT (JSON Web Token)
- Expires after 24 hours
- Must be included in all API requests

### Authentication Errors
| Status Code | Description | Solution |
|-------------|-------------|-----------|
| 401 | Invalid token | Refresh your token or log in again |
| 403 | Insufficient permissions | Contact administrator for required permissions |
| 419 | Token expired | Get a new token using refresh token |

## 🌐 Base Information

**Base URL**: `https://api.warehouse.example.com/v1`  
**Endpoint**: `POST /execute`  
**Content-Type**: `application/json`

## 📝 Request Format

### Common Headers
```http
Content-Type: application/json
Authorization: Bearer <your_access_token>
X-Request-ID: <unique_request_id>
```

### Common Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| apiType | String | ✅ | API type identifier |
| body | JSON | ✅ | Request body (varies by apiType) |

## 📦 Available APIs

### SKU Management
---

#### `SKU_CREATE`
Creates a new SKU (Stock Keeping Unit)

🔒 **Required Permissions**: `sku.create`

**Request Body Schema:**
```json
{
    "skuCode": "string",
    "skuName": "string",
    "attributes": {
        "weight": "number",
        "dimensions": {
            "length": "number",
            "width": "number",
            "height": "number"
        },
        "category": "string",
        "specifications": {
            "color": "string",
            "size": "string"
        }
    }
}
```

**Success Response:**
```json
{
    "success": true,
    "code": "200",
    "message": "SKU created successfully",
    "data": {
        "skuId": "string",
        "createdAt": "datetime"
    }
}
```

## 🔄 Response Format

All APIs return responses in the following format:

```json
{
    "success": boolean,
    "code": "string",
    "message": "string",
    "data": object,
    "requestId": "string",
    "timestamp": "datetime"
}
```

## ⚠️ Error Handling

### Common Error Codes
| Code | Status | Description |
|------|---------|-------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid parameters or request body |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Error Response Example
```json
{
    "success": false,
    "code": "400",
    "message": "Invalid request parameters",
    "errors": [
        {
            "field": "skuCode",
            "message": "SKU code cannot be empty"
        }
    ],
    "requestId": "req-123456",
    "timestamp": "2024-02-11T10:30:00Z"
}
```

## 📚 Best Practices

1. Always include a unique `X-Request-ID` in headers for request tracking
2. Handle token expiration by implementing refresh token logic
3. Implement exponential backoff for failed requests
4. Cache frequently used data to minimize API calls
5. Use appropriate HTTP methods for different operations

