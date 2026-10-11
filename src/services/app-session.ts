import type { User } from 'firebase/auth';

export interface AppSession {
  displayName: string;
  email: string;
  authenticatedAt: number;
  avatarUrl?: string;
}

export type AppSessionRestoreResult =
  { status: 'valid'; session: AppSession } | { status: 'missing' | 'invalid' | 'expired' };

export const APP_SESSION_KEY = 'minigames:minigames-app-734e1:app-session';
export const APP_SESSION_LIFETIME_MS = 5 * 60 * 1000;

export function createAppSession(user: User): AppSession {
  const email = user.email?.trim();
  if (!email) {
    throw new Error('The authenticated account does not have an email address.');
  }

  const session: AppSession = {
    displayName: user.displayName?.trim() ?? '',
    email,
    authenticatedAt: Date.now(),
  };
  const avatarUrl = user.photoURL?.trim();
  if (avatarUrl) session.avatarUrl = avatarUrl;

  localStorage.setItem(APP_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function restoreAppSession(now = Date.now()): AppSessionRestoreResult {
  const serializedSession = localStorage.getItem(APP_SESSION_KEY);
  if (serializedSession === null) return { status: 'missing' };

  let value: unknown;
  try {
    value = JSON.parse(serializedSession);
  } catch {
    localStorage.removeItem(APP_SESSION_KEY);
    return { status: 'invalid' };
  }

  if (!isAppSession(value)) {
    localStorage.removeItem(APP_SESSION_KEY);
    return { status: 'invalid' };
  }

  if (value.authenticatedAt > now || now - value.authenticatedAt >= APP_SESSION_LIFETIME_MS) {
    localStorage.removeItem(APP_SESSION_KEY);
    return { status: 'expired' };
  }

  return { status: 'valid', session: value };
}

export function clearAppSession(): void {
  localStorage.removeItem(APP_SESSION_KEY);
}

function isAppSession(value: unknown): value is AppSession {
  if (typeof value !== 'object' || value === null) return false;

  const session = value as Record<string, unknown>;
  const allowedKeys = new Set(['displayName', 'email', 'authenticatedAt', 'avatarUrl']);
  return (
    Object.keys(session).every((key) => allowedKeys.has(key)) &&
    typeof session.displayName === 'string' &&
    session.displayName === session.displayName.trim() &&
    typeof session.email === 'string' &&
    session.email.length > 0 &&
    session.email === session.email.trim() &&
    typeof session.authenticatedAt === 'number' &&
    Number.isFinite(session.authenticatedAt) &&
    session.authenticatedAt >= 0 &&
    (session.avatarUrl === undefined || typeof session.avatarUrl === 'string')
  );
}
