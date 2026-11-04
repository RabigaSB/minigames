import { createElement } from '../create-element';
import { createNewGamesSection } from '../components/carousel-card';
import { createLeaderboard } from '../components/leaderboard';
import { createDeveloperCta } from '../components/developer-cta';
import { createGameDetailsDialog } from '../components/game-details-dialog';
import { getAppPath } from '../constants';
import type { AppSession } from '../../services/app-session';
import { onLanguageChange, t } from '../../i18n';

export interface HomePageOptions {
  gameSlug?: string;
  onGameChange?: (slug: string | null) => void;
  getSession?: () => AppSession | null;
  onAuthRequired?: () => void;
}

export function createHomePage(options: HomePageOptions = {}): HTMLElement {
  const main = createElement('div', 'home');

  const description = createElement('section', 'home__description');
  const descriptionContainer = createElement('div', 'home__description-container');
  const descriptionTitle = createElement('h1', 'home__description-title', t('home.hero.title'));
  const descriptionText = createElement('p', 'home__description-text', t('home.hero.description'));
  const descriptionTextSpan = createElement(
    'span',
    'home__description-text--small',
    t('home.hero.descriptionDetail'),
  );
  descriptionText.append(descriptionTextSpan);
  const descriptionAction = createElement(
    'a',
    'home__description-button',
    t('home.hero.browseLibrary'),
  );
  descriptionAction.href = getAppPath('library');
  descriptionContainer.append(descriptionTitle, descriptionText, descriptionAction);
  description.append(descriptionContainer);

  const gameDialog = createGameDetailsDialog(options.onGameChange, options.gameSlug, {
    getSession: options.getSession,
    onAuthRequired: options.onAuthRequired,
  });
  const newGames = createNewGamesSection((slug) => gameDialog.openGame(slug));
  const leaderboard = createLeaderboard();
  const developerCta = createDeveloperCta();

  main.append(description, newGames, leaderboard, developerCta, gameDialog);

  let unsubscribe = (): void => undefined;
  unsubscribe = onLanguageChange(() => {
    if (!main.isConnected) {
      unsubscribe();
      return;
    }

    descriptionTitle.textContent = t('home.hero.title');
    if (descriptionText.firstChild) {
      descriptionText.firstChild.textContent = t('home.hero.description');
    }
    descriptionTextSpan.textContent = t('home.hero.descriptionDetail');
    descriptionAction.textContent = t('home.hero.browseLibrary');
  });

  return main;
}
