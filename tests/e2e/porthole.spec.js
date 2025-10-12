const { test, expect } = require('@playwright/test');

test('porthole puzzle reveals keyword after logging the correct change', async ({ page }) => {
  await page.goto('/');
  await page.click('nav .tab[data-target="spot-diff"]');

  await page.click('#porthole-observe-button');

  await page.evaluate(() => {
    const video = document.querySelector('#porthole-video');
    if (video) {
      video.pause();
      video.dispatchEvent(new Event('ended'));
    }
  });

  await page.waitForSelector('#porthole-option-list li');
  const correctOption = page.locator("#porthole-option-list input[data-correct='true']");
  await expect(correctOption).toHaveCount(1);
  await correctOption.check();

  const successBanner = page.locator('#porthole-success');
  await expect(successBanner).toHaveClass(/visible/);
  await expect(page.locator('#porthole-keyword')).toHaveText('PERISCOPE');
  await expect(page.locator('#keyword-banner')).toContainText('PERISCOPE');
});
