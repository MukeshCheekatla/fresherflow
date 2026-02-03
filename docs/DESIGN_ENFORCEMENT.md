# 🔒 FresherFlow - Design System Enforcement Plan

## Current State Audit

### ✅ What's Already Good
- ✅ Tailwind CSS v4 (modern)
- ✅ Radix UI primitives installed
- ✅ `class-variance-authority` for variants
- ✅ `clsx` and `tailwind-merge` for class handling

### ❌ Current Violations (Must Fix)

**Typography**:
- Base font: `14px` on mobile ❌ (should be 16px)
- Custom sizes: `--fs-h1: 28px`, `--fs-h2: 22px` ❌ (should use rem scale)

**Touch Targets**:
- Buttons: `height: 40px` ❌ (should be 48px minimum)
- Inputs: `height: 40px` ❌ (should be 48px minimum)

**Spacing**:
- Custom spacing: `--space-3: 12px`, `--space-10: 40px` ❌ (not 8pt grid)
- Arbitrary values in components ⚠️ (need to audit)

---

## 🎯 Enforcement Plan

### Phase 1: Lock Down Foundation (Week 1)

#### 1.1 Hard Reset `globals.css`

**File**: `apps/web/src/app/globals.css`

**Action**: Replace with strict rules

```css
@import "tailwindcss";

@layer base {
  /* HARD RULE: Never change this */
  html {
    font-size: 16px;
  }

  body {
    @apply bg-background text-foreground antialiased;
    line-height: 1.5;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px; /* Explicit enforcement */
  }

  /* HARD RULE: All interactive elements ≥ 48px */
  button, 
  a, 
  input, 
  select, 
  textarea {
    min-height: 48px;
  }
  
  /* Exception: Readonly text areas can be shorter */
  textarea[readonly] {
    min-height: auto;
  }
}

@layer components {
  /* Remove ALL custom component classes */
  /* Use Radix + CVA patterns only */
}
```

**Remove Entirely**:
- All `--fs-*` custom properties ❌
- All `--space-*` custom properties ❌
- All `.premium-*` classes ❌
- All `.btn-*` classes ❌
- All `.card` classes ❌

**Why**: Tailwind + Radix handle these. Custom CSS causes drift.

---

#### 1.2 Strict Tailwind Config

**File**: `apps/web/tailwind.config.ts`

**Replace with**:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    // HARD RULE: Extend only, never override defaults
    extend: {
      // Material Design Typography (locked)
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.2" }],   // 12px - rare use
        sm: ["0.875rem", { lineHeight: "1.25" }], // 14px
        base: ["1rem", { lineHeight: "1.5" }],    // 16px - default
        lg: ["1.125rem", { lineHeight: "1.5" }],  // 18px
        xl: ["1.25rem", { lineHeight: "1.4" }],   // 20px
        "2xl": ["1.5rem", { lineHeight: "1.3" }], // 24px
        "3xl": ["2rem", { lineHeight: "1.25" }],  // 32px
      },
      
      // 8pt Spacing Grid (locked)
      spacing: {
        "0.5": "0.25rem",  // 4px - micro only
        "1": "0.5rem",     // 8px
        "2": "1rem",       // 16px
        "3": "1.5rem",     // 24px
        "4": "2rem",       // 32px
        "6": "3rem",       // 48px
        "8": "4rem",       // 64px
        "12": "6rem",      // 96px
      },
      
      // Touch-safe heights (locked)
      height: {
        "touch": "3rem",      // 48px
        "touch-lg": "3.5rem", // 56px
      },
      
      minHeight: {
        "touch": "3rem",      // 48px
        "touch-lg": "3.5rem", // 56px
      },
      
      minWidth: {
        "touch": "3rem",      // 48px
      },
      
      // PWA container widths
      maxWidth: {
        "mobile": "400px",
        "tablet": "768px",
      },
      
      colors: {
        // Keep your existing HSL color system
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Removed**:
- `neutral` color scale (use `muted` instead)
- Custom `18` and `22` spacing (not 8pt)
- Font family with `var(--font-inter)` (keep simple)

---

### Phase 2: Component Library (Week 1-2)

#### 2.1 Create Strict Button Component

**File**: `apps/web/src/components/ui/Button.tsx`

```typescript
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef } from "react";

/**
 * HARD RULES:
 * - All sizes ≥ 48px (h-12 minimum)
 * - Only these variants allowed
 * - No arbitrary classes in usage
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-10 px-3 text-sm",      // 40px - absolute minimum
        default: "h-12 px-4 text-base", // 48px - standard
        lg: "h-14 px-6 text-lg",       // 56px - primary actions
        icon: "h-12 w-12",             // 48px square
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={clsx(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

**Usage Rules**:
```tsx
// ✅ Correct
<Button>Click Me</Button>
<Button size="lg">Primary Action</Button>
<Button variant="outline" size="sm">Secondary</Button>

// ❌ BANNED
<Button className="h-8 px-2">Too Small</Button>
<Button className="text-[13px]">Custom Size</Button>
<button>Raw Button</button>
```

---

#### 2.2 Create Strict Input Component

**File**: `apps/web/src/components/ui/Input.tsx`

```typescript
import { forwardRef } from "react";
import { clsx } from "clsx";

/**
 * HARD RULES:
 * - min-height: 48px (h-12)
 * - text-base (16px) only
 * - No custom heights allowed
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={clsx(
          "flex h-12 w-full rounded-md border-2 border-border bg-card px-3 py-2 text-base",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

---

#### 2.3 Create Mobile Container

**File**: `apps/web/src/components/ui/MobileContainer.tsx`

```typescript
import { clsx } from "clsx";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * HARD RULE: Mobile-first container
 * - Max width: 400px (real mobile comfort zone)
 * - Padding: 16px (4 spacing units)
 */
export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={clsx("mx-auto w-full max-w-mobile px-4", className)}>
      {children}
    </div>
  );
}
```

---

#### 2.4 Create Select Component (Mobile-Friendly)

**File**: `apps/web/src/components/ui/Select.tsx`

```typescript
import { forwardRef } from "react";
import { clsx } from "clsx";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * HARD RULES:
 * - min-height: 48px
 * - Native select (works on all devices)
 * - No custom dropdown libraries
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={clsx(
          "flex h-12 w-full rounded-md border-2 border-border bg-card px-3 py-2 text-base",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "appearance-none bg-[url('data:image/svg+xml;base64,...')] bg-no-repeat bg-right pr-10",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
```

---

### Phase 3: Lint Rules (Enforce Automatically)

#### 3.1 ESLint Plugin for Tailwind

**File**: `.eslintrc.json`

```json
{
  "extends": ["next/core-web-vitals"],
  "plugins": ["tailwindcss"],
  "rules": {
    "tailwindcss/no-arbitrary-value": "error",
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/enforces-shorthand": "warn",
    "tailwindcss/no-custom-classname": "warn"
  }
}
```

**Install**:
```bash
npm install -D eslint-plugin-tailwindcss
```

**Blocks**:
- `className="h-[35px]"` ❌
- `className="text-[13px]"` ❌
- `className="mt-[7px]"` ❌

---

#### 3.2 Stylelint for CSS

**File**: `.stylelintrc.json`

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "unit-allowed-list": ["rem", "px", "%", "vh", "vw"],
    "declaration-property-value-disallowed-list": {
      "/^(height|min-height|width|min-width)$/": [
        "/^(1[0-9]|2[0-9]|3[0-9]|4[0-6])px$/",
        {
          "message": "Use rem or enforce 48px+ for touch targets"
        }
      ]
    }
  }
}
```

**Blocks**:
- `height: 40px` ❌
- `min-height: 35px` ❌

---

#### 3.3 Pre-commit Hook

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Prevent commits with arbitrary Tailwind values
if git diff --cached --name-only | grep -E '\.(tsx|ts|jsx|js)$'; then
  if git diff --cached | grep -E 'className.*\['; then
    echo "❌ Arbitrary Tailwind values detected!"
    echo "Use only design system tokens."
    exit 1
  fi
fi

# Prevent small touch targets
if git diff --cached | grep -E '(h-[0-9]|h-10|min-h-[0-9]|min-h-10)'; then
  echo "⚠️  Warning: Touch targets below 48px detected"
  echo "Use h-12 (48px) or larger for interactive elements"
fi

npm run lint
```

**Install**:
```bash
npx husky-init && npm install
```

---

### Phase 4: Component Migration Strategy

#### 4.1 Audit Current Components

**Find all violations**:
```bash
# Find arbitrary values
grep -r "className.*\[" apps/web/src --include="*.tsx"

# Find small heights
grep -r "h-[0-9]\|h-10" apps/web/src --include="*.tsx"

# Find custom font sizes
grep -r "text-\[" apps/web/src --include="*.tsx"
```

#### 4.2 Migration Priority

**Week 1**:
1. Create `ui/Button.tsx`, `ui/Input.tsx`, `ui/Select.tsx`
2. Replace all `<button>` with `<Button>`
3. Replace all `<input>` with `<Input>`

**Week 2**:
1. Create `ui/Card.tsx`, `ui/Badge.tsx`
2. Migrate all card components
3. Migrate all badges

**Week 3**:
1. Remove all custom CSS from `globals.css`
2. Verify no arbitrary values in codebase
3. Run lint checks

---

### Phase 5: Icon Standards

**File**: `apps/web/src/components/ui/Icon.tsx`

```typescript
import { clsx } from "clsx";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "default" | "lg";
}

/**
 * HARD RULES:
 * - Minimum 20px (h-5 w-5)
 * - Standard 24px (h-6 w-6)
 * - Large 32px (h-8 w-8)
 */
const iconSizes = {
  sm: "h-5 w-5",       // 20px
  default: "h-6 w-6",  // 24px
  lg: "h-8 w-8",       // 32px
};

export function Icon({ 
  size = "default", 
  className, 
  children,
  ...props 
}: IconProps) {
  return (
    <svg
      className={clsx(iconSizes[size], className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      {children}
    </svg>
  );
}
```

**Usage with Heroicons**:
```tsx
import { HomeIcon } from "@heroicons/react/24/outline";

// ✅ Correct
<HomeIcon className="h-6 w-6" />

// ❌ BANNED
<HomeIcon className="h-4 w-4" />  // Too small
<HomeIcon className="h-[18px] w-[18px]" />  // Arbitrary
```

---

### Phase 6: Documentation & Rules

#### 6.1 Create Design System Docs

**File**: `docs/DESIGN_SYSTEM.md`

```markdown
# FresherFlow Design System

## Non-Negotiable Rules

### Typography
- ✅ Use only: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- ❌ Never: `text-[13px]`, `text-[15px]`, custom sizes

### Touch Targets
- ✅ Minimum: `h-12` (48px)
- ✅ Recommended: `h-12` buttons, `h-14` primary actions
- ❌ Never: `h-8`, `h-10`, or anything below 48px

### Spacing
- ✅ Use only: `0.5`, `1`, `2`, `3`, `4`, `6`, `8`, `12`
- ❌ Never: arbitrary values like `mt-[7px]`

### Components
- ✅ Always: Import from `@/components/ui`
- ❌ Never: Raw `<button>`, `<input>`, `<select>`

## PR Checklist
- [ ] No arbitrary Tailwind values (`[]`)
- [ ] All interactive elements ≥ 48px
- [ ] Only design system components used
- [ ] ESLint passes
- [ ] Visual review on mobile (375px)
```

#### 6.2 VS Code Settings

**File**: `.vscode/settings.json`

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.lint.invalidApply": "error",
  "tailwindCSS.lint.recommendedVariantOrder": "warning",
  "css.lint.unknownProperties": "error"
}
```

---

## 🎯 Execution Checklist

### Week 1: Foundation
- [ ] Update `globals.css` (remove all custom classes)
- [ ] Update `tailwind.config.ts` (locked spacing/typography)
- [ ] Create `ui/Button.tsx`
- [ ] Create `ui/Input.tsx`
- [ ] Create `ui/Select.tsx`
- [ ] Create `ui/MobileContainer.tsx`

### Week 2: Migration
- [ ] Replace all `<button>` with `<Button>`
- [ ] Replace all `<input>` with `<Input>`
- [ ] Replace all `<select>` with `<Select>`
- [ ] Audit for arbitrary values
- [ ] Fix all violations

### Week 3: Enforcement
- [ ] Install `eslint-plugin-tailwindcss`
- [ ] Set up Stylelint
- [ ] Add pre-commit hooks
- [ ] Create `DESIGN_SYSTEM.md`
- [ ] Team review and sign-off

---

## 🚨 Red Flags to Block in PRs

1. ❌ `className="h-[35px]"`
2. ❌ `className="text-[13px]"`
3. ❌ `className="mt-[7px]"`
4. ❌ `<button>` without using `<Button>`
5. ❌ CSS with `height: 40px`
6. ❌ Font sizes outside the scale
7. ❌ Spacing outside 8pt grid

---

## 📊 Success Metrics

After implementation:
- ✅ 0 arbitrary Tailwind values
- ✅ 0 interactive elements < 48px
- ✅ 100% components from `ui/` folder
- ✅ ESLint/Stylelint pass
- ✅ Lighthouse accessibility ≥ 95

---

**Ready to enforce discipline?** This plan will prevent all drift.

Say "execute enforcement plan" and I'll start with Phase 1.
