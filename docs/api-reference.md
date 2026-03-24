# API Reference

This document describes all API endpoints available in the application.

## Base URL

```txt
/api
```

## Authentication

All protected routes require authentication via the `Authorization` header with a Bearer token.

### Auth Endpoints

| Method | Path          | Description          |
| ------ | ------------- | -------------------- |
| GET    | `/api/auth/*` | better-auth handlers |
| POST   | `/api/auth/*` | better-auth handlers |

## User Routes

All user routes require authentication.

### GET /api/user

Get all users.

**Response**

```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "emailVerified": true,
    "image": "string | null",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/user/:id

Get a specific user by ID.

**Parameters**

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| id   | path | string | yes      | User ID     |

**Response**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "emailVerified": true,
  "image": "string | null",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/user

Create a new user.

**Request Body**

```json
{
  "name": "string",
  "email": "string",
  "image": "string (optional)"
}
```

**Response**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "emailVerified": false,
  "image": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/user/:id

Update an existing user.

**Parameters**

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| id   | path | string | yes      | User ID     |

**Request Body**

```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "image": "string (optional)"
}
```

### DELETE /api/user/:id

Delete a user.

**Parameters**

| Name | In   | Type   | Required | Description |
| ---- | ---- | ------ | -------- | ----------- |
| id   | path | string | yes      | User ID     |

## Public Routes

### GET /api/

Get API welcome message.

**Response**

```
Welcome to (🦊) TRY ELYSIA
```

### GET /api/health

Get API health status.

**Response**

```json
{
  "name": "TRY ELYSIA"
}
```

### GET /api/sse

Server-Sent Events endpoint for real-time streaming.

**Response**

```
data: hello world

event: message
data: {"message":"This is SSR message","timestamp":"2024-01-01T00:00:00.000Z"}
```

## WebSocket

### WS /api/chat

WebSocket endpoint for real-time chat.

**Authentication**: Required - connection will be rejected without valid session.

**Client → Server**

```json
{
  "id": "string",
  "message": "string"
}
```

**Server → Client (Welcome)**

```json
{
  "id": "string",
  "message": "Welcome"
}
```

**Server → Client (Unauthorized)**

```json
{
  "id": "string",
  "message": "Unauthorized"
}
```

## Error Responses

### 404 Not Found

```json
{
  "error": "Endpoint not found"
}
```

### 500 Internal Server Error

Production:

```json
{
  "error": "An unexpected error occurred"
}
```

Development:

```json
{
  "error": "Error message details"
}
```

### 429 Too Many Requests

```json
{
  "error": "Too many requests"
}
```

## Rate Limiting

The API implements rate limiting:

- **Window**: 60 seconds
- **Max requests**: 100 per IP
- Rate limit headers are included in responses

## OpenAPI Documentation

Full OpenAPI documentation is available at `/openapi` when the server is running.
