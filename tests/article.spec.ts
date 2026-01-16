import { test, expect } from '@playwright/test';

test('open first article from feed and verify content', async ({ page }) => {
  await page.goto('/');
  // click the first visible 'Read more...' link which leads to an article page
  const readMoreLinks = page.getByText('Read more...');
  await expect(readMoreLinks.first()).toBeVisible();
  await Promise.all([page.waitForURL(/.*articles\/.*$/), readMoreLinks.first().click()]);
  await page.waitForLoadState('networkidle');
  // article page should contain an article title (single visible h1) and author link
  const title = page.locator('h1:visible').first();
  await expect(title).toBeVisible();
  // author anchor links are like '/@username/' - check anchor href starts with '/@'
  const authorAnchor = page.locator('a[href^="/@"]').first();
  await expect(authorAnchor).toBeVisible();
});
