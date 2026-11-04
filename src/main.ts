import './styles/main.scss';

import { createApp } from './app/app';
import { i18nReady } from './i18n';

await i18nReady;
const app = createApp();

document.body.append(app);
