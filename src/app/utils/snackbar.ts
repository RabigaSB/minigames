import { createElement } from '../create-element';

export function showSnackbar(message: string, type: 'success' | 'error' = 'success'): void {
  const snackbar = createElement('div', 'snackbar');
  snackbar.classList.add(`snackbar--${type}`);
  snackbar.textContent = message;

  document.body.append(snackbar);

  requestAnimationFrame(() => snackbar.classList.add('snackbar--visible'));

  setTimeout(() => {
    snackbar.classList.remove('snackbar--visible');
    setTimeout(() => snackbar.remove(), 300);
  }, 3000);
}
