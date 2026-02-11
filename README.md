# 🌊 FresherFlow

<table align="center" border="0">
  <tr>
    <td align="center" width="80">
      <img src="./apps/web/public/main.png" width="60" alt="FresherFlow Icon">
    </td>
    <td align="center">
      <strong>Stop Searching. Start Applying.</strong><br/>
      <em>Verified job opportunities platform for freshers and students</em><br/>
      <a href="https://fresherflow.in">🌐 Website</a> • 
      <a href="https://www.linkedin.com/company/fresherflow-in">💼 LinkedIn</a> • 
      <a href="https://twitter.com/Fresherflow">🐦 Twitter</a> • 
      <a href="https://whatsapp.com/channel/0029VbCkZu6FHWq0qJOOU73D">💬 WhatsApp</a> • 
      <a href="https://t.me/fresherflowin">✈️ Telegram</a> • 
      <a href="https://github.com/MukeshCheekatla/fresherflow">📂 Repo</a>
    </td>
  </tr>
</table>

---

## 📖 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Platform Features](#-platform-features)
- [Connect With Us](#-connect-with-us)

---

## 🎯 About

FresherFlow solves a critical problem: **freshers waste 70% of their time filtering outdated listings and scams.** We've built a modern, verified platform that streamlines the job search experience for college students and recent graduates.

### The FresherFlow Promise

✅ **Zero Noise** – Every listing manually verified through our strict "Flow Protocol"  
✅ **Direct Access** – One-click redirection to official application portals  
✅ **Speed First** – Ultra-fast, distraction-free interface with 8pt grid design  
✅ **Smart Matching** – Eligibility filtering based on degree, graduation year, and skills

---

## 🔥 Key Features

### 🎓 For Students

- **Jobs, Internships & Walk-ins** – All opportunities in one unified feed
- **Smart Filters** – Filter by location, company, role, eligibility criteria
- **Closing Soon Alerts** – Visual badges for opportunities expiring within 72 hours
- **Bookmark Manager** – Save and track opportunities you're interested in
- **Offline Support** – Access bookmarked jobs even without internet
- **Profile-Based Matching** – See only jobs you're eligible for based on your profile

### 🔐 Modern Authentication

- **Passwordless Login** – Email OTP (Magic Links) for quick, secure access
- **Google OAuth 2.0** – One-click sign-in with your Google account
- **Passkey Support** – Admin panel with WebAuthn and TOTP 2FA

### 👨‍💼 For Admins

- **Admin Dashboard** – Dedicated interface for managing opportunities
- **Quick Edit** – Edit job postings directly from the public feed
- **Batch Operations** – Efficiently manage multiple listings
- **Analytics** – Track user engagement and application metrics

### 📱 PWA Features

- **Installable** – Add to home screen for native app-like experience
- **Responsive Design** – Optimized for mobile, tablet, and desktop
- **Fast Loading** – Sub-100ms page transitions with optimized assets
- **SEO Optimized** – Server-side rendering with Next.js for better discoverability

---

## 🛠 Tech Stack

### Frontend (`apps/web`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.5 | React framework with App Router & SSR |
| **React** | 19.2.3 | UI library with React Compiler |
| **TypeScript** | ^5.0 | Type safety across the entire codebase |
| **Tailwind CSS** | ^4.1 | Utility-first CSS framework (v4 alpha) |
| **shadcn/ui** | Latest | Accessible component library with Radix UI |
| **Lucide Icons** | ^0.563 | Modern icon library |
| **Playwright** | ^1.55 | E2E testing and smoke tests |

### Backend (`apps/api`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | >=20.0.0 | JavaScript runtime |
| **Express** | ^4.21 | Web framework for REST API |
| **Prisma** | ^6.2 | Type-safe ORM with migrations |
| **PostgreSQL** | Latest | Production database (via Neon) |
| **Redis** | Optional | Caching layer with IORedis |
| **JWT** | ^9.0 | Stateless authentication with HttpOnly cookies |
| **Zod** | ^3.24 | Runtime schema validation |
| **Winston** | ^3.19 | Structured logging |
| **Helmet** | ^8.0 | Security middleware |

### Shared Infrastructure

- **TurboRepo** – Monorepo build system with caching
- **Shared Packages** – `@fresherflow/types`, `@fresherflow/schemas`, `@fresherflow/constants`
- **Vercel** – Frontend deployment with edge functions
- **Render/Railway** – Backend API hosting
- **Neon** – Serverless PostgreSQL with branching

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 9.0.0
- **PostgreSQL** database (local or Neon)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MukeshCheekatla/fresherflow.git
   cd fresherflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in both `apps/api` and `apps/web`:

   **`apps/api/.env`**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fresherflow"
   JWT_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   RESEND_API_KEY="your-resend-api-key"
   FRONTEND_URL="http://localhost:3000"
   ```

   **`apps/web/.env`**
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   ```

4. **Initialize the database**
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Push schema to database
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

---

## 📦 Project Structure

```
fresherflow/
│
├── apps/
│   ├── api/                          # Backend API
│   │   ├── src/
│   │   │   ├── routes/              # API route handlers
│   │   │   │   ├── auth.ts          # Authentication routes
│   │   │   │   ├── jobs.ts          # Jobs CRUD
│   │   │   │   ├── admin.ts         # Admin panel routes
│   │   │   │   └── profile.ts       # User profile management
│   │   │   ├── middleware/          # Express middleware
│   │   │   ├── services/            # Business logic layer
│   │   │   ├── utils/               # Helper functions
│   │   │   └── index.ts             # Server entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Database schema
│   │   └── package.json
│   │
│   └── web/                          # Frontend (Next.js)
│       ├── src/
│       │   ├── app/                 # Next.js App Router
│       │   │   ├── (account)/       # User account pages
│       │   │   ├── (admin)/         # Admin panel pages
│       │   │   ├── auth/            # Authentication pages
│       │   │   ├── jobs/            # Job listings
│       │   │   ├── internships/     # Internship listings
│       │   │   ├── walk-ins/        # Walk-in drive listings
│       │   │   └── dashboard/       # User dashboard
│       │   ├── components/          # React components
│       │   │   ├── ui/              # shadcn/ui components
│       │   │   ├── auth/            # Auth-related components
│       │   │   └── admin/           # Admin components
│       │   ├── lib/                 # Utilities and configs
│       │   │   ├── api/             # API client functions
│       │   │   ├── hooks/           # Custom React hooks
│       │   │   └── offline/         # PWA offline support
│       │   └── contexts/            # React Context providers
│       └── package.json
│
├── packages/                         # Shared packages
│   ├── types/                       # TypeScript type definitions
│   ├── schemas/                     # Zod validation schemas
│   └── constants/                   # Shared constants
│
├── docs/                            # Documentation
│   ├── DEPLOY.md                   # Deployment guide
│   ├── automation.md               # Automation workflows
│   └── privacy-policy.md           # Legal documents
│
├── turbo.json                       # TurboRepo configuration
├── package.json                     # Root package.json
└── README.md                        # This file
```

---

## 🎮 Available Scripts

### Root-level commands

```bash
# Development
npm run dev                # Start all apps in dev mode (kills ports first)
npm run dev:api            # Start only backend API
npm run dev:web            # Start only frontend
npm run dev:stack          # Start API & Web with concurrently

# Build
npm run build              # Build all apps
npm run build:api          # Build backend only
npm run build:web          # Build frontend only

# Database
npm run db:generate        # Generate Prisma client
npm run db:push            # Push schema changes to database
npm run db:studio          # Open Prisma Studio GUI

# Utilities
npm run lint               # Run linters for all workspaces
npm run typecheck          # TypeScript type checking
npm run test               # Run test suites
npm run clean              # Clean node_modules and dist folders

# Port Management (Windows)
npm run kill:port          # Kill process on port 5000
npm run kill:web-port      # Kill process on port 3000
npm run kill:ports         # Kill both API and Web ports
```

---

## 🎨 Platform Features

### User Journey

1. **Onboarding**
   - Sign up with Google or Email OTP
   - Complete academic profile (degree, graduation year, skills)
   - Set preferences for job types and locations

2. **Discovery**
   - Browse verified jobs, internships, and walk-ins
   - Use smart filters (location, company, role, eligibility)
   - See "Closing Soon" badges for urgent opportunities

3. **Tracking**
   - Bookmark interesting opportunities
   - Track application status
   - Access offline bookmarks

4. **Application**
   - One-click redirect to official application portal
   - Auto-fill assistance with saved profile data

### Admin Features

- **Opportunity Management**
  - Create, edit, delete job/internship/walk-in listings
  - Bulk upload capabilities
  - Draft and publish workflow

- **User Management**
  - View registered users
  - Manage verification status

- **Security**
  - Passkey authentication (WebAuthn)
  - TOTP 2FA support
  - Secure admin routes with role-based access

### Technical Highlights

- **Type Safety** – Full TypeScript coverage with strict mode
- **API Design** – RESTful API with consistent error handling
- **Validation** – Request/response validation with Zod schemas
- **Caching** – Optional Redis integration for performance
- **Monitoring** – Sentry integration for error tracking
- **Rate Limiting** – Express rate limiter for API protection
- **Security Headers** – Helmet.js for HTTP security
- **CORS** – Configured for cross-origin requests
- **Logging** – Structured logs with Winston

---

## 🌐 Connect With Us

### Social Media

<p align="left">
  <a href="https://www.linkedin.com/company/fresherflow-in">
    <img src="https://img.shields.io/badge/LinkedIn-FresherFlow-0077B5?logo=linkedin&style=for-the-badge" alt="LinkedIn">
  </a>
  <a href="https://twitter.com/Fresherflow">
    <img src="https://img.shields.io/badge/Twitter-@Fresherflow-1DA1F2?logo=twitter&style=for-the-badge" alt="Twitter">
  </a>
  <a href="https://instagram.com/fresherflow">
    <img src="https://img.shields.io/badge/Instagram-@fresherflow-E4405F?logo=instagram&style=for-the-badge" alt="Instagram">
  </a>
</p>

### Community Channels

<p align="left">
  <a href="https://whatsapp.com/channel/0029VbCkZu6FHWq0qJOOU73D">
    <img src="https://img.shields.io/badge/WhatsApp-Channel-25D366?logo=whatsapp&style=for-the-badge" alt="WhatsApp">
  </a>
  <a href="https://t.me/fresherflowin">
    <img src="https://img.shields.io/badge/Telegram-Join-26A5E4?logo=telegram&style=for-the-badge" alt="Telegram">
  </a>
  <a href="https://www.facebook.com/FresherFlow.in">
    <img src="https://img.shields.io/badge/Facebook-FresherFlow-1877F2?logo=facebook&style=for-the-badge" alt="Facebook">
  </a>
</p>

### Support

- 📧 **Email:** [support@fresherflow.in](mailto:support@fresherflow.in)
- 🌐 **Website:** [fresherflow.in](https://fresherflow.in)
- 💼 **LinkedIn:** [FresherFlow Company Page](https://www.linkedin.com/company/fresherflow-in)

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Built with ❤️ for students navigating their career journey.

**Engineering Philosophy:** Modern, type-safe, and highly performant. Strict adherence to design systems, 48px minimum touch targets, and 8pt spacing grid.

---

<p align="center">
  <strong>Built with discipline. Optimized for students.</strong>
</p>
