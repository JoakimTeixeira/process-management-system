import { defineConfig, devices } from '@playwright/test';

const backofficeBaseUrl = 'http://127.0.0.1:4300';
const publicBaseUrl = 'http://127.0.0.1:4301';

// Playwright forces colored worker output; remove the conflicting inherited flag before it forks.
delete process.env['NO_COLOR'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command:
        'npm run start --prefix web/backoffice -- --host 127.0.0.1 --port 4300 --open=false',
      url: backofficeBaseUrl,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: 'npm run start --prefix web/public -- --host 127.0.0.1 --port 4301 --open=false',
      url: publicBaseUrl,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
});

export { backofficeBaseUrl, publicBaseUrl };
