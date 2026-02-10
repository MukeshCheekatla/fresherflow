# 🌊 FresherFlow

<p align="center">
  <img src="./apps/web/public/main.png" alt="FresherFlow" width="600">
</p>

<p align="center">
  <strong>Stop Searching. Start Applying.</strong>
</p>

<p align="center">
  <a href="https://fresherflow.in">
    <img src="https://img.shields.io/badge/🌐_Website-fresherflow.in-0ea5e9" alt="Website">
  </a>
  <a href="https://www.linkedin.com/company/fresherflow-in">
    <img src="https://img.shields.io/badge/LinkedIn-FresherFlow-0077B5?logo=linkedin" alt="LinkedIn">
  </a>
  <a href="https://twitter.com/Fresherflow">
    <img src="https://img.shields.io/badge/Twitter-@Fresherflow-1DA1F2?logo=twitter" alt="Twitter">
  </a>
</p>

<p align="center">
  <a href="https://whatsapp.com/channel/0029VbCkZu6FHWq0qJOOU73D">
    <img src="https://img.shields.io/badge/WhatsApp-Channel-25D366?logo=whatsapp" alt="WhatsApp">
  </a>
  <a href="https://t.me/fresherflowin">
    <img src="https://img.shields.io/badge/Telegram-Join-26A5E4?logo=telegram" alt="Telegram">
  </a>
  <a href="https://www.facebook.com/FresherFlow.in">
    <img src="https://img.shields.io/badge/Facebook-FresherFlow-1877F2?logo=facebook" alt="Facebook">
  </a>
  <a href="https://instagram.com/fresherflow">
    <img src="https://img.shields.io/badge/Instagram-@fresherflow-E4405F?logo=instagram" alt="Instagram">
  </a>
</p>

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

### �️ Secure Discovery
*   **Passwordless Logic:** Modern auth including Google OAuth 2.0 and Magic Links.
*   **Identity First:** Verified profiles ensure you only see what you are eligible for.

---

## � The Workflow
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

## � Discipline & Standards
*   **Design:** Strict adherence to `docs/DESIGN_SYSTEM.md`.
*   **UX:** 48px minimum touch targets and 8pt spacing grid.
*   **Security:** JWT-based stateless auth with HttpOnly cookies.

---

## � Support

- � Email: [support@fresherflow.in](mailto:support@fresherflow.in)
- 🌐 Website: [fresherflow.in](https://fresherflow.in)
- 💼 LinkedIn: [FresherFlow Company](https://www.linkedin.com/company/fresherflow-in)

---

**Built with discipline. Optimized for students.**
