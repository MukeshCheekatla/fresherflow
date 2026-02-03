YearHire - Complete Folder Structure
Root Directory
job/
├── apps/
│   ├── api/           # Backend API (Node.js + Express)
│   └── web/           # Frontend (Next.js)
├── docs/              # Documentation
└── node_modules/      # Dependencies
📁 Backend API (apps/api/)
api/
├── prisma/
│   ├── migrations/                    # Database migrations
│   └── schema.prisma                  # Prisma schema definition
├── src/
│   ├── middleware/
│   │   ├── adminAudit.ts             # Admin action logging
│   │   ├── adminRateLimit.ts         # Rate limiting for admin
│   │   ├── auth.ts                   # JWT authentication middleware
│   │   ├── errorHandler.ts           # Global error handler
│   │   └── validate.ts               # Request validation middleware
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── auth.ts               # Admin login/register
│   │   │   ├── feedback.ts           # Handle user feedback
│   │   │   └── opportunities.ts      # CRUD for opportunities
│   │   ├── actions.ts                # User actions (applied/planning/attended)
│   │   ├── auth.ts                   # User authentication
│   │   ├── feedback.ts               # User feedback routes
│   │   ├── opportunities.ts          # Get opportunities (user-facing)
│   │   └── profile.ts                # User profile management
│   ├── utils/
│   │   ├── expiryCron.ts             # Auto-expire opportunities
│   │   ├── logger.ts                 # Winston logger
│   │   └── validation.ts             # Zod schemas for validation
│   └── index.ts                       # Main entry point
├── .env                               # Environment variables
├── nodemon.json                       # Nodemon configuration
├── package.json                       # Dependencies
└── tsconfig.json                      # TypeScript config
📁 Frontend Web (apps/web/)
web/
├── public/
│   ├── icons/                        # PWA icons
│   └── manifest.json                 # PWA manifest
├── src/
│   ├── app/
│   │   ├── (admin)/                 # Admin layout group
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx      # Admin dashboard
│   │   │       ├── jobs/
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx  # Create job
│   │   │       │   ├── [id]/
│   │   │       │   │   └── edit/
│   │   │       │   │       └── page.tsx  # Edit job
│   │   │       │   └── page.tsx      # List jobs
│   │   │       ├── login/
│   │   │       │   └── page.tsx      # Admin login
│   │   │       ├── opportunities/
│   │   │       │   ├── create/
│   │   │       │   │   └── page.tsx  # Unified create opportunity
│   │   │       │   └── edit/
│   │   │       │       └── [id]/
│   │   │       │           └── page.tsx  # Edit opportunity
│   │   │       └── walkins/
│   │   │           ├── new/
│   │   │           │   └── page.tsx  # Create walk-in
│   │   │           ├── [id]/
│   │   │           │   └── edit/
│   │   │           │       └── page.tsx  # Edit walk-in
│   │   │           └── page.tsx      # List walk-ins
│   │   ├── (auth)/                  # Auth layout group
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # User login
│   │   │   └── register/
│   │   │       └── page.tsx         # User registration
│   │   ├── dashboard/
│   │   │   └── page.tsx             # User dashboard
│   │   ├── feed/
│   │   │   └── page.tsx             # Opportunities feed
│   │   ├── profile/
│   │   │   └── setup/
│   │   │       └── page.tsx         # Profile setup
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing page
│   │   └── globals.css              # Global styles
│   ├── contexts/
│   │   ├── AdminContext.tsx         # Admin auth context
│   │   └── AuthContext.tsx          # User auth context
│   ├── features/
│   │   ├── jobs/
│   │   │   ├── hooks/
│   │   │   │   └── useJobs.ts       # Fetch jobs hook
│   │   │   └── services/
│   │   │       └── jobs.service.ts  # Jobs API service
│   │   └── walkins/
│   │       ├── hooks/
│   │       │   └── useWalkins.ts    # Fetch walk-ins hook
│   │       └── services/
│   │           └── walkins.service.ts  # Walk-ins API service
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts            # API client utility
│   │   └── utils.ts                 # Utility functions (cn, etc.)
│   ├── shared/
│   │   ├── components/
│   │   │   ├── navigation/
│   │   │   │   └── TopNav.tsx       # Top navigation bar
│   │   │   └── ui/
│   │   │       ├── LoadingScreen.tsx    # Loading component
│   │   │       └── Skeleton.tsx         # Skeleton loaders
│   │   └── utils/
│   │       └── jobParser.ts         # Job text parser utility
│   └── types/
│       ├── api.ts                   # API response types
│       ├── job.ts                   # Job types
│       └── walkin.ts                # Walk-in types
├── .env.local                       # Environment variables
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies
├── postcss.config.js                # PostCSS config
├── tailwind.config.js               # Tailwind CSS config
└── tsconfig.json                    # TypeScript config
📁 Documentation (docs/)
docs/
└── core plan.txt                    # Product plan & requirements
Key Files Summary
Backend API
src/index.ts - Express server entry point
prisma/schema.prisma - Database schema (Users, Admins, Opportunities, etc.)
src/routes/admin/opportunities.ts - Admin CRUD for jobs/internships/walk-ins
src/utils/expiryCron.ts - Auto-expire jobs daily at midnight
Frontend Web
src/contexts/AuthContext.tsx - User authentication state
src/contexts/AdminContext.tsx - Admin authentication state
src/app/(admin)/admin/opportunities/create/page.tsx - Unified create page with auto-fill parser
src/shared/utils/jobParser.ts - Parses job postings from text (NO AI)
src/features/jobs/services/jobs.service.ts - Jobs API calls
src/features/walkins/services/walkins.service.ts - Walk-ins API calls
Architecture Overview
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│  - UI Rendering                         │
│  - Client Routing                       │
│  - Token Handling                       │
│  - API Consumption                      │
│                                         │
│  Port: 3000                             │
└────────────┬────────────────────────────┘
             │ HTTP/API Calls
             ▼
┌─────────────────────────────────────────┐
│         Backend (Node.js)               │
│  - Business Logic                       │
│  - Authentication (JWT)                 │
│  - Database Operations                  │
│  - Expiry Automation                    │
│  - Admin Controls                       │
│                                         │
│  Port: 5000                             │
└────────────┬────────────────────────────┘
             │ Prisma ORM
             ▼
┌─────────────────────────────────────────┐
│      Database (PostgreSQL)              │
│  - Users, Admins                        │
│  - Opportunities                        │
│  - Walk-in Details                      │
│  - User Actions & Feedback              │
│                                         │
│  Provider: Neon (Cloud)                 │
└─────────────────────────────────────────┘
Tech Stack
Layer	Technology
Frontend	Next.js 16.1.5, React, TypeScript, Tailwind CSS
Backend	Node.js, Express, TypeScript
Database	PostgreSQL (via Neon)
ORM	Prisma
Auth	JWT Tokens
Validation	Zod
Logging	Winston
Running the Project
Backend API
cd apps/api
npm run dev        # Runs on http://localhost:5000
Frontend Web
cd apps/web
npm run dev        # Runs on http://localhost:3000
Environment Variables
Backend (.env)
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:5000"