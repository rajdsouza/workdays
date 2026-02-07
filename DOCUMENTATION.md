# Workdays — Office Attendance Tracker

A mobile-first web app that helps you track office attendance against a configurable goal. Built with React and deployable to Google Play and the Apple App Store via Capacitor.

---

## Features

- **Attendance tracking** — Tap any working day to mark it as an office day. Tap again to clear.
- **Absence logging** — Long press a day to mark Sick, Leave, or Other absences across multiple consecutive working days.
- **Configurable goal** — Set your target attendance percentage (30%–80%).
- **Full-month calculation** — Percentage is always calculated against all working days in the month, minus absences.
- **Month navigation** — Swipe left/right or use arrow buttons to move between months.
- **Offline-first storage** — Data is stored locally using sql.js (SQLite compiled to WebAssembly) with a localStorage fallback.
- **Native deployment** — Wrapped with Capacitor for Android and iOS distribution.

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| UI            | React 18                            |
| Build         | Create React App (react-scripts 5)  |
| Storage       | sql.js (WASM) + localStorage        |
| Native shell  | Capacitor 8                         |
| Status bar    | @capacitor/status-bar               |

---

## Project Structure

```
workdays/
├── public/
│   ├── index.html           # HTML shell with mobile meta tags
│   └── manifest.json        # PWA / Capacitor metadata
├── src/
│   ├── index.js             # Entry point, Capacitor status bar init
│   ├── App.js               # Dashboard UI, components, interactions
│   ├── App.css              # All styles including modal, safe areas
│   └── api/
│       ├── storage.js       # sql.js + localStorage dual storage layer
│       ├── storage.test.js  # 7 storage tests
│       ├── dataLayer.js     # Pure calculation functions
│       └── dataLayer.test.js # 11 data layer tests
├── android/                 # Generated Android Studio project
├── ios/                     # Generated Xcode project
├── capacitor.config.json    # Capacitor configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 16+
- npm

### Install and Run

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`.

### Run Tests

```bash
npm test
```

18 tests across two suites (storage + data layer).

---

## How It Works

### Day Interactions

| Action     | Behaviour                                                                 |
|------------|---------------------------------------------------------------------------|
| **Tap**    | Unmarked day becomes **Office**. Any marked day (Office/Sick/Leave/Other) is **cleared**. |
| **Long press** | Opens a modal to select an absence type (Sick, Leave, Other) and how many consecutive working days to mark. |

### Calculations

- **Required Days** = Total working days in the month minus absences (sick + leave + other).
- **Percentage** = Office days / Required days.
- **Days Needed** = `ceil(goal% * required days)` — the total office days needed to meet the goal.
- **Nudge message** = How many more office days remain to reach the goal, plus remaining working days (current month only).

### Storage

The app attempts to load sql.js from CDN (`cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/sql-wasm.js`). If that fails (e.g. offline, CDN blocked), it falls back to localStorage.

**Database schema:**
```sql
CREATE TABLE entries (date TEXT PRIMARY KEY, type TEXT)
```

**Storage API:**
- `setDay(dateStr, type)` — Insert or update an entry.
- `removeDay(dateStr)` — Delete an entry.
- `getEntriesForMonth(year, month)` — Returns `[{date, type}, ...]` for the given month.

---

## Configuration

### Goal Percentage

Tap the "Goal: X%" button in the app to choose from 30%, 40%, 50%, 60%, 70%, or 80%. The selection is persisted in localStorage under the key `workdays_goal`.

---

## Deployment

### Build for Web

```bash
npm run build
```

Output goes to the `build/` directory.

### Sync to Native Platforms

```bash
npm run build
npm run cap:sync
```

### Android (Google Play)

1. Install [Android Studio](https://developer.android.com/studio).
2. Open the Android project:
   ```bash
   npm run cap:android
   ```
3. In `android/app/build.gradle`, set `versionCode` and `versionName`.
4. Generate a signing keystore:
   ```bash
   keytool -genkey -v -keystore workdays-release.keystore -alias workdays -keyalg RSA -keysize 2048 -validity 10000
   ```
5. In Android Studio: **Build > Generate Signed Bundle / APK** > select **AAB** > choose your keystore > **release** > **Finish**.
6. Upload the `.aab` to [Google Play Console](https://play.google.com/console) ($25 one-time fee).
7. Complete the store listing (description, screenshots, icon, privacy policy).
8. Submit for review.

### iOS (App Store)

1. Install [Xcode](https://developer.apple.com/xcode/) (macOS only).
2. Open the iOS project:
   ```bash
   npm run cap:ios
   ```
3. In Xcode, select your development team under **Signing & Capabilities**.
4. Set the version and build number in **General**.
5. **Product > Archive** to create an archive.
6. Use **Distribute App** to upload to [App Store Connect](https://appstoreconnect.apple.com) ($99/year Apple Developer Program).
7. Complete the App Store listing and submit for review.

### Updating the App

For each update:
1. Increment `versionCode` (Android) or build number (iOS).
2. Run:
   ```bash
   npm run build && npm run cap:sync
   ```
3. Build a new signed AAB/archive and upload.

---

## NPM Scripts

| Script          | Description                        |
|-----------------|------------------------------------|
| `npm start`     | Start dev server                   |
| `npm run build` | Production build to `build/`       |
| `npm test`      | Run test suites                    |
| `npm run cap:sync`    | Sync build to native platforms |
| `npm run cap:android` | Open Android Studio            |
| `npm run cap:ios`     | Open Xcode                     |

---

## Day Types

| Type           | Color   | Meaning                  |
|----------------|---------|--------------------------|
| Office         | Green   | Worked from office       |
| Sick           | Red     | Sick day                 |
| Leave          | Blue    | Annual leave / vacation  |
| Other          | Purple  | Other absence            |
| _(unmarked)_   | Grey    | No entry recorded        |

Absences reduce the required working days, making the attendance goal easier to reach proportionally.
