import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'reports/results.json' }]],
  use: {
    baseURL,
    // Locally keep a trace for every failure; on CI record on the first retry.
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      // Your everyday run: everything except the legacy suite, the trainer demo and the seeded failures.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/legacy/**', '**/trace-demo.spec.ts', '**/seeded/**'],
    },
    {
      // Same tests against the "v2 redesign" of QA Mart, plus the legacy suite.
      // Run with: npm run test:v2
      name: 'ui-v2',
      default: false,
      use: { ...devices['Desktop Chrome'], extraHTTPHeaders: { 'x-qamart-ui': 'v2' } },
      testIgnore: ['**/trace-demo.spec.ts', '**/seeded/**'],
    },
    {
      // Correct tests that fail on purpose, because QA Mart has planted bugs. Run with: npm run test:seeded
      name: 'seeded',
      default: false,
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/seeded/**/*.spec.ts',
    },
    {
      // The inherited Selenium-style script. Run with: npm run test:legacy
      name: 'legacy',
      default: false,
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/legacy/**/*.spec.ts',
    },
    {
      // Trainer-only failing test for the trace viewer demo. Run with: npm run demo:trace
      name: 'demo',
      default: false,
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/trace-demo.spec.ts',
    },
  ],
  webServer: {
    command: 'node app/server.js',
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(PORT) },
  },
});
