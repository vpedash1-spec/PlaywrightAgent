import { test, expect } from '@playwright/test';

test.describe('Home / Feed', () => {
  test('homepage shows site title and global feed', async ({ page }) => {
    await page.goto('/');
    // site title - use role=heading or link and pick the first one to avoid duplicates
    await expect(page.getByRole('heading', { name: 'conduit' }).first()).toBeVisible();
    // Global Feed tab or label
    await expect(page.getByRole('link', { name: 'Global Feed' })).toBeVisible();
    // there should be at least one article preview (look for "Read more..." links)
    const readMore = page.getByText('Read more...');
    await expect(readMore.first()).toBeVisible();
  });
});
