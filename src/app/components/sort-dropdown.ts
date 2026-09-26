import { createElement } from '../create-element';

export function createSortDropdown(onSelect: (sortValue: string) => void): HTMLElement {
  const wrapper = createElement('div', 'sort-dropdown');

  const button = createElement('button', 'sort-dropdown__button', 'Sort by: Rating ↓');
  button.type = 'button';

  const menu = createElement('ul', 'sort-dropdown__menu');
  menu.classList.add('sort-dropdown__menu--hidden');

  const options = [
    { label: 'Rating ↑', value: 'rating-asc' },
    { label: 'Rating ↓', value: 'rating-desc', selected: true },
    { label: 'Name A→Z', value: 'name-asc' },
    { label: 'Name Z→A', value: 'name-desc' },
  ];

  let currentSelected = 'rating-desc';

  options.forEach((opt) => {
    const li = createElement('li', 'sort-dropdown__item');
    if (opt.selected) li.classList.add('sort-dropdown__item--active');

    const textNode = document.createTextNode(opt.label);
    li.append(textNode);

    li.addEventListener('click', (e) => {
      e.stopPropagation();
      currentSelected = opt.value;
      button.textContent = `Sort by: ${opt.label}`;

      menu.querySelectorAll('.sort-dropdown__item').forEach((el) => {
        el.classList.remove('sort-dropdown__item--active');
      });

      li.classList.add('sort-dropdown__item--active');
      menu.classList.add('sort-dropdown__menu--hidden');
      onSelect(currentSelected);
    });

    menu.append(li);
  });

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('sort-dropdown__menu--hidden');
  });

  document.addEventListener('click', () => {
    menu.classList.add('sort-dropdown__menu--hidden');
  });

  wrapper.append(button, menu);
  return wrapper;
}
