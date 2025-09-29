const { test, expect } = require('@playwright/test');

const COLOR_INDEX = {
  red: 0,
  blue: 1,
  green: 2,
  yellow: 3,
  purple: 4,
  orange: 5
};

const SOLUTION = ['red', 'blue', 'green', 'yellow'];

const KEYWORD = 'RUDDER';

test('control unlock puzzle can be solved deterministically', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(({ solution, keyword }) => {
    window.SubControls.setControlUnlockState({ solution, keyword, apply: true });
  }, { solution: SOLUTION, keyword: KEYWORD });

  for (const color of SOLUTION) {
    const index = COLOR_INDEX[color];
    await page.locator('#color-picker .peg').nth(index).click();
  }

  await page.waitForTimeout(600);

  await expect(page.locator('#puzzle-box')).toContainText(KEYWORD);
  await expect(page.locator('#keyword-banner')).toContainText(KEYWORD);
});
