import { createHomePage } from './pages/home';
import { createLibraryPage } from './pages/library';

type View = 'home' | 'library';

export class Router {
  private currentView: View = 'home';
  private contentContainer: HTMLElement;

  constructor(contentContainer: HTMLElement) {
    this.contentContainer = contentContainer;
    this.initListeners();
  }

  private initListeners(): void {
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('[data-nav]');
      if (!target) return;

      e.preventDefault();
      const view = target.getAttribute('data-nav') as View;
      if (view && view !== this.currentView) {
        this.navigate(view);
      }
    });
  }

  public navigate(view: View): void {
    this.currentView = view;
    this.contentContainer.innerHTML = '';

    const page = view === 'home' ? createHomePage() : createLibraryPage();
    this.contentContainer.append(page);

    this.updateActiveNavStates();
    window.scrollTo(0, 0);
  }

  private updateActiveNavStates(): void {
    document.querySelectorAll('[data-nav]').forEach((el) => {
      const isMatch = el.getAttribute('data-nav') === this.currentView;
      el.classList.toggle('active', isMatch);
    });
  }
}
