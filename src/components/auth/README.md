# ProtectedRoute Component Usage

The `ProtectedRoute` component is used to protect routes that require authentication.

## Example Usage

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// In your App.tsx routing setup:
<Routes>
  <Route element={<AppLayout />}>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route path="/all-games" element={<AllGames />} />
    
    {/* Protected routes - require authentication */}
    <Route element={<ProtectedRoute />}>
      <Route path="/vip" element={<VipPage />} />
      <Route path="/bonuses" element={<BonusesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/wallet" element={<WalletPage />} />
    </Route>
  </Route>
</Routes>
```

## Features

- Shows a loading spinner while checking authentication status
- Redirects unauthenticated users to home page (or custom route)
- Preserves the attempted location for redirect after login
- Works with nested routes using React Router's `<Outlet />`

## Props

- `redirectTo` (optional): The route to redirect to if not authenticated (default: '/')
- `children` (optional): Child components to render if authenticated
```