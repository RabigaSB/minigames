import { createElement } from '../create-element';
import { FirebaseError } from 'firebase/app';
import { createAppSession, type AppSession } from '../../services/app-session';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../../services/firebase';
import { showSnackbar } from '../utils/snackbar';

export type AuthMode = 'login' | 'register';

export interface AuthDialog extends HTMLElement {
  openAuth(mode: AuthMode, syncUrl?: boolean): void;
  closeAuth(syncUrl?: boolean): void;
}

export function createAuthDialog(
  onAuthChange: (mode: AuthMode | null) => void = () => undefined,
  onAuthenticated: (session: AppSession) => void = () => undefined,
  onPendingChange: (pending: boolean) => void = () => undefined,
): AuthDialog {
  const createPasswordToggle = (input: HTMLInputElement): HTMLButtonElement => {
    const toggle = createElement('button', 'auth-dialog__eye-icon') as HTMLButtonElement;
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Show password');
    toggle.setAttribute('aria-controls', input.id);
    toggle.setAttribute('aria-pressed', 'false');
    input.classList.add('auth-dialog__input--with-toggle');
    toggle.addEventListener('click', () => {
      const isVisible = input.type === 'password';
      input.type = isVisible ? 'text' : 'password';
      toggle.classList.toggle('auth-dialog__eye-icon--visible', isVisible);
      toggle.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
      toggle.setAttribute('aria-pressed', String(isVisible));
    });
    return toggle;
  };

  const authDialog = Object.assign(createElement('div', 'auth-dialog'), {
    openAuth: (mode: AuthMode, syncUrl?: boolean): void => {
      void mode;
      void syncUrl;
    },
    closeAuth: (syncUrl?: boolean): void => void syncUrl,
  });

  const content = createElement('div', 'auth-dialog__content');
  const closeButton = createElement('button', 'auth-dialog__close', '×');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close authentication dialog');

  const tabsContainer = createElement('div', 'auth-dialog__tabs');
  const loginTab = createElement('button', 'auth-dialog__tab auth-dialog__tab--active', 'Login');
  loginTab.type = 'button';
  const registerTab = createElement('button', 'auth-dialog__tab', 'Register');
  registerTab.type = 'button';
  tabsContainer.append(loginTab, registerTab);
  const authStatus = createElement('p', 'auth-dialog__status') as HTMLParagraphElement;
  authStatus.setAttribute('role', 'status');
  authStatus.setAttribute('aria-live', 'polite');

  const loginForm = createElement('form', 'auth-dialog__form auth-dialog__form--login');

  const loginTitle = createElement('h2', 'auth-dialog__title', 'Welcome Back!');
  const loginSubtitle = createElement(
    'p',
    'auth-dialog__subtitle',
    'Sign in to resume your games and progress.',
  );

  const loginEmailGroup = createElement('div', 'auth-dialog__input-group');
  const loginEmailLabel = createElement('label', 'auth-dialog__label', 'Email Address');
  const loginEmailWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const loginEmailIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--mail');
  const loginEmailInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  loginEmailInput.id = 'login-email';
  loginEmailInput.type = 'email';
  loginEmailInput.required = true;
  loginEmailInput.placeholder = 'e.g. alex@minigames.com';
  loginEmailLabel.htmlFor = loginEmailInput.id;
  loginEmailWrapper.append(loginEmailIcon, loginEmailInput);
  loginEmailGroup.append(loginEmailLabel, loginEmailWrapper);

  const loginPasswordGroup = createElement('div', 'auth-dialog__input-group');
  const loginPasswordLabel = createElement('label', 'auth-dialog__label', 'Password');
  const loginPasswordWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const loginPasswordIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const loginPasswordInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  loginPasswordInput.id = 'login-password';
  loginPasswordInput.type = 'password';
  loginPasswordInput.required = true;
  loginPasswordInput.placeholder = '••••••••';
  loginPasswordLabel.htmlFor = loginPasswordInput.id;
  const loginPasswordToggle = createPasswordToggle(loginPasswordInput);
  loginPasswordWrapper.append(loginPasswordIcon, loginPasswordInput, loginPasswordToggle);
  loginPasswordGroup.append(loginPasswordLabel, loginPasswordWrapper);

  const forgotPasswordLink = createElement('a', 'auth-dialog__forgot-link', 'Forgot Password?');
  forgotPasswordLink.href = '#';

  const loginSubmitButton = createElement('button', 'auth-dialog__submit-btn', 'Login');
  loginSubmitButton.type = 'submit';
  loginSubmitButton.disabled = true;

  const loginDivider = createElement('div', 'auth-dialog__divider', 'OR');

  const googleLoginBtn = createElement('button', 'auth-dialog__google-btn', 'Continue with Google');
  googleLoginBtn.type = 'button';

  const switchRegisterText = createElement(
    'p',
    'auth-dialog switch-text',
    "Don't have an account? ",
  );
  const switchRegisterLink = createElement('a', 'auth-dialog__switch-link', 'Register');
  switchRegisterLink.href = '#';
  switchRegisterText.append(switchRegisterLink);

  loginForm.append(
    loginTitle,
    loginSubtitle,
    loginEmailGroup,
    loginPasswordGroup,
    forgotPasswordLink,
    loginSubmitButton,
    loginDivider,
    googleLoginBtn,
    switchRegisterText,
  );

  const registerForm = createElement(
    'form',
    'auth-dialog__form auth-dialog__form--register auth-dialog__form--hidden',
  );

  const registerTitle = createElement('h2', 'auth-dialog__title', 'Create Account');
  const registerSubtitle = createElement(
    'p',
    'auth-dialog__subtitle',
    'Join MiniGames to track your score & streak.',
  );

  const regUserGroup = createElement('div', 'auth-dialog__input-group');
  const regUserLabel = createElement('label', 'auth-dialog__label', 'Username');
  const regUserWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regUserIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--person');
  const regUserInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regUserInput.id = 'register-username';
  regUserInput.type = 'text';
  regUserInput.required = true;
  regUserInput.placeholder = 'e.g. CozyGamer99';
  regUserLabel.htmlFor = regUserInput.id;
  regUserWrapper.append(regUserIcon, regUserInput);
  regUserGroup.append(regUserLabel, regUserWrapper);

  const regEmailGroup = createElement('div', 'auth-dialog__input-group');
  const regEmailLabel = createElement('label', 'auth-dialog__label', 'Email Address');
  const regEmailWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regEmailIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--mail');
  const regEmailInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regEmailInput.id = 'register-email';
  regEmailInput.type = 'email';
  regEmailInput.required = true;
  regEmailInput.placeholder = 'your.email@domain.com';
  regEmailLabel.htmlFor = regEmailInput.id;
  regEmailWrapper.append(regEmailIcon, regEmailInput);
  regEmailGroup.append(regEmailLabel, regEmailWrapper);

  const regPassGroup = createElement('div', 'auth-dialog__input-group');
  const regPassLabel = createElement('label', 'auth-dialog__label', 'Password');
  const regPassWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regPassIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const regPassInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regPassInput.id = 'register-password';
  regPassInput.type = 'password';
  regPassInput.required = true;
  regPassInput.placeholder = 'Min. 6 characters';
  regPassLabel.htmlFor = regPassInput.id;
  const regPassToggle = createPasswordToggle(regPassInput);
  regPassWrapper.append(regPassIcon, regPassInput, regPassToggle);
  regPassGroup.append(regPassLabel, regPassWrapper);

  const regConfirmGroup = createElement('div', 'auth-dialog__input-group');
  const regConfirmLabel = createElement('label', 'auth-dialog__label', 'Confirm Password');
  const regConfirmWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regConfirmIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const regConfirmInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regConfirmInput.id = 'register-confirm-password';
  regConfirmInput.type = 'password';
  regConfirmInput.required = true;
  regConfirmInput.placeholder = 'Repeat your password';
  regConfirmLabel.htmlFor = regConfirmInput.id;
  const regConfirmToggle = createPasswordToggle(regConfirmInput);
  regConfirmWrapper.append(regConfirmIcon, regConfirmInput, regConfirmToggle);
  regConfirmGroup.append(regConfirmLabel, regConfirmWrapper);

  const registerSubmitButton = createElement('button', 'auth-dialog__submit-btn', 'Create Account');
  registerSubmitButton.type = 'submit';
  registerSubmitButton.disabled = true;

  const registerDivider = createElement('div', 'auth-dialog__divider', 'OR');

  const googleRegisterBtn = createElement(
    'button',
    'auth-dialog__google-btn',
    'Sign up with Google',
  );
  googleRegisterBtn.type = 'button';

  const switchLoginText = createElement(
    'p',
    'auth-dialog__switch-text',
    'Already have an account? ',
  );
  const switchLoginLink = createElement('a', 'auth-dialog__switch-link', 'Login');
  switchLoginLink.href = '#';
  switchLoginText.append(switchLoginLink);

  registerForm.append(
    registerTitle,
    registerSubtitle,
    regUserGroup,
    regEmailGroup,
    regPassGroup,
    regConfirmGroup,
    registerSubmitButton,
    registerDivider,
    googleRegisterBtn,
    switchLoginText,
  );

  content.append(closeButton, tabsContainer, authStatus, loginForm, registerForm);
  authDialog.append(content);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernamePattern = /^[A-Z][A-Za-z0-9]{1,29}$/;
  const uppercasePattern = /[A-Z]/;
  const digitPattern = /\d/;
  const specialCharacterPattern = /[^A-Za-z0-9]/;
  const printableAsciiPattern = /^[\x21-\x7E]+$/;

  const errorElements = new Map<HTMLInputElement, HTMLParagraphElement>();
  const createErrorElement = (input: HTMLInputElement, group: HTMLDivElement): void => {
    const error = createElement('p', 'auth-dialog__error') as HTMLParagraphElement;
    error.id = `${input.id}-error`;
    error.setAttribute('aria-live', 'polite');
    input.setAttribute('aria-describedby', error.id);
    input.setAttribute('aria-invalid', 'false');
    group.append(error);
    errorElements.set(input, error);
  };

  createErrorElement(loginEmailInput, loginEmailGroup);
  createErrorElement(loginPasswordInput, loginPasswordGroup);
  createErrorElement(regUserInput, regUserGroup);
  createErrorElement(regEmailInput, regEmailGroup);
  createErrorElement(regPassInput, regPassGroup);
  createErrorElement(regConfirmInput, regConfirmGroup);
  const touchedFields = new Set<HTMLInputElement>();

  const setFieldError = (input: HTMLInputElement, message: string): void => {
    const error = errorElements.get(input);
    if (!error) return;
    error.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    input.classList.toggle('auth-dialog__input--invalid', Boolean(message));
  };

  const validateEmail = (input: HTMLInputElement): string => {
    const value = input.value.trim();
    if (!value) return 'Email is required.';
    if (!emailPattern.test(value)) return 'Enter a valid email address.';
    return '';
  };

  const validateLoginPassword = (): string => {
    if (!loginPasswordInput.value) return 'Password is required.';
    if (loginPasswordInput.value.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return '';
  };

  const validateUsername = (): string => {
    const value = regUserInput.value;
    if (!value) return 'Username is required.';
    if (!usernamePattern.test(value)) {
      return 'Use 2-30 characters, starting with an uppercase English letter; letters and digits only.';
    }
    return '';
  };

  const validateRegisterPassword = (): string => {
    const value = regPassInput.value;
    if (!value) return 'Password is required.';
    if (value.length < 6) return 'Password must be at least 6 characters long.';
    if (
      !printableAsciiPattern.test(value) ||
      !uppercasePattern.test(value) ||
      !digitPattern.test(value) ||
      !specialCharacterPattern.test(value)
    ) {
      return 'Use English letters, at least one uppercase letter, one digit, and one special character.';
    }
    return '';
  };

  const validateConfirmPassword = (): string => {
    if (!regConfirmInput.value) return 'Please confirm your password.';
    if (regConfirmInput.value !== regPassInput.value) return 'Passwords do not match.';
    return '';
  };

  const updateLoginValidation = (): void => {
    const emailError = validateEmail(loginEmailInput);
    const passwordError = validateLoginPassword();
    setFieldError(loginEmailInput, touchedFields.has(loginEmailInput) ? emailError : '');
    setFieldError(loginPasswordInput, touchedFields.has(loginPasswordInput) ? passwordError : '');
    loginSubmitButton.disabled = Boolean(emailError || passwordError);
  };

  const updateRegisterValidation = (): void => {
    const usernameError = validateUsername();
    const emailError = validateEmail(regEmailInput);
    const passwordError = validateRegisterPassword();
    const confirmError = validateConfirmPassword();
    setFieldError(regUserInput, touchedFields.has(regUserInput) ? usernameError : '');
    setFieldError(regEmailInput, touchedFields.has(regEmailInput) ? emailError : '');
    setFieldError(regPassInput, touchedFields.has(regPassInput) ? passwordError : '');
    setFieldError(regConfirmInput, touchedFields.has(regConfirmInput) ? confirmError : '');
    registerSubmitButton.disabled = Boolean(
      usernameError || emailError || passwordError || confirmError,
    );
  };

  const resetForms = (): void => {
    loginForm.reset();
    registerForm.reset();
    for (const [input, toggle] of [
      [loginPasswordInput, loginPasswordToggle],
      [regPassInput, regPassToggle],
      [regConfirmInput, regConfirmToggle],
    ] as const) {
      input.type = 'password';
      toggle.classList.remove('auth-dialog__eye-icon--visible');
      toggle.setAttribute('aria-label', 'Show password');
      toggle.setAttribute('aria-pressed', 'false');
    }
    touchedFields.clear();
    for (const input of errorElements.keys()) {
      setFieldError(input, '');
    }
    updateLoginValidation();
    updateRegisterValidation();
  };

  const addValidationListeners = (
    input: HTMLInputElement,
    validate: () => void,
    revalidate?: HTMLInputElement,
  ): void => {
    const handleValidation = (): void => {
      touchedFields.add(input);
      if (revalidate) touchedFields.add(revalidate);
      validate();
    };
    input.addEventListener('input', handleValidation);
    input.addEventListener('change', handleValidation);
    input.addEventListener('blur', handleValidation);
  };

  addValidationListeners(loginEmailInput, updateLoginValidation);
  addValidationListeners(loginPasswordInput, updateLoginValidation);
  addValidationListeners(regUserInput, updateRegisterValidation);
  addValidationListeners(regEmailInput, updateRegisterValidation);
  addValidationListeners(regPassInput, updateRegisterValidation, regConfirmInput);
  addValidationListeners(regConfirmInput, updateRegisterValidation);

  updateLoginValidation();
  updateRegisterValidation();

  let currentMode: AuthMode = 'login';
  let isPending = false;
  const priorDisabledStates = new Map<HTMLButtonElement | HTMLInputElement, boolean>();
  const setPending = (pending: boolean, message = ''): void => {
    isPending = pending;
    authDialog.setAttribute('aria-busy', String(pending));
    content.classList.toggle('auth-dialog__content--pending', pending);
    authStatus.textContent = message;
    authStatus.classList.toggle('auth-dialog__status--error', false);
    authStatus.setAttribute('role', 'status');

    if (pending) {
      priorDisabledStates.clear();
      content.querySelectorAll('button, input').forEach((element) => {
        const control = element as HTMLButtonElement | HTMLInputElement;
        priorDisabledStates.set(control, control.disabled);
        control.disabled = true;
      });
      onPendingChange(true);
      return;
    }

    for (const [control, wasDisabled] of priorDisabledStates) {
      control.disabled = wasDisabled;
    }
    priorDisabledStates.clear();
    loginSubmitButton.textContent = 'Login';
    registerSubmitButton.textContent = 'Create Account';
    updateLoginValidation();
    updateRegisterValidation();
    onPendingChange(false);
  };

  const authErrorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was canceled.',
    'auth/popup-blocked': 'Allow pop-ups for this site and try again.',
    'auth/cancelled-popup-request': 'Another sign-in window is already open.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/user-not-found': 'No account was found with this email address.',
    'auth/wrong-password': 'The email or password is incorrect.',
    'auth/weak-password': 'Choose a stronger password and try again.',
  };
  const getAuthErrorMessage = (error: unknown): string => {
    if (error instanceof FirebaseError) {
      return authErrorMessages[error.code] ?? 'Authentication failed. Please try again.';
    }
    return 'Authentication failed. Please try again.';
  };

  const handleAuthentication = async (event: SubmitEvent, mode: AuthMode): Promise<void> => {
    event.preventDefault();
    if (isPending) return;

    const inputs =
      mode === 'login'
        ? [loginEmailInput, loginPasswordInput]
        : [regUserInput, regEmailInput, regPassInput, regConfirmInput];
    for (const input of inputs) touchedFields.add(input);
    if (mode === 'login') {
      updateLoginValidation();
      if (validateEmail(loginEmailInput) || validateLoginPassword()) return;
    } else {
      updateRegisterValidation();
      if (
        validateUsername() ||
        validateEmail(regEmailInput) ||
        validateRegisterPassword() ||
        validateConfirmPassword()
      ) {
        return;
      }
    }

    const pendingMessage = mode === 'login' ? 'Signing in...' : 'Creating your account...';
    setPending(true, pendingMessage);
    if (mode === 'login') loginSubmitButton.textContent = pendingMessage;
    else registerSubmitButton.textContent = pendingMessage;

    try {
      const credential =
        mode === 'login'
          ? await signInWithEmail(loginEmailInput.value.trim(), loginPasswordInput.value)
          : await signUpWithEmail(
              regEmailInput.value.trim(),
              regPassInput.value,
              regUserInput.value,
            );
      const session = createAppSession(credential.user);
      onAuthenticated(session);
      showSnackbar(
        mode === 'login' ? 'You are now signed in.' : 'Your account was created.',
        'success',
      );
      setPending(false);
      resetForms();
      authDialog.closeAuth();
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setPending(false, message);
      authStatus.classList.add('auth-dialog__status--error');
      authStatus.setAttribute('role', 'alert');
      showSnackbar(message, 'error');
    }
  };

  loginForm.addEventListener('submit', (event) => {
    void handleAuthentication(event, 'login');
  });
  registerForm.addEventListener('submit', (event) => {
    void handleAuthentication(event, 'register');
  });

  const handleGoogleAuthentication = async (button: HTMLButtonElement): Promise<void> => {
    if (isPending) return;

    const initialLabel = button.textContent ?? 'Continue with Google';
    const pendingMessage = 'Connecting to Google...';
    setPending(true, pendingMessage);
    button.textContent = pendingMessage;

    try {
      const credential = await signInWithGoogle();
      const session = createAppSession(credential.user);
      onAuthenticated(session);
      showSnackbar('You are now signed in with Google.', 'success');
      button.textContent = initialLabel;
      setPending(false);
      resetForms();
      authDialog.closeAuth();
    } catch (error) {
      const message = getAuthErrorMessage(error);
      button.textContent = initialLabel;
      setPending(false, message);
      authStatus.classList.add('auth-dialog__status--error');
      authStatus.setAttribute('role', 'alert');
      showSnackbar(message, 'error');
    }
  };

  googleLoginBtn.addEventListener('click', () => {
    void handleGoogleAuthentication(googleLoginBtn);
  });
  googleRegisterBtn.addEventListener('click', () => {
    void handleGoogleAuthentication(googleRegisterBtn);
  });

  const setMode = (mode: AuthMode, syncUrl = true): void => {
    if (isPending) return;
    authStatus.textContent = '';
    authStatus.classList.remove('auth-dialog__status--error');
    authStatus.setAttribute('role', 'status');
    if (mode !== currentMode) {
      currentMode = mode;
      resetForms();
    }
    const isLogin = mode === 'login';
    loginTab.classList.toggle('auth-dialog__tab--active', isLogin);
    registerTab.classList.toggle('auth-dialog__tab--active', !isLogin);
    loginForm.classList.toggle('auth-dialog__form--hidden', !isLogin);
    registerForm.classList.toggle('auth-dialog__form--hidden', isLogin);
    if (syncUrl && authDialog.classList.contains('auth-dialog--open')) {
      onAuthChange(mode);
    }
  };

  const showLogin = (): void => setMode('login');
  const showRegister = (): void => setMode('register');

  authDialog.openAuth = (mode: AuthMode, syncUrl = true): void => {
    if (isPending) return;
    setMode(mode, false);
    authDialog.classList.add('auth-dialog--open');
    if (syncUrl) onAuthChange(mode);
  };

  authDialog.closeAuth = (syncUrl = true): void => {
    if (isPending) return;
    const wasOpen = authDialog.classList.contains('auth-dialog--open');
    authDialog.classList.remove('auth-dialog--open');
    if (syncUrl && wasOpen) onAuthChange(null);
  };

  loginTab.addEventListener('click', showLogin);
  registerTab.addEventListener('click', showRegister);
  closeButton.addEventListener('click', () => authDialog.closeAuth());
  switchRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (isPending) return;
    showRegister();
  });
  switchLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (isPending) return;
    showLogin();
  });

  forgotPasswordLink.addEventListener('click', (event) => event.preventDefault());
  authDialog.addEventListener('click', (event) => {
    if (!isPending && event.target === authDialog) {
      authDialog.closeAuth();
    }
  });

  return authDialog;
}
