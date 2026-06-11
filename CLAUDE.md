# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run dev server (Create React App / react-scripts)
- `npm run build` — production build to `build/`
- `npm test` — run tests in watch mode (Jest via react-scripts)
- `npm test -- --watchAll=false App.test.js` — run a single test file once
- `firebase deploy --only hosting` — deploy (hosting serves the `build/` directory)

## Architecture

Mobile-first React 18 SPA (plain JavaScript, no TypeScript) for gym workout tracking, backed by Firebase (Auth, Firestore, Storage). Routing via react-router-dom v6, styling via Tailwind CSS with dark mode supported.

### Provider hierarchy

[App.js](src/App.js) nests three context providers around the router, all consumed via hooks:

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

The built-in exercise library is a static JSON file, [src/components/Exercises.json](src/components/Exercises.json), merged with the user's custom `exercises` collection in the search modal. Security rules ([firestore.rules](firestore.rules)) restrict access to the owning user; note they only cover `users/{userId}` and the `workouts` subcollection.

Firebase is initialized once in [src/firebaseConfig.js](src/firebaseConfig.js) (exports `db`, `auth`, `storage`, `googleProvider`); auth flows (email + Google popup) live in [src/firebaseAuthServices.js](src/firebaseAuthServices.js).

### Pages vs components

`src/pages/` holds route-level screens; `src/components/` holds shared UI (navbars, modals, `ExerciseSet`, charts, calendar). Navigation is rendered per-page via `MobileNavbar`/`Navbar`, not in a shared layout.
