import { createElement } from '../create-element';
import { FirebaseError } from 'firebase/app';
import { createAppSession, type AppSession } from '../../services/app-session';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../../services/firebase';
import { showSnackbar } from '../utils/snackbar';
import { onLanguageChange, t, type TranslationKey } from '../../i18n';

export type AuthMode = 'login' | 'register';

export interface AuthDialog extends HTMLElement {
  openAuth(mode: AuthMode, syncUrl?: boolean): void;
  closeAuth(syncUrl?: boolean): void;
  dispose?(): void;
}

export function createAuthDialog(
  onAuthChange: (mode: AuthMode | null) => void = () => undefined,
  onAuthenticated: (session: AppSession) => void = () => undefined,
  onPendingChange: (pending: boolean) => void = () => undefined,
): AuthDialog {
  const createPasswordToggle = (input: HTMLInputElement): HTMLButtonElement => {
    const toggle = createElement('button', 'auth-dialog__eye-icon') as HTMLButtonElement;
    toggle.type = 'button';
    toggle.setAttribute('aria-label', t('authDialog.showPassword'));
    toggle.setAttribute('aria-controls', input.id);
    toggle.setAttribute('aria-pressed', 'false');
    input.classList.add('auth-dialog__input--with-toggle');
    toggle.addEventListener('click', () => {
      const isVisible = input.type === 'password';
      input.type = isVisible ? 'text' : 'password';
      toggle.classList.toggle('auth-dialog__eye-icon--visible', isVisible);
      toggle.setAttribute(
        'aria-label',
        t(isVisible ? 'authDialog.hidePassword' : 'authDialog.showPassword'),
      );
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
    dispose: (): void => undefined,
  });
  authDialog.setAttribute('role', 'dialog');
  authDialog.setAttribute('aria-modal', 'true');

  const content = createElement('div', 'auth-dialog__content');
  const closeButton = createElement('button', 'auth-dialog__close', '×');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', t('authDialog.close'));

  const tabsContainer = createElement('div', 'auth-dialog__tabs');
  const loginTab = createElement(
    'button',
    'auth-dialog__tab auth-dialog__tab--active',
    t('authDialog.loginTab'),
  );
  loginTab.type = 'button';
  const registerTab = createElement('button', 'auth-dialog__tab', t('authDialog.registerTab'));
  registerTab.type = 'button';
  tabsContainer.append(loginTab, registerTab);
  const authStatus = createElement('p', 'auth-dialog__status') as HTMLParagraphElement;
  authStatus.setAttribute('role', 'status');
  authStatus.setAttribute('aria-live', 'polite');

  const loginForm = createElement('form', 'auth-dialog__form auth-dialog__form--login');

  const loginTitle = createElement('h2', 'auth-dialog__title', t('authDialog.loginTitle'));
  const loginSubtitle = createElement('p', 'auth-dialog__subtitle', t('authDialog.loginSubtitle'));

  const loginEmailGroup = createElement('div', 'auth-dialog__input-group');
  const loginEmailLabel = createElement('label', 'auth-dialog__label', t('authDialog.emailLabel'));
  const loginEmailWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const loginEmailIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--mail');
  const loginEmailInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  loginEmailInput.id = 'login-email';
  loginEmailInput.type = 'email';
  loginEmailInput.required = true;
  loginEmailInput.placeholder = t('authDialog.loginEmailPlaceholder');
  loginEmailLabel.htmlFor = loginEmailInput.id;
  loginEmailWrapper.append(loginEmailIcon, loginEmailInput);
  loginEmailGroup.append(loginEmailLabel, loginEmailWrapper);

  const loginPasswordGroup = createElement('div', 'auth-dialog__input-group');
  const loginPasswordLabel = createElement(
    'label',
    'auth-dialog__label',
    t('authDialog.passwordLabel'),
  );
  const loginPasswordWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const loginPasswordIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const loginPasswordInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  loginPasswordInput.id = 'login-password';
  loginPasswordInput.type = 'password';
  loginPasswordInput.required = true;
  loginPasswordInput.placeholder = t('authDialog.passwordPlaceholder');
  loginPasswordLabel.htmlFor = loginPasswordInput.id;
  const loginPasswordToggle = createPasswordToggle(loginPasswordInput);
  loginPasswordWrapper.append(loginPasswordIcon, loginPasswordInput, loginPasswordToggle);
  loginPasswordGroup.append(loginPasswordLabel, loginPasswordWrapper);

  const forgotPasswordLink = createElement(
    'a',
    'auth-dialog__forgot-link',
    t('authDialog.forgotPassword'),
  );
  forgotPasswordLink.href = '#';

  const loginSubmitButton = createElement(
    'button',
    'auth-dialog__submit-btn',
    t('authDialog.loginSubmit'),
  );
  loginSubmitButton.type = 'submit';
  loginSubmitButton.disabled = true;

  const loginDivider = createElement('div', 'auth-dialog__divider', t('authDialog.divider'));

  const googleLoginBtn = createElement(
    'button',
    'auth-dialog__google-btn',
    t('authDialog.googleLogin'),
  );
  googleLoginBtn.type = 'button';

  const switchRegisterText = createElement(
    'p',
    'auth-dialog switch-text',
    t('authDialog.noAccount'),
  );
  const switchRegisterLink = createElement(
    'a',
    'auth-dialog__switch-link',
    t('authDialog.registerLink'),
  );
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

  const registerTitle = createElement('h2', 'auth-dialog__title', t('authDialog.registerTitle'));
  const registerSubtitle = createElement(
    'p',
    'auth-dialog__subtitle',
    t('authDialog.registerSubtitle'),
  );

  const regUserGroup = createElement('div', 'auth-dialog__input-group');
  const regUserLabel = createElement('label', 'auth-dialog__label', t('authDialog.usernameLabel'));
  const regUserWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regUserIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--person');
  const regUserInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regUserInput.id = 'register-username';
  regUserInput.type = 'text';
  regUserInput.required = true;
  regUserInput.placeholder = t('authDialog.usernamePlaceholder');
  regUserLabel.htmlFor = regUserInput.id;
  regUserWrapper.append(regUserIcon, regUserInput);
  regUserGroup.append(regUserLabel, regUserWrapper);

  const regEmailGroup = createElement('div', 'auth-dialog__input-group');
  const regEmailLabel = createElement('label', 'auth-dialog__label', t('authDialog.emailLabel'));
  const regEmailWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regEmailIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--mail');
  const regEmailInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regEmailInput.id = 'register-email';
  regEmailInput.type = 'email';
  regEmailInput.required = true;
  regEmailInput.placeholder = t('authDialog.registerEmailPlaceholder');
  regEmailLabel.htmlFor = regEmailInput.id;
  regEmailWrapper.append(regEmailIcon, regEmailInput);
  regEmailGroup.append(regEmailLabel, regEmailWrapper);

  const regPassGroup = createElement('div', 'auth-dialog__input-group');
  const regPassLabel = createElement('label', 'auth-dialog__label', t('authDialog.passwordLabel'));
  const regPassWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regPassIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const regPassInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regPassInput.id = 'register-password';
  regPassInput.type = 'password';
  regPassInput.required = true;
  regPassInput.placeholder = t('authDialog.passwordMinPlaceholder');
  regPassLabel.htmlFor = regPassInput.id;
  const regPassToggle = createPasswordToggle(regPassInput);
  regPassWrapper.append(regPassIcon, regPassInput, regPassToggle);
  regPassGroup.append(regPassLabel, regPassWrapper);

  const regConfirmGroup = createElement('div', 'auth-dialog__input-group');
  const regConfirmLabel = createElement(
    'label',
    'auth-dialog__label',
    t('authDialog.confirmPasswordLabel'),
  );
  const regConfirmWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regConfirmIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const regConfirmInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regConfirmInput.id = 'register-confirm-password';
  regConfirmInput.type = 'password';
  regConfirmInput.required = true;
  regConfirmInput.placeholder = t('authDialog.confirmPasswordPlaceholder');
  regConfirmLabel.htmlFor = regConfirmInput.id;
  const regConfirmToggle = createPasswordToggle(regConfirmInput);
  regConfirmWrapper.append(regConfirmIcon, regConfirmInput, regConfirmToggle);
  regConfirmGroup.append(regConfirmLabel, regConfirmWrapper);

  const registerSubmitButton = createElement(
    'button',
    'auth-dialog__submit-btn',
    t('authDialog.registerSubmit'),
  );
  registerSubmitButton.type = 'submit';
  registerSubmitButton.disabled = true;

  const registerDivider = createElement('div', 'auth-dialog__divider', t('authDialog.divider'));

  const googleRegisterBtn = createElement(
    'button',
    'auth-dialog__google-btn',
    t('authDialog.googleRegister'),
  );
  googleRegisterBtn.type = 'button';

  const switchLoginText = createElement(
    'p',
    'auth-dialog__switch-text',
    t('authDialog.hasAccount'),
  );
  const switchLoginLink = createElement('a', 'auth-dialog__switch-link', t('authDialog.loginLink'));
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
    if (!value) return t('authDialog.validation.emailRequired');
    if (!emailPattern.test(value)) return t('authDialog.validation.emailInvalid');
    return '';
  };

  const validateLoginPassword = (): string => {
    if (!loginPasswordInput.value) return t('authDialog.validation.passwordRequired');
    if (loginPasswordInput.value.length < 6) {
      return t('authDialog.validation.passwordMinLength');
    }
    return '';
  };

  const validateUsername = (): string => {
    const value = regUserInput.value;
    if (!value) return t('authDialog.validation.usernameRequired');
    if (!usernamePattern.test(value)) {
      return t('authDialog.validation.usernameFormat');
    }
    return '';
  };

  const validateRegisterPassword = (): string => {
    const value = regPassInput.value;
    if (!value) return t('authDialog.validation.passwordRequired');
    if (value.length < 6) return t('authDialog.validation.passwordMinLength');
    if (
      !printableAsciiPattern.test(value) ||
      !uppercasePattern.test(value) ||
      !digitPattern.test(value) ||
      !specialCharacterPattern.test(value)
    ) {
      return t('authDialog.validation.passwordComplexity');
    }
    return '';
  };

  const validateConfirmPassword = (): string => {
    if (!regConfirmInput.value) return t('authDialog.validation.confirmPasswordRequired');
    if (regConfirmInput.value !== regPassInput.value) {
      return t('authDialog.validation.passwordsDoNotMatch');
    }
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
      toggle.setAttribute('aria-label', t('authDialog.showPassword'));
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
  let authStatusKey: TranslationKey | null = null;
  let pendingButton: HTMLButtonElement | null = null;
  const pendingButtonLabels = new Map<HTMLButtonElement, TranslationKey>([
    [loginSubmitButton, 'authDialog.signingIn'],
    [registerSubmitButton, 'authDialog.creatingAccount'],
    [googleLoginBtn, 'authDialog.connectingToGoogle'],
    [googleRegisterBtn, 'authDialog.connectingToGoogle'],
  ]);
  const priorDisabledStates = new Map<HTMLButtonElement | HTMLInputElement, boolean>();
  const setPending = (pending: boolean, messageKey: TranslationKey | null = null): void => {
    isPending = pending;
    authStatusKey = messageKey;
    authDialog.setAttribute('aria-busy', String(pending));
    content.classList.toggle('auth-dialog__content--pending', pending);
    authStatus.textContent = messageKey ? t(messageKey) : '';
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
    pendingButton = null;
    loginSubmitButton.textContent = t('authDialog.loginSubmit');
    registerSubmitButton.textContent = t('authDialog.registerSubmit');
    updateLoginValidation();
    updateRegisterValidation();
    onPendingChange(false);
  };

  const authErrorMessages: Record<string, TranslationKey> = {
    'auth/email-already-in-use': 'authDialog.errors.emailAlreadyInUse',
    'auth/invalid-credential': 'authDialog.errors.invalidCredentials',
    'auth/invalid-email': 'authDialog.validation.emailInvalid',
    'auth/network-request-failed': 'authDialog.errors.network',
    'auth/popup-closed-by-user': 'authDialog.errors.googleCanceled',
    'auth/popup-blocked': 'authDialog.errors.popupBlocked',
    'auth/cancelled-popup-request': 'authDialog.errors.popupAlreadyOpen',
    'auth/too-many-requests': 'authDialog.errors.tooManyRequests',
    'auth/user-not-found': 'authDialog.errors.userNotFound',
    'auth/wrong-password': 'authDialog.errors.invalidCredentials',
    'auth/weak-password': 'authDialog.errors.weakPassword',
  };
  const getAuthErrorKey = (error: unknown): TranslationKey => {
    if (error instanceof FirebaseError) {
      return authErrorMessages[error.code] ?? 'authDialog.errors.generic';
    }
    return 'authDialog.errors.generic';
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

    const pendingKey = mode === 'login' ? 'authDialog.signingIn' : 'authDialog.creatingAccount';
    pendingButton = mode === 'login' ? loginSubmitButton : registerSubmitButton;
    setPending(true, pendingKey);
    pendingButton.textContent = t(pendingKey);

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
        mode === 'login' ? 'authDialog.signedIn' : 'authDialog.accountCreated',
        'success',
      );
      setPending(false);
      resetForms();
      authDialog.closeAuth();
    } catch (error) {
      const errorKey = getAuthErrorKey(error);
      setPending(false, errorKey);
      authStatus.classList.add('auth-dialog__status--error');
      authStatus.setAttribute('role', 'alert');
      showSnackbar(errorKey, 'error');
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

    const initialLabelKey: TranslationKey =
      button === googleLoginBtn ? 'authDialog.googleLogin' : 'authDialog.googleRegister';
    pendingButton = button;
    const pendingKey = 'authDialog.connectingToGoogle';
    setPending(true, pendingKey);
    button.textContent = t(pendingKey);

    try {
      const credential = await signInWithGoogle();
      const session = createAppSession(credential.user);
      onAuthenticated(session);
      showSnackbar('authDialog.signedInWithGoogle', 'success');
      button.textContent = t(initialLabelKey);
      setPending(false);
      resetForms();
      authDialog.closeAuth();
    } catch (error) {
      const errorKey = getAuthErrorKey(error);
      button.textContent = t(initialLabelKey);
      setPending(false, errorKey);
      authStatus.classList.add('auth-dialog__status--error');
      authStatus.setAttribute('role', 'alert');
      showSnackbar(errorKey, 'error');
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
    authStatusKey = null;
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

  const refreshTranslations = (): void => {
    closeButton.setAttribute('aria-label', t('authDialog.close'));
    loginTab.textContent = t('authDialog.loginTab');
    registerTab.textContent = t('authDialog.registerTab');
    loginTitle.textContent = t('authDialog.loginTitle');
    loginSubtitle.textContent = t('authDialog.loginSubtitle');
    loginEmailLabel.textContent = t('authDialog.emailLabel');
    loginEmailInput.placeholder = t('authDialog.loginEmailPlaceholder');
    loginPasswordLabel.textContent = t('authDialog.passwordLabel');
    loginPasswordInput.placeholder = t('authDialog.passwordPlaceholder');
    forgotPasswordLink.textContent = t('authDialog.forgotPassword');
    loginDivider.textContent = t('authDialog.divider');
    switchRegisterText.firstChild!.textContent = t('authDialog.noAccount');
    switchRegisterLink.textContent = t('authDialog.registerLink');

    registerTitle.textContent = t('authDialog.registerTitle');
    registerSubtitle.textContent = t('authDialog.registerSubtitle');
    regUserLabel.textContent = t('authDialog.usernameLabel');
    regUserInput.placeholder = t('authDialog.usernamePlaceholder');
    regEmailLabel.textContent = t('authDialog.emailLabel');
    regEmailInput.placeholder = t('authDialog.registerEmailPlaceholder');
    regPassLabel.textContent = t('authDialog.passwordLabel');
    regPassInput.placeholder = t('authDialog.passwordMinPlaceholder');
    regConfirmLabel.textContent = t('authDialog.confirmPasswordLabel');
    regConfirmInput.placeholder = t('authDialog.confirmPasswordPlaceholder');
    registerDivider.textContent = t('authDialog.divider');
    switchLoginText.firstChild!.textContent = t('authDialog.hasAccount');
    switchLoginLink.textContent = t('authDialog.loginLink');

    for (const [input, toggle] of [
      [loginPasswordInput, loginPasswordToggle],
      [regPassInput, regPassToggle],
      [regConfirmInput, regConfirmToggle],
    ] as const) {
      toggle.setAttribute(
        'aria-label',
        t(input.type === 'password' ? 'authDialog.showPassword' : 'authDialog.hidePassword'),
      );
    }

    if (authStatusKey) authStatus.textContent = t(authStatusKey);
    if (pendingButton) {
      const labelKey = pendingButtonLabels.get(pendingButton);
      if (labelKey) pendingButton.textContent = t(labelKey);
    } else {
      loginSubmitButton.textContent = t('authDialog.loginSubmit');
      registerSubmitButton.textContent = t('authDialog.registerSubmit');
      googleLoginBtn.textContent = t('authDialog.googleLogin');
      googleRegisterBtn.textContent = t('authDialog.googleRegister');
    }

    updateLoginValidation();
    updateRegisterValidation();
  };
  const unsubscribeLanguageChange = onLanguageChange(refreshTranslations);
  authDialog.dispose = (): void => unsubscribeLanguageChange();

  return authDialog;
}
