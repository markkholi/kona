# Kona AP1 — Architecture & Implementation Plan

> **Status:** Plan (Mark QC gate before build)
> **Scope:** UI revamp, Share list, Sibling profiles
> **Constraint:** Expo 57 / RN 0.86, on-device only, no accounts

---

## 1. Current Architecture Snapshot

```
App.tsx                          NativeStackNavigator (5 screens)
├─ HomeScreen                    Age picker + interest input → Results
├─ ResultsScreen                 FlatList of 20 BookCards, genre filter, sort
├─ BookDetailScreen              Hero card + AgeAuditCard + save/share/library
├─ SavedBooksScreen              FlatList of saved BookCards
└─ SettingsScreen                Provider selector, API keys, rubric accordion

src/
├─ components/
│   ├─ BookCard.tsx              Horizontal cover + info card (used in Results & Saved)
│   └─ AgeAuditCard.tsx          4-factor maturity matrix + age gauge
├─ constants/
│   ├─ ageRubric.ts              AGE_PROFILES[10–17], isAgeAppropriate(), getMaturityColor()
│   └─ bookCovers.ts             LOCAL_BOOK_COVERS, ISBN lookup, jacket palette, getBookCoverSource()
├─ data/
│   └─ curatedBooks.ts           300 pre-vetted BookRecommendation objects (7.7 k lines)
├─ services/
│   ├─ aiRecommender.ts          fetchBookRecommendations() → Gemini / OpenAI / mock + Google Books enrichment
│   ├─ googleBooks.ts            fetchGoogleBookMetadata() — cover, ISBN, pageCount, preview
│   ├─ mockBooks.ts              getMockRecommendations() — scored + padded to 20
│   └─ storage.ts                AsyncStorage CRUD: settings, saved books, search history
└─ types/
    ├─ book.ts                   BookRecommendation, MaturityScores, AgeProfile, ApiSettings
    └─ navigation.ts             RootStackParamList (Home, Results, BookDetail, SavedBooks, Settings)
```

**Key design traits:**
- Stack-only navigation via `@react-navigation/native-stack`.
- Flat color palette (`#4F46E5` indigo primary, `#F8FAFC` background, slate greys).
- All state is per-screen `useState` + AsyncStorage. No global state manager.
- Storage keys are un-scoped: `@kona_saved_books_v1`, `@kona_settings_v1`, `@kona_search_history_v1`.

---

## 2. Feature 1 — UI Revamp ("Reading Nook" Visual System)

### 2.1 Design Tokens (new file: `src/theme/tokens.ts`)

| Token group | Current | Proposed |
|---|---|---|
| **Primary** | `#4F46E5` (indigo-600) | `#6D5B4B` warm-cocoa primary / `#C4956A` amber-honey accent |
| **Background** | `#F8FAFC` (slate-50) | `#FBF8F4` warm-cream |
| **Surface** | `#FFFFFF` flat white cards | `#FFFDFB` with 16 px radius, subtle warm shadow |
| **Text** | `#0F172A` slate-900 | `#3B2F2F` espresso |
| **Type scale** | Hard-coded font sizes 10–20 | Semantic scale: `caption` 12, `body` 15, `title` 20, `hero` 28; all multiply by Dynamic Type factor |
| **Radius** | 6–16 mixed | Consistent 16 (cards), 24 (chips), 12 (buttons) |
| **Spacing** | Ad-hoc 6–40 | 4-px grid: `xs=4 sm=8 md=16 lg=24 xl=32` |
| **Motion** | `slide_from_right` only | Shared-element cover transition (Results→Detail), spring tab switch, fade-in list items |

A single `tokens.ts` exports colors, spacing, radii, and a `useScaledFont()` hook that reads `PixelRatio.getFontScale()` so the entire app scales with iOS Dynamic Type and Android font-size settings.

### 2.2 Navigation: Bottom Tabs + Nested Stacks

Replace the single NativeStack with a bottom-tab shell:

```
BottomTabNavigator (3 tabs)          ← NEW: @react-navigation/bottom-tabs
├─ Discover (tab icon: Compass)
│   └─ DiscoverStack (NativeStack)
│       ├─ Home                      ← existing, restyled
│       ├─ Results                   ← existing, magazine-style
│       └─ BookDetail                ← existing, glanceable audit
├─ Saved (tab icon: Bookmark)
│   └─ SavedStack (NativeStack)
│       ├─ SavedBooks                ← existing, restyled
│       └─ BookDetail                ← reuse
└─ Settings (tab icon: Settings)
    └─ SettingsStack (NativeStack)
        └─ Settings                  ← existing, restyled
```

**Dependencies to add:** `@react-navigation/bottom-tabs` (already compatible with nav 7.x).

**Migration strategy:** `App.tsx` becomes the tab navigator. Each tab stack wraps the existing screen components with zero logic changes — only import paths and `navigation.ts` types update.

### 2.3 Screen-by-Screen Changes

#### Home (Discover tab root)
- Replace STEP 1 / STEP 2 with a single guided card: age scroller at top, interest chips below, large CTA.
- Interest chips become scrollable "mood" pills with soft emoji prefixes (🚀 Space, ⚔️ Fantasy, etc.).
- Recent searches become a small "Continue Reading Journey" section.
- Remove top-bar Saved/Settings icons (tabs handle that).
- Warm background gradient `#FBF8F4 → #F5EDE3` behind the search card.

#### Results (magazine-style)
- Two-column masonry grid of BookCards (alternating tall/short) instead of single-column FlatList.
- Each card: full-bleed cover image, title overlay at bottom with gradient scrim, save-heart icon.
- Genre chip strip stays; sort becomes a bottom-sheet instead of an inline dropdown.
- "Powered by" badge moves to a subtle footer.
- Loading state: skeleton cards with warm shimmer.

#### BookDetail (glanceable audit)
- Hero: full-width cover bleed with parallax scroll.
- Audit section: collapsed by default to a single "Age ✓ Verified" pill; tappable to expand the full AgeAuditCard.
- Action bar sticky at bottom: Save | Share | Library.
- "Why It Matches" and Synopsis become expandable accordion sections.

#### SavedBooks
- Add "Share My List" FAB at bottom-right.
- Empty state illustration (warm book-stack graphic).

#### Settings
- Group into expandable sections (Provider, Profiles, Data).
- "Profiles" section is the sibling profile manager (Feature 3).

### 2.4 Accessibility Requirements
- All touchable targets ≥ 44×44 pt.
- `accessibilityLabel` and `accessibilityRole` on every interactive element.
- Color contrast ≥ 4.5:1 for body text (espresso on cream passes).
- Dynamic Type: font sizes via `useScaledFont()` hook, never hard-coded.
- Reduced-motion: honour `AccessibilityInfo.isReduceMotionEnabled` to skip parallax/spring.

---

## 3. Feature 2 — Share List

### 3.1 Data Flow

```
User taps "Share" on Results or SavedBooks
  ↓
buildSharePayload(books: BookRecommendation[], profileName?: string): string
  ↓
React Native Share.share({ title, message })
  ↓
OS share-sheet (Messages, Email, AirDrop, etc.)
```

### 3.2 Payload Format (plain text)

```
📚 Kona Book Recommendations for [ProfileName], Age [N]
Interest: "[interest phrase]"

1. "Percy Jackson & the Olympians" by Rick Riordan (2005)
   Ages 10–13 · Mythological Fantasy · 377 pages
   Why: High-energy mythological adventure...

2. ...

——
20 books curated by Kona · kona.app
```

### 3.3 Implementation Plan

| File | Change |
|---|---|
| `src/services/share.ts` (NEW) | `buildSharePayload()`, `shareBookList()`, `shareSingleBook()` |
| `src/screens/ResultsScreen.tsx` | Add share icon in nav bar; calls `shareBookList(displayedBooks, age, interest)` |
| `src/screens/SavedBooksScreen.tsx` | Add FAB or nav-bar share icon; calls `shareBookList(savedBooks)` |
| `src/screens/BookDetailScreen.tsx` | Existing `handleShare()` refactored to use shared `shareSingleBook()` |

No new dependencies needed — uses built-in `react-native` `Share` API.

---

## 4. Feature 3 — Sibling Profiles

### 4.1 Data Model

```typescript
// src/types/profile.ts (NEW)
export interface ReaderProfile {
  id: string;            // uuid-v4 style, generated on-device
  name: string;          // "Emma", "Liam" — max 20 chars
  age: number;           // 10–17
  avatarIndex: number;   // index into a predefined avatar palette (0–7)
  createdAt: number;     // epoch ms
}
```

### 4.2 Storage Design

```
@kona_profiles_v1          → ReaderProfile[]  (max 6 profiles)
@kona_active_profile_v1    → string (profile id)
@kona_saved_books_v1       → UNCHANGED (legacy, becomes "default" profile's books)
@kona_saved_books_{id}_v1  → BookRecommendation[] per non-default profile
@kona_search_history_{id}_v1 → RecentSearch[] per profile
```

**Migration:** On first launch after update, if `@kona_profiles_v1` doesn't exist, create a "Default Reader" profile and link existing saved-books/history to it. Zero data loss.

### 4.3 Profile Context

```typescript
// src/context/ProfileContext.tsx (NEW)
const ProfileContext = React.createContext<{
  profiles: ReaderProfile[];
  activeProfile: ReaderProfile | null;
  switchProfile: (id: string) => void;
  addProfile: (name: string, age: number) => void;
  updateProfile: (id: string, patch: Partial<ReaderProfile>) => void;
  deleteProfile: (id: string) => void;
}>(...);
```

Wrap `<App>` in `<ProfileProvider>`. Every screen that reads/writes saved books or search history resolves the active profile's storage key via the context.

### 4.4 UI Touchpoints

| Location | Change |
|---|---|
| **Home** (top-left) | Profile avatar pill showing active name + age; tap opens profile switcher bottom-sheet |
| **Profile Switcher** (bottom-sheet) | List of profiles with avatar/name/age; "Add Profile" card; long-press to edit/delete |
| **Settings → Profiles section** | Full CRUD: add, rename, change age, delete with confirmation |
| **Results** | Header badge shows "Recommendations for [Name], Age [N]" |
| **SavedBooks** | Scoped to active profile; badge shows profile name |
| **Share payload** | Includes profile name if non-default |

### 4.5 Privacy Guarantees
- All profile data stays in AsyncStorage on-device.
- Profile deletion removes all associated saved-books and search-history keys.
- No profile data is ever sent to Google Books, Gemini, or OpenAI APIs — only age (int) and interest (string) are sent.

---

## 5. Dependency Changes

| Package | Version | Why |
|---|---|---|
| `@react-navigation/bottom-tabs` | ^7.x | Bottom tab navigator for Discover / Saved / Settings |
| `react-native-reanimated` | ~3.x (Expo 57 compatible) | Spring animations, shared-element transitions, parallax |
| `react-native-gesture-handler` | ~2.x (Expo 57 compatible) | Bottom-sheet swipe, long-press profile actions |
| `@gorhom/bottom-sheet` | ^5.x | Profile switcher, sort options, share options |

All four packages are Expo-managed and prebuild-compatible. No native module ejection required.

---

## 6. File Structure After AP1

```
src/
├─ theme/
│   └─ tokens.ts                 ← NEW: colors, spacing, radii, useScaledFont()
├─ context/
│   └─ ProfileContext.tsx         ← NEW: active profile state + CRUD
├─ navigation/
│   ├─ BottomTabs.tsx             ← NEW: tab navigator shell
│   ├─ DiscoverStack.tsx          ← NEW: Home → Results → BookDetail
│   ├─ SavedStack.tsx             ← NEW: SavedBooks → BookDetail
│   └─ SettingsStack.tsx          ← NEW: Settings
├─ components/
│   ├─ BookCard.tsx               ← EDIT: warm tokens, 2-col variant, a11y labels
│   ├─ AgeAuditCard.tsx           ← EDIT: collapsible mode
│   ├─ ProfilePill.tsx            ← NEW: avatar + name chip for Home header
│   ├─ ProfileSwitcher.tsx        ← NEW: bottom-sheet profile list
│   └─ ShareFab.tsx               ← NEW: floating share button
├─ screens/
│   ├─ HomeScreen.tsx             ← EDIT: guided layout, profile pill, warm theme
│   ├─ ResultsScreen.tsx          ← EDIT: magazine grid, share icon, profile badge
│   ├─ BookDetailScreen.tsx       ← EDIT: parallax hero, collapsible audit, sticky actions
│   ├─ SavedBooksScreen.tsx       ← EDIT: share FAB, profile-scoped, empty illustration
│   └─ SettingsScreen.tsx         ← EDIT: profile CRUD section, grouped layout
├─ services/
│   ├─ storage.ts                 ← EDIT: profile-aware key resolution, migration fn
│   ├─ share.ts                   ← NEW: buildSharePayload(), shareBookList()
│   ├─ aiRecommender.ts           (unchanged)
│   ├─ googleBooks.ts             (unchanged)
│   └─ mockBooks.ts               (unchanged)
├─ constants/
│   ├─ ageRubric.ts               (unchanged)
│   └─ bookCovers.ts              (unchanged)
├─ data/
│   └─ curatedBooks.ts            (unchanged)
└─ types/
    ├─ book.ts                    (unchanged)
    ├─ navigation.ts              ← EDIT: nested tab + stack param lists
    └─ profile.ts                 ← NEW: ReaderProfile interface
```

---

## 7. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Bottom-tabs migration breaks deep links from Results→BookDetail | Medium | Both Discover and Saved stacks register BookDetail; pass `targetAge` in both |
| `react-native-reanimated` version conflict with Expo 57 | Low | Use Expo-managed version via `npx expo install`; validate in CI |
| Profile storage migration loses existing saved books | High | Migration function runs once, wraps existing data under default profile, then sets a `@kona_migrated_v1` flag |
| Magazine 2-column grid performance with 20 cover images | Medium | Use `FlashList` or `FlatList` with `numColumns={2}` + `getItemLayout`; lazy-load images |
| Dynamic Type at extreme scales breaks card layouts | Low | Test at largest accessibility size; use `maxFontSizeMultiplier` as safety valve |

---

## 8. Out of Scope (Later Phases)

- Libby / OverDrive deep links for library holds
- Home-screen widgets (book-of-the-day)
- Reading streaks and gamification
- "Too hard / too dark" feedback loop per book
- New AI recommender model rewrite
- Cloud sync / accounts
