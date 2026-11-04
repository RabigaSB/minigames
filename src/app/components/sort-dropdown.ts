import { createElement } from '../create-element';
import { onLanguageChange, t, type TranslationKey } from '../../i18n';

const options: Array<{ key: TranslationKey; value: string }> = [
  { key: 'library.sort.ratingAscending', value: 'rating-asc' },
  { key: 'library.sort.ratingDescending', value: 'rating-desc' },
  { key: 'library.sort.nameAscending', value: 'name-asc' },
  { key: 'library.sort.nameDescending', value: 'name-desc' },
];

function getSortLabel(value: string): string {
  const option = options.find((item) => item.value === value) ?? options[1];
  return t('library.sortBy', { option: t(option.key) });
}

onLanguageChange(() => {
  document.querySelectorAll<HTMLElement>('.sort-dropdown').forEach((wrapper) => {
    const button = wrapper.querySelector<HTMLButtonElement>('.sort-dropdown__button');
    const selectedValue = button?.dataset.sortValue;
    if (button && selectedValue) button.textContent = getSortLabel(selectedValue);

    wrapper.querySelectorAll<HTMLElement>('.sort-dropdown__item').forEach((item) => {
      const value = item.dataset.sortValue;
      const option = options.find((candidate) => candidate.value === value);
      if (option) item.textContent = t(option.key);
    });
  });
});

export function createSortDropdown(
  onSortChange: (sortValue: string) => void,
  initialSort = 'rating-desc',
): HTMLElement {
  const wrapper = createElement('div', 'sort-dropdown');
  const selectedOption = options.find((option) => option.value === initialSort) ?? options[1];

  const button = createElement(
    'button',
    'sort-dropdown__button',
    getSortLabel(selectedOption.value),
  );
  button.type = 'button';
  button.dataset.sortValue = selectedOption.value;
  button.setAttribute('aria-expanded', 'false');

  const menu = createElement('ul', 'sort-dropdown__menu');
  menu.classList.add('sort-dropdown__menu--hidden');

  options.forEach((option) => {
    const item = createElement('li', 'sort-dropdown__item', t(option.key));
    item.dataset.sortValue = option.value;
    if (option.value === selectedOption.value) item.classList.add('sort-dropdown__item--active');

    item.addEventListener('click', (event) => {
      event.stopPropagation();
      button.dataset.sortValue = option.value;
      button.textContent = getSortLabel(option.value);
      menu.querySelectorAll('.sort-dropdown__item').forEach((element) => {
        element.classList.remove('sort-dropdown__item--active');
      });

      item.classList.add('sort-dropdown__item--active');
      menu.classList.add('sort-dropdown__menu--hidden');
      button.setAttribute('aria-expanded', 'false');

      onSortChange(option.value);
    });

    menu.append(item);
  });

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    menu.classList.toggle('sort-dropdown__menu--hidden');
    button.setAttribute(
      'aria-expanded',
      String(!menu.classList.contains('sort-dropdown__menu--hidden')),
    );
  });

  document.addEventListener('click', () => {
    menu.classList.add('sort-dropdown__menu--hidden');
    button.setAttribute('aria-expanded', 'false');
  });

  wrapper.append(button, menu);
  return wrapper;
}
