# Job Platform - Proper Monorepo

> **A product-based monorepo, not tech symmetry.**  
> Apps are products. Packages are contracts.

## 🏗️ Architecture

```
job/
├── apps/
│   ├── api/          # Backend product (Express + Prisma)
│   └── web/          # Frontend product (Next.js)
│
├── packages/
│   ├── types/        # Shared TypeScript types (single source of truth)
│   └── schemas/      # Shared Zod validation (business rules)
│
├── package.json      # Root workspace config
└── README.md
```

## ⚖️ Hard Rules (Enforced - NO Exceptions)

> **These rules are non-negotiable. Violating them creates technical debt that will hurt you later.**

### Rule 1: Import Boundaries
```
✅ Apps CAN import packages
❌ Packages NEVER import apps
✅ Packages can import other packages
```

**Enforcement**:
- Frontend: Import ONLY from `@job-platform/types` and `@job-platform/schemas`
- Backend: Import ONLY from `@job-platform/types` and `@job-platform/schemas`
- NO local type definitions in apps/
- NO duplicated types

### Rule 2: Eligibility Authority
```
✅ Backend decides eligibility (apps/api)
❌ Frontend NEVER filters eligibility
❌ Frontend NEVER calculates profile completion
✅ Frontend displays what backend approved
```

**Enforcement**:
- Eligibility logic ONLY in `apps/api/src/utils/eligibility.ts`
- Frontend receives pre-filtered opportunities
- Backend does NOT trust client filters

### Rule 3: Profile Completion Authority
```
✅ Backend calculates profile completion (apps/api)
❌ Frontend NEVER determines completion percentage
✅ Frontend displays backend's calculation
```

**Enforcement**:
- Completion logic ONLY in `apps/api/src/utils/completion.ts`
- Backend updates `completionPercentage` on profile changes
- Frontend reads, never writes

### Rule 4: Admin Separation
```
❌ Admin is NOT a role toggle
❌ Admin is NOT a user with isAdmin flag
✅ Admin is a controlled surface
✅ Separate auth, separate tokens, separate routes
```

**Enforcement**:
- Admin token stored separately (`adminToken`, not user token)
- Admin routes: `/api/admin/*`
- Admin context: `AdminContext` (separate from `AuthContext`)
- NO `isAdmin` flags in User model

### Rule 5: Shared Package Purity
```
✅ packages/ contain ONLY pure logic
❌ NO database queries in packages/
❌ NO HTTP handlers in packages/
❌ NO UI components in packages/
```

**Enforcement**:
- `packages/types`: TypeScript types ONLY
- `packages/schemas`: Zod schemas ONLY
- NO Prisma imports in packages/
- NO Express imports in packages/

### Rule 6: Single Source of Truth
```
✅ All types in @job-platform/types
✅ All validation in @job-platform/schemas
✅ Prisma schema is database truth
❌ NO local type files in apps/
```

**Enforcement**:
- `apps/web/src/types/` does NOT exist
- `apps/api/src/types/` does NOT exist
- Import from packages/ or delete

### Rule 7: Naming Consistency
```
✅ Use @job-platform/* everywhere
❌ NO mixing job/job-platform/jobdiscover
```

**Current standard**: `@job-platform/*`

---

## 🚨 Common Violations (DO NOT DO THIS)

### ❌ Frontend Eligibility Filtering
```typescript
// apps/web - WRONG
const eligible = opportunities.filter(opp => 
  opp.allowedDegrees.includes(user.degree)
);
```

**Why it's wrong**: Frontend should never decide eligibility. Backend is authoritative.

### ❌ Duplicated Types
```typescript
// apps/web/src/types/opportunity.ts - WRONG
export interface Opportunity { ... }
```

**Why it's wrong**: Type drift. Use `@job-platform/types` instead.

### ❌ Business Logic in Packages
```typescript
// packages/types/index.ts - WRONG
export function calculateEligibility(user, opp) { ... }
```

**Why it's wrong**: Packages are contracts, not logic. Put in `apps/api`.

### ❌ Package Importing App Code
```typescript
// packages/schemas/index.ts - WRONG
import { prisma } from '../../apps/api/...';
```

**Why it's wrong**: Violates dependency boundaries.  Packages can't know about apps.

---

## 📍 Post-MVP Considerations

### Admin UI Location
**Current**: `apps/web/(admin)/admin/*` (route group)  
**Future**: May move to `apps/admin` (separate Next.js app)  

**Rule**: NO admin-only logic in shared components. Keep admin isolated.



## 🚀 Quick Start

### 1. Install (Monorepo)
```bash
# From root - installs ALL packages
npm install
```

### 2. Setup API
```bash
# Create apps/api/.env
DATABASE_URL="postgresql://..."
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
FRONTEND_URL="http://localhost:3000"

# Initialize database
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Setup Web
```bash
# Create apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Run Development
```bash
# Runs both API and Web concurrently
npm run dev
```

Or individually:
```bash
npm run dev:api    # http://localhost:5000
npm run dev:web    # http://localhost:3000
```

## 📦 Package Details

### `@job-platform/types`
**Purpose**: Single source of truth for all TypeScript types  
**Contains**: Enums, interfaces, API contracts  
**Used by**: Both apps/api and apps/web  
**Never contains**: Business logic, validation, database code

```typescript
import { OpportunityType, User, Profile } from '@job-platform/types';
```

### `@job-platform/schemas`
**Purpose**: Shared Zod validation with business rules  
**Contains**: Input validation, refinements, constraints  
**Used by**: Both apps/api (enforce) and apps/web (client validation)  
**Never contains**: Database queries, HTTP handlers

```typescript
import { opportunitySchema, educationSchema } from '@job-platform/schemas';
```

## 🎯 Core Features

### User Journey
1. Landing → Register → Login
2. **Mandatory** 3-step profile (100% = access)
3. Browse opportunities (eligibility pre-filtered by API)
4. View details → Track actions
5. Submit feedback

### Admin Journey
1. Separate login (`/admin/login`)
2. Create/edit opportunities
3. Manage listings (expire, delete)
4. Review user feedback

### Platform Intelligence
- **Profile Gating**: Incomplete = redirect to `/profile/complete`
- **Eligibility Filtering**: Backend filters by degree/year/skills
- **Walk-in Priority**: Always shown first (orange badge)
- **Auto-Expiry**: Cron job runs daily (apps/api/src/cron)

## 📂 What Lives Where

### `apps/api` (ONLY)
- Prisma schema & migrations
- Database queries
- Cron jobs (expiry automation)
- Auth token generation
- **Eligibility logic** ← Critical
- Stage locking
- Admin permissions

### `apps/web` (ONLY)
- Next.js pages & components
- UI state management (React Context)
- API client (fetch calls)
- Form handling
- Client-side routing

### `packages/types` (Shared Contracts)
- All enums (OpportunityType, UserActionStatus, etc.)
- Entity interfaces (User, Profile, Opportunity, etc.)
- API request/response types
- **No logic, just types**

### `packages/schemas` (Shared Validation)
- Zod schemas with business rules
- Input validation (min/max, required fields)
- Refinements (e.g., salaryMax >= salaryMin)
- **No database, no HTTP**

## 🔐 Security Model

### User Auth
- JWT access tokens (15min)
- Refresh tokens (7 days)
- Stored in localStorage (web) + HTTP-only cookies (future)
- Auto-refresh on 401

### Admin Auth
- **Completely separate** from user auth
- Different tokens (`adminToken`)
- Different routes (`/api/admin/*`)
- Different context (`AdminContext`)

### Why Separate?
- Admin ≠ privileged user
- Admin is a different product
- Prevents accidental elevation
- Clear audit trails

## 📊 Scripts Reference

### Development
```bash
npm run dev         # Run both API + Web
npm run dev:api     # API only
npm run dev:web     # Web only
```

### Build
```bash
npm run build       # Build all workspaces
npm run build:api   # API production build
npm run build:web   # Web production build
```

### Database
```bash
npm run db:generate # Generate Prisma Client
npm run db:push     # Push schema to DB
npm run db:seed     # Create admin user
npm run db:studio   # Open Prisma Studio
```

### Utilities
```bash
npm run lint        # Lint all workspaces
npm run typecheck   # TypeScript check all
npm run clean       # Remove node_modules + dist
```

## 🧪 Testing Checklist

### User Flow
- [ ] Register → Complete profile → Browse opportunities
- [ ] Profile completion shows 100%
- [ ] Walk-ins appear first (orange badge)
- [ ] Action tracking updates dashboard counts
- [ ] Feedback submission works

### Admin Flow
- [ ] Admin login (`admin@jobdiscover.com` / `admin123`)
- [ ] Create job/internship/walk-in
- [ ] Walk-in form shows special fields
- [ ] Opportunity list with filters
- [ ] Expire/delete actions work

### Eligibility Logic (Backend Authority)
- [ ] User with DEGREE sees degree-only opportunities
- [ ] User with 2024 passout sees matching years only
- [ ] Skills are filtered correctly
- [ ] Frontend displays filtered results only

## 🚀 Deployment

### Backend (apps/api)
Platform: Railway / Render / Fly.io

```bash
# Build command
npm run build:api

# Start command
npm run start:api

# Environment Variables
DATABASE_URL=<neon-url>
JWT_ACCESS_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
FRONTEND_URL=<vercel-url>
NODE_ENV=production
```

### Frontend (apps/web)
Platform: Vercel / Netlify

```bash
# Build command (Vercel auto-detects)
npm run build:web

# Environment Variables
NEXT_PUBLIC_API_URL=<railway-url>

# Root directory (Vercel setting)
apps/web
```

## 🎯 Success Metrics

Platform is production-ready when:
- ✅ `npm run dev` starts both servers
- ✅ User can register → profile → browse
- ✅ Admin can login → create opportunities
- ✅ Types are imported from `@job-platform/types`
- ✅ Schemas are shared between API and Web
- ✅ No eligibility logic in Web app
- ✅ Expiry cron runs (check logs)

## 🤝 Contributing

### Adding a New Feature

1. **Define contracts first** (`packages/types`, `packages/schemas`)
2. **Implement in API** (database, routes, logic)
3. **Build UI in Web** (pages, components)
4. **Never violate import rules**

### Adding Shared Code

**Ask**: Is this a business rule or a UI concern?

- **Business rule** → `packages/schemas`
- **Type definition** → `packages/types`
- **API logic** → `apps/api`
- **UI component** → `apps/web`

### Never Do This
```typescript
// ❌ BAD - Duplicated type
// apps/web/src/types/opportunity.ts
export interface Opportunity { ... }

// ✅ GOOD - Import from shared package
import { Opportunity } from '@job-platform/types';
```

```typescript
// ❌ BAD - Frontend filtering eligibility
const eligible = opportunities.filter(opp => 
  opp.allowedDegrees.includes(user.educationLevel)
);

// ✅ GOOD - Backend already filtered
const opportunities = await api.getOpportunities();
// These are already eligible for this user
```

## 📝 Migration from Stage-0

If you have `packages/backend` and `packages/frontend`, run:

```bash
.\migrate-to-monorepo.ps1
```

This moves:
- `backend` or `packages/backend` → `apps/api`
- `frontend` or `packages/frontend` → `apps/web`

Then install dependencies:
```bash
npm install
```

## 🆘 Troubleshooting

**Error: Cannot find module '@job-platform/types'**
```bash
npm install  # Installs all workspaces
```

**Error: Prisma Client not generated**
```bash
npm run db:generate
```

**Error: CORS issues**
- Check `FRONTEND_URL` in `apps/api/.env`
- Should match where Web is running

**Error: Admin login fails**
```bash
npm run db:seed  # Creates admin user
```

## 📚 Further Reading

- [Monorepo Best Practices](https://monorepo.tools/)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

**This is not a backend + frontend repo.**  
**This is a platform with clear boundaries.**

Built with discipline for students seeking opportunities.
