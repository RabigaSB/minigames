import { createElement } from '../create-element';
import { fetchLeaderboard, type LeaderboardPlayer } from '../utils/api';
import { formatToK } from '../utils/formatters';
import { showSnackbar } from '../utils/snackbar';
import { getCurrentLanguage, onLanguageChange, t, type TranslationKey } from '../../i18n';

type LeaderboardState = 'loading' | 'empty' | 'error' | 'loaded';

const tabletHeaders: TranslationKey[] = [
  'leaderboard.columns.rank',
  'leaderboard.columns.player',
  'leaderboard.columns.games',
  'leaderboard.columns.score',
  'leaderboard.columns.streak',
];
const desktopHeaders: TranslationKey[] = [
  'leaderboard.columns.rank',
  'leaderboard.columns.player',
  'leaderboard.columns.gamesPlayed',
  'leaderboard.columns.totalScore',
  'leaderboard.columns.streak',
  'leaderboard.columns.favoriteGame',
];

export function createLeaderboard(): HTMLElement {
  const section = createElement('section', 'leaderboard');
  section.setAttribute('aria-labelledby', 'leaderboard-title');

  const title = createElement('h2', 'leaderboard__title');
  title.id = 'leaderboard-title';
  const titleLead = createElement('span', 'leaderboard__title-lead');
  const titleSpan = createElement('span', 'leaderboard__title--span');
  title.append(titleLead, titleSpan);
  section.append(title);

  const contentWrapper = createElement('div', 'leaderboard__content-wrapper');
  section.append(contentWrapper);

  let state: LeaderboardState = 'loading';
  let players: LeaderboardPlayer[] = [];
  let errorMessage = '';
  let reload = (): void => undefined;
  const renderCurrentState = (): void => {
    titleLead.textContent = t('leaderboard.title');
    titleSpan.textContent = t('leaderboard.thisWeek');
    if (state === 'loading') renderSkeleton(contentWrapper);
    else if (state === 'empty') renderEmptyState(contentWrapper);
    else if (state === 'error') renderErrorState(contentWrapper, errorMessage, reload);
    else renderTable(contentWrapper, players);
  };
  reload = (): void => {
    void loadLeaderboardData((nextState, data, error) => {
      state = nextState;
      players = data;
      errorMessage = error;
      renderCurrentState();
    });
  };
  renderCurrentState();
  reload();

  let unsubscribe = (): void => undefined;
  unsubscribe = onLanguageChange(() => {
    if (!section.isConnected) {
      unsubscribe();
      return;
    }
    renderCurrentState();
  });

  return section;
}

async function loadLeaderboardData(
  updateState: (
    state: LeaderboardState,
    players: LeaderboardPlayer[],
    errorMessage: string,
  ) => void,
): Promise<void> {
  updateState('loading', [], '');

  try {
    const players = await fetchLeaderboard();
    if (!players || players.length === 0) {
      updateState('empty', [], '');
      return;
    }
    updateState('loaded', players, '');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : t('leaderboard.failedToLoad');
    updateState('error', [], errorMessage);
    showSnackbar(t('leaderboard.failedToLoad'), 'error');
  }
}

function renderSkeleton(container: HTMLElement): void {
  const skeleton = createElement('div', 'leaderboard__skeleton', t('leaderboard.loading'));
  skeleton.setAttribute('role', 'status');
  container.replaceChildren(skeleton);
}

function renderEmptyState(container: HTMLElement): void {
  const emptyBanner = createElement('div', 'leaderboard__empty', t('leaderboard.empty'));
  container.replaceChildren(emptyBanner);
}

function renderErrorState(container: HTMLElement, message: string, onRetry: () => void): void {
  const errorBanner = createElement('div', 'leaderboard__error');
  const errorText = createElement('p', 'leaderboard__error-text');
  errorText.append(
    createElement('span', 'leaderboard__error-prefix', t('leaderboard.errorPrefix')),
    document.createTextNode(` ${message}`),
  );
  const retryBtn = createElement('button', 'leaderboard__retry-btn', t('common.retry'));
  retryBtn.addEventListener('click', onRetry);

  errorBanner.append(errorText, retryBtn);
  container.replaceChildren(errorBanner);
}

function renderTable(container: HTMLElement, players: LeaderboardPlayer[]): void {
  const table = createElement('table', 'leaderboard__table');
  const tableHead = createElement('thead', 'leaderboard__head');
  const headerRow = createElement('tr');

  for (const header of tabletHeaders) {
    const cell = createElement('th', 'leaderboard__header--tablet', t(header));
    cell.scope = 'col';
    headerRow.append(cell);
  }

  for (const header of desktopHeaders) {
    const cell = createElement('th', 'leaderboard__header', t(header));
    cell.scope = 'col';
    headerRow.append(cell);
  }

  tableHead.append(headerRow);
  const tableBody = createElement('tbody', 'leaderboard__body');
  for (const player of players) {
    tableBody.append(createPlayerRow(player));
  }

  table.append(tableHead, tableBody);
  container.replaceChildren(table);
}

function createPlayerRow(player: LeaderboardPlayer): HTMLTableRowElement {
  const row = createElement('tr', 'leaderboard__row');
  const rank = createElement('td', 'leaderboard__cell leaderboard__rank', `#${player.rank}`);

  const playerCell = createElement('td', 'leaderboard__cell');
  const playerWrapper = createElement('div', 'leaderboard__player');
  const avatar = createElement('span', 'leaderboard__avatar', getInitials(player.playerName));
  avatar.setAttribute('aria-hidden', 'true');
  const playerName = createElement('span', 'leaderboard__name', player.playerName);
  playerWrapper.append(avatar, playerName);
  playerCell.append(playerWrapper);

  const gamesPlayed = createElement('td', 'leaderboard__cell', player.gamesPlayed.toString());
  const totalScoreMobile = createElement(
    'td',
    'leaderboard__cell leaderboard__cell--mobile',
    formatToK(player.totalScore),
  );
  const locale = getCurrentLanguage();
  const totalScore = createElement(
    'td',
    'leaderboard__cell leaderboard__cell--tablet',
    player.totalScore.toLocaleString(
      locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-US',
    ),
  );
  const streakMobile = createElement(
    'td',
    'leaderboard__cell leaderboard__cell--mobile-d',
    `🔥 ${t('leaderboard.streakDaysShort', { count: player.streakDays })}`,
  );
  const streak = createElement(
    'td',
    'leaderboard__cell leaderboard__cell--desktop',
    `🔥 ${t('leaderboard.streakDays', { count: player.streakDays })}`,
  );
  const favoriteGame = createElement('td', 'leaderboard__cell');
  favoriteGame.append(createElement('span', 'leaderboard__game', player.favoriteGameName));

  row.append(
    rank,
    playerCell,
    gamesPlayed,
    totalScoreMobile,
    totalScore,
    streakMobile,
    streak,
    favoriteGame,
  );
  return row;
}

function getInitials(playerName: string): string {
  const parts = playerName.split('_');

  if (parts.length > 1 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return playerName.slice(0, 2).toUpperCase();
}
