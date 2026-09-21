import { createElement } from '../create-element';
import gamesData from '../../data/all-games-seed.json';
import leaderboardData from '../../data/leaderboard.json';
import { createCarouselCard } from '../components/carouselCard';
import { createLeaderboard } from '../components/leaderboard';
import { createDeveloperCta } from '../components/developer-cta';

export function createHomePage(): HTMLElement {
  const main = createElement('main', 'home');

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
  descriptionAction.href = '/library';
  descriptionContainer.append(descriptionTitle, descriptionText, descriptionAction);
  description.append(descriptionContainer);

  const newGames = createElement('section', 'home__newgames');
  const titleWrapper = createElement('div', 'home__newgames-wrapper');
  const newGamesTitle = createElement('h2', 'home__newgames-title', 'New Games');
  const arrowWrapper = createElement('div', 'home__newgames-tools');
  const arrowForward = createElement('img', 'home__newgames-arrow--forward');
  const arrowBackward = createElement('img', 'home__newgames-arrow--backward');
  arrowForward.src = './assets/arrow.png';
  arrowForward.alt = 'arrow';
  arrowBackward.src = './assets/arrow.png';
  arrowBackward.alt = 'arrow';
  arrowWrapper.append(arrowBackward, arrowForward);
  titleWrapper.append(newGamesTitle, arrowWrapper);

  const carouselContainer = createElement('div', 'home__newgames-carousel');
  const games = gamesData.data.slice(0, 5);

  for (const game of games) {
    const card = createCarouselCard(game);
    carouselContainer.append(card);
  }

  const leaderboard = createLeaderboard(leaderboardData.data);
  const developerCta = createDeveloperCta();

  newGames.append(titleWrapper, carouselContainer);
  main.append(description, newGames, leaderboard, developerCta);

  return main;
}
