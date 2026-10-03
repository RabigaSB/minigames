import { createElement } from '../create-element';
import { fetchLeaderboard, type LeaderboardPlayer } from '../utils/api';
import { formatToK } from '../utils/formatters';
import { showSnackbar } from '../utils/snackbar';

export function createLeaderboard(): HTMLElement {
  const section = createElement('section', 'leaderboard');
  section.setAttribute('aria-labelledby', 'leaderboard-title');

  const title = createElement('h2', 'leaderboard__title', 'Top Players ');
  const titleSpan = createElement('span', 'leaderboard__title--span', 'This Week');
  title.append(titleSpan);
  title.id = 'leaderboard-title';
  section.append(title);

  // Create content wrapper to hold skeleton, error, empty, or table states
  const contentWrapper = createElement('div', 'leaderboard__content-wrapper');
  section.append(contentWrapper);

  // Trigger initial fetch
  loadLeaderboardData(contentWrapper);

  return section;
}

async function loadLeaderboardData(container: HTMLElement): Promise<void> {
  renderSkeleton(container);

  try {
    const players = await fetchLeaderboard();
    container.innerHTML = '';

    if (!players || players.length === 0) {
      renderEmptyState(container);
      return;
    }

    renderTable(container, players);
  } catch (error) {
    container.innerHTML = '';
    const errorMsg = error instanceof Error ? error.message : 'Failed to load leaderboard';
    renderErrorState(container, errorMsg);
    showSnackbar(errorMsg, 'error');
  }
}

function renderSkeleton(container: HTMLElement): void {
  container.innerHTML = `
    <div class="leaderboard__skeleton" style="padding: 24px; text-align: center; color: var(--on-bg-low, #737380);">
      Loading Top Players leaderboard...
    </div>
  `;
}

function renderEmptyState(container: HTMLElement): void {
  const emptyBanner = createElement('div', 'leaderboard__empty', 'No leaderboard data available.');
  container.append(emptyBanner);
}

function renderErrorState(container: HTMLElement, message: string): void {
  const errorBanner = createElement('div', 'leaderboard__error');
  const errorText = createElement('p', 'leaderboard__error-text', `Error: ${message}`);
  const retryBtn = createElement('button', 'leaderboard__retry-btn', 'Retry');

  retryBtn.addEventListener('click', () => {
    loadLeaderboardData(container);
  });

  errorBanner.append(errorText, retryBtn);
  container.append(errorBanner);
}

function renderTable(container: HTMLElement, players: LeaderboardPlayer[]): void {
  const table = createElement('table', 'leaderboard__table');

  const tableHead = createElement('thead', 'leaderboard__head');
  const headerRow = createElement('tr');

  const headersTablet = ['RANK', 'PLAYER', 'GAMES', 'SCORE', 'STREAK'];
  const headers = ['RANK', 'PLAYER', 'GAMES PLAYED', 'TOTAL SCORE', 'STREAK', 'FAVORITE GAME'];

  for (const header of headersTablet) {
    const cell = createElement('th', 'leaderboard__header--tablet', header);
    cell.scope = 'col';
    headerRow.append(cell);
  }

  for (const header of headers) {
    const cell = createElement('th', 'leaderboard__header', header);
    cell.scope = 'col';
    headerRow.append(cell);
  }

  tableHead.append(headerRow);

  const tableBody = createElement('tbody', 'leaderboard__body');

  for (const player of players) {
    const row = createPlayerRow(player);
    tableBody.append(row);
  }

  table.append(tableHead, tableBody);
  container.append(table);
}

function createPlayerRow(player: LeaderboardPlayer): HTMLTableRowElement {
  const row = createElement('tr', 'leaderboard__row');

  const rank = createElement('td', 'leaderboard__cell leaderboard__rank', `#${player.rank}`);

  const playerCell = createElement('td', 'leaderboard__cell');
  const playerWrapper = createElement('div', 'leaderboard__player');

  const initials = getInitials(player.playerName);
  const avatar = createElement('span', 'leaderboard__avatar', initials);
  avatar.setAttribute('aria-hidden', 'true');

  const playerName = createElement('span', 'leaderboard__name', player.playerName);

  playerWrapper.append(avatar, playerName);
  playerCell.append(playerWrapper);

  const gamesPlayed = createElement('td', 'leaderboard__cell', player.gamesPlayed.toString());

  const totalScoreMobile = createElement(
    'td',
    'leaderboard__cell leaderboard__cell--mobile',
    formatToK(player.totalScore).toString(),
  );

  const totalScore = createElement(
    'td',
    'leaderboard__cell leaderboard__cell--tablet',
    player.totalScore.toLocaleString('en-US'),
  );

  const streakMobile = createElement(
    'td',
    'leaderboard__cell leaderboard__cell--mobile-d',
    `🔥 ${player.streakDays}d`,
  );

  const streak = createElement(
    'td',
    'leaderboard__cell leaderboard__cell--desktop',
    `🔥 ${player.streakDays} ${player.streakDays === 1 ? 'day' : 'days'}`,
  );

  const favoriteGame = createElement('td', 'leaderboard__cell');
  const gameBadge = createElement('span', 'leaderboard__game', player.favoriteGameName);
  favoriteGame.append(gameBadge);

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
