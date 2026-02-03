# FresherFlow - Updated Folder Structure

**Last Updated**: 2026-02-03 (After UI Consolidation & Critical Bug Fixes)

---

## 🎯 **Key Changes Since Last Update**

### ✅ **Completed**:
1. ❌ **DELETED**: `apps/web/src/shared/components/ui/` - eliminated duplicate UI layer
2. ✅ **NEW**: Material Design compliant UI components in `components/ui/`
3. ✅ **NEW**: `lib/profileCompletion.ts` - backend-matching profile logic
4. ✅ **FIXED**: `apps/api/src/utils/jwt.ts` - runtime JWT validation
5. ✅ **FIXED**: `apps/web/src/app/(admin)/admin/layout.tsx` - secure admin routes
6. ✅ **UPDATED**: `apps/web/src/app/opportunities/page.tsx` - profile error handling

---

## 📁 **Current Structure**

### **Root**
```
job/
├── apps/
│   ├── api/          → Express backend (TypeScript)
│   └── web/          → Next.js frontend (TypeScript + Tailwind v4)
├── packages/
│   └── types/        → Shared TypeScript types
├── docs/             → Documentation (35 files)
└── prisma/           → Database schema & migrations
```

---

## 🖥️ **Backend (apps/api/src/)**

### **Core Files**
```
apps/api/src/
├── index.ts                        → Express app setup, middleware, routes
├── middleware/
│   ├── auth.ts                     → requireAuth, requireAdmin ✅ SECURE
│   ├── errorHandler.ts             → Centralized error handling
│   ├── httpLogger.ts               → Morgan HTTP logging
│   ├── profileGate.ts              → Profile completion validator
│   └── validate.ts                 → Zod request validation
├── routes/
│   ├── auth.ts                     → User auth (login, register, refresh)
│   ├── profile.ts                  → User profile CRUD
│   ├── opportunities.ts            → Job listings (with profileGate)
│   ├── actions.ts                  → User applications/saves
│   └── admin/
│       ├── auth.ts                 → Admin login & verification
│       ├── opportunities.ts        → Admin job management
│       └── feedback.ts             → User feedback handling
└── utils/
    ├── jwt.ts                      → ✅ FIXED: JWT with runtime validation
    ├── logger.ts                   → Chalk-enhanced logging
    
**Key Fix**: `jwt.ts` now validates `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` at startup with clear error messages.

---

## 🌐 **Frontend (apps/web/src/)**

### **UI Components (Single Authoritative Boundary)** ✅
```
apps/web/src/components/ui/         ← THE ONLY UI LAYER
├── Button.tsx                      ✅ Material Design (48px default)
├── Input.tsx                       ✅ Material Design (48px, 16px font)
├── Select.tsx                      ✅ Native, mobile-friendly
├── MobileContainer.tsx             ✅ PWA container (400px max)
├── LoadingScreen.tsx               ✅ Moved from shared
├── Skeleton.tsx                    ✅ Merged (all variants)
├── Navigation.tsx                  → Main app navigation
└── ThemeToggle.tsx                 → Dark mode toggle
```

**Deleted**: `apps/web/src/shared/components/ui/` (eliminated duplicate layer)

---

### **App Routes**
```
apps/web/src/app/
├── (auth)/
│   ├── login/page.tsx              → User login
│   └── signup/page.tsx             → User registration
├── (admin)/
│   ├── layout.tsx                  → ✅ FIXED: Secure admin wrapper
│   ├── admin/
│   │   ├── layout.tsx              → Admin nav/sidebar
│   │   ├── dashboard/page.tsx      → Admin overview
│   │   ├── jobs/                   → Job management
│   │   ├── walkins/                → Walk-in management
│   │   ├── opportunities/          → Opportunity CRUD
│   │   └── feedback/page.tsx       → User feedback
│   └── auth/
│       └── login/page.tsx          → Admin login
├── dashboard/page.tsx              → User dashboard
├── opportunities/page.tsx          ✅ FIXED: Profile error handling
├── profile/
│   ├── edit/page.tsx               → Profile editor
│   └── complete/page.tsx           → Onboarding flow
└── layout.tsx                      → Root layout (auth provider)
```

**Key Fixes**:
- `(admin)/layout.tsx`: Now redirects unauthenticated users (no UI exposure)
- `opportunities/page.tsx`: Shows helpful error when profile incomplete

---

### **Contexts & State**
```
apps/web/src/contexts/
├── AuthContext.tsx                 → User auth state
└── AdminContext.tsx                → Admin auth state
```

---

### **Library & Utilities**
```
apps/web/src/lib/
├── api/
│   ├── client.ts                   ✅ FIXED: Parses 403 profile errors
│   └── admin.ts                    → Admin API calls
├── hooks/
│   └── useDebounce.ts              → Debounce utility
├── profileCompletion.ts            ✅ NEW: Matches backend logic exactly
└── utils.ts                        → Tailwind cn() helper
```

**Key Addition**: `profileCompletion.ts` - calculates profile % matching backend, prevents 403 mismatches

---

### **Feature Components**
```
apps/web/src/features/
└── jobs/
    └── components/
        └── JobCard.tsx             ✅ REWRITTEN: Canonical reference pattern
```

**JobCard Status**: Zero arbitrary values, Material Design compliant, serves as template for all components

---

## 📚 **Documentation (docs/)**

### **Key Documents** (35 total)
```
docs/
├── UI_GUIDELINES.md                ✅ NEW: Minimal UI rules reference
├── UI_EXECUTION_SUMMARY.md         ✅ NEW: UI consolidation summary
├── UI_CONSOLIDATION_PLAN.md        → UI migration strategy
├── BUGS_FIXED_SUMMARY.md           ✅ NEW: All critical bugs resolved
├── CRITICAL_BUGS_COMPLETE.md       → Bug fix details
├── MOBILE_AUDIT.md                 → Mobile-first audit findings
├── MATERIAL_DESIGN_PLAN.md         → Design standards
├── DESIGN_ENFORCEMENT.md           → Lint rules & enforcement
├── FOLDER_STRUCTURE.md             → This file (updated)
└── [31 other documentation files]
```

---

## 🗄️ **Database (prisma/)**
```
prisma/
├── schema.prisma                   → Data models
└── migrations/                     → Version-controlled schema changes
```

**Key Models**: User, Profile, Admin, Opportunity, WalkInDetails, Action, Feedback

---

## 🎯 **Architecture Decisions**

### ✅ **Single UI Boundary**
- **Only** `apps/web/src/components/ui/` contains UI components
- Features import from this folder, never define raw HTML controls
- Prevents UI drift, enforces standards

### ✅ **Material Design Compliance**
- Touch targets: 48px minimum (h-12)
- Base font: 16px (text-base) - prevents iOS zoom
- Spacing: 8pt grid only
- Typography: text-xs (12px) minimum, text-sm (14px) for body

### ✅ **Security**
- Backend: `requireAuth` and `requireAdmin` middleware
- Frontend: Context-based guards + redirect
- JWT: Runtime validation with clear errors
- Admin routes: No UI exposure for unauthenticated users

### ✅ **Profile Completion**
- Frontend calculation matches backend exactly
- 403 errors show helpful UI with completion %
- Clear CTA to complete profile
- No silent failures

---

## 📊 **File Counts**

| Category | Count |
|----------|-------|
| UI Components | 8 (consolidated) |
| App Routes | ~20 pages |
| API Routes | 6 main + 3 admin |
| Middleware | 5 |
| Contexts | 2 |
| Documentation | 35 |

---

## 🚀 **Next Steps**

### **If Migrating More Components**:
1. Use `JobCard.tsx` as template
2. Import from `@/components/ui/` only
3. Follow `UI_GUIDELINES.md`
4. Zero arbitrary Tailwind values

### **If Deploying**:
1. Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in production
2. Run database migrations
3. Test admin login flow
4. Verify profile completion UX

---

**Status**: ✅ Production-ready  
**UI Drift**: ✅ Prevented (single boundary enforced)  
**Critical Bugs**: ✅ All resolved  
**Security**: ✅ Admin routes protected  
**User Experience**: ✅ Clear error messages
