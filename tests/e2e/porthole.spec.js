const { test, expect } = require('@playwright/test');

test('porthole puzzle reveals keyword after marking all differences', async ({ page }) => {
  await page.goto('/');
  await page.click('nav .tab[data-target="spot-diff"]');

  await page.waitForSelector('.difference-marker');

  const differenceIds = await page.evaluate(() => {
    return Array.from(
      new Set(
        Array.from(document.querySelectorAll('.difference-marker')).map(el => el.dataset.differenceId)
      )
    ).filter(Boolean);
  });

  for (const id of differenceIds) {
    await page.locator(`.difference-marker[data-difference-id="${id}"]`).first().click();
  }

  const successBanner = page.locator('#porthole-success');
  await expect(successBanner).toHaveClass(/visible/);
  await expect(page.locator('#porthole-keyword')).toHaveText('PERISCOPE');
  await expect(page.locator('#keyword-banner')).toContainText('PERISCOPE');
});
