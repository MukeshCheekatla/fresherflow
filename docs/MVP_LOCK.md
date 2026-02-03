# MVP SCOPE LOCK

**Purpose**: This document defines the **non-negotiable** feature boundary for the MVP release of the Job & Walk-in Opportunity Platform. Any feature not explicitly listed as INCLUDED is POST-MVP and blocked from development.

**Enforcement**: This is a contract, not a wishlist. Scope creep kills products.

---

## ✅ INCLUDED IN MVP (Approved Features)

### Core Opportunity Types
- **Jobs** - Full-time positions with eligibility filtering
- **Internships** - Temporary positions with eligibility filtering
- **Walk-ins** - Event-based opportunities with date/venue management

### Admin Capabilities
- **Admin-only posting** - Only admins create/edit/expire opportunities
- **Manual verification** - Admins manually verify and maintain listings
- **Expiry automation** - Cron-based automatic expiry
- **Audit logging** - All admin actions tracked permanently

### User Features
- **Eligibility filtering** - Backend-enforced degree/passout/skills matching
- **Action tracking** - Users can mark: Applied, Planning, Attended, Not Eligible
- **Profile completion** - Gated access based on 100% profile completion
- **Feedback submission** - Users can report expired/broken/duplicate listings

### System Features
- **Authentication** - Separate user and admin auth (JWT-based)
- **Profile gating** - Feed/dashboard blocked until profile complete
- **Status lifecycle** - ACTIVE → EXPIRED (terminal state, clean)
- **Rate limiting** - 10 admin operations per hour

---

## ❌ EXCLUDED FROM MVP (Post-MVP Only)

### Account Types
- ❌ **Recruiter accounts** - No company self-service posting
- ❌ **Multi-role users** - Users are users, admins are admins (no crossover)

### Content & Media
- ❌ **Resume upload** - No file storage, no PDF parsing
- ❌ **Company logos** - Text-only listings
- ❌ **Media attachments** - No images, videos, files

### Communication
- ❌ **Chat / messaging** - No user-admin chat, no user-recruiter chat
- ❌ **Email notifications** - No automated emails (welcome, expiry, matches)
- ❌ **SMS notifications** - No phone integration

### Intelligence & Automation
- ❌ **Recommendations** - No "suggested for you" logic
- ❌ **AI / automation** - No auto-tagging, auto-filtering, chatbots
- ❌ **Smart matching** - Eligibility is rule-based only, no ML

### Analytics & Reporting
- ❌ **Analytics dashboards** - No charts, graphs, insights for admins
- ❌ **User analytics** - No tracking beyond actions/feedback
- ❌ **Export functionality** - No CSV exports, reports

### Payments & Commerce
- ❌ **Payments** - No premium listings, no paid features
- ❌ **Subscriptions** - No recurring billing

### Social & Sharing
- ❌ **Social login** - Email/password only
- ❌ **Sharing** - No share buttons, no referrals
- ❌ **Comments/reviews** - Feedback only (structured, not freeform)

---

## 🔒 THE RULE

> **Any feature not explicitly listed in the INCLUDED section is POST-MVP.**

If a feature request comes up:
1. Check this document
2. If not listed → defer to post-MVP
3. If "similar" → still defer
4. No exceptions

---

## 📌 What "MVP" Means for This Platform

**MVP = Minimum Viable Product, NOT Minimum Viable Polish**

The platform ships when:
- ✅ All INCLUDED features work correctly
- ✅ Edge cases resolved (Step 7 passed)
- ✅ Data integrity enforced (Steps 4-6 passed)
- ✅ Backend authority locked (Steps 1-3 passed)
- ✅ Pre-launch checklist complete (Step 9)

**NOT when:**
- ❌ "Just one more feature" added
- ❌ UI is "perfectly polished"
- ❌ Every possible integration exists

---

## 🚨 Violations

If anyone (developer, stakeholder, user) requests a POST-MVP feature:

**Response template:**
> "That's a great idea for post-MVP. Right now we're focused on shipping a correct, trustworthy platform. Let's revisit after launch."

**Do NOT:**
- ❌ Say "maybe we can squeeze it in"
- ❌ Start "exploratory work"
- ❌ Build 80% and leave it disabled

---

## 📅 Post-MVP Roadmap (Deferred)

These are **intentionally delayed**, not forgotten:

### Phase 2 (Post-Launch)
- Email notifications
- Analytics for admins
- Recruiter self-service (careful gating)

### Phase 3 (Growth)
- Smart recommendations
- Resume parsing
- Advanced search

### Phase 4 (Scale)
- Mobile apps (native)
- API for partners
- Multi-language support

---

## ✅ Sign-Off

**This document is binding.**

- Product Owner: Accepted ✅
- Engineering: Accepted ✅
- Stakeholders: Accepted ✅

**Date Locked**: 2026-02-01  
**Review Date**: Post-MVP only

---

**Ship what's right. Ship what's complete. Then iterate.**
