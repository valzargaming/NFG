const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './browser-tests',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { browserName: 'chromium', screenshot: 'only-on-failure', trace: 'off', video: 'off' },
  projects: [
    { name: 'desktop-light', use: { viewport: { width: 1280, height: 1000 } } },
    { name: 'desktop-dark', use: { viewport: { width: 1280, height: 1000 } } },
    {
      name: 'mobile-light',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
