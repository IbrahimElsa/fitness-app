# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run dev server (Create React App / react-scripts)
- `npm run build` — production build to `build/`
- `npm test` — run tests in watch mode (Jest via react-scripts)
- `npm test -- --watchAll=false App.test.js` — run a single test file once
- `npx eslint src --ext .js` — lint; CI builds run with `CI=true`, which turns warnings into build failures
- `firebase deploy` — deploy hosting (serves `build/`) and Firestore rules/indexes (both configured in [firebase.json](firebase.json))

[PROGRESS.md](PROGRESS.md) tracks the review findings and what has landed; update it when you fix or add something.

## Architecture

Mobile-first React 18 SPA (plain JavaScript, no TypeScript) for gym workout tracking, backed by Firebase (Auth, Firestore, Storage). Routing via react-router-dom v6, styling via Tailwind CSS with dark mode supported. Dark mode is class-based: `tailwind.config.js` sets `darkMode: ['class', '.dark-mode']` so `dark:` utilities follow the `dark-mode` class ThemeProvider puts on `<body>`, not the OS setting.

### Offline-first

The app is designed to work in a gym with no signal:

- **Firestore persistent cache** ([src/firebaseConfig.js](src/firebaseConfig.js), `initializeFirestore` + `persistentLocalCache`) serves reads from IndexedDB offline and queues writes. Do not add localStorage caches of Firestore data; the old `templates`/`recentWorkouts`/`gymVisits`/`workoutData_*` keys were removed for this reason.
- **Writes are not awaited** where the UI must proceed offline (finish workout, save/delete template, add custom exercise). Awaiting `setDoc`/`addDoc` blocks until the server acknowledges, which never happens offline. Call the write, attach `.catch`, and navigate.
- **Service worker** ([src/service-worker.js](src/service-worker.js), Workbox) precaches the app shell; react-scripts injects the manifest at build time because the file exists at that path. It is registered from [src/index.js](src/index.js) in production only. Storage uploads (profile picture) are the one thing that genuinely needs a connection.
- [OfflineBanner](src/components/OfflineBanner.js) shows a status strip while `navigator.onLine` is false.

### Provider hierarchy

[App.js](src/App.js) nests three context providers around the router, all consumed via hooks. Routes that need a user are wrapped in [RequireAuth](src/components/RequireAuth.js), which waits for auth to resolve and redirects to `/login` with a `returnPath` that Login honours. Pages that render their own signed-out state (Home, Workout, Statistics, Exercises, ActiveWorkout, FinishedWorkout) are left unguarded.

1. **ThemeProvider** ([src/components/ThemeContext.js](src/components/ThemeContext.js)) — `useTheme()` returns `{ theme, toggleTheme, themeCss }`. `themeCss` is a map of named Tailwind class strings (e.g. `cardLight`/`cardDark`, `primaryButton`); components compose classes from it rather than hardcoding colors. Theme persists to localStorage and toggles a `dark-mode` class on `<body>`.
2. **AuthProvider** ([src/AuthContext.js](src/AuthContext.js)) — `useAuth()` returns `{ currentUser, loading, logout }`. The `loading` flag matters: pages must wait for `loading === false` before redirecting unauthenticated users, otherwise refreshes bounce logged-in users to `/login`.
3. **PersistedStateProvider** ([src/components/PersistedStateProvider.js](src/components/PersistedStateProvider.js)) — `usePersistedState()` holds the in-progress workout (`selectedExercises`, `localExerciseData`, `startTime`, `timer`, `isActive`) and mirrors it to the `activeWorkout` localStorage key while `isActive` is true, so an active workout survives refresh/close. `clearState()` ends it.

### Active workout flow

Workout → ActiveWorkout → FinishedWorkout. [ActiveWorkout.js](src/pages/ActiveWorkout.js) is the most complex page: it starts a workout from `location.state` (passed from Workout/Templates pages), restores one from localStorage, and computes the elapsed timer from `startTime` (wall-clock based, not tick-counting). Besides the provider's `activeWorkout` key, it also writes individual `startTime`/`isActive`/`timer`/`timeLeft` localStorage keys (rest timer + beforeunload backup) — both sources are checked on restore, so keep them consistent when changing persistence logic. An active workout is allowed to continue even if auth is lost; users are only redirected to login when there is no user *and* no active workout.

### Firestore data model

All user data lives under `users/{uid}`:

- `users/{uid}/workouts` — completed workout documents (exercises with sets/weights/reps, duration, timestamp)
- `users/{uid}/templates` — saved workout templates
- `users/{uid}/exercises` — user-created custom exercises
- The user doc itself holds profile fields (e.g. `profilePic`, a Storage download URL)

The built-in exercise library is a static JSON file, [src/components/Exercises.json](src/components/Exercises.json), merged with the user's custom `exercises` collection in the search modal. Security rules ([firestore.rules](firestore.rules)) restrict `users/{userId}` and every subcollection under it to the owning user. Workout `timestamp` is stored as an ISO string and `duration` as `"HH:MM:SS"`; readers should tolerate missing fields because older accounts may hold a placeholder workout doc created by an earlier registration flow.

Firebase is initialized once in [src/firebaseConfig.js](src/firebaseConfig.js) (exports `db`, `auth`, `storage`, `googleProvider`); auth flows (email + Google popup) live in [src/firebaseAuthServices.js](src/firebaseAuthServices.js).

### Pages vs components

`src/pages/` holds route-level screens; `src/components/` holds shared UI (navbars, modals, `ExerciseSet`, charts, calendar). Navigation is rendered per-page via `MobileNavbar`/`Navbar`, not in a shared layout.
