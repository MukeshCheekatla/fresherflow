# 🌊 FresherFlow
### Stop Searching. Start Applying.

**FresherFlow** is the definitive career portal for the next generation of talent. We bridge the gap between fresh graduates and verified, high-impact career opportunities—excluding the noise, the scams, and the paywalls.

[![Live Platform](https://img.shields.io/badge/Live-fresherflow.in-0ea5e9?style=for-the-badge)](https://fresherflow.in)
[![Design System](https://img.shields.io/badge/Design-Locked-amber?style=for-the-badge)](./docs/DESIGN_SYSTEM.md)

---

## 🎯 Our Mission
The transition from college to career is broken. Freshers spend **70% of their time** filtering through outdated listings and predatory "training-plus-job" scams. 

**FresherFlow changes the stream:**
*   **Zero Noise:** Every listing is manually verified through our strict "Flow Protocol."
*   **Direct Access:** One-click redirection to official application portals.
*   **Speed First:** A distraction-free, 8pt-grid-based interface designed for ultra-fast discovery.

---

## 🔥 Key Product Features

### 🏢 Intelligent Feed
*   **Verified Pipeline:** Only genuine jobs, internships, and walk-in drives are synced to your feed.
*   **Smart Urgency:** Visual amber badges and "Closing Soon" filters for jobs expiring within 72 hours.
*   **Eligibility Engine:** Real-time matching based on your degree, pass-out year, and skill set.

### 📱 Premium PWA Experience
*   **Installable:** Add FresherFlow to your home screen for a native app feel.
*   **Ultra-Lightweight:** Sub-100ms transitions and optimized asset loading.
*   **Offline Ready:** View your bookmarked opportunities even without an internet connection.

### 🛡️ Secure Discovery
*   **Passwordless Logic:** Modern auth including Google OAuth 2.0 and Magic Links.
*   **Identity First:** Verified profiles ensure you only see what you are eligible for.

---

## 🔗 The Workflow
1.  **Initialize Identity:** Complete your profile with academic records.
2.  **Discover:** Toggle between Jobs, Internships, and Walk-ins.
3.  **Track:** Bookmark interesting listings and track your application status.
4.  **Execute:** Switch to the official portal and apply.

---

## 🛠 Technical Architecture

> **Engineering Philosophy:** Modern, type-safe, and highly performant monorepo.

| Layer | Technology | Significance |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App) | Server-side rendering & SEO by default |
| **Styling** | Tailwind CSS v4 | Cutting-edge utility-first design enforcement |
| **Backend** | Express + Node.js | Scalable, event-driven API architecture |
| **Database** | PostgreSQL + Prisma | Robust relational data with safe migrations |
| **Monorepo** | TurboRepo | Blazing fast parallel build pipelines |

### 📦 Project Structure
```bash
fresherflow/
├── apps/
│   ├── api/          # Express + Prisma Backend
│   └── web/          # Next.js Frontend
├── packages/
│   ├── types/        # Shared Type Definitions
│   └── schemas/      # Shared Zod Validations
└── docs/             # Technical Specs & Design System
```

---

## 🚀 Getting Started

### 1. Development Sync
```bash
git clone https://github.com/krish/fresherflow.git
npm install
```

### 2. Environment Configuration
Create `.env` files in `apps/api` and `apps/web` (refer to `docs/SETUP.md` for secrets).

### 3. Initialize & Launch
```bash
npm run db:generate  # Sync Prisma Client
npm run dev          # Start Monorepo Stream
```

---

## 📋 Discipline & Standards
*   **Design:** Strict adherence to `docs/DESIGN_SYSTEM.md`.
*   **UX:** 48px minimum touch targets and 8pt spacing grid.
*   **Security:** JWT-based stateless auth with HttpOnly cookies.

---
**Built with discipline. Optimized for students.**
**[cheekatlamukesh@gmail.com](mailto:cheekatlamukesh@gmail.com)**
