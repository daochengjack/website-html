# Admin Authentication System Implementation

## Overview

This document describes the complete implementation of the authenticated admin area for the monorepo application. The system provides JWT-based authentication with secure session management and a full-featured admin interface.

## Architecture

### Backend (NestJS)

The backend implements a complete authentication system with the following components:

#### Auth Module (`apps/backend/src/modules/auth/`)

- **auth.controller.ts** - HTTP endpoints for login, logout, refresh, and session validation
- **auth.service.ts** - Business logic for authentication and token management
- **jwt.strategy.ts** - Passport JWT strategy for token validation
- **jwt-auth.guard.ts** - Global guard that protects all routes by default
- **roles.guard.ts** - Guard for role-based access control
- **Decorators:**
  - `@Public()` - Marks routes as publicly accessible
  - `@Roles(...roles)` - Restricts access to specific roles
  - `@CurrentUser()` - Injects authenticated user into route handlers

#### Key Features

1. **JWT Tokens with HttpOnly Cookies**
   - Access token: 15 minutes lifetime
   - Refresh token: 7 days lifetime
   - Stored in secure, HttpOnly cookies

2. **Session Management**
   - Sessions stored in `UserSession` database table
   - Automatic expiration handling
   - Session ID embedded in JWT payload

3. **Password Support**
   - bcrypt for new users
   - SHA256 fallback for seeded users (development)

4. **CORS Configuration**
   - Credentials support enabled
   - Frontend URL whitelisting

### Frontend (Next.js 14)

The frontend provides a complete admin interface with authentication flow:

#### Auth Components

1. **AuthContext** (`contexts/auth/AuthContext.tsx`)
   - Global authentication state
   - Login/logout methods
   - Automatic token refresh (every 10 minutes)
   - Role checking utilities

2. **Middleware** (`middleware.ts`)
   - Protects `/admin/*` routes
   - Validates sessions with backend
   - Redirects unauthorized users to login

3. **Login Page** (`app/(auth)/login/page.tsx`)
   - Email/password form
   - Error handling
   - Redirect support after login

4. **Admin Layout** (`app/admin/layout.tsx`)
   - Sidebar navigation
   - User header with logout
   - Loading states
   - Responsive design

5. **Admin Pages**
   - Dashboard with placeholder metrics
   - Products (placeholder)
   - Categories (placeholder)
   - Content (placeholder)
   - Inquiries (placeholder)
   - Settings (placeholder)

## Installation & Setup

### 1. Install Dependencies

Backend:

```bash
cd /home/engine/project
pnpm add bcrypt @nestjs/jwt @nestjs/passport passport passport-jwt \
  cookie-parser @types/bcrypt @types/passport-jwt @types/cookie-parser \
  --filter @repo/backend
```

Frontend:

```bash
pnpm add jose cookies-next --filter @repo/frontend
```

### 2. Environment Configuration

**Backend** (`apps/backend/.env.local`):

```env
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`apps/frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Setup

Run migrations and seed:

```bash
cd packages/db
pnpm db:migrate
pnpm db:seed
```

This creates the default admin user:

- **Email:** `admin@csceramic.com`
- **Password:** `admin123`

### 4. Start Services

Terminal 1 - Backend:

```bash
cd apps/backend
npm run dev
```

Terminal 2 - Frontend:

```bash
cd apps/frontend
npm run dev
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/login

Login with email and password.

**Request:**

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

- `accessToken` (HttpOnly, 15 min)
- `refreshToken` (HttpOnly, 7 days)

#### POST /auth/logout

Logout and invalidate session.

**Authentication:** Required

#### POST /auth/refresh

Refresh access token using refresh token.

**Authentication:** Refresh token cookie required

#### GET /auth/me

Get current authenticated user.

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

## Usage Examples

### Backend: Protecting Routes

```typescript
// Public route (no authentication required)
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}

// Protected route (authentication required)
@Get('admin/users')
getUsers() {
  return this.userService.findAll();
}

// Role-restricted route
@Roles('admin')
@Get('admin/system')
getSystemInfo() {
  return this.systemService.getInfo();
}

// Access current user
@Get('profile')
getProfile(@CurrentUser() user: CurrentUserData) {
  return { user };
}
```

### Frontend: Using Auth Context

```tsx
'use client';

import { useAuth } from '../../contexts/auth/AuthContext';

export function MyComponent() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      {hasRole('admin') && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Security Features

### 1. HttpOnly Cookies

Tokens are stored in HttpOnly cookies, preventing XSS attacks.

### 2. CORS Protection

Only the configured frontend URL can make authenticated requests.

### 3. Session Validation

Every request validates the session against the database.

### 4. Token Expiration

Short-lived access tokens (15 min) limit exposure if compromised.

### 5. Automatic Refresh

Frontend automatically refreshes tokens to maintain sessions.

### 6. Secure Password Hashing

bcrypt with proper salt rounds for password storage.

## Testing

### Backend Tests

Run unit tests:

```bash
cd apps/backend
npm test
```

Test auth service:

```bash
npm test -- auth.service.spec.ts
```

### Manual Testing

1. **Login Flow**
   - Navigate to `http://localhost:3000/admin`
   - Should redirect to `/login`
   - Login with `admin@csceramic.com` / `admin123`
   - Should redirect to `/admin` dashboard

2. **Protected Routes**
   - Access admin pages (products, categories, etc.)
   - All should require authentication

3. **Session Persistence**
   - Login and refresh the page
   - Should remain logged in

4. **Logout**
   - Click logout button
   - Should redirect to login page
   - Attempting to access `/admin` should redirect to login

5. **Token Refresh**
   - Stay logged in for >10 minutes
   - Session should refresh automatically
   - No logout or redirect should occur

## File Structure

```
apps/backend/src/modules/auth/
├── decorators/
│   ├── current-user.decorator.ts
│   ├── public.decorator.ts
│   └── roles.decorator.ts
├── dto/
│   ├── auth-response.dto.ts
│   ├── login.dto.ts
│   └── refresh-token.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── strategies/
│   └── jwt.strategy.ts
├── auth.controller.ts
├── auth.module.ts
└── auth.service.ts

apps/frontend/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── content/page.tsx
│   │   ├── inquiries/page.tsx
│   │   └── settings/page.tsx
│   └── layout.tsx
├── components/
│   └── admin/
│       ├── AdminHeader.tsx
│       └── AdminSidebar.tsx
├── contexts/
│   └── auth/
│       └── AuthContext.tsx
├── lib/
│   └── auth/
│       └── api.ts
└── middleware.ts
```

## Troubleshooting

### Issue: "Module not found" errors

- Use relative imports in frontend (not `@/*` aliases)
- Ensure `moduleResolution: "bundler"` in tsconfig.json

### Issue: Cookie not being sent

- Check CORS configuration in backend
- Ensure `credentials: 'include'` in fetch calls
- Verify FRONTEND_URL matches actual frontend URL

### Issue: Token expired immediately

- Check system time synchronization
- Verify JWT_SECRET is consistent
- Check token expiration settings

### Issue: Redirect loop

- Clear browser cookies
- Check middleware configuration
- Verify `/login` is not protected

## Production Considerations

### 1. Environment Variables

- Use strong, random secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Never commit secrets to version control
- Use environment variable management (e.g., AWS Secrets Manager)

### 2. HTTPS

- Always use HTTPS in production
- Set `secure: true` for cookies in production
- Configure `sameSite: 'strict'` for additional security

### 3. Rate Limiting

- Implement rate limiting on login endpoint
- Consider IP-based throttling
- Add CAPTCHA for suspicious activity

### 4. Session Management

- Implement session cleanup for expired sessions
- Consider session revocation for security incidents
- Log authentication events for audit

### 5. Password Policy

- Enforce strong passwords
- Implement password expiration
- Support password reset flow
- Consider two-factor authentication

## Next Steps

1. **User Management**
   - Create users CRUD interface
   - Add role assignment UI
   - Implement user invitation flow

2. **Password Reset**
   - Create password reset request endpoint
   - Email reset token
   - Reset password form

3. **Two-Factor Authentication**
   - Add TOTP support
   - QR code generation
   - Backup codes

4. **Activity Logging**
   - Log all authentication events
   - Track user actions
   - Admin audit trail

5. **Real Data Integration**
   - Connect dashboard to real APIs
   - Implement CRUD operations
   - Add search and filtering

## Documentation

- **Backend Auth API:** `apps/backend/docs/auth-api.md`
- **Frontend README:** `apps/frontend/README.md`
- **Database Schema:** `packages/db/prisma/schema.prisma`

## Support

For issues or questions:

1. Check documentation in respective README files
2. Review error logs in backend console
3. Check browser console for frontend errors
4. Verify environment configuration
