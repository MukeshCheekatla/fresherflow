# 🔧 Critical Bug Fixes - Execution Plan

## 🎯 **Bug #1: Admin Login 500 Error**

### **Root Cause**:
Line 4-7 in `apps/api/src/utils/jwt.ts`:
```typescript
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;  // ❌ Undefined if env var missing
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
```

When `JWT_ACCESS_SECRET` is undefined, `jwt.sign()` throws:
```
TypeError: secretOrPrivateKey must have a value
```

This causes a 500 error instead of a helpful message.

### **Fix**:
Add runtime validation with clear error messages:

```typescript
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error('CRITICAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}
```

---

## 🎯 **Bug #2: Admin Route Protection**

### **Root Cause**:
Admin routes are protected by `requireAdmin` middleware, BUT:
- Frontend admin pages (`apps/web/src/app/(admin)/*`) have client-side guards only
- If middleware fails, no redirect happens on frontend
- Users might see partial admin UI before being blocked

### **Current Protection** (Backend):
```typescript
// apps/api/src/index.ts line 123
app.use('/api/admin/auth', adminAuthRoutes);

// All admin opportunity routes have requireAdmin
```

**Status**: Backend is PROTECTED ✅  
**Issue**: Frontend client-side guard is weak ⚠️

### **Fix Needed**:
Verify frontend `AdminContext` properly handles 403/401 and redirects.

---

## 🎯 **Bug #3: Profile Completion 403 Mismatch**

### **Status**: ✅ ALREADY FIXED in Phase 1

**What we did**:
1. Created `lib/profileCompletion.ts` matching backend logic
2. Enhanced API client to parse 403 errors with `completionPercentage`
3. Updated opportunities page to show helpful error UI

**Result**: Users now see:
```
Profile Completion Required
70% → 100%
Add missing education details and preferences to unlock job listings
[Complete Your Profile] button
```

**No further action needed.**

---

## 📋 **Execution Checklist**

### ✅ **Immediate Fixes**:
1. [ ] Fix JWT env var validation in `jwt.ts`
2. [ ] Add startup check for required env vars
3. [ ] Test admin login with proper error messages
4. [ ] Verify admin middleware blocks non-admin users
5. [ ] Check AdminContext redirect logic

### ⏭️ **Already Fixed**:
- ✅ Profile completion 403 error handling
- ✅ Helpful error messages for incomplete profiles

---

**Starting with JWT fix now...**
