import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/minigames/',
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Test files contain assertions and fixtures, not application logic.
      exclude: ['src/**/*.{test,spec}.ts'],
      reporter: ['text', 'html'],
    },
  },
});
