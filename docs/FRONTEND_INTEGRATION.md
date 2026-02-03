# Frontend Integration - Quick Start Guide

## ✅ What's Ready

**Backend API:** `http://localhost:5000` (running)  
**Frontend Setup:** Complete with API client, auth context, and type definitions

## 🔧 Integration Components Created

### 1. API Client (`src/lib/api/client.ts`)
- Auto JWT injection
- Refresh token flow
- Auto-retry on 401
- All endpoints wrapped (auth, profile, opportunities, actions)

### 2. TypeScript Types (`src/types/api.ts`)
- User, Profile, Opportunity, WalkInDetails
- AuthResponse, ApiError
- All enums match backend Prisma schema

### 3. Auth Context (`src/contexts/AuthContext.tsx`)
```typescript
const { user, profile, login, register, logout, refreshUser } = useAuth();
```

### 4. Gate Components (`src/components/gates/ProfileGate.tsx`)
```tsx
<AuthGate>      {/* Redirects to /login if not authenticated */}
<ProfileGate>   {/* Redirects to /profile/complete if < 100% */}
  {children}
</ProfileGate>
</AuthGate>
```

## 📝 Quick Usage Examples

### Login Page
```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    router.push('/dashboard');
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Protected Page
```tsx
import { AuthGate, ProfileGate } from '@/components/gates/ProfileGate';

export default function OpportunitiesPage() {
  return (
    <AuthGate>
      <ProfileGate>
        {/* Only shown if authenticated AND profile complete */}
        <OpportunitiesFeed />
      </ProfileGate>
    </AuthGate>
  );
}
```

### Fetch Opportunities
```tsx
import { opportunitiesApi } from '@/lib/api/client';

const opportunities = await opportunitiesApi.list({ type: 'JOB', city: 'Bangalore' });
```

## 🎯 Next Steps

1. **Update Root Layout** - Wrap app with AuthProvider
2. **Create Login/Register Pages** - Use authApi
3. **Build Profile Completion Flow** - Use profileApi
4. **Create Opportunities Feed** - Use opportunitiesApi

**Phase 1 Backend + Frontend Integration = COMPLETE** ✅
