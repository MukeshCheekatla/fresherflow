# 🌊 FresherFlow
[![Domain](https://img.shields.io/badge/Live-fresherflow.in-0ea5e9?style=for-the-badge)](https://fresherflow.in)

```
fresherflow/
├── apps/
│   ├── api/          # Backend product (Express + Prisma)
│   └── web/          # Frontend product (Next.js)
│
├── packages/
│   ├── types/        # Shared TypeScript types (@fresherflow/types)
│   ├── schemas/      # Shared Zod validation (@fresherflow/schemas)
│   └── constants/    # Shared constants (@fresherflow/constants)
│
└── turbo.json        # Turbo configuration
```

## ⚖️ Hard Rules & Enforcement

### 1. Import Boundaries
- Frontend/Backend: Import ONLY from `@fresherflow/types` and `@fresherflow/schemas`.
- NO local type definitions in `apps/`.
- Packages NEVER import from apps.

### 2. Authority (Backend is King)
- **Eligibility**: Logic ONLY in `apps/api/src/domain/eligibility/match.ts`.
- **Profile Completion**: Logic ONLY in `apps/api/src/utils/profileCompletion.ts`.
- Frontend displays what backend approves; it never calculates or filters.

### 3. Admin Separation
- Admin is a completely separate product surface.
- Separate auth, separate tokens (`adminToken`), separate routes (`/api/admin/*`).
- NO `isAdmin` flags in the User model.

---

## 🚀 Quick Start

### 1. Install & Setup
```bash
npm install

# Setup apps/api/.env
DATABASE_URL="postgresql://..."
JWT_ACCESS_SECRET="..."
FRONTEND_URL="http://localhost:3000"

npm run db:generate
npm run db:push
```

### 2. Run Development
```bash
npm run dev         # Runs API (5000) + Web (3000)
```

## 🎯 Core Features

### User & Admin Journeys
- **PWA Experience**: Offline access & instant loading (Stale-While-Revalidate).
- **Bulk Management**: Admin can curate hundreds of listings at once.
- **Job Text Parsing**: One-click listing creation from raw text.
- **Intelligence**: Backend-driven eligibility filtering and profile gating.
- **SEO**: Automated `sitemap.xml` and `robots.txt`.

## � Scripts Reference

```bash
npm run dev          # Run all apps
npm run build        # Build all workspaces
npm run lint         # Lint all workspaces
npm run typecheck    # TypeScript check all
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to DB
npm run db:studio    # Open Prisma Studio
```

## 🚀 Deployment

### Backend (apps/api)
- **Build**: `npm run build:api`
- **Start**: `npm run start:api`
- **Required Env**: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `ADMIN_EMAIL`

### Frontend (apps/web)
- **Build**: `npm run build:web`
- **Vercel Settings**: Root directory `apps/web`
- **Required Env**: `NEXT_PUBLIC_API_URL`

## 🆘 Troubleshooting

- **Admin login fails**: Ensure `ADMIN_EMAIL` env matches the email you use to login. The first login triggers the "Claim Admin" flow automatically.
- **Zod/Type errors**: Run `npm install` from the root to sync workspace symlinks.

---
**Focus on discipline. Built for students.**
