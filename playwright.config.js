// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const PORT = Number(process.env.PORT || 4173);
const BASE_URL = `http://127.0.0.1:${PORT}`;

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  timeout: 30 * 1000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'node scripts/dev-server.js',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 10 * 1000
  },
  projects: [
    'ballast',
    'control-unlock',
    'navigation',
    'porthole',
    'sonar'
  ].map((name) => ({
    name,
    testMatch: `**/${name}.spec.js`,
    use: { ...devices['Desktop Chrome'] }
  }))
});
