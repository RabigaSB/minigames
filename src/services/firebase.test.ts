import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  auth,
  googleProvider,
  logOut,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  updateUserProfile,
} from './firebase';

const sdk = vi.hoisted(() => ({
  initializeApp: vi.fn(() => ({ name: 'app' })),
  getAuth: vi.fn(() => ({ currentUser: { uid: 'user-1' } })),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  setCustomParameters: vi.fn(),
}));

vi.mock('firebase/app', () => ({ initializeApp: sdk.initializeApp }));
vi.mock('firebase/auth', () => ({
  getAuth: sdk.getAuth,
  signInWithEmailAndPassword: sdk.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: sdk.createUserWithEmailAndPassword,
  signInWithPopup: sdk.signInWithPopup,
  signOut: sdk.signOut,
  updateProfile: sdk.updateProfile,
  GoogleAuthProvider: class {
    setCustomParameters = sdk.setCustomParameters;
  },
}));

describe('Firebase service wrappers', () => {
  beforeEach(() => {
    sdk.signInWithEmailAndPassword.mockClear();
    sdk.createUserWithEmailAndPassword.mockClear();
    sdk.signInWithPopup.mockClear();
    sdk.signOut.mockClear();
    sdk.updateProfile.mockClear();
  });

  it('initializes Firebase auth and configures Google account selection', () => {
    expect(auth).toMatchObject({ currentUser: { uid: 'user-1' } });
    expect(googleProvider).toBeDefined();
  });

  it('delegates email and Google sign-ins to Firebase Auth', async () => {
    const credential = { user: { uid: 'user-1' } };
    sdk.signInWithEmailAndPassword.mockResolvedValue(credential);
    sdk.signInWithPopup.mockResolvedValue(credential);

    await expect(signInWithEmail('user@example.com', 'secret')).resolves.toBe(credential);
    await expect(signInWithGoogle()).resolves.toBe(credential);
    expect(sdk.signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'user@example.com',
      'secret',
    );
    expect(sdk.signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
  });

  it('sets the registration display name before returning its credential', async () => {
    const user = { uid: 'new-user' };
    const credential = { user };
    sdk.createUserWithEmailAndPassword.mockResolvedValue(credential);
    sdk.updateProfile.mockResolvedValue(undefined);

    await expect(signUpWithEmail('new@example.com', 'secret', 'CozyGamer')).resolves.toBe(
      credential,
    );
    expect(sdk.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'new@example.com',
      'secret',
    );
    expect(sdk.updateProfile).toHaveBeenCalledWith(user, { displayName: 'CozyGamer' });
  });

  it('delegates sign-out and profile updates using current Firebase identity', async () => {
    await logOut();
    await updateUserProfile('Player', 'https://example.com/avatar.png');

    expect(sdk.signOut).toHaveBeenCalledWith(auth);
    expect(sdk.updateProfile).toHaveBeenCalledWith(auth.currentUser, {
      displayName: 'Player',
      photoURL: 'https://example.com/avatar.png',
    });
  });
});
