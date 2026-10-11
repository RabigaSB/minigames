import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APP_SESSION_KEY,
  APP_SESSION_LIFETIME_MS,
  type AppSession,
} from '../../services/app-session';
import { createHeader } from './header';

const firebaseMocks = vi.hoisted(() => ({
  logOut: vi.fn(),
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signUpWithEmail: vi.fn(),
}));
vi.mock('../../services/firebase', () => firebaseMocks);
vi.mock('../utils/snackbar', () => ({ showSnackbar: vi.fn() }));

function storeSession(session: AppSession): void {
  localStorage.setItem(APP_SESSION_KEY, JSON.stringify(session));
}

function validSession(overrides: Partial<AppSession> = {}): AppSession {
  return {
    displayName: 'Player Name',
    email: 'player@example.com',
    authenticatedAt: Date.now(),
    ...overrides,
  };
}

describe('header session state', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    localStorage.clear();
    vi.clearAllMocks();
    firebaseMocks.logOut.mockResolvedValue(undefined);
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('restores the profile and exposes desktop logout for a valid app session', () => {
    storeSession(validSession());
    const header = createHeader();
    document.body.append(header);

    expect(header.querySelector('.header__user')?.textContent).toBe('Player Name');
    expect((header.querySelector('.header__profile') as HTMLElement).hidden).toBe(false);
    expect((header.querySelector('.header__logout') as HTMLButtonElement).hidden).toBe(false);
    expect(header.querySelector('.header__avatar')?.textContent).toBe('PN');
    expect(header.querySelector('.mobile-menu__logout')?.hasAttribute('hidden')).toBe(false);
    expect(header.getAppSession()).toEqual(expect.objectContaining({ email: 'player@example.com' }));
  });

  it('uses the email local part and generic initials fallbacks for a missing display name', () => {
    storeSession(validSession({ displayName: '', email: 'player@example.com' }));
    const header = createHeader();

    expect(header.querySelector('.header__user')?.textContent).toBe('player');
    expect(header.querySelector('.header__avatar')?.textContent).toBe('P');
  });

  it('clears only the app session and switches to guest mode immediately on logout', async () => {
    storeSession(validSession());
    localStorage.setItem('unrelated', 'preserved');
    const header = createHeader();
    document.body.append(header);
    const logout = header.querySelector<HTMLButtonElement>('.header__logout')!;
    logout.click();

    expect(header.querySelector('.header__profile')?.hasAttribute('hidden')).toBe(true);
    expect(header.querySelector('.header__sign-in')?.hasAttribute('hidden')).toBe(false);
    expect(header.getAppSession()).toBeNull();
    expect(localStorage.getItem(APP_SESSION_KEY)).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('preserved');
    await vi.waitFor(() => expect(firebaseMocks.logOut).toHaveBeenCalledOnce());
  });

  it('stays in guest mode and reports sign-out failures', async () => {
    storeSession(validSession());
    firebaseMocks.logOut.mockRejectedValue(new Error('Firebase offline'));
    const header = createHeader();
    document.body.append(header);
    header.querySelector<HTMLButtonElement>('.header__logout')!.click();

    await vi.waitFor(() => expect(firebaseMocks.logOut).toHaveBeenCalledOnce());
    expect(header.getAppSession()).toBeNull();
    expect(header.querySelector('.header__sign-in')?.hasAttribute('hidden')).toBe(false);
  });

  it('expires the fixed session timer and signs out to guest mode', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_800_000_000_000);
    storeSession(validSession({ authenticatedAt: Date.now() }));
    const header = createHeader();
    document.body.append(header);

    await vi.advanceTimersByTimeAsync(APP_SESSION_LIFETIME_MS);

    expect(header.getAppSession()).toBeNull();
    expect(header.querySelector('.header__sign-in')?.hasAttribute('hidden')).toBe(false);
    expect(localStorage.getItem(APP_SESSION_KEY)).toBeNull();
    expect(firebaseMocks.logOut).toHaveBeenCalledOnce();
  });

  it('clears malformed session data and does not restore Firebase identity alone', () => {
    localStorage.setItem(APP_SESSION_KEY, '{broken');
    const header = createHeader();

    expect(header.getAppSession()).toBeNull();
    expect(header.querySelector('.header__sign-in')?.hasAttribute('hidden')).toBe(false);
    expect(localStorage.getItem(APP_SESSION_KEY)).toBeNull();
    expect(firebaseMocks.logOut).toHaveBeenCalledOnce();
  });
});
