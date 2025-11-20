# Authentication API Documentation

## Overview

The authentication system provides JWT-based authentication with HttpOnly cookies for secure session management. It supports user login, logout, token refresh, and session validation.

## Architecture

### Backend Components

- **Auth Module** (`src/modules/auth/`)
  - `auth.controller.ts` - API endpoints for authentication
  - `auth.service.ts` - Business logic for authentication
  - `jwt.strategy.ts` - Passport JWT strategy
  - `jwt-auth.guard.ts` - Guard for protecting routes
  - `roles.guard.ts` - Guard for role-based access control

### Frontend Components

- **Auth Context** (`contexts/auth/AuthContext.tsx`)
  - Provides authentication state and methods across the app
  - Handles automatic token refresh
  - Manages user session

- **Middleware** (`middleware.ts`)
  - Protects `/admin` routes
  - Validates session before allowing access
  - Redirects unauthorized users to login

## API Endpoints

### POST /auth/login

Login with email and password. Sets HttpOnly cookies with access and refresh tokens.

**Request Body:**

```json
{
  "email": "admin@csceramic.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "user": {
    "id": "user-id",
    "email": "admin@csceramic.com",
    "name": "System Administrator",
    "roles": ["admin"]
  }
}
```

**Cookies Set:**

- `accessToken` - Valid for 15 minutes
- `refreshToken` - Valid for 7 days

### POST /auth/logout

Logout and invalidate the current session.

**Authentication:** Required

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/refresh

Refresh the access token using the refresh token.

**Cookies Required:** `refreshToken`

**Response:**

```json
{
  "user": {
    "id": "user-id",
    "email": "admin@csceramic.com",
    "name": "System Administrator",
    "roles": ["admin"]
  }
}
```

### GET /auth/me

Get current authenticated user information.

**Authentication:** Required

**Response:**

```json
{
  "user": {
    "id": "user-id",
    "email": "admin@csceramic.com",
    "name": "System Administrator",
    "roles": ["admin"]
  }
}
```

## Security Features

### HttpOnly Cookies

Access and refresh tokens are stored in HttpOnly cookies, making them inaccessible to JavaScript and protecting against XSS attacks.

### JWT Strategy

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens include session ID for validation

### Session Management

Sessions are stored in the database with expiration timestamps. Invalid or expired sessions are rejected.

### CORS Configuration

CORS is configured to only accept requests from the frontend URL with credentials enabled.

## Protecting Routes

### Backend

Use the `@Public()` decorator for public endpoints:

```typescript
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

Use the `@Roles()` decorator for role-based access:

```typescript
@Roles('admin')
@Get('admin/users')
getUsers() {
  // Only admins can access
}
```

### Frontend

Protected routes are automatically guarded by Next.js middleware. The middleware checks for valid authentication cookies and validates sessions with the backend.

## Environment Variables

### Backend (.env.local)

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Default Admin User

The database seed creates a default admin user:

- **Email:** `admin@csceramic.com`
- **Password:** `admin123` (from SEED_ADMIN_PASSWORD env var)
- **Role:** admin

**Important:** Change the password in production!

## Token Refresh

The frontend automatically refreshes tokens every 10 minutes to maintain the session. If refresh fails, the user is logged out and redirected to the login page.

## Testing

Run backend tests:

```bash
cd apps/backend
npm test
```

Test login flow:

1. Start the backend: `npm run dev`
2. Login: `POST http://localhost:3001/auth/login`
3. Access protected endpoint: `GET http://localhost:3001/auth/me`

## Error Handling

All authentication errors return appropriate HTTP status codes:

- **401 Unauthorized** - Invalid credentials, expired session, or missing token
- **403 Forbidden** - Valid authentication but insufficient permissions
- **400 Bad Request** - Invalid request data

Error responses include a descriptive message:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```
