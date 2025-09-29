const { test, expect } = require('@playwright/test');

const CUSTOM_LAYOUT = ['0-0', '0-1', '1-0'];
const SONAR_KEYWORD = 'PING';

test('sonar puzzle recognises a scripted contact layout', async ({ page }) => {
  await page.goto('/');
  await page.click('nav .tab[data-target="sonar"]');

  await page.evaluate(({ layout, keyword }) => {
    window.SubControls.setSonarState({ layout, keyword, apply: true });
  }, { layout: CUSTOM_LAYOUT, keyword: SONAR_KEYWORD });

  for (const cellId of CUSTOM_LAYOUT) {
    await page.locator(`.sonar-cell[data-cell="${cellId}"]`).click();
  }

  await expect(page.locator('#sonar-success')).toBeVisible();
  await expect(page.locator('#sonar-keyword')).toHaveText(SONAR_KEYWORD);
  await expect(page.locator('#keyword-banner')).toContainText(SONAR_KEYWORD);
});
