import { createElement } from '../create-element';

const TABLET_BREAKPOINT = 768;
const MAX_VISIBLE_PAGES_DESKTOP = 4;
const MAX_VISIBLE_PAGES_MOBILE = 3;

export function createPagination(): HTMLElement {
  const nav = createElement('nav', 'pagination');
  nav.setAttribute('aria-label', 'Library Pagination');

  const prevBtn = createElement('button', 'pagination__arrow pagination__arrow--prev', '‹');
  prevBtn.type = 'button';
  prevBtn.setAttribute('aria-label', 'Previous page');

  const pagesContainer = createElement('div', 'pagination__pages');

  const nextBtn = createElement('button', 'pagination__arrow pagination__arrow--next', '›');
  nextBtn.type = 'button';
  nextBtn.setAttribute('aria-label', 'Next page');

  let currentPage = 1;
  const startPage = 1;
  const endPage =
    window.innerWidth < TABLET_BREAKPOINT ? MAX_VISIBLE_PAGES_MOBILE : MAX_VISIBLE_PAGES_DESKTOP;

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = createElement(
      'button',
      'pagination__page-btn',
      i.toString(),
      `pagination__page-btn-${i}`,
    );
    pageBtn.type = 'button';

    if (i === startPage) {
      pageBtn.classList.add('active');
    }

    pageBtn.addEventListener('click', () => {
      setPage(i);
    });

    pagesContainer.append(pageBtn);
  }

  function setActiveClass(currentPage: number) {
    const currentActiveBtn = pagesContainer.querySelector(`#pagination__page-btn-${currentPage}`);
    pagesContainer
      .querySelectorAll('.pagination__page-btn')
      .forEach((c) => c.classList.remove('active'));
    currentActiveBtn?.classList.add('active');
  }

  function setPage(page: number) {
    if (page < startPage || page > endPage) return;
    currentPage = page;
    setDisabled(currentPage);
    setActiveClass(currentPage);
  }

  function setDisabled(currentPage: number) {
    if (currentPage === startPage) {
      prevBtn.classList.add('disabled');
      prevBtn.setAttribute('disabled', 'true');
    } else {
      prevBtn.classList.remove('disabled');
      prevBtn.removeAttribute('disabled');
    }

    if (currentPage === endPage) {
      nextBtn.classList.add('disabled');
      nextBtn.setAttribute('disabled', 'true');
    } else {
      nextBtn.classList.remove('disabled');
      nextBtn.removeAttribute('disabled');
    }
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > startPage) {
      setPage(currentPage - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < endPage) {
      setPage(currentPage + 1);
    }
  });

  nav.append(prevBtn, pagesContainer, nextBtn);
  return nav;
}
