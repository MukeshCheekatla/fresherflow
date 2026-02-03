# UI Component Guidelines

## Hard Rules (Non-Negotiable)

### 1. Single UI Boundary
**ALL** interactive elements import from `@/components/ui/`

```tsx
// ✅ CORRECT
import { Button } from '@/components/ui/Button';
<Button>Click Me</Button>

// ❌ WRONG - bypassing UI layer
<button className="h-10 px-3">Click Me</button>
```

---

### 2. Typography (CORRECTED)

| Size | TailwindClass | Use Case |
|------|------|----------|
| 12px | `text-xs` | Labels, badges (MINIMUM) |
| 14px | `text-sm` | Body text, descriptions |
| 16px | `text-base` | Titles, inputs (default) |
| 18px+ | `text-lg`, `text-xl` | Headings |

**NO** `text-[9px]`, `text-[10px]`, `text-[13px]`, etc.

---

### 3. Touch Targets (Material Design)

| Component | Minimum Height | Tailwind Class |
|-----------|---------------|----------------|
| Button | 48px | `h-12` |
| Input | 48px | `h-12` |
| Select | 48px | `h-12` |
| Icon Button | 48x48px | `h-12 w-12` |

**NO** `h-9` (36px), `h-10` (40px) for primary interactive elements

---

### 4. Spacing (8pt Grid)

| Value | Tailwind | Use |
|-------|----------|-----|
| 4px | `gap-1`, `p-1` | Micro |
| 8px | `gap-2`, `p-2` | Default |
| 12px | `gap-3`, `p-3` | Medium |
| 16px | `gap-4`, `p-4` | Section |
| 24px | `gap-6`, `p-6` | Large |

**NO** `gap-[7px]`, `p-[13px]`, etc.

---

### 5. NO Arbitrary Values

❌ **Forbidden**:
- `text-[13px]`
- `h-[35px]`
- `w-[127px]`
- `gap-[7px]`
- `text-[#ff0000]`

✅ **Use Instead**:
- Defined sizes: `text-sm`, `h-12`
- Design tokens: `text-primary`, `bg-card`
- Spacing scale: `gap-2`, `gap-4`

---

## Available Components

### `Button.tsx`
```tsx
<Button variant="default|outline|ghost" size="default|sm|lg|icon">
  Click Me
</Button>
```

- Default: 48px height
- Small: 40px (secondary actions only)
- Large: 56px (primary CTAs)

### `Input.tsx`
```tsx
<Input type="text" placeholder="Enter value" />
```

- Always 48px height
- 16px base font (prevents iOS zoom)

### `Select.tsx`
```tsx
<Select>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

- Native select (mobile-friendly)
- 48px height

### `MobileContainer.tsx`
```tsx
<MobileContainer>
  {/* Content */}
</MobileContainer>
```

- Max width: 400px
- Padding: 16px
- Use for PWA screens

---

## Reference Pattern

**See**: `apps/web/src/features/jobs/components/JobCard.tsx`

This is the **canonical example** showing:
- Zero arbitrary values
- Correct typography
- Proper spacing
- Touch-safe interactions

Use it as a template for ALL feature components.

---

## Enforcement

### Manual Check (until ESLint plugin works):
```bash
# Find arbitrary values
grep -r "className.*\[" apps/web/src --include="*.tsx"
```

### PR Checklist:
- [ ] No arbitrary values
- [ ] All buttons ≥ 48px
- [ ] All inputs ≥ 48px  
- [ ] Text ≥ 12px (`text-xs`)
- [ ] 8pt spacing grid
- [ ] UI components imported from `@/components/ui`

---

**That's it.** Follow JobCard. No exceptions.
