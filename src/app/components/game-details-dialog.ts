import { createElement } from '../create-element';

export function createGameDetailsDialog(): HTMLElement {
  const dialog = createElement('div', 'game-dialog');

  const content = createElement('div', 'game-dialog__content');

  //hero section
  const closeBtn = createElement('button', 'game-dialog__close');
  closeBtn.type = 'button';

  const hero = createElement('section', 'game-dialog__hero');
  const image = createElement('img', 'game-dialog__image');
  image.src = './assets/tukoni-banner.png';
  hero.append(image, closeBtn);

  //info section
  const infoSection = createElement('section', 'game-dialog__info');

  const topRow = createElement('div', 'game-dialog__top-row');
  const title = createElement('h2', 'game-dialog__title', 'Tukoni: Forest Keepers');
  const stats = createElement('div', 'game-dialog__stats');
  const rating = createElement('span', 'game-dialog__rating', '4.9');
  const likes = createElement('span', 'game-dialog__likes', '31.2K');
  stats.append(rating, likes);
  topRow.append(title, stats);

  const description = createElement(
    'p',
    'game-dialog__description',
    'Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.',
  );
  const badges = createElement('section', 'game-dialog__badges');

  badges.append(
    createBadge('Genre', 'Puzzle'),
    createBadge('Players', 'Solo'),
    createBadge('Duration', '40–90 min'),
    createBadge('Price', 'Free'),
  );

  const actionsRow = createElement('div', 'game-dialog__actions');
  const playNowBtn = createElement('button', 'game-dialog__play-btn', 'Play Now');
  playNowBtn.type = 'button';

  const favoriteBtn = createElement('button', 'game-dialog__favorite-btn');
  favoriteBtn.type = 'button';
  const favoriteBtnText = createElement(
    'span',
    'game-dialog__favorite-btn-text',
    'Add to Favorites',
  );

  favoriteBtn.append(favoriteBtnText);

  actionsRow.append(playNowBtn, favoriteBtn);

  infoSection.append(topRow, description, badges, actionsRow);

  //records section
  const recordsSection = createElement('section', 'game-dialog__records-section');
  const recordsTitleIcon = createElement('span', 'game-dialog__title-icon', '🏆');
  const recordsTitle = createElement('h3', 'game-dialog__section-title', 'Top Records');
  const recordsList = createElement('div', 'game-dialog__records-list');
  recordsTitle.prepend(recordsTitleIcon);

  const recordsData = [
    { rank: '🥇', user: 'ForestSpirit', score: '356,700 pts', time: '2 days ago' },
    { rank: '🥈', user: 'TeaBrewer', score: '332,400 pts', time: '5 days ago' },
    { rank: '🥉', user: 'HerbalistPath', score: '308,900 pts', time: '1 week ago' },
  ];

  recordsData.forEach((rec) => {
    const item = createElement('div', 'game-dialog__record-item');
    const numberWrapper = createElement('div', 'game-dialog__record-wrapper');
    const userWrapper = createElement('div', 'game-dialog__user-wrapper');
    const userRank = createElement('span', 'game-dialog__record-rank', rec.rank);
    const userInfo = createElement('span', 'game-dialog__record-user', rec.user);
    const scoreInfo = createElement('span', 'game-dialog__record-score', rec.score);
    const timeInfo = createElement('span', 'game-dialog__record-time', rec.time);
    userWrapper.append(userRank, userInfo);
    numberWrapper.append(scoreInfo, timeInfo);
    item.append(userWrapper, numberWrapper);
    recordsList.append(item);
  });

  recordsSection.append(recordsTitle, recordsList);

  // Comments Section
  const commentsSection = createElement('div', 'game-dialog__comments-section');
  const commentsTitle = createElement('h3', 'game-dialog__section-title', 'Comments (3)');

  const commentForm = createElement('div', 'game-dialog__comment-form');
  const userAvatar = createElement('div', 'game-dialog__avatar', 'U');
  const commentInput = createElement(
    'textarea',
    'game-dialog__comment-input',
  ) as HTMLTextAreaElement;
  commentInput.rows = 2;
  commentInput.placeholder = 'Write a comment...';
  commentInput.name = 'game-dialog__comment';
  const sendBtn = createElement('button', 'game-dialog__send-btn');
  sendBtn.type = 'button';
  commentForm.append(userAvatar, commentInput, sendBtn);

  const commentsList = createElement('div', 'game-dialog__comments-list');

  const commentsData = [
    {
      avatar: 'F',
      user: 'ForestDweller',
      time: '3 hours ago',
      text: "The hand-drawn art is absolutely magical 🍄 Every location feels like a page from a children's storybook. The mushroom village made me cry happy tears!",
      likes: '12',
    },
    {
      avatar: 'H',
      user: 'HerbalTeaLover',
      time: '1 day ago',
      text: 'Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.',
      likes: '5',
    },
    {
      avatar: 'C',
      user: 'CottageCoreMia',
      time: '3 days ago',
      text: 'I want to live inside this game forever 🌿 The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.',
      likes: '8',
    },
  ];

  commentsData.forEach((comment) => {
    const card = createElement('div', 'game-dialog__comment-card');

    const cardHeader = createElement('div', 'game-dialog__comment-header');
    const avatar = createElement('div', 'game-dialog__comment-avatar', comment.avatar);
    const userInfo = createElement('div', 'game-dialog__comment-user-info');
    const userName = createElement('span', 'game-dialog__comment-user', comment.user);
    const commentTime = createElement('span', 'game-dialog__comment-time', comment.time);
    userInfo.append(userName, commentTime);
    cardHeader.append(avatar, userInfo);

    const commentText = createElement('p', 'game-dialog__comment-text', comment.text);

    const cardFooter = createElement('div', 'game-dialog__comment-footer');
    const likeBtn = createElement('button', 'game-dialog__comment-like', comment.likes);
    likeBtn.type = 'button';
    cardFooter.append(likeBtn);

    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('active');
    });

    card.append(cardHeader, commentText, cardFooter);
    commentsList.append(card);
  });

  commentsSection.append(commentsTitle, commentForm, commentsList);

  //helpers and event listeners
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  favoriteBtn.addEventListener('click', () => {
    favoriteBtn.classList.toggle('active');
    const isActive = favoriteBtn.classList.contains('active');
    favoriteBtnText.textContent = isActive ? 'Remove from Favorites' : 'Add to Favorites';
  });

  sendBtn.addEventListener('click', () => {
    commentInput.value = '';
  });

  const closeDialog = () => {
    dialog.classList.remove('game-dialog--open');
    document.body.classList.remove('dialog-open');
    content.scrollTop = 0;
    commentInput.value = '';
    commentInput.style.height = 'auto';
    favoriteBtn.classList.remove('active');
    favoriteBtnText.textContent = 'Add to Favorites';
    commentsList.querySelectorAll('.game-dialog__comment-like').forEach((btn) => {
      btn.classList.remove('active');
    });
  };

  closeBtn.addEventListener('click', closeDialog);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.classList.contains('game-dialog--open')) {
      closeDialog();
    }
  });

  function createBadge(label: string, value: string) {
    const badge = createElement('div', 'game-dialog__badge');

    const title = createElement('p', 'game-dialog__badge-label', label);

    const text = createElement('p', 'game-dialog__badge-value', value);

    badge.append(title, text);

    return badge;
  }

  commentInput.addEventListener('input', () => {
    commentInput.style.height = 'auto';
    commentInput.style.height = `${commentInput.scrollHeight}px`;
  });

  content.append(hero, infoSection, recordsSection, commentsSection);
  dialog.append(content);

  return dialog;
}
