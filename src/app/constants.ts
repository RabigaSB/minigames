export const ROUTES = {
  HOME: 'home',
  LIBRARY: 'library',
} as const;

export const APP_BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

export function getAppPath(route: 'home' | 'library'): string {
  const routePath = route === 'home' ? '/' : '/library';
  return `${APP_BASE_PATH}${routePath}`;
}
