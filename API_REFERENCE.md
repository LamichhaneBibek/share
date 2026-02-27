# API Reference - Updated Endpoints

## Overview
All endpoints are prefixed with `/api`

---

## POST /api/shares
**Create a new share**

### Request Body
```json
{
  "content": "Your text content here",
  "contentType": "text",           // optional, default: "text"
  "expiryHours": 168,              // optional, default: 168 (7 days)
  "oneTimeRead": false             // optional, default: false
}
```

### Response (201)
```json
{
  "id": "uuid-string",
  "slug": "a1b2c3d4",
  "content": "Your text content here",
  "contentType": "text",
  "shareUrl": "/share/a1b2c3d4",
  "expiresAt": "2026-03-06T10:30:00.000Z"
}
```

### Error Responses
- **400**: Empty content
- **413**: Content exceeds 1MB size limit
- **429**: Rate limit exceeded (100 shares per day)
- **500**: Server error

---

## GET /api/shares
**Fetch user's shares with pagination**

### Query Parameters
```
page=1         // optional, default: 1
limit=20       // optional, default: 20, max: 50
```

### Example Request
```
GET /api/shares?page=1&limit=20
```

### Response (200)
```json
{
  "items": [
    {
      "id": "uuid-string",
      "session_id": "user-session-id",
      "slug": "a1b2c3d4",
      "content": "Shared content",
      "content_type": "text",
      "view_count": 5,
      "created_at": "2026-02-27T10:30:00.000Z",
      "expires_at": "2026-03-06T10:30:00.000Z",
      "one_time_read": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Features
- Automatically cleans up expired shares before returning results
- Returns pagination metadata
- Filters by current session (user)
- Sorted by creation date (newest first)

---

## GET /api/shares/[slug]
**Fetch a specific share**

### URL Parameter
```
slug: a1b2c3d4  // 8-character share identifier
```

### Response (200)
```json
{
  "id": "uuid-string",
  "session_id": "user-session-id",
  "slug": "a1b2c3d4",
  "content": "Shared content",
  "content_type": "text",
  "view_count": 6,
  "created_at": "2026-02-27T10:30:00.000Z",
  "expires_at": "2026-03-06T10:30:00.000Z",
  "one_time_read": false
}
```

### Behavior
- **Increments view_count** on each request
- **If one_time_read is true**: Auto-deletes share after reading, subsequent requests return 404
- **If share is expired**: Returns 404 and deletes the share
- **Expired shares cleanup**: Happens automatically before fetching

### Error Responses
- **404**: Share not found or has expired
- **500**: Server error

---

## DELETE /api/shares/[slug]
**Delete a specific share**

### URL Parameter
```
slug: a1b2c3d4
```

### Response (200)
```json
{
  "success": true
}
```

### Error Responses
- **404**: Share not found
- **500**: Server error

---

## Rate Limiting

### Policy
- **Limit**: 100 shares per day
- **Scope**: Per user session (HTTP-only cookie)
- **Reset**: Midnight UTC (automatically)

### Rate Limit Response (429)
```json
{
  "error": "Rate limit exceeded. Maximum 100 shares per day."
}
```

### Checking Rate Limit Status
Monitor X-RateLimit headers in production (if implemented):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709251200
```

---

## Content Validation

### Size Limits
- **Maximum**: 1MB (1,000,000 bytes)
- **Minimum**: 1 character (non-empty)

### Error (413 Payload Too Large)
```json
{
  "error": "Content exceeds maximum size of 1000KB"
}
```

---

## Expiration Options

### Supported Durations (in hours)
- `1` - Expires in 1 hour
- `24` - Expires in 1 day
- `168` - Expires in 7 days (default)
- `720` - Expires in 30 days
- Custom number accepted (any positive integer)

### Cleanup
- Expired shares are **automatically deleted** on GET requests to `/api/shares`
- Manual cleanup query:
```sql
DELETE FROM shared_items WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
```

---

## One-Time Read Feature

### Setting One-Time Read
```json
{
  "content": "Sensitive data",
  "oneTimeRead": true
}
```

### Behavior
- Share can be viewed exactly **one time**
- **After first view**: Share is automatically deleted
- **Subsequent attempts**: Return 404 "Share not found"
- Useful for: Passwords, API keys, sensitive information

---

## Session Management

### Session Cookie
- **Name**: `session_id`
- **Type**: HTTP-only secure cookie
- **Duration**: 30 days
- **Secure**: Yes (HTTPS in production)
- **SameSite**: Lax

### Session Identification
- Auto-created on first request to `/api/shares` POST
- Persists across browser sessions for 30 days
- Used for rate limiting and data ownership

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - GET or DELETE successful |
| 201 | Created - Share successfully created |
| 400 | Bad Request - Invalid input (empty content) |
| 404 | Not Found - Share doesn't exist or expired |
| 413 | Payload Too Large - Content exceeds 1MB |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Examples

### Create a share with 1-hour expiration
```bash
curl -X POST http://localhost:3000/api/shares \
  -H "Content-Type: application/json" \
  -d '{
    "content": "https://example.com",
    "expiryHours": 1
  }'
```

### Create a one-time read share
```bash
curl -X POST http://localhost:3000/api/shares \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Secret API Key: abc123xyz",
    "oneTimeRead": true
  }'
```

### Get paginated shares (10 per page)
```bash
curl http://localhost:3000/api/shares?page=1&limit=10
```

### View a specific share
```bash
curl http://localhost:3000/api/shares/a1b2c3d4
```

### Delete a share
```bash
curl -X DELETE http://localhost:3000/api/shares/a1b2c3d4
```

---

## Migration Notes

### Breaking Changes
None! The API is backward compatible.

### New Parameters
- `expiryHours` in POST (optional)
- `oneTimeRead` in POST (optional)
- Query parameters in GET (optional)
- DELETE method added (new endpoint)

### New Fields in Responses
- `view_count`
- `expires_at`
- `one_time_read`
- `pagination` (in GET /api/shares)
