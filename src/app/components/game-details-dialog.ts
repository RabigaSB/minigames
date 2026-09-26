import { createElement } from '../create-element';

export function createGameDetailsDialog(): HTMLElement {
  const dialog = createElement('div', 'game-dialog');

  const content = createElement('div', 'game-dialog__content');

  const closeBtn = createElement('button', 'game-dialog__close');
  closeBtn.type = 'button';

  const closeDialog = () => {
    dialog.classList.remove('game-dialog--open');
    document.body.classList.remove('dialog-open');
  };

  closeBtn.addEventListener('click', closeDialog);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.classList.contains('game-dialog--open')) {
      closeDialog();
    }
  });

  dialog.append(content);

  return dialog;
}
