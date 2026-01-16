import { test, expect } from '@playwright/test';

test('Register new user (happy path) and no relevant console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const timestamp = Date.now();
  const username = `pwreg${timestamp}`;
  const email = `${username}@example.com`;
  const password = 'Password123!';

  await page.goto('/');
  await page.getByRole('link', { name: /Sign up/i }).click();
  await expect(page).toHaveURL(/.*register/);

  // Fill registration form using placeholders (site uses placeholders)
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: /Sign up/i }).click();

  // Wait for navigation and the username to appear in the navigation bar
  await page.waitForLoadState('networkidle');
  const profileHref = `/@${username}/`;
  const navProfile = page.locator(`nav a.nav-link[href="${profileHref}"]`).first();
  if ((await navProfile.count()) > 0) {
    await expect(navProfile).toBeVisible({ timeout: 10_000 });
  } else {
    // fallback: visible link with username
    await expect(page.getByRole('link', { name: username }).first()).toBeVisible({
      timeout: 10_000,
    });
  }

  // allow navigation and UI to settle
  await page.waitForTimeout(500);

  // Filter out known benign console errors (service worker/MIME/DNS noise). Any other errors will fail the test.
  const ignorePatterns = [
    /service worker/i,
    /unsupported mime/i,
    /undefinedservice-worker/i,
    /net::ERR_NAME_NOT_RESOLVED/i,
    /Failed to load resource:/i,
  ];
  const relevantErrors = consoleErrors.filter((msg) => !ignorePatterns.some((rx) => rx.test(msg)));
  expect(relevantErrors.length, `Unexpected console errors:\n${relevantErrors.join('\n')}`).toBe(0);
});
