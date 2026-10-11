import { describe, expect, it } from 'vitest';
import { createElement } from './create-element';
import { APP_BASE_PATH, getAppPath } from './constants';

describe('DOM and route utilities', () => {
  it('creates elements with optional class, text, and id', () => {
    const populated = createElement('button', 'action', 'Launch', 'launch');
    expect(populated.tagName).toBe('BUTTON');
    expect(populated.className).toBe('action');
    expect(populated.textContent).toBe('Launch');
    expect(populated.id).toBe('launch');

    const bare = createElement('div');
    expect(bare.className).toBe('');
    expect(bare.textContent).toBe('');
    expect(bare.id).toBe('');
  });

  it('builds app routes using the configured base path', () => {
    expect(APP_BASE_PATH).toBeTypeOf('string');
    expect(getAppPath('home')).toBe(`${APP_BASE_PATH}/`);
    expect(getAppPath('library')).toBe(`${APP_BASE_PATH}/library`);
  });
});
