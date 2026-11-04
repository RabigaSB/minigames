import './styles/main.scss';

import { createApp } from './app/app';
import { getCurrentLanguage, i18nReady, onLanguageChange } from './i18n';

await i18nReady;
document.documentElement.lang = getCurrentLanguage();
onLanguageChange((language) => {
  document.documentElement.lang = language;
});

const app = createApp();

document.body.append(app);
