# 🎨 Auth Pages Visual Component Structure

## Login Page Layout

```
┌─────────────────────────────────────────────┐
│  auth-container (Full screen, dark bg)      │
│ ┌───────────────────────────────────────┐   │
│ │ auth-background (Animated orbs)       │   │
│ │ ┌─────┐         ┌──────┐  ┌──────┐  │   │
│ │ │ ◆   │ (orb-1) │(orb) │  │ (orb)│  │   │
│ │ └─────┘         │-2    │  │-3    │  │   │
│ │                 └──────┘  └──────┘  │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ auth-card (Glass morphism)            │   │
│ │ ┌─────────────────────────────────┐  │   │
│ │ │ auth-header                     │  │   │
│ │ │  ◆ (glowing logo)              │  │   │
│ │ │  DATTO RMM (gradient text)     │  │   │
│ │ │  Access Your Command Center    │  │   │
│ │ └─────────────────────────────────┘  │   │
│ │                                       │   │
│ │ ⚠ Error Alert (if present)          │   │
│ │                                       │   │
│ │ ┌─────────────────────────────────┐  │   │
│ │ │ auth-form                       │  │   │
│ │ │                                 │  │   │
│ │ │ ┌─────────────────────────────┐ │  │   │
│ │ │ │ form-group                  │ │  │   │
│ │ │ │ EMAIL ADDRESS               │ │  │   │
│ │ │ │ ┌─────────────────────────┐ │ │  │   │
│ │ │ │ │ form-input              │ │ │  │   │
│ │ │ │ │ you@example.com        │ │ │  │   │
│ │ │ │ └─────────────────────────┘ │ │  │   │
│ │ │ │ ✓ Error message (if invalid) │ │  │   │
│ │ │ └─────────────────────────────┘ │  │   │
│ │ │                                 │  │   │
│ │ │ ┌─────────────────────────────┐ │  │   │
│ │ │ │ form-group                  │ │  │   │
│ │ │ │ PASSWORD                    │ │  │   │
│ │ │ │ ┌─────────────────────────┐ │ │  │   │
│ │ │ │ │ form-input              │ │ │  │   │
│ │ │ │ │ ••••••••               │ │ │  │   │
│ │ │ │ └─────────────────────────┘ │ │  │   │
│ │ │ │ ✓ Error message (if invalid) │ │  │   │
│ │ │ └─────────────────────────────┘ │  │   │
│ │ │                                 │  │   │
│ │ │ Forgot password? (link)         │  │   │
│ │ │                                 │  │   │
│ │ │ ┌─────────────────────────────┐ │  │   │
│ │ │ │ auth-button (gradient)      │ │  │   │
│ │ │ │ ► SIGN IN  →               │ │  │   │
│ │ │ └─────────────────────────────┘ │  │   │
│ │ └─────────────────────────────────┘  │   │
│ │                                       │   │
│ │ ─────────────────────────────────────  │   │
│ │ New to DATTO?                         │   │
│ │ ─────────────────────────────────────  │   │
│ │                                       │   │
│ │ ┌─────────────────────────────────┐  │   │
│ │ │ auth-link-button (cyan border)  │  │   │
│ │ │ Create Account  →              │  │   │
│ │ └─────────────────────────────────┘  │   │
│ │                                       │   │
│ └───────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Registration Page Layout

```
┌─────────────────────────────────────────────┐
│  auth-container (Full screen, dark bg)      │
│ ┌───────────────────────────────────────┐   │
│ │ auth-background (Animated orbs)       │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ auth-card (Glass morphism, scrollable)   │
│ │ ┌─────────────────────────────────┐  │   │
│ │ │ auth-header                     │  │   │
│ │ │  ◆ (glowing logo)              │  │   │
│ │ │  Join DATTO RMM                │  │   │
│ │ │  Create Your Command Center    │  │   │
│ │ └─────────────────────────────────┘  │   │
│ │                                       │   │
│ │ ⚠ Error Alert (if present)          │   │
│ │                                       │   │
│ │ ┌─────────────────────────────────┐  │   │
│ │ │ auth-form (with scroll)         │  │   │
│ │ │                                 │  │   │
│ │ │ ┌─────────────────────────────┐ │  │   │
│ │ │ │ ORGANIZATION NAME           │ │  │   │
│ │ │ │ [Your Company Name.........]│ │  │   │
│ │ │ │ ✓ Error message            │ │  │   │
│ │ │ └─────────────────────────────┘ │  │   │
│ │ │                                 │  │   │
│ │ │ ┌─────────────────────────────┐ │  │   │
│ │ │ │ EMAIL ADDRESS               │ │  │   │
│ │ │ │ [you@company.com............]│ │  │   │
│ │ │ │ ✓ Error message            │ │  │   │
│ │ │ └─────────────────────────────┘ │  │   │
│ │ │                                 │  │   │
│ │ │ ┌─────────────────────────────┐ │  │   │
│ │ │ │ PASSWORD                    │ │  │   │
│ │ │ │ [••••••••..................]│ │  │   │
│ │ │ │ ▰▰▰▰▰ Very Strong          │ │  │   │
│ │ │ │ ✓ Error message (if invalid) │ │  │   │
│ │ │ └─────────────────────────────┘ │  │   │
│ │ │                                 │  │   │
│ │ │ ┌─────────────────────────────┐ │  │   │
│ │ │ │ CONFIRM PASSWORD            │ │  │   │
│ │ │ │ [••••••••..................]│ │  │   │
│ │ │ │ ✓ Error message            │ │  │   │
│ │ │ └─────────────────────────────┘ │  │   │
│ │ │                                 │  │   │
│ │ │ ┌─────────────────────────────┐ │  │   │
│ │ │ │ auth-button (gradient)      │ │  │   │
│ │ │ │ ► CREATE ACCOUNT  →         │ │  │   │
│ │ │ └─────────────────────────────┘ │  │   │
│ │ └─────────────────────────────────┘  │   │
│ │                                       │   │
│ │ ─────────────────────────────────────  │   │
│ │ Already have an account?              │   │
│ │ ─────────────────────────────────────  │   │
│ │                                       │   │
│ │ ┌─────────────────────────────────┐  │   │
│ │ │ auth-link-button (cyan border)  │  │   │
│ │ │ Sign In  →                      │  │   │
│ │ └─────────────────────────────────┘  │   │
│ │                                       │   │
│ └───────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
auth-container
├── auth-background
│   ├── ::before (gradient overlay)
│   ├── background-orb.orb-1 (animated)
│   ├── background-orb.orb-2 (animated)
│   └── background-orb.orb-3 (animated)
│
└── auth-content
    └── auth-card (.register-card on register page)
        ├── ::before (top border line)
        │
        ├── auth-header
        │   ├── auth-logo
        │   │   └── logo-icon (◆ with glow)
        │   ├── auth-title (gradient text)
        │   └── auth-subtitle
        │
        ├── auth-alert.alert-error (conditional)
        │   ├── alert-icon
        │   └── p (error message)
        │
        ├── auth-form
        │   ├── form-group (for each field)
        │   │   ├── form-label
        │   │   └── input-wrapper
        │   │       ├── form-input
        │   │       ├── password-strength (on register)
        │   │       │   ├── strength-bars
        │   │       │   │   └── strength-bar × 5
        │   │       │   └── strength-label
        │   │       └── input-error (conditional)
        │   │
        │   ├── forgot-password (login only)
        │   │
        │   └── auth-button
        │       └── button-loader (loading state)
        │           ├── spinner
        │           └── text
        │
        ├── auth-divider
        │   └── span
        │
        └── auth-link-button
            ├── span (text)
            └── link-arrow
```

---

## CSS Classes Reference

### Structure Classes
- `.auth-container` - Full screen wrapper
- `.auth-background` - Background with orbs
- `.background-orb` - Individual floating orb
- `.auth-content` - Centered content area
- `.auth-card` - Main card with glass effect

### Header Classes
- `.auth-header` - Header section
- `.auth-logo` - Logo wrapper
- `.logo-icon` - Logo symbol (◆)
- `.auth-title` - Main title
- `.auth-subtitle` - Subtitle text

### Alert Classes
- `.auth-alert` - Alert container
- `.alert-error` - Error state
- `.alert-icon` - Alert icon

### Form Classes
- `.auth-form` - Form wrapper
- `.form-group` - Field group
- `.form-label` - Field label
- `.form-input` - Input field
- `.input-wrapper` - Input container
- `.input-error` - Error message

### Password Classes
- `.password-strength` - Strength indicator wrapper
- `.strength-bars` - Bars container
- `.strength-bar` - Individual bar (.weak, .fair, .good, .strong, .very-strong)
- `.strength-label` - Strength text

### Button Classes
- `.auth-button` - Primary button
- `.button-loader` - Loader state
- `.spinner` - Spinner animation
- `.button-text` - Button text
- `.button-arrow` - Arrow icon

### Link Classes
- `.forgot-password` - Forgot password link
- `.auth-divider` - Section divider
- `.auth-link-button` - Secondary button

### Modifiers
- `.error` - Error state on input
- `.loading` - Loading state on button
- `.register-card` - Scrollable card on register page

---

## Animation Classes/Keyframes

- `@keyframes float` - Orb floating motion
- `@keyframes glow-pulse` - Logo glow effect
- `@keyframes shimmer` - Button shine
- `@keyframes spin-loader` - Loading spinner
- `@keyframes slide-in` - Entrance animation

---

## Responsive Breakpoints

### Desktop (> 640px)
- Full featured layout
- All animations active
- Standard sizing

### Tablet (≤ 640px)
- Reduced padding
- Slightly smaller fonts
- Optimized spacing

### Mobile (≤ 480px)
- Compact layout
- Touch-friendly sizes
- Scrollable forms
- Larger 16px font inputs (iOS)
- Simplified animations

---

## Interaction States

### Input States
- **Default**: Subtle border, semi-transparent
- **Hover**: Slightly brighter, cyan hint
- **Focus**: Cyan glow, vibrant border
- **Error**: Red border, error background
- **Filled**: Shows clear value

### Button States
- **Default**: Full opacity, gradient fill
- **Hover**: Elevated with shadow, arrow moves
- **Active**: Slight press-down
- **Loading**: Spinner, disabled interaction
- **Disabled**: Reduced opacity, not clickable

### Form States
- **Untouched**: No validation display
- **Touched**: Shows validation feedback
- **Invalid**: Red error styling
- **Valid**: Green indicators (password strength)

