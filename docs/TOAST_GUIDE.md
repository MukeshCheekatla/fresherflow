# 🍞 Toast Notifications - Quick Reference

## ✅ What's Been Added

**Global Toast Setup:**
- ✅ `react-hot-toast` installed
- ✅ `<Toaster />` added to root layout
- ✅ Configured with dark theme, top-right position

**Pages with Toast Notifications:**

1. ✅ **Admin Dashboard** - Shows all API errors with exact messages
2. ✅ **Admin Opportunities List** - Toast for expire/delete actions  
3. ⏳ **Admin Edit Page** - Needs toast
4. ⏳ **Admin Create Page** - Needs toast
5. ⏳ **User Pages** - Needs toast

---

## 📝 How to Use Toast in Any Page

### 1. Import toast
```tsx
import toast from 'react-hot-toast';
```

### 2. Show toast notifications

**Success:**
```tsx
toast.success('✅ Opportunity created successfully!');
```

**Error:**
```tsx
toast.error(`❌ Failed: ${error.message}`);
```

**Loading (with update):**
```tsx
const loadingToast = toast.loading('Creating opportunity...');
try {
  // API call
  toast.success('✅ Done!', { id: loadingToast });
} catch (error) {
  toast.error(`❌ Failed: ${error.message}`, { id: loadingToast });
}
```

---

## 🔧 Standard Error Handler Pattern

```tsx
try {
  const response = await fetch(url, options);
  
  if (response.status === 403 || response.status === 401) {
    toast.error('🔒 Session expired. Please login again.');
    logout();
    return;
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  toast.success('✅ Success!');
  
} catch (error: any) {
  toast.error(`❌ ${error.message}`);
  console.error('Full error:', error);
}
```

---

## 🎯 Priority Actions

**Immediate (5 min):**
1. Re-login as admin (token expired)
2. Test dashboard - errors now show in toasts
3. Test expire/delete - errors show intoasts

**Next (10 min):**
4. Add toast to edit opportunity page
5. Add toast to create opportunity page  
6. Add toast to user opportunities page

---

## 🚀 Test After Re-Login

1. Go to `/admin/login`
2. Login with credentials
3. Go to `/admin/dashboard`
4. Check if stats load OR see toast with exact error
5. Go to `/admin/opportunities`
6. Try to expire a job → see loading toast → success/error toast
7. Try to delete a job → see loading toast → success/error toast

**Now all errors are visible!** No more silent failures.
