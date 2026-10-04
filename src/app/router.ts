import { createHomePage } from './pages/home';
import { createLibraryPage, type LibraryRouteState } from './pages/library';
import { createNotFoundPage } from './pages/not-found';
import type { AuthDialog, AuthMode } from './components/auth-dialog';
import type { GameDetailsDialog } from './components/game-details-dialog';
import { APP_BASE_PATH, getAppPath } from './constants';

type View = 'home' | 'library' | 'not-found';
type NavigableView = Exclude<View, 'not-found'>;
type RouteState = {
  view: View;
  category: string;
  sort: string;
  page: number;
  game?: string;
  auth?: AuthMode;
};

const VALID_SORTS = new Set(['rating-asc', 'rating-desc', 'name-asc', 'name-desc']);

export class Router {
  private contentContainer: HTMLElement;
  private authDialog: AuthDialog | null = null;

  constructor(contentContainer: HTMLElement) {
    this.contentContainer = contentContainer;
    this.initListeners();
  }

  private initListeners(): void {
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;

      const target = (event.target as HTMLElement).closest('a[href]');
      if (!target) return;

      const navValue = target.getAttribute('data-nav');
      const targetUrl = new URL((target as HTMLAnchorElement).href, window.location.href);
      if (targetUrl.origin !== window.location.origin) return;
      if (!navValue && (target as HTMLAnchorElement).getAttribute('href')?.startsWith('#')) return;

      const view =
        navValue === 'home' || navValue === 'library'
          ? navValue
          : this.getRoutePath(targetUrl.pathname) === '/library'
            ? 'library'
            : this.getRoutePath(targetUrl.pathname) === '/' ||
                this.getRoutePath(targetUrl.pathname) === '/home'
              ? 'home'
              : null;
      if (view !== 'home' && view !== 'library') return;

      event.preventDefault();
      this.navigate(view);
    });

    window.addEventListener('popstate', () => this.renderLocation());
  }

  public setAuthDialog(authDialog: AuthDialog): void {
    this.authDialog = authDialog;
  }

  public start(): void {
    this.restoreGitHubPagesUrl();
    this.renderLocation();
  }

  private restoreGitHubPagesUrl(): void {
    const currentUrl = new URL(window.location.href);
    const requestedUrl = currentUrl.searchParams.get('__gh_pages_redirect');
    if (!requestedUrl) return;

    const restoredUrl = new URL(requestedUrl, window.location.origin);
    const isWithinAppBase =
      restoredUrl.origin === window.location.origin &&
      (restoredUrl.pathname === APP_BASE_PATH ||
        restoredUrl.pathname === `${APP_BASE_PATH}/` ||
        restoredUrl.pathname.startsWith(`${APP_BASE_PATH}/`));

    if (isWithinAppBase) {
      window.history.replaceState(
        window.history.state,
        '',
        `${restoredUrl.pathname}${restoredUrl.search}${restoredUrl.hash}`,
      );
      return;
    }

    currentUrl.searchParams.delete('__gh_pages_redirect');
    window.history.replaceState(
      window.history.state,
      '',
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
    );
  }

  public navigate(view: NavigableView): void {
    const path = getAppPath(view);
    window.history.pushState({}, '', path);
    this.renderLocation();
    window.scrollTo(0, 0);
  }

  public handleAuthChange = (mode: AuthMode | null): void => {
    const url = new URL(window.location.href);
    if (mode) {
      url.searchParams.set('auth', mode);
      url.searchParams.delete('game');
    } else {
      url.searchParams.delete('auth');
    }
    this.writeUrl(url, mode === null);
  };

  private handleGameChange = (slug: string | null): void => {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set('game', slug);
      url.searchParams.delete('auth');
    } else {
      url.searchParams.delete('game');
    }
    this.writeUrl(url, slug === null);
  };

  private handleLibraryStateChange = (state: LibraryRouteState, replace = false): void => {
    const url = new URL(window.location.href);
    url.searchParams.set('category', state.category);
    url.searchParams.set('sort', state.sort);
    url.searchParams.set('page', String(state.page));
    this.writeUrl(url, replace);
  };

  private writeUrl(url: URL, replace: boolean): void {
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (replace) {
      window.history.replaceState(window.history.state, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
  }

  private parseLocation(): RouteState {
    const url = new URL(window.location.href);
    const routePath = this.getRoutePath(url.pathname);
    const view: View =
      routePath === '/library'
        ? 'library'
        : routePath === '/' || routePath === '/home'
          ? 'home'
          : 'not-found';
    const rawPage = Number(url.searchParams.get('page'));
    const rawSort = url.searchParams.get('sort') ?? 'rating-desc';
    const rawAuth = url.searchParams.get('auth');
    const auth = rawAuth === 'login' || rawAuth === 'register' ? rawAuth : undefined;

    return {
      view,
      category: url.searchParams.get('category') ?? 'all',
      sort: VALID_SORTS.has(rawSort) ? rawSort : 'rating-desc',
      page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
      game: view === 'not-found' || auth ? undefined : (url.searchParams.get('game') ?? undefined),
      auth: view === 'not-found' ? undefined : auth,
    };
  }

  private getRoutePath(pathname: string): string {
    if (!APP_BASE_PATH) return pathname;
    if (pathname === APP_BASE_PATH || pathname === `${APP_BASE_PATH}/`) return '/';
    if (pathname.startsWith(`${APP_BASE_PATH}/`)) return pathname.slice(APP_BASE_PATH.length);
    return pathname;
  }

  private renderLocation(): void {
    const state = this.parseLocation();
    const previousGameDialog = this.contentContainer.querySelector(
      '.game-dialog',
    ) as GameDetailsDialog | null;
    previousGameDialog?.dispose();
    document.body.classList.remove('dialog-open');
    this.contentContainer.replaceChildren();

    const page =
      state.view === 'not-found'
        ? createNotFoundPage()
        : state.view === 'home'
          ? createHomePage({
              gameSlug: state.game,
              onGameChange: this.handleGameChange,
            })
          : createLibraryPage({
              state: {
                category: state.category,
                sort: state.sort,
                page: state.page,
              },
              gameSlug: state.game,
              onStateChange: this.handleLibraryStateChange,
              onGameChange: this.handleGameChange,
            });

    this.contentContainer.append(page);
    if (state.auth) {
      this.authDialog?.openAuth(state.auth, false);
    } else {
      this.authDialog?.closeAuth(false);
    }
    this.updateActiveNavStates(state.view);
  }

  private updateActiveNavStates(view: View): void {
    document.querySelectorAll('[data-nav]').forEach((element) => {
      const isMatch = element.getAttribute('data-nav') === view;
      element.classList.toggle('active', isMatch);
    });
  }
}
