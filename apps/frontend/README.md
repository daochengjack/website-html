# Frontend Application

Next.js 14 application with authenticated admin area.

## Features

### Authentication

- JWT-based authentication with HttpOnly cookies
- Protected admin routes with middleware
- Automatic token refresh
- Role-based access control ready

### Admin Panel

- Dashboard with key metrics
- Responsive sidebar navigation
- User profile header with logout
- Placeholder pages for:
  - Products
  - Categories
  - Content
  - Inquiries
  - Settings

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (or npm)
- Backend API running on port 3001

### Installation

```bash
cd apps/frontend
pnpm install
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
apps/frontend/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── admin/              # Protected admin area
│   │   ├── layout.tsx      # Admin layout with sidebar
│   │   ├── page.tsx        # Dashboard
│   │   ├── products/
│   │   ├── categories/
│   │   ├── content/
│   │   ├── inquiries/
│   │   └── settings/
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Public homepage
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx
│       └── AdminHeader.tsx
├── contexts/
│   └── auth/
│       └── AuthContext.tsx # Auth state management
├── lib/
│   └── auth/
│       └── api.ts          # Auth API client
└── middleware.ts           # Route protection
```

## Authentication Flow

### Login

1. User navigates to `/login`
2. Enters credentials (email/password)
3. Frontend calls `POST /auth/login` on backend
4. Backend sets HttpOnly cookies with tokens
5. User is redirected to `/admin`

### Protected Routes

1. User accesses `/admin/*`
2. Middleware checks for `accessToken` cookie
3. Validates token with backend `GET /auth/me`
4. If valid, allows access
5. If invalid, redirects to `/login`

### Token Refresh

- Automatic refresh every 10 minutes
- Uses refresh token to get new access token
- If refresh fails, user is logged out

### Logout

1. User clicks logout button
2. Frontend calls `POST /auth/logout`
3. Backend invalidates session
4. Cookies are cleared
5. User is redirected to `/login`

## Using Auth Context

The `AuthContext` provides authentication state and methods throughout the app:

```tsx
'use client';

import { useAuth } from '@/contexts/auth/AuthContext';

export function MyComponent() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      {hasRole('admin') && <p>You are an admin</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Default Credentials

After running database seed:

- **Email:** `admin@csceramic.com`
- **Password:** `admin123`

## Styling

The app uses Tailwind CSS for styling. The design is:

- Responsive (mobile-first)
- Accessible (ARIA labels, keyboard navigation)
- Modern (clean, professional look)

## API Integration

All API calls use `fetch` with `credentials: 'include'` to send cookies:

```typescript
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
  credentials: 'include',
});
```

## Testing

### Manual Testing

1. Start backend: `cd apps/backend && npm run dev`
2. Start frontend: `cd apps/frontend && npm run dev`
3. Navigate to `http://localhost:3000/admin`
4. Should redirect to `/login`
5. Login with admin credentials
6. Should redirect to `/admin` dashboard
7. Try navigation between admin pages
8. Logout should return to login page
9. Refresh page - should stay logged in
10. Clear cookies - should be logged out

### E2E Testing (Future)

The project structure is ready for E2E tests with Playwright or Cypress.

## Deployment Considerations

### Environment Variables

Set `NEXT_PUBLIC_API_URL` to your production API URL.

### Security

- Ensure HTTPS in production
- Set secure cookies flags (already configured)
- Use strong JWT secrets
- Implement rate limiting
- Regular security audits

### Performance

- Static generation for public pages
- Server-side rendering for authenticated pages
- Optimize images and assets
- Enable compression
- Use CDN for static assets

## Future Enhancements

- [ ] Two-factor authentication
- [ ] Password reset flow
- [ ] User management UI
- [ ] Activity logging
- [ ] Dark mode
- [ ] Internationalization
- [ ] Real API integration for dashboard metrics
- [ ] Form validation libraries (e.g., react-hook-form + zod)
- [ ] Toast notifications for user feedback
- [ ] Loading states and skeletons
- [ ] Error boundaries
