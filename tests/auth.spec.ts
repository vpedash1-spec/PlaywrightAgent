import { test, expect } from '@playwright/test';

test.describe('Authentication pages', () => {
  test('navigate to Sign up page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Sign up/i }).click();
    await expect(page).toHaveURL(/.*register/);
    // check form fields - site uses placeholders; check inputs by placeholder as fallback
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });

  test('navigate to Sign in page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });
});
