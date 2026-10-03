import { createElement } from '../create-element';

export type AuthMode = 'login' | 'register';

export interface AuthDialog extends HTMLElement {
  openAuth(mode: AuthMode, syncUrl?: boolean): void;
  closeAuth(syncUrl?: boolean): void;
}

export function createAuthDialog(
  onAuthChange: (mode: AuthMode | null) => void = () => undefined,
): AuthDialog {
  const authDialog = Object.assign(createElement('div', 'auth-dialog'), {
    openAuth: (mode: AuthMode, syncUrl?: boolean): void => {
      void mode;
      void syncUrl;
    },
    closeAuth: (syncUrl?: boolean): void => void syncUrl,
  });

  const content = createElement('div', 'auth-dialog__content');

  const tabsContainer = createElement('div', 'auth-dialog__tabs');
  const loginTab = createElement('button', 'auth-dialog__tab auth-dialog__tab--active', 'Login');
  loginTab.type = 'button';
  const registerTab = createElement('button', 'auth-dialog__tab', 'Register');
  registerTab.type = 'button';
  tabsContainer.append(loginTab, registerTab);

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
  loginEmailInput.type = 'email';
  loginEmailInput.placeholder = 'e.g. alex@minigames.com';
  loginEmailWrapper.append(loginEmailIcon, loginEmailInput);
  loginEmailGroup.append(loginEmailLabel, loginEmailWrapper);

  const loginPasswordGroup = createElement('div', 'auth-dialog__input-group');
  const loginPasswordLabel = createElement('label', 'auth-dialog__label', 'Password');
  const loginPasswordWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const loginPasswordIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const loginPasswordInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  loginPasswordInput.type = 'password';
  loginPasswordInput.placeholder = '••••••••';
  const loginPasswordToggle = createElement('span', 'auth-dialog__eye-icon');
  loginPasswordWrapper.append(loginPasswordIcon, loginPasswordInput, loginPasswordToggle);
  loginPasswordGroup.append(loginPasswordLabel, loginPasswordWrapper);

  const forgotPasswordLink = createElement('a', 'auth-dialog__forgot-link', 'Forgot Password?');
  forgotPasswordLink.href = '#';

  const loginSubmitButton = createElement('button', 'auth-dialog__submit-btn', 'Login');
  loginSubmitButton.type = 'button';

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
  regUserInput.type = 'text';
  regUserInput.placeholder = 'e.g. CozyGamer_99';
  regUserWrapper.append(regUserIcon, regUserInput);
  regUserGroup.append(regUserLabel, regUserWrapper);

  const regEmailGroup = createElement('div', 'auth-dialog__input-group');
  const regEmailLabel = createElement('label', 'auth-dialog__label', 'Email Address');
  const regEmailWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regEmailIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--mail');
  const regEmailInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regEmailInput.type = 'email';
  regEmailInput.placeholder = 'your.email@domain.com';
  regEmailWrapper.append(regEmailIcon, regEmailInput);
  regEmailGroup.append(regEmailLabel, regEmailWrapper);

  const regPassGroup = createElement('div', 'auth-dialog__input-group');
  const regPassLabel = createElement('label', 'auth-dialog__label', 'Password');
  const regPassWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regPassIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const regPassInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regPassInput.type = 'password';
  regPassInput.placeholder = 'Min. 8 characters';
  regPassWrapper.append(regPassIcon, regPassInput);
  regPassGroup.append(regPassLabel, regPassWrapper);

  const regConfirmGroup = createElement('div', 'auth-dialog__input-group');
  const regConfirmLabel = createElement('label', 'auth-dialog__label', 'Confirm Password');
  const regConfirmWrapper = createElement('div', 'auth-dialog__input-wrapper');
  const regConfirmIcon = createElement('span', 'auth-dialog__icon auth-dialog__icon--lock');
  const regConfirmInput = createElement('input', 'auth-dialog__input') as HTMLInputElement;
  regConfirmInput.type = 'password';
  regConfirmInput.placeholder = 'Repeat your password';
  regConfirmWrapper.append(regConfirmIcon, regConfirmInput);
  regConfirmGroup.append(regConfirmLabel, regConfirmWrapper);

  const registerSubmitButton = createElement('button', 'auth-dialog__submit-btn', 'Create Account');
  registerSubmitButton.type = 'button';

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

  content.append(tabsContainer, loginForm, registerForm);
  authDialog.append(content);

  const setMode = (mode: AuthMode, syncUrl = true): void => {
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
    setMode(mode, false);
    authDialog.classList.add('auth-dialog--open');
    if (syncUrl) onAuthChange(mode);
  };

  authDialog.closeAuth = (syncUrl = true): void => {
    const wasOpen = authDialog.classList.contains('auth-dialog--open');
    authDialog.classList.remove('auth-dialog--open');
    if (syncUrl && wasOpen) onAuthChange(null);
  };

  loginTab.addEventListener('click', showLogin);
  registerTab.addEventListener('click', showRegister);
  switchRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegister();
  });
  switchLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });

  authDialog.addEventListener('click', (event) => {
    if (event.target === authDialog) {
      authDialog.closeAuth();
    }
  });

  return authDialog;
}
