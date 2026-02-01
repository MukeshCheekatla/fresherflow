# JobDiscover Platform - Zero-Cost MVP

A user-first job discovery platform built with Next.js and Firebase.

## Features

- 🎯 **Intent-Based Job Discovery** - Find jobs based on your goals, not just keywords
- 📍 **Walk-in Opportunities** - Location-based hiring events
- 🔔 **Smart Alerts** - Get notified about relevant opportunities
- 🚫 **No Mandatory Signup** - Browse jobs as a guest
- ✨ **Clean, Minimal Design** - High whitespace, readable typography

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Auth)
- **Zero Cost**: No paid APIs

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Firestore Database**:
   - Go to Build > Firestore Database
   - Create database in test mode (we'll add rules later)
4. Enable **Authentication**:
   - Go to Build > Authentication
   - Enable Google Sign-in provider
   - Enable Email/Password provider (for OTP)

### 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app (name it "JobDiscover" or similar)
5. Copy the `firebaseConfig` object

### 4. Set Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Paste your Firebase config values into `.env.local`

### 5. Deploy Firestore Rules

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Init Firebase in project:
   ```bash
   firebase init firestore
   ```
   - Select existing project
   - Keep default file paths

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 6. Set Admin UID

1. Run the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/account`
3. Sign in with Google
4. Go to Firebase Console > Authentication > Users
5. Copy your UID
6. Edit `firestore.rules` and replace `"PASTE_YOUR_FIREBASE_UID_HERE"` with your actual UID
7. Deploy rules again:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 7. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── jobs/              # Job listing and detail pages
│   ├── walkins/           # Walk-in opportunities
│   ├── alerts/            # Alert management
│   ├── account/           # User account
│   └── admin/             # Admin job posting (coming soon)
├── components/
│   ├── navigation/        # TopNav, etc.
│   ├── jobs/              # Job cards, filters (coming soon)
│   └── walkins/           # Walk-in components (coming soon)
└── lib/
    ├── firebase.ts        # Firebase config
    ├── types.ts           # TypeScript types
    └── utils.ts           # Utilities
```

## Development Roadmap

- [x] Foundation setup
- [x] Basic navigation
- [ ] Admin job posting form
- [ ] Job listing with filters
- [ ] Walk-in opportunities
- [ ] User authentication
- [ ] Alert system
- [ ] Mobile optimization

## Zero-Cost Architecture

- Firebase Free Tier: 1GB storage, 50K reads/day
- No Maps SDK (external links instead)
- No AI APIs (manual admin entry)
- Client-side filtering
- Vercel free tier for hosting

## Contributing

This is an MVP. Keep it simple. No over-engineering.

## License

MIT
