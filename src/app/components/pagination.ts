import { createElement } from '../create-element';

const TABLET_BREAKPOINT = 768;
const MAX_VISIBLE_PAGES_DESKTOP = 4;
const MAX_VISIBLE_PAGES_MOBILE = 3;

export function createPagination(onPageChange: (page: number) => void, initialPage = 1) {
  const nav = createElement('nav', 'pagination');
  nav.setAttribute('aria-label', 'Library Pagination');

  const prevBtn = createElement(
    'button',
    'pagination__arrow pagination__arrow--prev disabled',
    '‹',
  );
  prevBtn.type = 'button';
  prevBtn.disabled = true;
  prevBtn.setAttribute('aria-label', 'Previous page');

  const pagesContainer = createElement('div', 'pagination__pages');

  const nextBtn = createElement('button', 'pagination__arrow pagination__arrow--next', '›');
  nextBtn.type = 'button';
  nextBtn.setAttribute('aria-label', 'Next page');

  let currentPage = Math.max(1, initialPage);
  let totalPages = 4;

  function renderPageBtns(total: number) {
    totalPages = Math.max(1, total);
    const maxVisible =
      window.innerWidth < TABLET_BREAKPOINT ? MAX_VISIBLE_PAGES_MOBILE : MAX_VISIBLE_PAGES_DESKTOP;
    const startPage = Math.max(
      1,
      Math.min(currentPage - Math.floor((maxVisible - 1) / 2), totalPages - maxVisible + 1),
    );
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    pagesContainer.innerHTML = '';

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = createElement(
        'button',
        'pagination__page-btn',
        i.toString(),
        `pagination__page-btn-${i}`,
      );
      pageBtn.type = 'button';

      if (i === currentPage) {
        pageBtn.classList.add('active');
      }

      pageBtn.addEventListener('click', () => {
        setPage(i);
      });

      pagesContainer.append(pageBtn);
    }
    setDisabled(currentPage);
  }

  function setActiveClass(page: number) {
    pagesContainer
      .querySelectorAll('.pagination__page-btn')
      .forEach((c) => c.classList.remove('active'));
    const currentActiveBtn = pagesContainer.querySelector(`#pagination__page-btn-${page}`);
    currentActiveBtn?.classList.add('active');
  }

  function setPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    setActiveClass(currentPage);
    setDisabled(currentPage);
    onPageChange(currentPage);
  }

  function setDisabled(page: number) {
    if (page <= 1) {
      prevBtn.classList.add('disabled');
      prevBtn.disabled = true;
    } else {
      prevBtn.classList.remove('disabled');
      prevBtn.removeAttribute('disabled');
    }

    if (page >= totalPages) {
      nextBtn.classList.add('disabled');
      nextBtn.disabled = true;
    } else {
      nextBtn.classList.remove('disabled');
      nextBtn.removeAttribute('disabled');
    }
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  });

  window.addEventListener('resize', () => {
    renderPageBtns(totalPages);
  });

  nav.append(prevBtn, pagesContainer, nextBtn);

  return Object.assign(nav, {
    updatePagination: (newTotalPages: number, newCurrentPage: number) => {
      currentPage = newCurrentPage;
      renderPageBtns(newTotalPages);
    },
  });
}
