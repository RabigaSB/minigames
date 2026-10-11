import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import {
  APP_SESSION_KEY,
  APP_SESSION_LIFETIME_MS,
  clearAppSession,
  createAppSession,
  restoreAppSession,
} from './app-session';

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe('app session persistence', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
    vi.stubGlobal('localStorage', storage);
    vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('stores only the app profile fields under the namespaced key', () => {
    const session = createAppSession({
      email: 'player@example.com',
      displayName: ' Player ',
      photoURL: ' https://example.com/avatar.png ',
    } as User);

    expect(session).toEqual({
      displayName: 'Player',
      email: 'player@example.com',
      authenticatedAt: 1_800_000_000_000,
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(storage.getItem(APP_SESSION_KEY)).toBe(JSON.stringify(session));
    expect(storage.length).toBe(1);
  });

  it('omits an unavailable avatar and allows an empty profile name', () => {
    const session = createAppSession({
      email: 'player@example.com',
      displayName: null,
      photoURL: null,
    } as User);

    expect(session).toEqual({
      displayName: '',
      email: 'player@example.com',
      authenticatedAt: 1_800_000_000_000,
    });
    expect(session).not.toHaveProperty('avatarUrl');
  });

  it('rejects users without an email', () => {
    expect(() =>
      createAppSession({ email: null, displayName: 'Player', photoURL: null } as User),
    ).toThrow('The authenticated account does not have an email address.');
    expect(storage.getItem(APP_SESSION_KEY)).toBeNull();
  });

  it('restores a valid session without extending its timestamp', () => {
    const session = {
      displayName: 'Player',
      email: 'player@example.com',
      authenticatedAt: 1_800_000_000_000 - 1_000,
    };
    storage.setItem(APP_SESSION_KEY, JSON.stringify(session));

    expect(restoreAppSession()).toEqual({ status: 'valid', session });
    expect(JSON.parse(storage.getItem(APP_SESSION_KEY) ?? '{}').authenticatedAt).toBe(
      session.authenticatedAt,
    );
  });

  it('returns missing when no stored session exists', () => {
    expect(restoreAppSession()).toEqual({ status: 'missing' });
  });

  it.each(['{invalid', JSON.stringify({ email: 'player@example.com' }), JSON.stringify({
    displayName: 'Player',
    email: 'player@example.com',
    authenticatedAt: 'yesterday',
  }), JSON.stringify({
    displayName: 'Player',
    email: 'player@example.com',
    authenticatedAt: 1_800_000_000_000,
    password: 'must-not-be-stored',
  })])('removes invalid stored session data (%s)', (value) => {
    storage.setItem(APP_SESSION_KEY, value);

    expect(restoreAppSession()).toEqual({ status: 'invalid' });
    expect(storage.getItem(APP_SESSION_KEY)).toBeNull();
  });

  it('expires a session at the fixed lifetime boundary', () => {
    storage.setItem(
      APP_SESSION_KEY,
      JSON.stringify({
        displayName: 'Player',
        email: 'player@example.com',
        authenticatedAt: Date.now() - APP_SESSION_LIFETIME_MS,
      }),
    );

    expect(restoreAppSession()).toEqual({ status: 'expired' });
    expect(storage.getItem(APP_SESSION_KEY)).toBeNull();
  });

  it('clears only the app session key', () => {
    storage.setItem(APP_SESSION_KEY, 'session');
    storage.setItem('unrelated-setting', 'keep');

    clearAppSession();

    expect(storage.getItem(APP_SESSION_KEY)).toBeNull();
    expect(storage.getItem('unrelated-setting')).toBe('keep');
  });
});
