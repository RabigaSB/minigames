import { createElement } from '../create-element';
import { createNewGamesSection } from '../components/carousel-card';
import { createLeaderboard } from '../components/leaderboard';
import { createDeveloperCta } from '../components/developer-cta';
import { createGameDetailsDialog } from '../components/game-details-dialog';
import { getAppPath } from '../constants';
import type { AppSession } from '../../services/app-session';

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
  const descriptionTitle = createElement(
    'h1',
    'home__description-title',
    'Take a Short Break & Have Fun',
  );
  const descriptionText = createElement(
    'p',
    'home__description-text',
    'Discover hundreds of curated casual mini-games. Play instantly in your browser',
  );
  const descriptionTextSpan = createElement(
    'span',
    'home__description-text--small',
    ' — puzzle, match 3, farm, and board classics.',
  );
  descriptionText.append(descriptionTextSpan);
  const descriptionAction = createElement('a', 'home__description-button', 'Browse Library');
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

  return main;
}
