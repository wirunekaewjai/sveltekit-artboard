import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.ts',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:41751',
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'pnpm --dir examples/sveltekit dev --port 41751 --host 127.0.0.1',
    url: 'http://127.0.0.1:41751/__artboard',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
