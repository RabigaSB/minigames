import { createElement } from '../create-element';
import type { Player } from '../../data/player';

export function createLeaderboard(players: Player[]): HTMLElement {
  const section = createElement('section', 'leaderboard');

  section.setAttribute('aria-labelledby', 'leaderboard-title');

  const title = createElement('h2', 'leaderboard__title', 'Top Players ');
  const titleSpan = createElement('span', 'leaderboard__title--span', 'This Week');
  title.append(titleSpan);

  title.id = 'leaderboard-title';

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

  section.append(title, table);

  return section;
}

function createPlayerRow(player: Player): HTMLTableRowElement {
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

  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return playerName.slice(0, 2).toUpperCase();
}

function formatToK(num: number): string {
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}
