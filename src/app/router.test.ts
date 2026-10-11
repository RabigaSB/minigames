import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../services/app-session';
import type { AuthDialog } from './components/auth-dialog';
import { getAppPath } from './constants';
import { Router } from './router';

const pageMocks = vi.hoisted(() => ({
  createHomePage: vi.fn(),
  createLibraryPage: vi.fn(),
  createNotFoundPage: vi.fn(),
  showSnackbar: vi.fn(),
}));

vi.mock('./pages/home', () => ({ createHomePage: pageMocks.createHomePage }));
vi.mock('./pages/library', () => ({ createLibraryPage: pageMocks.createLibraryPage }));
vi.mock('./pages/not-found', () => ({ createNotFoundPage: pageMocks.createNotFoundPage }));
vi.mock('./utils/snackbar', () => ({ showSnackbar: pageMocks.showSnackbar }));

describe('SPA router', () => {
  let content: HTMLElement;
  let router: Router;
  let session: AppSession | null;
  let authDialog: AuthDialog;
  let openAuth: ReturnType<typeof vi.fn<(mode: 'login' | 'register', sync?: boolean) => void>>;
  let closeAuth: ReturnType<typeof vi.fn<(sync?: boolean) => void>>;

  beforeEach(() => {
    document.body.replaceChildren();
    vi.clearAllMocks();
    window.history.replaceState({}, '', getAppPath('home'));
    vi.stubGlobal('scrollTo', vi.fn());
    content = document.createElement('main');
    document.body.append(content);
    session = null;
    openAuth = vi.fn<(mode: 'login' | 'register', sync?: boolean) => void>();
    closeAuth = vi.fn<(sync?: boolean) => void>();
    authDialog = Object.assign(document.createElement('div'), {
      openAuth,
      closeAuth,
    }) as AuthDialog;
    pageMocks.createHomePage.mockImplementation((options) => {
      const page = document.createElement('div');
      page.className = 'home-page';
      if (options.gameSlug) {
        const gameDialog = Object.assign(document.createElement('div'), { dispose: vi.fn() });
        gameDialog.className = 'game-dialog';
        page.append(gameDialog);
      }
      return page;
    });
    pageMocks.createLibraryPage.mockImplementation(() => document.createElement('div'));
    pageMocks.createNotFoundPage.mockImplementation(() => document.createElement('div'));
    router = new Router(content);
    router.setAuthDialog(authDialog);
    router.setAuthAccess(() => session, vi.fn());
  });

  afterEach(() => document.body.replaceChildren());

  it('opens direct guest Auth URLs while retaining game state for Auth close', () => {
    window.history.replaceState(
      {},
      '',
      `${getAppPath('library')}?auth=register&game=sample&category=puzzle#comments`,
    );
    router.start();

    expect(openAuth).toHaveBeenCalledWith('register', false);
    expect(pageMocks.createLibraryPage).toHaveBeenCalledWith(
      expect.objectContaining({ gameSlug: undefined }),
    );
    expect(window.location.search).toContain('game=sample');

    router.handleAuthChange(null);
    expect(window.location.pathname).toBe(getAppPath('library'));
    expect(window.location.search).toContain('game=sample');
    expect(window.location.search).not.toContain('auth=');
    expect(window.location.hash).toBe('#comments');
    expect(pageMocks.createLibraryPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ gameSlug: 'sample' }),
    );
  });

  it('blocks authenticated Auth URLs with replace-state cleanup and one warning', () => {
    session = {
      displayName: 'Player',
      email: 'player@example.com',
      authenticatedAt: Date.now(),
    };
    window.history.replaceState({}, '', `${getAppPath('home')}?auth=login&page=4&game=sample#top`);
    const historyLength = window.history.length;
    router.start();

    expect(window.location.pathname).toBe(getAppPath('home'));
    expect(window.location.search).toBe('?page=4&game=sample');
    expect(window.location.hash).toBe('#top');
    expect(window.history.length).toBe(historyLength);
    expect(openAuth).not.toHaveBeenCalled();
    expect(closeAuth).toHaveBeenCalledWith(false);
    expect(pageMocks.showSnackbar).toHaveBeenCalledOnce();
    expect(pageMocks.showSnackbar).toHaveBeenCalledWith(
      'You are already authenticated.',
      'warning',
    );
    expect(pageMocks.createHomePage).toHaveBeenLastCalledWith(
      expect.objectContaining({ gameSlug: 'sample' }),
    );
  });

  it('guards UI auth openings and removes only auth from the current URL', () => {
    session = {
      displayName: 'Player',
      email: 'player@example.com',
      authenticatedAt: Date.now(),
    };
    window.history.replaceState(
      {},
      '',
      `${getAppPath('library')}?category=arcade&auth=register#list`,
    );
    const historyLength = window.history.length;

    router.handleAuthChange('login');

    expect(window.location.search).toBe('?category=arcade');
    expect(window.location.hash).toBe('#list');
    expect(window.history.length).toBe(historyLength);
    expect(openAuth).not.toHaveBeenCalled();
    expect(pageMocks.showSnackbar).toHaveBeenCalledOnce();
  });

  it('restores path views on Back and Forward without a reload', () => {
    router.start();
    router.navigate('library');
    expect(window.location.pathname).toBe(getAppPath('library'));
    expect(pageMocks.createLibraryPage).toHaveBeenCalledOnce();

    window.history.back();
    return new Promise<void>((resolve) => {
      window.addEventListener(
        'popstate',
        () => {
          expect(window.location.pathname).toBe(getAppPath('home'));
          expect(pageMocks.createHomePage).toHaveBeenCalled();
          resolve();
        },
        { once: true },
      );
    });
  });
});
