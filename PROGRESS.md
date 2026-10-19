# Improvement Progress

Tracking the findings from the full-app review (October 2026) and the offline-first pivot.
Status: `[x]` done, `[ ]` open, `[~]` partially done.

> **Branch note.** The review was done against `fixing-timer`. The work below landed on
> `offline-first`, branched from `master` after it was pulled on 2026-10-18. `fixing-timer`
> still holds unmerged improvements to the active-workout flow (per-exercise `instanceId`s so
> duplicate exercises don't share sets, a "previous sets" column in `ExerciseSet`, a
> calendar-day filter in History, and timer resync on `visibilitychange`). Merging it will
> conflict in `ActiveWorkout.js`, `TimerModal.js`, `Templates.js`, `History.js` and the auth
> pages; resolve in favour of the offline-first write pattern (writes not awaited) and keep
> the `fixing-timer` features.

## Phase 1: Critical fixes

- [x] Dark mode toggle only half works (Tailwind `darkMode` defaulted to `media`, so `dark:` utilities followed the OS, not the in-app toggle)
- [x] Deploy workflow triggered on `main` but the default branch is `master`
- [x] `CI=true` build failed on ESLint warnings (unused imports)
- [x] `firebase.json` only deployed hosting, so `firestore.rules` was never deployed
- [x] Rules let any signed-in user create a `users/{uid}` doc for any uid; templates and exercises subcollections had no rules at all on `master`
- [x] Google sign-in never created the `users/{uid}` doc (profile picture upload threw, "Member Since" was N/A)
- [x] Registration wrote a placeholder `{ initialized: true }` workout that crashed History and skewed Statistics; readers now skip docs without exercises
- [x] Rest timer never signalled completion (now vibrates, beeps and notifies); notification permission is requested when the timer is opened, not on page mount
- [x] Finish workout: double-tap guard, visible error when logged out, empty exercises dropped, at least one set required, auto-generated doc id instead of `workout N` (which needed a full collection read)
- [x] Template delete asks for confirmation
- [x] Auth guards: `RequireAuth` wraps Profile, History, Templates, EditTemplate
- [x] Login honours `returnPath`; Login/Register show readable auth errors instead of raw Firebase strings
- [x] Account deletion reauthenticates Google users via popup and removes the Storage profile picture
- [x] Test suite runs (Firebase SDK mocked) and asserts the dashboard renders

## Phase 2: Offline-first pivot

- [x] Firestore persistent local cache (multi-tab) in `firebaseConfig.js`
- [x] Service worker precaching the app shell (Workbox via `src/service-worker.js`, registered in production)
- [x] Offline indicator (`OfflineBanner`)
- [x] Writes no longer block on server acknowledgement (finish workout, save/delete template, add custom exercise)
- [x] Hand-rolled localStorage caches removed (`templates`, `workoutTemplates`, `recentWorkouts`, `gymVisits`, `workoutData_*`); logout clears the legacy keys
- [x] Statistics no longer lags five minutes behind
- [x] FinishedWorkout renders from navigation state (instant, works offline) with a cache fetch as fallback
- [x] PWA manifest and `index.html` metadata (name, description, theme colour); hosting headers for the service worker and hashed assets
- [x] Profile picture upload fails gracefully offline and uses `setDoc` + merge
- [ ] Test the full offline flow on a device: install as PWA, airplane mode, start/finish workout, reconnect and confirm sync
- [ ] Decide whether to keep Firestore persistence across logout (`clearIndexedDbPersistence` requires `terminate()` first; currently the cache is left in place, which is safe because paths are per-uid)

## Phase 3: Performance and data

- [ ] Home, Statistics and Profile each fetch the whole workouts collection; use `getCountFromServer` / `limit(1)` or a shared store
- [ ] Code-split heavy pages (Statistics with recharts) with `React.lazy`. Bundle is 386 kB gzipped after adding Firestore persistence (+23 kB)
- [ ] Remove unused dependencies (class-variance-authority, clsx, tailwind-merge, tailwindcss-animate, react-swipeable, react-vertical-timeline-component, date-fns)
- [ ] Drop Font Awesome in favour of lucide-react (used for two icons)
- [ ] History month filter only covers loaded pages
- [ ] Store duration as seconds and timestamps as Firestore Timestamps
- [ ] Update caniuse-lite (`npx update-browserslist-db@latest`)

## Phase 4: UI consistency, UX and housekeeping

- [ ] Workout flow pages (ActiveWorkout, TimerModal, SearchExercisesModal) still use raw gray/blue classes instead of `themeCss`
- [~] Non-existent Tailwind classes: fixed `left-4.5`, `left-5.5`, `bg-slate-750` and the interpolated `hover:${...}`; `z-1` in EditTemplate remains
- [~] Custom exercise form: empty names are now rejected and category/muscle default to "Other"; still only appears when search is empty, and there is no edit/delete
- [~] `alert()` remains in EditTemplate validation; `console.log` calls removed from Login/Register/History
- [~] Loading/disabled state added to Login and FINISH; Register and Save Template still lack one
- [~] Accessibility: CancelModal has `role="dialog"`, Escape and backdrop close; other modals and clickable divs unchanged
- [ ] Weight unit hardcoded to lb
- [x] `.firebase/` hosting cache untracked and ignored
- [x] CLAUDE.md added to `master` (was only on `fixing-timer`) and updated for the offline-first design

## Changelog

### 2026-10-18 (branch `offline-first`)

- Offline-first foundation: Firestore persistent cache, Workbox service worker, offline banner, non-blocking writes, localStorage caches removed.
- Critical fixes: Tailwind class-based dark mode, deploy workflow branch, Firestore rules deployed and tightened, Google user doc creation, timer completion cue, finish-workout guards, template delete confirmation, route guards, readable auth errors, working test suite.
- Verified: `npx eslint src` clean, `CI=true npm run build` compiles, `npm test` passes, `build/service-worker.js` emitted with the precache manifest.
