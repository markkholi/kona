# Kona AP1 — UI Revamp: "Reading Nook" Visual System

> Companion to `docs/ARCHITECTURE.md`. This doc specifies the visual language,
> screen-by-screen design intent, and component-level styling guidance for the
> builder phase.

---

## 1. Visual System Overview

### 1.1 Palette

| Role | Hex | Usage |
|---|---|---|
| **Cocoa** (primary) | `#6D5B4B` | Headings, active tab, primary buttons |
| **Honey** (accent) | `#C4956A` | CTA highlights, active chips, links |
| **Cream** (bg) | `#FBF8F4` | Screen backgrounds |
| **Linen** (surface) | `#FFFDFB` | Cards, sheets, modals |
| **Espresso** (text) | `#3B2F2F` | Body and heading text |
| **Dusty** (muted) | `#9C8B7E` | Secondary text, icons, placeholders |
| **Sage** (success) | `#5A8A6E` | Verified badges, approval indicators |
| **Rosewood** (danger) | `#C0503C` | Warnings, destructive actions |
| **Parchment** (tint) | `#F5EDE3` | Section backgrounds, profile cards |

The warm palette evokes a "cozy reading nook" — bookshelves, warm lamplight, and aged paper.

### 1.2 Typography

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `hero` | 28 | 800 | −0.5 | Home greeting, empty-state titles |
| `title` | 20 | 700 | −0.3 | Screen headers, book titles (detail) |
| `subtitle` | 17 | 600 | 0 | Section headers, card titles |
| `body` | 15 | 400 | 0.1 | Descriptions, paragraphs |
| `caption` | 12 | 500 | 0.3 | Badges, metadata, timestamps |
| `micro` | 10 | 600 | 0.5 | Age pill labels, chip text |

All sizes are base values. Actual rendered size = `base × PixelRatio.getFontScale()`, clamped to `maxFontSizeMultiplier: 1.5` to prevent extreme overflow.

### 1.3 Elevation & Shadows

| Level | Use | Shadow |
|---|---|---|
| 0 | Flat elements, inline chips | None |
| 1 | Cards (BookCard, section cards) | `{ 0, 2, rgba(59,47,47,0.06), 8 }` |
| 2 | Floating action button, bottom sheet | `{ 0, 4, rgba(59,47,47,0.12), 16 }` |
| 3 | Modal overlays | `{ 0, 8, rgba(59,47,47,0.16), 24 }` |

### 1.4 Corner Radii

| Token | Value | Use |
|---|---|---|
| `sm` | 8 | Inner elements, small badges |
| `md` | 12 | Buttons, input fields |
| `lg` | 16 | Cards, section containers |
| `xl` | 24 | Chips, pills, avatar circles |
| `full` | 9999 | Circular avatars |

### 1.5 Spacing Grid (4-px base)

`xs=4  sm=8  md=16  lg=24  xl=32  xxl=48`

### 1.6 Motion Principles

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Screen push | Slide from right (keep native) | 350 ms | Platform default |
| Tab switch | Cross-fade | 200 ms | ease-in-out |
| Card appear (list) | Fade-in + translate-Y 8px | 250 ms | spring(damping: 15) |
| Cover tap → Detail | Shared element (cover image) | 400 ms | spring(damping: 20) |
| Bottom sheet open | Slide from bottom | 300 ms | spring(damping: 18) |
| Save heart toggle | Scale bounce 1.0→1.3→1.0 | 200 ms | spring |

Honour `AccessibilityInfo.isReduceMotionEnabled`: when true, skip all spring/shared-element animations, use instant transitions.

---

## 2. Screen-by-Screen Design Spec

### 2.1 Home Screen (Discover Tab Root)

**Layout (top to bottom):**

1. **Profile strip** (48 px): Active profile avatar (32 px circle) + "Hi, [Name]!" + age badge. Tap → profile switcher bottom-sheet. If single default profile, show "Hi, Reader!".

2. **Hero greeting card** (Parchment bg, lg radius):
   - Headline: "What should [Name] read next?" (`hero` font)
   - Subhead: "Pick an age, share an interest, and we'll find 20 perfect books." (`body`, `dusty`)

3. **Age scroller** — horizontal, larger pills (64 × 72 px) with warm selected state (Honey bg, Espresso text). Unselected: Linen bg, Dusty text. Below the scroller: a single-line profile card showing grade + Lexile range for the selected age.

4. **Interest input card** (Linen surface, lg radius):
   - Multiline TextInput with warm placeholder.
   - Below: scrollable "mood" chips with emoji prefixes. Selected chip fills the input.
   - Chips: 🚀 Space & Sci-Fi · ⚔️ Epic Fantasy · 🔍 Mystery & Thriller · 💻 Coding & Tech · 🐾 Animal Stories · 🏔️ Survival · ⚽ Sports · 🎭 Graphic Novels · 🏛️ History · 🌍 Diverse Voices

5. **CTA button** — full-width, Cocoa bg, rounded (md), 56 px height:
   "Find 20 Books for [Name] →"

6. **Recent searches** (if any) — horizontal scroll, Parchment cards with age badge + interest snippet.

7. **Safety footer** — Sage icon + micro text.

**Removed:** Top-bar Saved/Settings icons (tabs replace them), STEP 1/STEP 2 labels, intro banner.

### 2.2 Results Screen

**Nav bar:** Back arrow + "Books for [Name]" + share icon (Share2).

**Loading state:** 2-column skeleton grid with warm shimmer (Parchment → Cream → Parchment loop).

**Content:**

1. **Context strip** — Honey-tinted bar: "[Name], Age 12 · Space & Sci-Fi · 20 books" + Refresh icon.

2. **Genre chips** — horizontal scroll, Parchment bg, Honey active.

3. **Magazine grid** — `FlatList numColumns={2}` or masonry:
   - Each cell: rounded cover image (aspect 2:3), gradient scrim at bottom, title + author overlay.
   - Heart icon at top-right of each card for save toggle.
   - Tap → BookDetail.

4. **Sort** — Tappable "Sort: Best Match ▼" opens a bottom-sheet with options.

5. **Footer** — "Powered by [source]" in `micro` / `dusty`.

### 2.3 BookDetail Screen

**Hero zone** (top 40% of screen):
- Full-width cover image with parallax scroll-offset.
- Gradient overlay (transparent → Cream) at the bottom.
- Floating back arrow (top-left, translucent circle).
- Genre badge overlaid at top-right.

**Content (scrollable, below hero):**

1. **Title block** — `title` font + author + year/pages/ISBN chips.

2. **Audit pill** — "✓ Verified for Age 12" (Sage bg). Tap expands the full `AgeAuditCard` inline (collapsed by default for a cleaner look).

3. **Synopsis** — expandable, 3-line clamp with "Read more".

4. **Interest Connection** — expandable accordion.

5. **Sticky bottom action bar** (Linen, elevation 2):
   - Save button (toggle, Honey active) | Google Books | Library (WorldCat) | Share

### 2.4 SavedBooks Screen

**Nav bar:** "My Bookshelf" + count badge + share icon.

**Empty state:**
- Warm illustration placeholder (book-stack emoji/graphic).
- "Start saving books you love" hero text.
- "Discover Books" CTA.

**Populated state:**
- Profile badge at top: "Showing [Name]'s saved books ([N])".
- Genre filter chips.
- Single-column BookCards (as today, but warm-themed).
- Swipe-left to remove.
- **Share FAB** (bottom-right): floating circle, Honey bg, Share2 icon. Tap → share full saved list via OS sheet.

### 2.5 Settings Screen

**Layout — grouped sections:**

1. **Reader Profiles** (new section, top):
   - Horizontal scroll of profile cards (avatar circle + name + age).
   - "+ Add Reader" card at end.
   - Tap → edit bottom-sheet (name, age, delete).

2. **Recommendation Engine** — existing provider picker, warm-styled.

3. **API Credentials** — existing, warm-styled, collapsible.

4. **Age Rubrics** — existing accordion, warm-styled.

5. **Data & Privacy** — Clear history, app version.

### 2.6 Bottom Tab Bar

| Tab | Icon | Label | Stack root |
|---|---|---|---|
| Discover | `Compass` | Discover | HomeScreen |
| Saved | `Bookmark` | Saved | SavedBooksScreen |
| Settings | `Settings` | Settings | SettingsScreen |

- Linen background, 1px Parchment top border.
- Active: Cocoa icon + label. Inactive: Dusty icon + label.
- Height: 56 px (iOS safe area adds padding automatically).
- Badge on Saved tab: number of saved books (if > 0).

---

## 3. Component Styling Guide

### 3.1 BookCard (Results — Grid Variant)

```
┌─────────────────┐
│  [Cover Image]  │  aspect 2:3
│                 │  radius: lg (top), 0 (bottom)
│   ♥ (save)      │  top-right overlay
│                 │
│ ░░░░░░░░░░░░░░ │  gradient scrim
│ Title           │  subtitle font, white
│ Author · Year   │  caption font, white 80%
└─────────────────┘
Width: (screenWidth − 3×md) / 2
```

### 3.2 BookCard (SavedBooks — List Variant)

Keep the existing horizontal layout (cover-left, info-right) but apply warm tokens:
- Card bg: Linen, radius lg, elevation 1.
- Cover: 80 × 120, radius sm.
- Genre badge: Parchment bg, Cocoa text.
- Save icon: filled Honey when saved.

### 3.3 AgeAuditCard (Collapsible)

Default state: a single row "✓ Age-Verified for Age N" with a chevron.
Expanded state: the existing full audit card content, animated slide-down.

### 3.4 ProfilePill

```
┌──────────────────────┐
│ (Avatar) Hi, Emma! 12│
└──────────────────────┘
```
- 40 px height, Parchment bg, radius xl.
- Avatar: 28 px circle with predefined color fill + first-letter initial.
- Tap: opens ProfileSwitcher bottom-sheet.

### 3.5 ProfileSwitcher (Bottom Sheet)

```
┌─────────────────────────┐
│  Switch Reader           │
│                          │
│  (●) Emma, Age 12  ✓    │
│  ( ) Liam, Age 15       │
│  ( ) + Add Reader        │
│                          │
│  [ Edit Profiles ]       │
└─────────────────────────┘
```
- `@gorhom/bottom-sheet` with Linen bg.
- Avatar circles + name + age for each profile.
- Active profile has Honey check.
- "Add Reader" row opens inline name + age picker.

---

## 4. Illustration & Asset Notes

- No custom illustrations required for AP1. Use lucide-react-native icons throughout.
- Book-stack empty-state: compose from `BookOpen` icons arranged in a stack pattern, no raster image needed.
- Profile avatars: solid-color circles (using the JACKET_PALETTES array from `bookCovers.ts`) with a white initial letter — no external avatar assets.

---

## 5. Dark Mode

Out of scope for AP1. The warm palette is light-only. However, `tokens.ts` should be structured as `lightTokens` / `darkTokens` objects so a future dark-mode pass only needs to add `darkTokens` and a theme context toggle.
