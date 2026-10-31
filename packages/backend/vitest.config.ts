import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Use an isolated in-memory SQLite DB for every test run.
    env: {
      NODE_ENV: 'test',
      DATABASE_FILE: ':memory:',
    },
    include: ['test/**/*.test.ts'],
  },
});
