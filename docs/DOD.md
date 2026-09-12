# Kona AP1 — Definition of Done

> Checklist for the build phase. Each item maps to specific files.
> Builder should check these off as implemented; Mark QC verifies on AVD emulator.

---

## Feature 1: UI Revamp — "Reading Nook" Visual System

### Theme & Tokens
- [ ] **CREATE** `src/theme/tokens.ts` — color palette (cocoa, honey, cream, linen, espresso, dusty, sage, rosewood, parchment), spacing grid, radii, elevation shadows, typography scale
- [ ] **CREATE** `src/theme/useScaledFont.ts` — hook that reads `PixelRatio.getFontScale()` and returns scaled sizes; respects `maxFontSizeMultiplier: 1.5`
- [ ] **VERIFY** all screens import tokens instead of hard-coded hex values

### Navigation (Bottom Tabs)
- [ ] **INSTALL** `@react-navigation/bottom-tabs` via `npx expo install`
- [ ] **CREATE** `src/navigation/BottomTabs.tsx` — Discover / Saved / Settings tabs
- [ ] **CREATE** `src/navigation/DiscoverStack.tsx` — Home → Results → BookDetail
- [ ] **CREATE** `src/navigation/SavedStack.tsx` — SavedBooks → BookDetail
- [ ] **CREATE** `src/navigation/SettingsStack.tsx` — Settings
- [ ] **EDIT** `App.tsx` — replace single Stack with BottomTabs
- [ ] **EDIT** `src/types/navigation.ts` — add tab + nested stack param lists
- [ ] **VERIFY** navigation between tabs and within stacks works; back button returns within stack, not across tabs

### Animations & Motion
- [ ] **INSTALL** `react-native-reanimated` via `npx expo install`
- [ ] **INSTALL** `react-native-gesture-handler` via `npx expo install`
- [ ] **INSTALL** `@gorhom/bottom-sheet` via `npx expo install`
- [ ] **EDIT** `babel.config.js` or `app.json` — add reanimated plugin if required by Expo 57
- [ ] **VERIFY** reduce-motion honoured (skip spring/parallax when `isReduceMotionEnabled`)

### Home Screen
- [ ] **EDIT** `src/screens/HomeScreen.tsx` — warm palette, profile strip, hero greeting, emoji mood chips, remove STEP labels, remove top-bar icons
- [ ] **VERIFY** age scroller uses warm active state (Honey bg)
- [ ] **VERIFY** CTA says "Find 20 Books for [Name] →" with profile name
- [ ] **VERIFY** interest chips have emoji prefixes and fill the input on tap
- [ ] **VERIFY** all hit targets ≥ 44×44 pt

### Results Screen
- [ ] **EDIT** `src/screens/ResultsScreen.tsx` — 2-column magazine grid, warm tokens, share icon in nav, sort via bottom-sheet, skeleton loading
- [ ] **EDIT** `src/components/BookCard.tsx` — add grid variant (cover image with gradient scrim + title overlay); keep list variant for SavedBooks
- [ ] **VERIFY** genre filter chips use warm palette
- [ ] **VERIFY** 20 books render in 2-col grid without layout glitches
- [ ] **VERIFY** save-heart icon visible on each grid card

### BookDetail Screen
- [ ] **EDIT** `src/screens/BookDetailScreen.tsx` — parallax hero cover, collapsible audit pill, sticky bottom action bar, warm tokens
- [ ] **EDIT** `src/components/AgeAuditCard.tsx` — add `collapsible` prop; default collapsed to single verification pill
- [ ] **VERIFY** expanding audit card shows full maturity matrix
- [ ] **VERIFY** sticky action bar has Save / Google Books / Library / Share

### SavedBooks Screen
- [ ] **EDIT** `src/screens/SavedBooksScreen.tsx` — warm tokens, profile badge, swipe-to-delete, share FAB, empty-state illustration
- [ ] **CREATE** `src/components/ShareFab.tsx` — floating action button for sharing list
- [ ] **VERIFY** empty state shows warm illustration + "Discover Books" CTA

### Settings Screen
- [ ] **EDIT** `src/screens/SettingsScreen.tsx` — grouped sections, profile CRUD at top, warm tokens
- [ ] **VERIFY** all existing settings (provider, API keys, rubrics, clear history) still functional

### Accessibility
- [ ] **VERIFY** Dynamic Type scaling works at all iOS accessibility sizes (up to xxxLarge)
- [ ] **VERIFY** every interactive element has `accessibilityLabel` and `accessibilityRole`
- [ ] **VERIFY** color contrast ≥ 4.5:1 for all body text on backgrounds
- [ ] **VERIFY** VoiceOver / TalkBack can navigate the full Home → Results → Detail → Save flow

---

## Feature 2: Share List

- [ ] **CREATE** `src/services/share.ts` — `buildSharePayload(books, age?, interest?, profileName?)`, `shareBookList(books, age?, interest?, profileName?)`, `shareSingleBook(book, targetAge, profileName?)`
- [ ] **EDIT** `src/screens/ResultsScreen.tsx` — add share icon to nav bar; wire to `shareBookList()`
- [ ] **EDIT** `src/screens/SavedBooksScreen.tsx` — wire ShareFab to `shareBookList(savedBooks)`
- [ ] **EDIT** `src/screens/BookDetailScreen.tsx` — refactor `handleShare()` to use `shareSingleBook()` from shared service
- [ ] **VERIFY** share payload includes profile name, age, interest, book list with title/author/year/genre/pages
- [ ] **VERIFY** OS share-sheet opens on iOS and Android
- [ ] **VERIFY** sharing 0 books (empty saved list) shows a friendly alert instead of empty payload

---

## Feature 3: Sibling Profiles

### Data Layer
- [ ] **CREATE** `src/types/profile.ts` — `ReaderProfile` interface
- [ ] **CREATE** `src/context/ProfileContext.tsx` — `ProfileProvider`, `useProfiles()` hook; wraps AsyncStorage CRUD
- [ ] **EDIT** `src/services/storage.ts` — add profile-aware key resolution (`getProfileStorageKey(profileId, baseKey)`); add `migrateToProfiles()` function that promotes existing un-scoped data to default profile on first run
- [ ] **VERIFY** migration: existing saved books and search history preserved under auto-created default profile

### UI
- [ ] **CREATE** `src/components/ProfilePill.tsx` — avatar circle + name + age; tap opens switcher
- [ ] **CREATE** `src/components/ProfileSwitcher.tsx` — bottom-sheet with profile list, add-reader row, edit link
- [ ] **EDIT** `src/screens/HomeScreen.tsx` — add ProfilePill to top of screen; age defaults to active profile's age
- [ ] **EDIT** `src/screens/ResultsScreen.tsx` — header shows "Books for [Name]"
- [ ] **EDIT** `src/screens/SavedBooksScreen.tsx` — scoped to active profile; badge shows profile name
- [ ] **EDIT** `src/screens/SettingsScreen.tsx` — add "Reader Profiles" section with horizontal profile cards, add/edit/delete
- [ ] **EDIT** `App.tsx` — wrap with `<ProfileProvider>`

### Profile CRUD
- [ ] **VERIFY** can create up to 6 profiles (name + age)
- [ ] **VERIFY** switching profiles scopes saved books and search history
- [ ] **VERIFY** deleting a profile removes its saved books and search history from storage
- [ ] **VERIFY** cannot delete the last remaining profile
- [ ] **VERIFY** profile data never appears in API requests (only age int + interest string sent)

---

## Cross-Cutting

### Privacy
- [ ] **VERIFY** no profile names, book titles, or personal data sent to any external API
- [ ] **VERIFY** "Clear Search History" clears history for active profile only (or all profiles with confirmation)

### TypeScript
- [ ] **VERIFY** `npm run typecheck` passes with zero errors

### Existing Logic Preservation
- [ ] **VERIFY** AI recommender (Gemini / OpenAI / mock) works unchanged
- [ ] **VERIFY** Google Books metadata enrichment works unchanged
- [ ] **VERIFY** age rubric audit logic (`isAgeAppropriate`) works unchanged
- [ ] **VERIFY** curated book pool (300 books) untouched

### QC Emulator Gate
- [ ] **RUN** `scripts/emulator-qc.ps1` on AVD MatthewsQC_Phone
- [ ] **SCREENSHOT** Home, Results (2-col grid), BookDetail, SavedBooks, Settings, Profile Switcher
- [ ] **WALK** full flow: switch profile → search → browse results → view detail → save → share list → switch profile → verify scoped saves

---

## Files Summary

### New Files (13)
| Path | Purpose |
|---|---|
| `src/theme/tokens.ts` | Design tokens |
| `src/theme/useScaledFont.ts` | Dynamic Type hook |
| `src/navigation/BottomTabs.tsx` | Tab navigator |
| `src/navigation/DiscoverStack.tsx` | Discover tab stack |
| `src/navigation/SavedStack.tsx` | Saved tab stack |
| `src/navigation/SettingsStack.tsx` | Settings tab stack |
| `src/types/profile.ts` | ReaderProfile type |
| `src/context/ProfileContext.tsx` | Profile state + CRUD |
| `src/components/ProfilePill.tsx` | Profile chip (Home header) |
| `src/components/ProfileSwitcher.tsx` | Profile switcher sheet |
| `src/components/ShareFab.tsx` | Floating share button |
| `src/services/share.ts` | Share payload builder |
| `docs/DOD.md` | This checklist |

### Edited Files (11)
| Path | Scope of change |
|---|---|
| `App.tsx` | Replace Stack with BottomTabs; wrap in ProfileProvider |
| `src/types/navigation.ts` | Add tab + nested stack param lists |
| `src/screens/HomeScreen.tsx` | Warm theme, profile pill, guided layout, mood chips |
| `src/screens/ResultsScreen.tsx` | Magazine grid, share icon, profile badge, bottom-sheet sort |
| `src/screens/BookDetailScreen.tsx` | Parallax hero, collapsible audit, sticky actions |
| `src/screens/SavedBooksScreen.tsx` | Profile-scoped, share FAB, warm theme, swipe-delete |
| `src/screens/SettingsScreen.tsx` | Profile section, grouped layout, warm theme |
| `src/components/BookCard.tsx` | Grid + list variants, warm tokens, a11y |
| `src/components/AgeAuditCard.tsx` | Collapsible mode |
| `src/services/storage.ts` | Profile-aware keys, migration function |
| `package.json` | New deps (bottom-tabs, reanimated, gesture-handler, bottom-sheet) |

### Unchanged Files
| Path |
|---|
| `src/services/aiRecommender.ts` |
| `src/services/googleBooks.ts` |
| `src/services/mockBooks.ts` |
| `src/constants/ageRubric.ts` |
| `src/constants/bookCovers.ts` |
| `src/data/curatedBooks.ts` |
| `src/types/book.ts` |
