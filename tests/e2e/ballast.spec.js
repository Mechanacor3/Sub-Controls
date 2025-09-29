const { test, expect } = require('@playwright/test');

test('ballast puzzle helpers balance the submarine', async ({ page }) => {
  await page.goto('/');
  await page.click('nav .tab[data-target="ballast"]');

  const solution = await page.evaluate(() => {
    const config = window.SubControls.getBallastConfig();
    const offsets = [];
    for (let a = config.slider.minOffset; a <= config.slider.maxOffset; a += 1) {
      for (let b = config.slider.minOffset; b <= config.slider.maxOffset; b += 1) {
        for (let c = config.slider.minOffset; c <= config.slider.maxOffset; c += 1) {
          for (let d = config.slider.minOffset; d <= config.slider.maxOffset; d += 1) {
            const candidate = [a, b, c, d];
            const result = window.SubControls.simulateBallast(candidate, 1);
            if (result.tilt === 0 && result.depth === 0) {
              return { offsets: candidate, polarity: 1 };
            }
          }
        }
      }
    }
    return null;
  });

  if (!solution) {
    throw new Error('No ballast solution found');
  }

  await page.evaluate(options => {
    window.SubControls.setBallastControls({ ...options, autoConfirm: true });
  }, solution);

  await expect(page.locator('#ballast-outcome')).toContainText('keyword TRIM');
  await expect(page.locator('#keyword-banner')).toContainText('TRIM');
});
