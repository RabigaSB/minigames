import { createElement } from '../create-element';

export function createGameDetailsDialog() {
  const dialog = createElement('div', 'game-details-dialog');

  const content = createElement('div', 'game-details-dialog__content');

  dialog.append(content);

  return dialog;
}
