import { describe, expect, it, vi } from 'vitest';
import type { AppSession } from '../../services/app-session';
import { changeLanguage } from '../../i18n';
import { createHomePage } from './home';

const components = vi.hoisted(() => ({
  createNewGamesSection: vi.fn(),
  createLeaderboard: vi.fn(),
  createDeveloperCta: vi.fn(),
  createGameDetailsDialog: vi.fn(),
}));

vi.mock('../components/carousel-card', () => ({
  createNewGamesSection: components.createNewGamesSection,
}));
vi.mock('../components/leaderboard', () => ({
  createLeaderboard: components.createLeaderboard,
}));
vi.mock('../components/developer-cta', () => ({
  createDeveloperCta: components.createDeveloperCta,
}));
vi.mock('../components/game-details-dialog', () => ({
  createGameDetailsDialog: components.createGameDetailsDialog,
}));

describe('home page composition', () => {
  it('updates the hero copy in place when the active language changes', async () => {
    components.createGameDetailsDialog.mockReturnValue(document.createElement('div'));
    components.createNewGamesSection.mockReturnValue(document.createElement('section'));
    components.createLeaderboard.mockReturnValue(document.createElement('section'));
    components.createDeveloperCta.mockReturnValue(document.createElement('section'));

    const page = createHomePage();
    document.body.append(page);
    const title = page.querySelector('.home__description-title');
    const description = page.querySelector('.home__description-text');
    const action = page.querySelector('.home__description-button');

    await changeLanguage('kk');

    expect(title?.textContent).toBe('Үзіліс жасап, көңіл көтеріңіз');
    expect(description?.textContent).toContain('Таңдалған жүздеген шағын ойынды');
    expect(action?.textContent).toBe('Ойындар кітапханасын ашу');

    await changeLanguage('en');
    document.body.replaceChildren();
  });

  it('wires game dialog session guards and composes the public home sections', () => {
    const session: AppSession = {
      displayName: 'Player',
      email: 'player@example.com',
      authenticatedAt: Date.now(),
    };
    const getSession = vi.fn(() => session);
    const onAuthRequired = vi.fn();
    const onGameChange = vi.fn();
    const dialog = document.createElement('div');
    const openGame = vi.fn();
    Object.assign(dialog, { openGame });
    const newGames = document.createElement('section');
    const leaderboard = document.createElement('section');
    const developerCta = document.createElement('section');
    components.createGameDetailsDialog.mockReturnValue(dialog);
    components.createNewGamesSection.mockReturnValue(newGames);
    components.createLeaderboard.mockReturnValue(leaderboard);
    components.createDeveloperCta.mockReturnValue(developerCta);

    const page = createHomePage({
      gameSlug: 'sample-game',
      onGameChange,
      getSession,
      onAuthRequired,
    });

    expect(components.createGameDetailsDialog).toHaveBeenCalledWith(onGameChange, 'sample-game', {
      getSession,
      onAuthRequired,
    });
    const selectGame = components.createNewGamesSection.mock.calls.at(-1)?.[0] as (
      slug: string,
    ) => void;
    selectGame('selected-game');
    expect(openGame).toHaveBeenCalledWith('selected-game');
    expect(page.children).toHaveLength(5);
    expect(page.lastElementChild).toBe(dialog);
    expect(page.children[1]).toBe(newGames);
    expect(page.children[2]).toBe(leaderboard);
    expect(page.children[3]).toBe(developerCta);
  });
});
