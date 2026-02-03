# 📐 Material Design + PWA Standardization Plan

## Current State Analysis

**Stack**:
- ✅ Next.js 16.1.5
- ✅ Tailwind CSS v4 (modern)
- ✅ Radix UI (accessible primitives)
- ⚠️ Custom font sizes (14px base on mobile)
- ⚠️ Button heights (40px - below Material Design 48px)
- ⚠️ Mixed spacing system

**Issues**:
1. Base font too small (14px on mobile, should be 16px)
2. Touch targets below 48px minimum
3. Custom spacing mixed with standard spacing
4. Typography scale not Material Design compliant

---

## 🎯 Implementation Plan

### Phase 1: Foundation (Typography + Spacing)

#### 1.1 Fix Base Typography ✅ Enforce 16px

**File**: `apps/web/src/app/globals.css`

**Current**:
```css
--fs-body: 14px;  /* ❌ Too small for mobile */
--fs-small: 12px; /* ❌ Minimum should be 12px */
```

**Fix to Material Design**:
```css
:root {
  /* Material Design Typography Scale (Mobile-First) */
  --fs-h1: 2rem;      /* 32px */
  --fs-h2: 1.5rem;    /* 24px */
  --fs-h3: 1.25rem;   /* 20px */
  --fs-body: 1rem;    /* 16px - NEVER LOWER */
  --fs-small: 0.875rem; /* 14px - sparingly */
  --fs-button: 1rem;  /* 16px */
  
  /* Line heights (Material Design) */
  --lh-tight: 1.25;
  --lh-normal: 1.5;
  --lh-relaxed: 1.75;
}

/* Desktop scale */
@media (min-width: 1024px) {
  :root {
    --fs-h1: 2.5rem;   /* 40px */
    --fs-h2: 2rem;     /* 32px */
    --fs-h3: 1.5rem;   /* 24px */
    --fs-body: 1rem;   /* 16px - consistent */
    --fs-small: 0.875rem; /* 14px */
  }
}

body {
  font-size: 16px; /* Explicit base */
  line-height: 1.5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
```

#### 1.2 Standardize 8pt Spacing Grid

**Current**: Mixed `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`

**Fix**: Enforce Material Design 8pt grid only

```css
:root {
  /* 8pt Grid (Material Design) */
  --space-1: 0.5rem;  /* 8px */
  --space-2: 1rem;    /* 16px */
  --space-3: 1.5rem;  /* 24px */
  --space-4: 2rem;    /* 32px */
  --space-6: 3rem;    /* 48px */
  --space-8: 4rem;    /* 64px */
  
  /* Micro spacing (use sparingly) */
  --space-0-5: 0.25rem; /* 4px - only for micro adjustments */
}
```

**Remove**:
- `--space-3: 12px` ❌ (not 8pt)
- `--space-10: 40px` ❌ (not 8pt)
- `--space-12: 48px` ❌ (duplicate of space-6)

---

### Phase 2: Touch Targets (48px Minimum)

#### 2.1 Fix Button Heights

**Current**:
```css
.premium-button {
  height: 40px; /* ❌ Below Material Design */
}
```

**Fix**:
```css
.premium-button, .btn-primary {
  min-height: 3rem; /* 48px - Material Design minimum */
  min-width: 3rem;  /* 48px for icon buttons */
  padding: 0.75rem 1.5rem; /* 12px 24px */
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.5rem; /* 8px */
}

/* Icon-only buttons */
.btn-icon {
  min-height: 3rem;
  min-width: 3rem;
  padding: 0.75rem;
}

/* Small buttons (use sparingly, still touch-safe) */
.btn-small {
  min-height: 2.5rem; /* 40px - absolute minimum */
  padding: 0.5rem 1rem;
}
```

#### 2.2 Fix Input Heights

**Current**:
```css
.premium-input {
  height: 40px; /* ❌ Too small */
}
```

**Fix**:
```css
.premium-input, select.premium-input {
  min-height: 3rem; /* 48px */
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

textarea.premium-input {
  min-height: 6rem; /* 96px - 2 lines minimum */
}
```

#### 2.3 Bottom Navigation Touch Targets

**Current**: Likely too small

**Fix**:
```css
.bottom-nav-item {
  min-height: 3.5rem; /* 56px - Material Design recommendation */
  min-width: 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.bottom-nav-icon {
  width: 1.5rem; /* 24px */
  height: 1.5rem;
}

.bottom-nav-label {
  font-size: 0.75rem; /* 12px - only place allowed */
  font-weight: 500;
}
```

---

### Phase 3: Tailwind Config Update

#### 3.1 Update `tailwind.config.ts`

**File**: `apps/web/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Material Design Typography
      fontSize: {
        sm: ['0.875rem', { lineHeight: '1.25' }],      // 14px
        base: ['1rem', { lineHeight: '1.5' }],         // 16px
        lg: ['1.125rem', { lineHeight: '1.5' }],       // 18px
        xl: ['1.25rem', { lineHeight: '1.4' }],        // 20px
        '2xl': ['1.5rem', { lineHeight: '1.3' }],      // 24px
        '3xl': ['2rem', { lineHeight: '1.25' }],       // 32px
        '4xl': ['2.5rem', { lineHeight: '1.2' }],      // 40px
      },
      
      // Material Design Spacing (8pt grid)
      spacing: {
        '0.5': '0.25rem',  // 4px (micro)
        '1': '0.5rem',     // 8px
        '2': '1rem',       // 16px
        '3': '1.5rem',     // 24px
        '4': '2rem',       // 32px
        '6': '3rem',       // 48px
        '8': '4rem',       // 64px
        '12': '6rem',      // 96px
        '16': '8rem',      // 128px
      },
      
      // Touch-safe minimum dimensions
      minHeight: {
        'touch': '3rem',      // 48px
        'nav': '3.5rem',      // 56px
        'input': '3rem',      // 48px
      },
      
      minWidth: {
        'touch': '3rem',      // 48px
      },
      
      colors: {
        // ... keep existing colors
      },
      
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### Phase 4: Component Updates

#### 4.1 Mobile-Friendly Multi-Select (Replace Desktop Pattern)

**Current Issue**: Admin job form uses `<select multiple>` with "Hold Ctrl" instruction

**Fix**: Create `MultiSelectChips.tsx` component

```tsx
// apps/web/src/components/ui/MultiSelectChips.tsx
'use client';

import { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

export function MultiSelectChips({ options, selected, onChange, label }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      {/* Selected chips */}
      <div className="flex flex-wrap gap-2">
        {selected.map(value => {
          const option = options.find(o => o.value === value);
          return (
            <button
              key={value}
              onClick={() => toggleOption(value)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium min-h-touch"
            >
              {option?.label}
              <span className="text-lg">×</span>
            </button>
          );
        })}
      </div>
      
      {/* Add button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-12 px-4 border-2 border-border rounded-lg text-left flex items-center justify-between"
      >
        <span className="text-muted-foreground">
          {selected.length === 0 ? 'Select options' : `${selected.length} selected`}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {/* Options modal (mobile drawer) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-card w-full max-h-[80vh] rounded-t-2xl sm:rounded-2xl sm:max-w-md overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold">Select {label}</h3>
              <button onClick={() => setIsOpen(false)} className="min-h-12 min-w-12 text-2xl">×</button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh] p-2">
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className="w-full min-h-12 px-4 py-3 flex items-center gap-3 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selected.includes(option.value) ? 'bg-primary border-primary' : 'border-border'
                  }`}>
                    {selected.includes(option.value) && <span className="text-primary-foreground text-xs">✓</span>}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            
            <div className="p-4 border-t border-border">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full min-h-12 bg-primary text-primary-foreground rounded-lg font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Phase 5: PWA Configuration

#### 5.1 Add Web App Manifest

**File**: `apps/web/public/manifest.json`

```json
{
  "name": "FresherFlow - Premium Career Feed",
  "short_name": "FresherFlow",
  "description": "Premium career opportunities and walk-ins for freshers",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "categories": ["business", "productivity"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

#### 5.2 Update Layout Metadata

**File**: `apps/web/src/app/layout.tsx`

```tsx
export const metadata: Metadata = {
  title: 'FresherFlow',
  description: 'Premium career feed for freshers',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5, // Allow zoom for accessibility
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FresherFlow',
  },
};
```

#### 5.3 Create Simple Service Worker

**File**: `apps/web/public/sw.js`

```javascript
const CACHE_NAME = 'fresherflow-v1';
const OFFLINE_URL = '/offline';

// Cache opportunities for offline viewing
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/opportunities')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
```

#### 5.4 Register Service Worker

**File**: `apps/web/src/app/layout.tsx` (add script)

```tsx
'use client';

useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

---

### Phase 6: Icon Generation

#### 6.1 Generate PWA Icons

```bash
# Install icon generator
npm install -g pwa-asset-generator

# Generate from logo
pwa-asset-generator apps/web/public/logo.svg apps/web/public/icons \
  --icon-only \
  --favicon \
  --type png \
  --background "#0f172a"
```

---

## 🚀 Execution Order

### Week 1: Critical Fixes
1. ✅ Update typography base to 16px
2. ✅ Enforce 48px touch targets
3. ✅ Standardize 8pt spacing grid
4. ✅ Update Tailwind config

### Week 2: Components
1. ✅ Create MultiSelectChips component
2. ✅ Replace admin location multi-select
3. ✅ Update all button heights
4. ✅ Update all input heights

### Week 3: PWA
1. ✅ Add manifest.json
2. ✅ Generate icons
3. ✅ Add service worker
4. ✅ Update layout metadata

---

## 📊 Before/After Comparison

| Item | Before | After (Material Design) |
|------|--------|------------------------|
| Base font | 14px ❌ | 16px ✅ |
| Button height | 40px ❌ | 48px ✅ |
| Input height | 40px ❌ | 48px ✅ |
| Spacing | Mixed ⚠️ | 8pt grid ✅ |
| Multi-select | Desktop-only ❌ | Mobile drawer ✅ |
| PWA manifest | Missing ❌ | Full PWA ✅ |
| Touch targets | 40px ❌ | 48px+ ✅ |
| Service Worker | None ❌ | Offline cache ✅ |

---

## 🎯 Success Criteria

- [ ] All text ≥ 16px (except nav labels at 12px)
- [ ] All buttons ≥ 48px height
- [ ] All inputs ≥ 48px height
- [ ] Only 8pt spacing used (4/8/16/24/32/48/64)
- [ ] No desktop-only form controls
- [ ] PWA installable on mobile
- [ ] Lighthouse PWA score ≥ 90
- [ ] Lighthouse Accessibility score ≥ 95

---

## 📝 Next Steps

Run this plan in order:
1. Phase 1: Foundation fixes
2. Phase 2: Touch targets
3. Phase 3: Tailwind update
4. Phase 4: Component replacement
5. Phase 5: PWA configuration
6. Phase 6: Icon generation

**Ready to execute?** Say "execute material design plan" and I'll start implementing each phase systematically.
