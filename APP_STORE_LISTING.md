# Kona — Apple App Store Connect Listing & Submission Guide

This document contains all metadata, configuration details, and step-by-step instructions needed to submit **Kona** to the Apple App Store.

---

## 1. App Store Listing Metadata

### App Name
- **Store Name:** `Kona - Books for Kids`
  *(Note: If "Kona" is already taken by another app worldwide in App Store Connect, use `Kona: Books for Kids` or `Kona Book Recommender`)*
- **Bundle ID:** `com.mkholi.kona` (matches `app.json`)
- **SKU:** `kona-books`
- **Primary Language:** English (U.S.)

### Subtitle (30 characters max)
```text
20 Vetted Books for Ages 10-17
```
*(Exact count: 30 characters)*

### Categories
- **Primary Category:** Education
- **Secondary Category:** Books *(or Reference)*

### Keywords (100 characters max, comma-separated, no spaces)
```text
books,reading,kids,recommendations,teens,middle school,high school,lexile,library,ya fiction,novels
```
*(Exact count: 99 characters)*

### Promotional Text (170 characters max)
```text
Discover 20 age-appropriate book recommendations tailored to your child's interests, complete with educator-backed maturity audits and reading complexity benchmarks.
```
*(Exact count: 168 characters)*

### Description (Full Copy)
```text
Finding the right book for young readers shouldn't be guesswork. Kona helps parents, educators, librarians, and students discover exactly 20 age-appropriate books tailored to any passion or interest.

Whether your reader is excited about space mysteries with robots, ancient mythology quests, coding competitions, high-stakes wilderness survival, or found-family heists, Kona curates a diverse, engaging list of titles perfectly calibrated for their developmental stage.

WHY KONA?

• EXACTLY 20 RECOMMENDATIONS PER SEARCH: Receive a comprehensive, varied list of 20 high-quality literary choices for every single inquiry.

• STRICT AGE-APPROPRIATENESS VALIDATION: Every single recommendation undergoes an educator-designed multi-factor audit assessing:
  - Reading Level & Lexile complexity
  - Violence & Peril limits
  - Language & Slang thresholds
  - Romance & Intimacy appropriateness
  - Sensitive & Dark themes oversight

• AGE-BY-AGE BENCHMARKING (AGES 10 TO 17): Tailored profiles for every single year—from 5th Grade elementary transitions to 12th Grade pre-college literature.

• DETAILED AUDIT SCORECARD: Tap any title to inspect its developmental fit gauge, 4-factor maturity matrix, content heads-up alerts, and educator rationale explaining why the title is right for that specific reader age.

• OFFICIAL BOOK METADATA: Browse verified book covers, publication years, page counts, and ISBN details powered by Google Books.

• SAVED READING LIST: Bookmark favorite titles into a personal reading list to take to the library or bookstore.

• PRIVACY-FIRST & ZERO ADS: No accounts, no logins, no personal data collection, and no tracking. All searches and saved books stay safely on your device.
```

### URLs
- **Support URL:** `https://github.com/mkholi` *(or your personal site)*
- **Marketing URL (optional):** `https://github.com/mkholi`
- **Privacy Policy URL:** `https://mkholi.github.io/kona/` *(or host `docs/index.html` on GitHub Pages / Vercel)*

---

## 2. Age Rating Questionnaire (Apple Content Declaration)

When completing the Age Rating questionnaire in App Store Connect:
- **Violence:** None / Infrequent Mild
- **Profanity or Crude Humor:** None
- **Mature / Suggestive / Sexual Themes:** None
- **Horror / Fear Themes:** None
- **Medical / Treatment Information:** None
- **Alcohol, Tobacco, or Drug Use or References:** None
- **Simulated Gambling:** None
- **Unrestricted Web Access:** No
- **Contests:** No
- **Made for Kids:** Optional (Recommended category: 9–11 and 12+)

---

## 3. App Review Information (For the Apple Reviewer)

- **Sign-In Required:** **No** (Uncheck "Sign-in required")
- **Contact Info:**
  - First Name: `Mark`
  - Last Name: `Kholi`
  - Phone Number: *(Your phone with country code, e.g. +1...)*
  - Email: `mkholi23@gmail.com`
- **Review Notes:**
```text
Kona is a book recommendation app for readers aged 10-17. It does not require an account or login. The app includes a built-in curated library that works immediately out of the box with zero external setup or API keys required. Reviewers can select any age (10-17), type any topic (e.g., "space exploration" or tap a suggestion chip), and tap "Recommend 20 Books" to view the 20 recommendations and age audit cards.
```

---

## 4. App Store Screenshots (Ready)

All required screenshots have been generated in `C:\Users\mkhol\Documents\Apps2\cursor\Kona\screenshots\`:

### Directory Structure & Resolutions
1. **iPhone 6.1" (`1170 x 2532` px, 24-bit RGB, No Alpha):**
   `screenshots/iphone_6.1/`
   - `01_home_screen.png` — Age 12 selector, middle school Lexile benchmark, interest chips
   - `02_results_20_books.png` — 20 vetted recommendations with "Verified for Age" badges
   - `03_book_audit_detail.png` — 4-factor maturity safety scorecard & educator rationale
   - `04_saved_reading_list.png` — Saved books reading list
   - `05_settings_rubrics.png` — Provider settings & developmental rubrics 10–17

2. **iPhone 6.5" / 6.7" (`1284 x 2778` px, 24-bit RGB, No Alpha):**
   `screenshots/iphone_6.5/`
   - `01_home_screen.png`
   - `02_results_20_books.png`
   - `03_book_audit_detail.png`
   - `04_saved_reading_list.png`
   - `05_settings_rubrics.png`
   *(Also available as marketing showcase cards in `screenshots/iphone_6.5_showcase/`)*

3. **iPad 13-inch (`2064 x 2752` px, 24-bit RGB, No Alpha):**
   `screenshots/ipad_13/`
   - `01_home_screen.png`
   - `02_results_20_books.png`
   - `03_book_audit_detail.png`
   - `04_saved_reading_list.png`
   - `05_settings_rubrics.png`
   *(Also available for 12.9" at `2048 x 2732` px in `screenshots/ipad_12.9/`)*

To re-generate all screenshots at any time:
```powershell
python scripts/generate_app_store_screenshots.py
```

---

## 5. EAS Build & Submit Step-by-Step

### Step 1: Create the App Record in App Store Connect (Browser)
1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) and sign in.
2. Click **Apps** → **+** (blue plus icon) → **New App**.
3. Select:
   - **Platforms:** `iOS`
   - **Name:** `Kona - Books for Kids` *(or `Kona Book Recommender` if already taken)*
   - **Primary Language:** `English (U.S.)`
   - **Bundle ID:** `com.mkholi.kona` *(select from dropdown; if not yet listed, create it in developer.apple.com → Identifiers)*
   - **SKU:** `kona-books`
   - **User Access:** `Full Access`
4. Click **Create**.

### Step 2: Build the Production iOS IPA
In your terminal, run:
```powershell
npm run eas:ios
```
*(Or: `npx.cmd eas-cli@latest build --platform ios --profile production`)*

When prompted:
- **Apple ID sign-in:** Log in with your Apple Developer account credentials.
- **Distribution Certificate & Provisioning Profile:** Select **Yes** to let EAS generate and manage them automatically.

Wait a few minutes while Expo builds the production `.ipa` in the cloud.

### Step 3: Submit to App Store Connect / TestFlight
Once the build completes on Expo:
```powershell
npm run eas:submit
```
*(Or: `npx.cmd eas-cli@latest submit --platform ios --latest`)*

When EAS asks:
- **App Store Connect API Key:** Select **"Generate a new App Store Connect API Key"** (EAS will create it and link it to your account so future uploads are 1-click automatic).

### Step 4: Complete Listing & Submit to App Review
1. In [App Store Connect](https://appstoreconnect.apple.com), open the app.
2. Go to **Distribution** → **iOS App 1.0.0 (Prepare for Submission)**.
3. Upload the 5 screenshots from `.qc/appstore_1284x2778/` into the iPhone 6.7" / 6.5" slot.
4. Paste in the **Description**, **Keywords**, **Subtitle**, and **Support URL** from Section 1 above.
5. In the **Build** section, select the uploaded build (once TestFlight finishes processing it, typically 5–15 minutes).
6. Fill in **App Review Information** (no login required, review notes from Section 3).
7. Complete **App Privacy** (No data collected).
8. Click **Save**, then click **Add for Review** → **Submit to App Review**!
