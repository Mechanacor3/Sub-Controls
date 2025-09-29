const { test, expect } = require('@playwright/test');

test('navigation riddle gates hints and confirms the correct keyword', async ({ page }) => {
  await page.goto('/');
  await page.click('nav .tab[data-target="navigation"]');

  const firstHintButton = page.locator('.nav-hint-toggle[data-hint="nav-hint-1"]');
  const secondHintButton = page.locator('.nav-hint-toggle[data-hint="nav-hint-2"]');
  const firstHint = page.locator('#nav-hint-1');
  const secondHint = page.locator('#nav-hint-2');
  const answerInput = page.locator('#nav-answer');
  const submitButton = page.locator('#nav-submit');
  const feedback = page.locator('#nav-feedback');

  await expect(firstHintButton).toBeEnabled();
  await firstHintButton.click();
  await expect(firstHint).toBeVisible();

  await expect(secondHintButton).toBeDisabled();

  for (const guess of ['WRONG', 'AGAIN']) {
    await answerInput.fill(guess);
    await submitButton.click();
    await expect(feedback).toContainText('heading drifts off-course');
    await page.waitForTimeout(800);
  }

  await expect(secondHintButton).toBeEnabled();
  await secondHintButton.click();
  await expect(secondHint).toBeVisible();

  await answerInput.fill('CHART');
  await submitButton.click();

  await expect(page.locator('#nav-success')).toHaveClass(/visible/);
  await expect(page.locator('#keyword-banner')).toContainText('CHART');
  await expect(answerInput).toHaveAttribute('readonly', 'readonly');
});
