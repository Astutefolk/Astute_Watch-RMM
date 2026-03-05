# 🎨 Visual Design Mockup - Auth Pages

## Color System

```
┌─────────────────────────────────────────────────────────┐
│  PRIMARY CYAN                                            │
│  #00d4ff                                                 │
│  ████████████████████████████████████████████████████   │
│  Primary buttons, borders, accents, hover states        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SECONDARY PURPLE                                        │
│  #7c3aed                                                 │
│  ████████████████████████████████████████████████████   │
│  Gradient accent, complementary effects                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  BACKGROUND DARK BLUE                                    │
│  #0f172a                                                 │
│  ████████████████████████████████████████████████████   │
│  Main background, professional dark mode               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TEXT PRIMARY                                            │
│  #f1f5f9                                                 │
│  ████████████████████████████████████████████████████   │
│  Main text, headings, primary content                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ERROR RED                                               │
│  #ef4444                                                 │
│  ████████████████████████████████████████████████████   │
│  Error states, invalid inputs, warnings                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SUCCESS GREEN                                           │
│  #22c55e                                                 │
│  ████████████████████████████████████████████████████   │
│  Password strength, valid states, confirmations         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  WARNING ORANGE                                          │
│  #f59e0b                                                 │
│  ████████████████████████████████████████████████████   │
│  Warnings, caution states, alerts                       │
└─────────────────────────────────────────────────────────┘
```

---

## Login Page Visual Layout

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │                                                          │ ║
║  │   ◆ ← Glowing diamond logo (Cyan)                       │ ║
║  │                                                          │ ║
║  │   DATTO RMM ← Gradient text (Cyan → Purple)             │ ║
║  │   Access Your Command Center ← Subtitle                 │ ║
║  │                                                          │ ║
║  ├──────────────────────────────────────────────────────────┤ ║
║  │                                                          │ ║
║  │   EMAIL ADDRESS                                          │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │ you@example.com                                │  │ ║
║  │   │ (Focus: Cyan glow, blur background visible)    │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │   ✓ Error message (if invalid)                         │ ║
║  │                                                          │ ║
║  │   PASSWORD                                               │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │ ••••••••                                        │  │ ║
║  │   │ (Focus: Cyan glow)                              │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │   ✓ Error message (if invalid)                         │ ║
║  │                                                          │ ║
║  │                          Forgot password? ← Link        │ ║
║  │                                                          │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │                                                │  │ ║
║  │   │   ► SIGN IN  →   ← Gradient button             │  │ ║
║  │   │   (Cyan to Purple)                             │  │ ║
║  │   │   (Hover: Shadow, arrow moves right)           │  │ ║
║  │   │                                                │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │                                                          │ ║
║  │   ─────────────────────────────────────────────────     │ ║
║  │        New to DATTO?                                     │ ║
║  │   ─────────────────────────────────────────────────     │ ║
║  │                                                          │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │ Create Account  →  ← Cyan bordered button     │  │ ║
║  │   │ (Hover: Brighter border, cyan glow)           │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │                                                          │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  Background Animations:                                       ║
║  ◇ Floating cyan-purple orb (top-right, 20s float)           ║
║  ◇ Floating purple-cyan orb (bottom-left, 20s float)         ║
║  ◇ Floating dark gradient orb (center, 20s float)            ║
║                                                                ║
║  All in dark blue background (#0f172a)                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Registration Page Visual Layout

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │                                                          │ ║
║  │   ◆ ← Glowing diamond logo (Cyan)                       │ ║
║  │                                                          │ ║
║  │   Join DATTO RMM ← Gradient text                        │ ║
║  │   Create Your Command Center ← Subtitle                 │ ║
║  │                                                          │ ║
║  ├──────────────────────────────────────────────────────────┤ ║
║  │                                                 (Scroll) │ ║
║  │   ORGANIZATION NAME                              ▲      │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │ Your Company Name                             │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │   ✓ Error message (if invalid)                         │ ║
║  │                                                          │ ║
║  │   EMAIL ADDRESS                                          │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │ you@company.com                                │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │   ✓ Error message (if invalid)                         │ ║
║  │                                                          │ ║
║  │   PASSWORD                                               │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │ ••••••••                                        │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │   ▰▰▰▰▰ Very Strong ← Green strength indicator        │ ║
║  │   ✓ Error message (if invalid)                         │ ║
║  │                                                          │ ║
║  │   CONFIRM PASSWORD                                       │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │ ••••••••                                        │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │   ✓ Error message (if passwords don't match)           │ ║
║  │                                                          │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │                                                │  │ ║
║  │   │   ► CREATE ACCOUNT  →   ← Gradient button    │  │ ║
║  │   │                                                │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │                                                          │ ║
║  │   ─────────────────────────────────────────────────     │ ║
║  │        Already have an account?                         │ ║
║  │   ─────────────────────────────────────────────────     │ ║
║  │                                                          │ ║
║  │   ┌─────────────────────────────────────────────────┐  │ ║
║  │   │ Sign In  →  ← Cyan bordered button            │  │ ║
║  │   └─────────────────────────────────────────────────┘  │ ║
║  │                                                  ▼      │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  Same animated background with floating orbs                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Password Strength Indicator Visual

```
No Password Entered:
(Nothing shown)

Weak Password (1/5):
▰░░░░ Weak
└─ Red (#ef4444)

Fair Password (2/5):
▰▰░░░ Fair
└─ Orange (#f59e0b)

Good Password (3/5):
▰▰▰░░ Good
└─ Blue (#3b82f6)

Strong Password (4/5):
▰▰▰▰░ Strong
└─ Purple (#8b5cf6)

Very Strong Password (5/5):
▰▰▰▰▰ Very Strong
└─ Green (#22c55e)
```

---

## Input Field States

```
DEFAULT STATE (Untouched):
┌──────────────────────────┐
│ Placeholder text          │
└──────────────────────────┘
Background: rgba(255,255,255, 0.05)
Border:     rgba(255,255,255, 0.1)


FOCUS STATE:
┌──────────────────────────┐
│ Input value here...      │ ✨ Cyan glow
└──────────────────────────┘
Background: rgba(255,255,255, 0.08)
Border:     rgba(0,212,255, 0.4)
Shadow:     0 0 20px rgba(0,212,255, 0.15)


HOVER STATE:
┌──────────────────────────┐
│ Input value...           │
└──────────────────────────┘
Background: rgba(255,255,255, 0.07)
Border:     rgba(0,212,255, 0.2)


ERROR STATE:
┌──────────────────────────┐
│ Invalid email            │
└──────────────────────────┘ ← Red border
Background: rgba(239,68,68, 0.05)
Border:     rgba(239,68,68, 0.5)
Text:       #fca5a5
Message:    "Please enter a valid email"
```

---

## Button States

```
PRIMARY BUTTON (auth-button):

DEFAULT:
┌──────────────────────────────┐
│ ► SIGN IN  →                 │
└──────────────────────────────┘
Background: Cyan → Purple gradient
Color:      White
Border:     None


HOVER:
┌──────────────────────────────┐
│ ► SIGN IN  →  (arrow moves)  │ ↑ Elevated
└──────────────────────────────┘
Shadow:     0 10px 30px rgba(0,212,255, 0.3)
Transform:  translateY(-2px)


LOADING:
┌──────────────────────────────┐
│ ⟳ Signing in...              │
└──────────────────────────────┘
Cursor:     Not-allowed
Opacity:    0.5


DISABLED:
┌──────────────────────────────┐
│ ► SIGN IN  →                 │ (faded)
└──────────────────────────────┘
Opacity:    0.5
Cursor:     Not-allowed


SECONDARY BUTTON (auth-link-button):

DEFAULT:
┌──────────────────────────────┐
│ Create Account  →            │
└──────────────────────────────┘
Border:     1px solid cyan
Background: rgba(0,212,255, 0.05)
Color:      Cyan


HOVER:
┌──────────────────────────────┐
│ Create Account  →            │ ← Cyan glow
└──────────────────────────────┘
Border:     1px solid rgba(0,212,255, 0.5)
Background: rgba(0,212,255, 0.1)
Shadow:     0 0 20px rgba(0,212,255, 0.2)
```

---

## Error Alert Visual

```
ERROR ALERT:
┌───────────────────────────────────────────┐
│ ⚠  Login failed. Please try again.       │
└───────────────────────────────────────────┘
Background: rgba(239,68,68, 0.1)
Border:     1px solid rgba(239,68,68, 0.3)
Color:      #fca5a5 (light red)
Icon:       ⚠ in red (#ef4444)
Animation:  Slide in from top
```

---

## Animation Examples

```
FLOAT ANIMATION (Orbs):
    ◇ Position 1 (start)
       ↙  ↗
    ◇     ◇  Position 2 (20s)
       ↖  ↘
    ◇ Position 3 (center)


GLOW PULSE (Logo):
    ◆ (Dim) → ◆ (Bright) → ◆ (Dim)
    └─────────────────────────────┘
    2 second cycle, infinite


SHIMMER (Button):
    ┌──────────────────────────────┐
    │ ► SIGN IN  →                 │
    └──────────────────────────────┘
    ════════════════════════════════ (Shine passes)
    3 second animation, infinite


SPIN LOADER (Spinner):
    ⟲ → ⟳ → ⟲ → ⟳ → ⟲
    └──────────────────┘
    1 second rotation


SLIDE IN (Entrance):
    ╔═══════════════════════════════╗
    ║ Card below, fading in...      ║  ↓ Moving up
    ╚═══════════════════════════════╝
    └─→ Opacity 0 to 1
    └─→ translateY 20px to 0
    └─→ Duration: 0.6s
```

---

## Responsive Design Visualization

```
DESKTOP (> 640px):
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  ┌────────────────────────────────────────────┐ ║
║  │                                            │ ║
║  │  Card: Max-width 480px, Padding 50px      │ ║
║  │  All features visible                     │ ║
║  │  All animations active                    │ ║
║  │                                            │ ║
║  └────────────────────────────────────────────┘ ║
║                                                   ║
╚═══════════════════════════════════════════════════╝


TABLET (641px - 480px):
╔════════════════════════════════════╗
║                                    ║
║ ┌────────────────────────────────┐║
║ │                                ││
║ │  Card: Padding 35px            ││
║ │  Slightly reduced fonts        ││
║ │  All features visible          ││
║ │                                ││
║ └────────────────────────────────┘║
║                                    ║
╚════════════════════════════════════╝


MOBILE (< 480px):
╔═══════════════════════════╗
║                           ║
║ ┌─────────────────────────║
║ │                         ║
║ │  Card: Padding 25px     ║
║ │  Compact layout         ║
║ │  16px inputs (iOS)      ║
║ │  Scrollable form        ║
║ │  Touch-friendly         ║
║ │                         ║
║ └─────────────────────────║
║                           ║
╚═══════════════════════════╝
```

---

## Component Nesting Tree

```
auth-container
│
├── auth-background
│   ├── ::before (gradient overlay)
│   ├── background-orb (orb-1)
│   ├── background-orb (orb-2)
│   └── background-orb (orb-3)
│
└── auth-content
    └── auth-card
        ├── ::before (top border line)
        │
        ├── auth-header
        │   ├── auth-logo
        │   │   └── logo-icon (◆)
        │   ├── auth-title
        │   └── auth-subtitle
        │
        ├── auth-alert (conditional)
        │   ├── alert-icon
        │   └── p (message)
        │
        ├── auth-form
        │   ├── form-group (email)
        │   │   ├── form-label
        │   │   └── input-wrapper
        │   │       ├── form-input
        │   │       └── input-error (conditional)
        │   │
        │   ├── form-group (password)
        │   │   ├── form-label
        │   │   └── input-wrapper
        │   │       ├── form-input
        │   │       ├── password-strength (conditional)
        │   │       │   ├── strength-bars
        │   │       │   │   └── strength-bar × 5
        │   │       │   └── strength-label
        │   │       └── input-error (conditional)
        │   │
        │   ├── forgot-password (login only)
        │   │
        │   └── auth-button
        │       └── button-loader (loading)
        │           ├── spinner
        │           └── text
        │
        ├── auth-divider
        │   └── span
        │
        └── auth-link-button
            ├── span
            └── link-arrow
```

---

**Visual design complete and production-ready! ✨**
