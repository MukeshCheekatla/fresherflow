# 🍞 COMPLETE TOAST INTEGRATION - ALL PAGES

## ✅ ALREADY DONE
- ✅ Root Layout (`apps/web/src/app/layout.tsx`) - Toaster component added
- ✅ Admin Dashboard - All errors show in toast  
- ✅ Admin Opportunities List - Expire/Delete with toast

## 🔧 TOAST INTEGRATION PATTERN

### Replace ALL `alert()` with `toast`

**Before:**
```tsx
alert('Success!');
alert('Error: ' + error.message);
```

**After:**
```tsx
import toast from 'react-hot-toast';

toast.success('✅ Success!');
toast.error(`❌ Error: ${error.message}`);
```

### Standard Error Handler for API Calls

```tsx
const handleSubmit = async () => {
  const loadingToast = toast.loading('⏳ Processing...');
  
  try {
    const response = await fetch(url, options);
    
    // Check auth errors
    if (response.status === 403 || response.status === 401) {
      toast.error('🔒 Session expired. Please login again.', { id: loadingToast });
      logout();
      return;
    }
    
    // Check other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    toast.success('✅ Success!', { id: loadingToast });
    
  } catch (error: any) {
    toast.error(`❌ ${error.message}`, { id: loadingToast });
    console.error('Full error:', error);
  }
};
```

---

## 📋 PAGES THAT NEED TOAST (Priority Order)

### HIGH PRIORITY (Critical User Flow)

#### 1. `/profile/edit/page.tsx`
**Current:** Line 57 has `alert`
**Replace:**
```tsx
import toast from 'react-hot-toast';

// Line 44-59
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   const loadingToast = toast.loading('⏳ Updating profile...');

    try {
        await profileApi.updateProfile({...});
        await refreshProfile();
        toast.success('✅ Profile updated successfully!', { id: loadingToast });
        router.push('/dashboard');
    } catch (error: any) {
        toast.error(`❌ Failed to update profile: ${error.message}`, { id: loadingToast });
    }
};
```

#### 2. `/admin/opportunities/create/page.tsx`
**Current:** Lines 100, 153 have `alert`
**Replace:**
```tsx
import toast from 'react-hot-toast';

// Line 100 (parser success)
toast.success('✅ Form auto-filled! Review and adjust.');

// Line 140-155 (create submit)
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('⏳ Creating opportunity...');

    try {
        const response = await fetch(...);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create');
        }
        
        toast.success('✅ Opportunity created successfully!', { id: loadingToast });
        router.push('/admin/opportunities');
    } catch (error: any) {
        toast.error(`❌ ${error.message}`, { id: loadingToast });
    }
};
```

#### 3. `/admin/opportunities/edit/[id]/page.tsx`
Similar pattern - replace any alerts with toast

#### 4. `/admin/login/page.tsx`
**Replace login errors:**
```tsx
toast.error('❌ Invalid credentials');
toast.error(`❌ Login failed: ${error.message}`);
```

#### 5. `/login/page.tsx` (User login)
```tsx
toast.error('❌ Invalid email or password');
toast.success('✅ Login successful!');
```

#### 6. `/register/page.tsx`
```tsx
toast.error('❌ Passwords do not match');
toast.error(`❌ Registration failed: ${error.message}`);
toast.success('✅ Account created! Redirecting...');
```

#### 7. `/profile/complete/page.tsx`
```tsx
toast.success('✅ Profile completed!');
toast.error(`❌ ${error.message}`);
```

#### 8. `/dashboard/page.tsx`
```tsx
// For API errors
toast.error(`❌ Failed to load data: ${error.message}`);
```

#### 9. `/opportunities/page.tsx`
```tsx
// For loading errors
toast.error(`❌ Failed to load opportunities: ${error.message}`);
```

#### 10. `/opportunities/[id]/page.tsx`
```tsx
// For apply action
toast.loading('⏳ Submitting application...');
toast.success('✅ Applied successfully!');
toast.error(`❌ Failed to apply: ${error.message}`);
```

---

## 🎯 IMMEDIATE ACTION PLAN

**Step 1:** Add toast import to ALL these files:
```tsx
import toast from 'react-hot-toast';
```

**Step 2:** Replace ALL `alert()` calls:
- `alert('message')` → `toast.error('❌ message')` or `toast.success('✅ message')`

**Step 3:** Wrap ALL async operations with loading toast:
```tsx
const loadingToast = toast.loading('⏳ Loading...');
// ... operation ...
toast.success('✅ Done!', { id: loadingToast });
```

**Step 4:** Test ALL pages:
1. Login errors
2. Create/Edit/Delete errors
3. Profile update errors
4. API connection errors

---

## 🧪 TESTING CHECKLIST

After adding toasts, test these scenarios:

- [ ] Admin login with wrong password → Toast shows error
- [ ] Create opportunity with missing fields → Toast shows validation error
- [ ] Edit opportunity with expired token → Toast shows "Session expired"
- [ ] Delete opportunity → Loading toast → Success toast
- [ ] Expire opportunity → Loading toast → Success toast
- [ ] User profile update → Loading → Success/Error toast
- [ ] Apply to opportunity → Loading → Success toast
- [ ] API server offline → Toast shows connection error

---

## 💡 TOAST BEST PRACTICES

1. **Always use emojis**: ✅ ❌ ⏳ 🔒 
2. **Loading states**: Always replace loading toast on completion
3. **Error details**: Show full error message, not just "Failed"
4. **Duration**: Errors stay longer (7s), success shorter (5s) - already configured
5. **Position**: Top-right (already configured)

---

**Total Pages Needing Toast: ~10**
**Estimated Time: 30-60 minutes to add toast to all pages**

**Next:** Run the app and systematically test each page, fixing alerts as you find them.
