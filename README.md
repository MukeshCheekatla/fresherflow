<![CDATA[<div align="center">

![FresherFlow Banner](./apps/web/public/main.png)

# 🌊 FresherFlow

### **Stop Searching. Start Applying.**

**The definitive career portal for fresh graduates.** Verified opportunities, zero noise, maximum impact.

[![Website](https://img.shields.io/badge/Website-fresherflow.in-0ea5e9?style=for-the-badge&logo=google-chrome&logoColor=white)](https://fresherflow.in)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-FresherFlow-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/fresherflow-in)
[![Twitter](https://img.shields.io/badge/Twitter-@Fresherflow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/Fresherflow)

[![WhatsApp](https://img.shields.io/badge/WhatsApp-Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029VbCkZu6FHWq0qJOOU73D)
[![Telegram](https://img.shields.io/badge/Telegram-Join-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/fresherflowin)
[![Facebook](https://img.shields.io/badge/Facebook-FresherFlow-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/FresherFlow.in)
[![Instagram](https://img.shields.io/badge/Instagram-@fresherflow-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/fresherflow)

</div>

---

## 🎯 **Mission**

The transition from college to career is broken. Fresh graduates spend **70% of their time** filtering through expired listings, duplicate posts, and predatory "pay-for-training" scams.

**FresherFlow changes the stream:**
- ✅ **Zero Noise** – Every listing is manually verified through our strict Flow Protocol
- ✅ **Direct Access** – One-click redirection to official application portals
- ✅ **Speed First** – Distraction-free interface built for ultra-fast discovery
- ✅ **Smart Matching** – Personalized feed based on your degree, batch, skills, and location

---

## 🔥 **Key Features**

### 📋 **Verified Opportunity Feed**
- **Curated Pipeline** – Only genuine jobs, internships, and walk-in drives
- **Smart Urgency** – Visual badges and "Closing Soon" filters for jobs expiring within 72 hours
- **Eligibility Engine** – Real-time matching based on degree, pass-out year, and skill set
- **Category Filters** – Browse by Jobs, Internships, or Walk-ins with advanced search

### 📱 **Progressive Web App (PWA)**
- **Installable** – Add FresherFlow to your home screen for a native app feel
- **Ultra-Lightweight** – Sub-100ms page transitions with optimized asset loading
- **Offline Ready** – View bookmarked opportunities even without internet

### 👤 **Profile-First Experience**
- **Smart Onboarding** – Complete your profile once, unlock all relevant opportunities
- **Action Tracking** – Mark jobs as Applied, Planning, Attended, or Not Eligible
- **Saved Jobs** – Bookmark listings and track your application pipeline
- **Profile Completeness** – Get matched to better opportunities with a complete profile

### 🛡️ **Secure & Modern Auth**
- **Passwordless** – Google OAuth 2.0 + Magic Links (OTP)
- **Session Management** – Secure JWT-based authentication with refresh tokens

### 👨‍💼 **Admin Operations**
- **Content Management** – Create, edit, and publish opportunities with full audit trail
- **Link Health Tracking** – Automated verification to detect broken application links
- **Analytics Dashboard** – Monitor user engagement, application trends, and system health
- **Bulk Actions** – Efficiently manage multiple listings with CSV export

---

## 🛠️ **Technology Stack**

> **Engineering Philosophy:** Modern, type-safe, highly performant monorepo

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | Server-side rendering, SEO optimization, fast page loads |
| **Styling** | Tailwind CSS v4 | Modern utility-first design with custom premium palette |
| **Backend** | Express + Node.js | Scalable REST API with middleware pipeline |
| **Database** | PostgreSQL + Prisma | Type-safe ORM with migration management |
| **Auth** | JWT + WebAuthn | Secure session handling with passkey support |
| **Monorepo** | Turbo + npm Workspaces | Blazing fast parallel builds and shared packages |
| **Deployment** | Vercel + Render | Web on Vercel, API on Render, PostgreSQL on Neon |

---

## 📦 **Project Structure**

```bash
fresherflow/
├── apps/
│   ├── api/              # Express + Prisma Backend
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints (auth, opportunities, admin)
│   │   │   ├── middleware/ # Auth, rate limiting, error handling
│   │   │   └── cron/     # Background jobs (expiry tracking)
│   │   └── prisma/       # Database schema and migrations
│   ├── web/              # Next.js Frontend
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   ├── components/ # Reusable UI components
│       │   ├── features/ # Feature-specific modules
│       │   └── lib/      # API client, utilities
│       └── public/       # Static assets, PWA manifest
│   
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── schemas/          # Zod validation schemas
│   ├── constants/        # Shared constants and enums
│   └── auth/             # JWT helper utilities
└── docs/                 # Technical specs & deployment guides
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js `>=20.0.0`
- npm `>=9.0.0`
- PostgreSQL database (local or hosted)

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/fresherflow.git
cd fresherflow
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
Create `.env` files in `apps/api` and `apps/web`:

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/fresherflow
DIRECT_DATABASE_URL=postgresql://user:password@localhost:5432/fresherflow
JWT_SECRET=your-secure-secret
REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key
RP_ID=localhost
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### **4. Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### **5. Start Development**
```bash
# Start both web and API concurrently
npm run dev

# Or start individually:
npm run dev:web   # Next.js on http://localhost:3000
npm run dev:api   # Express on http://localhost:5000
```

### **6. Open Prisma Studio (Optional)**
```bash
npm run db:studio
```

---

## 📚 **Documentation**

- **[Deployment Guide](./docs/DEPLOY.md)** – Deploy to Vercel + Render
- **[API Templates](./docs/templates.md)** – Job posting JSON structures
- **[Privacy Policy](./docs/privacy-policy.md)** – Data handling practices
- **[Terms of Service](./docs/terms-of-service.md)** – User agreement

---

## 🤝 **Contributing**

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📋 **Discipline & Standards**

- **Design System** – 8pt spacing grid, 48px minimum touch targets
- **Type Safety** – Strict TypeScript with Zod validation
- **Security** – JWT-based stateless auth with HttpOnly cookies
- **Performance** – Lazy loading, image optimization, code splitting
- **SEO** – Dynamic metadata, JSON-LD structured data, sitemaps

---

## 🔒 **Security**

- Found a security vulnerability? Please email **security@fresherflow.in**
- Do not open public issues for security concerns
- We follow responsible disclosure practices

---

## 📞 **Support**

- **Email:** [support@fresherflow.in](mailto:support@fresherflow.in)
- **LinkedIn:** [FresherFlow Company](https://www.linkedin.com/company/fresherflow-in)
- **Twitter:** [@Fresherflow](https://twitter.com/Fresherflow)
- **Telegram:** [Join Community](https://t.me/fresherflowin)
- **WhatsApp:** [Updates Channel](https://whatsapp.com/channel/0029VbCkZu6FHWq0qJOOU73D)

---

## 📜 **License**

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.

---

## 🌟 **Acknowledgments**

Built with discipline. Optimized for students. Trusted by thousands of fresh graduates.

**FresherFlow** – Where verified opportunities meet ambitious talent.

---

<div align="center">

**[Visit FresherFlow →](https://fresherflow.in)**

Made with 💙 by the FresherFlow Team

</div>
]]>
