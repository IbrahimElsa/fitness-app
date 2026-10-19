/* eslint-disable no-restricted-globals */
// Service worker for offline support. react-scripts injects the precache
// manifest (self.__WB_MANIFEST) at build time because this file exists at
// src/service-worker.js. It is only active in production builds.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

clientsClaim();

// Precache the app shell: index.html, JS, CSS and the bundled exercise library.
precacheAndRoute(self.__WB_MANIFEST);

// App-shell routing: serve index.html for all navigation requests so the SPA
// loads offline on any route (e.g. /active-workout after a refresh).
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(({ request, url }) => {
  if (request.mode !== 'navigate') return false;
  if (url.pathname.startsWith('/_')) return false;
  if (url.pathname.match(fileExtensionRegexp)) return false;
  return true;
}, createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html'));

// Profile pictures live in Firebase Storage; keep a small cache so the avatar
// still renders offline.
registerRoute(
  ({ url }) => url.origin === 'https://firebasestorage.googleapis.com',
  new CacheFirst({
    cacheName: 'profile-images',
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

// Firestore and Auth traffic is handled by the Firebase SDK's own offline
// persistence, so it is deliberately not intercepted here.

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
