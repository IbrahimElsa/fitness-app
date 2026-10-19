import { render, screen } from '@testing-library/react';
import App from './App';

// Firebase's browser SDK can't initialise under Jest/jsdom (the Auth package
// pulls in undici), so the SDK surface used at render time is mocked. Pages
// receive an anonymous user and render their signed-out state.
jest.mock('./firebaseConfig', () => ({ db: {}, auth: {}, storage: {}, googleProvider: {} }));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return () => {};
  }),
  signOut: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn(),
  reauthenticateWithPopup: jest.fn(),
  deleteUser: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  getDocs: jest.fn(() => Promise.resolve({ docs: [], empty: true, size: 0 })),
  setDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  onSnapshot: jest.fn(() => () => {}),
}));
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

test('renders the dashboard for a signed-out visitor', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /log in/i }).length).toBeGreaterThan(0);
});
