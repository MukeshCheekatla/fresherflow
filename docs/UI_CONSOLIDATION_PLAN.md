# 🔒 UI Consolidation & Enforcement - Implementation Plan

## Current State Analysis

### Existing UI Files:

**`apps/web/src/shared/components/ui/`** (TO BE MERGED):
1. `LoadingScreen.tsx` - Keep (useful utility)
2. `Skeleton.tsx` - Duplicate (merge with main)
3. `badge.tsx` - Has violations, rewrite
4. `button.tsx` - **❌ MAJOR VIOLATIONS** (h-9/36px, h-8/32px, h-10/40px)
5. `card.tsx` - Check for violations
6. `input.tsx` - Check for violations
7. `label.tsx` - Keep if compliant

**`apps/web/src/components/ui/`** (MAIN UI BOUNDARY):
1. `Navigation.tsx` - Keep
2. `Skeleton.tsx` - Duplicate
3. `ThemeToggle.tsx` - Keep

---

## Execution Steps

### Step 1: Move & Consolidate UI Files ✅

**Actions**:
1. Move `LoadingScreen.tsx` → `components/ui/Loading Screen.tsx`
2. Merge both `Skeleton.tsx` files (keep better one in `components/ui/`)
3. Move `label.tsx` → `components/ui/Label.tsx`
4. **Delete** `shared/components/ui/` folder entirely
5. Update all imports across codebase

### Step 2: Create Strict Material Design Components 🎯

Create in `apps/web/src/components/ui/`:

#### **Button.tsx** (REWRITE - Material Design Compliant)
```typescript
// HARD RULES:
// - Default: h-12 (48px)
// - Small: h-10 (40px) - absolute minimum
// - Large: h-14 (56px)
// - Icon: 48x48px square
// - NO arbitrary values allowed
```

#### **Input.tsx** (REWRITE)
```typescript
// HARD RULES:
// - min-height: 3rem (48px)
// - font-size: 1rem (16px base)
// - padding: standardized
```

#### **Select.tsx** (NEW)
```typescript
// Native select, mobile-friendly
// min-height: 48px
```

#### **MobileContainer.tsx** (NEW)
```typescript
// max-width: 400px
// padding: 16px (1rem)
```

#### **Card.tsx** (REWRITE if violations exist)
```typescript
// Standardized padding: 1rem, 1.5rem, 2rem
// No arbitrary spacing
```

#### **Badge.tsx** (REWRITE if violations exist)
```typescript
// Standard sizes only
// No text-[8px] or text-[10px]
```

### Step 3: Update All Imports 📦

**Find & Replace**:
```
FROM: @/shared/components/ui/
TO: @/components/ui/
```

Run across entire codebase.

### Step 4: Create MultiSelectChips (Mobile-Friendly) 🆕

**Purpose**: Replace desktop-only `<select multiple>` in admin forms

**File**: `apps/web/src/components/ui/MultiSelectChips.tsx`

**Features**:
- Touch-friendly chips
- Mobile drawer for selection
- No "Hold Ctrl" pattern
- Checkboxes for each option

### Step 5: Rewrite JobCard (Reference Pattern) 📋

**Current violations in `JobCard.tsx`**:
- `text-[9px]` - 13 instances ❌
- `text-[8px]` - 9 instances ❌
- `text-[10px]` - 5 instances ❌
- Custom heights, padding

**Fix**:
- Replace all arbitrary values
- Use only strict UI components
- Typography: `text-xs` minimum (12px), `text-sm` for body
- Spacing: 8pt grid only

### Step 6: Add Enforcement Tools 🔐

#### A. ESLint Configuration

**File**: `.eslintrc.json`

```json
{
  "plugins": ["tailwindcss"],
  "rules": {
    "tailwindcss/no-arbitrary-value": "error",
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-custom-classname": "warn"
  }
}
```

**Install**: 
```bash
npm install -D eslint-plugin-tailwindcss
```

#### B. Pre-commit Hook

**File**: `.husky/pre-commit`

```bash
#!/bin/sh

# Block arbitrary Tailwind values
if git diff --cached | grep -E 'className.*\['; then
  echo "❌ Arbitrary Tailwind values detected!"
  echo "Use only design system tokens."
  exit 1
fi

# Prevent small touch targets
if git diff --cached | grep -E '(h-[0-9]|h-10|h-11)'; then
  echo "⚠️  Touch targets below 48px detected"
  echo "Use h-12 (48px) or larger"
fi

npm run lint
```

**Install Husky**:
```bash
npx husky-init && npm install
```

#### C. Import Boundaries (Optional)

Prevent features from bypassing UI components:

**File**: `.eslintrc.json` (add)

```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["!@/components/ui/*"],
        "message": "Import UI components from @/components/ui only"
      }]
    }]
  }
}
```

### Step 7: Update globals.css (Remove Custom Classes) 🧹

**Delete from `globals.css`**:
- `.premium-button` classes
- `.premium-input` classes  
- `.premium-card` classes
- All custom component CSS

**Keep only**:
- CSS variables (colors, spacing)
- Base layer rules (html, body)
- Utility classes if needed

### Step 8: Documentation 📚

**File**: `docs/UI_GUIDELINES.md`

```markdown
# UI Component Guidelines

## Rules

1. ALL interactive elements import from `@/components/ui`
2. NO raw `<button>`, `<input>`, `<select>` in features
3. NO arbitrary Tailwind values (`text-[13px]`, `h-[35px]`)
4. Minimum touch target: 48px (h-12)
5. Base font size: 16px (text-base)

## Usage

✅ Correct:
```tsx
import { Button } from '@/components/ui/Button';
<Button>Click Me</Button>
```

❌ Wrong:
```tsx
<button className="h-10 text-[13px]">Click Me</button>
```
```

---

## Validation Checklist

After implementation:

- [ ] Zero files in `shared/components/ui/`
- [ ] All UI components in `components/ui/`
- [ ] No arbitrary Tailwind values outside UI folder
- [ ] All buttons ≥ 48px
- [ ] All inputs ≥ 48px
- [ ] All text ≥ 16px base (except labels at 14px)
- [ ] JobCard uses strict components only
- [ ] ESLint passes with no warnings
- [ ] Pre-commit hook blocks violations

---

## Migration Order

**Week 1** (Foundation):
1. ✅ Move/consolidate UI files
2. ✅ Rewrite Button.tsx (Material Design)
3. ✅ Rewrite Input.tsx
4. ✅ Create Select.tsx
5. ✅ Create MobileContainer.tsx

**Week 2** (Components):
1. ✅ Rewrite Card.tsx
2. ✅ Rewrite Badge.tsx
3. ✅ Create MultiSelectChips.tsx
4. ✅ Update all imports

**Week 3** (Enforcement):
1. ✅ Rewrite JobCard (reference pattern)
2. ✅ Add ESLint rules
3. ✅ Add pre-commit hooks
4. ✅ Clean up globals.css
5. ✅ Write documentation

**Week 4** (Validation):
1. ✅ Audit entire codebase
2. ✅ Fix remaining violations
3. ✅ Test on mobile (375px viewport)
4. ✅ Lighthouse audit (score ≥ 95)

---

**Ready to execute!** Starting with Step 1: Consolidation.
