import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/minigames/',
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Test files contain assertions and fixtures, not application logic.
      exclude: [
        'src/**/*.{test,spec}.ts',
        // Entry-point only: imports styles, creates the app, and attaches it to the document.
        'src/main.ts',
        // Bootstrap wiring only: constructs the shell and connects router/header instances.
        'src/app/app.ts',
        // Fixed informational markup; no application decisions, state, or event behavior.
        'src/app/components/footer.ts',
        'src/app/components/developer-cta.ts',
        'src/app/components/mobile-menu.ts',
        'src/app/pages/not-found.ts',
      ],
      reporter: ['text', 'html'],
    },
  },
});
