import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';
import { createAuthDialog, type AuthMode } from './auth-dialog';
import type { AppSession } from '../../services/app-session';

const firebaseMocks = vi.hoisted(() => ({
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signUpWithEmail: vi.fn(),
}));

vi.mock('../../services/firebase', () => firebaseMocks);

describe('authentication dialog', () => {
  let onAuthChange: ReturnType<typeof vi.fn<(mode: AuthMode | null) => void>>;
  let onAuthenticated: ReturnType<typeof vi.fn<(session: AppSession) => void>>;
  let onPendingChange: ReturnType<typeof vi.fn<(pending: boolean) => void>>;

  beforeEach(() => {
    document.body.replaceChildren();
    localStorage.clear();
    vi.clearAllMocks();
    onAuthChange = vi.fn<(mode: AuthMode | null) => void>();
    onAuthenticated = vi.fn<(session: AppSession) => void>();
    onPendingChange = vi.fn<(pending: boolean) => void>();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createDialog() {
    const dialog = createAuthDialog(onAuthChange, onAuthenticated, onPendingChange);
    document.body.append(dialog);
    return dialog;
  }

  function setLoginValues(email = 'player@example.com', password = 'Secure1!') {
    const emailInput = document.querySelector<HTMLInputElement>('#login-email')!;
    const passwordInput = document.querySelector<HTMLInputElement>('#login-password')!;
    emailInput.value = email;
    passwordInput.value = password;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    return document.querySelector<HTMLFormElement>('.auth-dialog__form--login')!;
  }

  function user(overrides: Partial<User> = {}): User {
    return {
      email: 'player@example.com',
      displayName: 'Player',
      photoURL: null,
      ...overrides,
    } as User;
  }

  it('opens and switches modes while synchronizing URL callbacks', () => {
    const dialog = createDialog();
    dialog.openAuth('register');

    expect(dialog.classList.contains('auth-dialog--open')).toBe(true);
    expect(onAuthChange).toHaveBeenLastCalledWith('register');
    expect(
      document
        .querySelector('.auth-dialog__form--register')
        ?.classList.contains('auth-dialog__form--hidden'),
    ).toBe(false);

    document.querySelector<HTMLButtonElement>('.auth-dialog__tab')!.click();
    expect(onAuthChange).toHaveBeenLastCalledWith('login');

    dialog.closeAuth();
    expect(dialog.classList.contains('auth-dialog--open')).toBe(false);
    expect(onAuthChange).toHaveBeenLastCalledWith(null);
  });

  it('does not call sign-in when the login form is invalid', async () => {
    const dialog = createDialog();
    const form = setLoginValues('bad-email', 'short');
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(firebaseMocks.signInWithEmail).not.toHaveBeenCalled();
    expect(document.querySelector('#login-email')?.getAttribute('aria-invalid')).toBe('true');
    expect(dialog.classList.contains('auth-dialog--open')).toBe(false);
  });

  it('submits valid credentials, creates a session, and closes on success', async () => {
    firebaseMocks.signInWithEmail.mockResolvedValue({ user: user() });
    const dialog = createDialog();
    const form = setLoginValues();
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(onAuthenticated).toHaveBeenCalledOnce());

    expect(firebaseMocks.signInWithEmail).toHaveBeenCalledWith('player@example.com', 'Secure1!');
    expect(onAuthenticated.mock.calls[0][0]).toMatchObject({
      email: 'player@example.com',
      displayName: 'Player',
    });
    expect(dialog.classList.contains('auth-dialog--open')).toBe(false);
    expect(onPendingChange).toHaveBeenNthCalledWith(1, true);
    expect(onPendingChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps the dialog open and restores controls when sign-in fails', async () => {
    firebaseMocks.signInWithEmail.mockRejectedValue(
      new FirebaseError('auth/invalid-credential', 'invalid credentials'),
    );
    const dialog = createDialog();
    dialog.openAuth('login');
    const form = setLoginValues();
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await vi.waitFor(() =>
      expect(document.querySelector('.auth-dialog__status')?.textContent).toContain(
        'email or password is incorrect',
      ),
    );

    expect(dialog.classList.contains('auth-dialog--open')).toBe(true);
    expect(document.querySelector<HTMLButtonElement>('.auth-dialog__google-btn')!.disabled).toBe(
      false,
    );
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it('validates registration fields and blocks invalid submissions', async () => {
    const dialog = createDialog();
    dialog.openAuth('register');
    const username = document.querySelector<HTMLInputElement>('#register-username')!;
    const email = document.querySelector<HTMLInputElement>('#register-email')!;
    const password = document.querySelector<HTMLInputElement>('#register-password')!;
    const confirm = document.querySelector<HTMLInputElement>('#register-confirm-password')!;
    username.value = 'lowercase';
    email.value = 'not-email';
    password.value = 'weak';
    confirm.value = 'different';
    const form = document.querySelector<HTMLFormElement>('.auth-dialog__form--register')!;
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(firebaseMocks.signUpWithEmail).not.toHaveBeenCalled();
    expect(username.getAttribute('aria-invalid')).toBe('true');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(password.getAttribute('aria-invalid')).toBe('true');
    expect(confirm.getAttribute('aria-invalid')).toBe('true');
    expect(dialog.classList.contains('auth-dialog--open')).toBe(true);
  });

  it('creates an account with a valid registration and username', async () => {
    firebaseMocks.signUpWithEmail.mockResolvedValue({ user: user({ displayName: 'CozyGamer' }) });
    const dialog = createDialog();
    dialog.openAuth('register');
    const username = document.querySelector<HTMLInputElement>('#register-username')!;
    const email = document.querySelector<HTMLInputElement>('#register-email')!;
    const password = document.querySelector<HTMLInputElement>('#register-password')!;
    const confirm = document.querySelector<HTMLInputElement>('#register-confirm-password')!;
    username.value = 'CozyGamer99';
    email.value = 'player@example.com';
    password.value = 'Secure1!';
    confirm.value = 'Secure1!';
    const form = document.querySelector<HTMLFormElement>('.auth-dialog__form--register')!;
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(firebaseMocks.signUpWithEmail).toHaveBeenCalledOnce());

    expect(firebaseMocks.signUpWithEmail).toHaveBeenCalledWith(
      'player@example.com',
      'Secure1!',
      'CozyGamer99',
    );
    expect(dialog.classList.contains('auth-dialog--open')).toBe(false);
  });

  it('supports Google sign-in and leaves the dialog open when the popup is canceled', async () => {
    firebaseMocks.signInWithGoogle.mockResolvedValueOnce({ user: user() });
    firebaseMocks.signInWithGoogle.mockRejectedValueOnce(
      new FirebaseError('auth/popup-closed-by-user', 'popup closed'),
    );
    const dialog = createDialog();
    dialog.openAuth('login');
    const googleButton = document.querySelector<HTMLButtonElement>('.auth-dialog__google-btn')!;
    googleButton.click();
    await vi.waitFor(() => expect(onAuthenticated).toHaveBeenCalledOnce());
    expect(dialog.classList.contains('auth-dialog--open')).toBe(false);

    dialog.openAuth('login');
    googleButton.click();
    await vi.waitFor(() =>
      expect(document.querySelector('.auth-dialog__status')?.textContent).toContain('canceled'),
    );
    expect(dialog.classList.contains('auth-dialog--open')).toBe(true);
    expect(googleButton.disabled).toBe(false);
  });

  it('locks controls and prevents closing while an auth request is pending', async () => {
    let resolveSignIn!: (value: { user: User }) => void;
    firebaseMocks.signInWithEmail.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      }),
    );
    const dialog = createDialog();
    dialog.openAuth('login');
    const form = setLoginValues();
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(onPendingChange).toHaveBeenCalledWith(true));

    expect(document.querySelector<HTMLInputElement>('#login-email')!.disabled).toBe(true);
    dialog.closeAuth();
    expect(dialog.classList.contains('auth-dialog--open')).toBe(true);

    resolveSignIn({ user: user() });
    await vi.waitFor(() => expect(dialog.classList.contains('auth-dialog--open')).toBe(false));
  });
});
