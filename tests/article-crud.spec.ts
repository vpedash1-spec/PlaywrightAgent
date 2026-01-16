import { test, expect } from "@playwright/test";

test("authenticated user can create and delete an article and no console errors occur", async ({
  page,
}) => {
  // capture console errors
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  // create a unique user via the UI Sign up flow
  const timestamp = Date.now();
  const username = `pwtest${timestamp}`;
  const email = `${username}@example.com`;
  const password = "Password123!";

  await page.goto("/");
  await page.getByRole("link", { name: /Sign up/i }).click();
  await expect(page).toHaveURL(/.*register/);
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: /Sign up/i }).click();
  // after signup, the username should appear in the top nav
  await expect(page.getByRole("link", { name: username })).toBeVisible();

  // Go to New Post page and publish an article
  // ensure signup finished and nav updated
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("link", { name: username })).toBeVisible({
    timeout: 10_000,
  });
  // Try clicking 'New Post' nav link; fallback to editor href
  const editorLink = page.locator('a[href="/editor"]');
  if ((await editorLink.count()) > 0) {
    await editorLink.first().click();
  } else {
    await page.getByRole("link", { name: /New Post|New Article|New/i }).click();
  }
  await expect(page.getByPlaceholder("Article Title")).toBeVisible();

  const articleTitle = `E2E Test Article ${timestamp}`;
  await page.getByPlaceholder("Article Title").fill(articleTitle);
  await page
    .getByPlaceholder("What's this article about?")
    .fill("testing article creation");
  await page
    .getByPlaceholder("Write your article (in markdown)")
    .fill("This is the body of the test article.");
  await page.getByPlaceholder("Enter tags").fill("playwright");
  await page.getByRole("button", { name: "Publish Article" }).click();

  // verify article page shows the title
  await expect(page.locator("h1")).toHaveText(articleTitle);

  // Visit profile and verify article is present (use exact href to disambiguate)
  const profileHref = `/@${username}/`;
  const topNavProfile = page
    .locator(`nav a.nav-link[href="${profileHref}"]`)
    .first();
  if ((await topNavProfile.count()) > 0) {
    await topNavProfile.click();
  } else {
    await page.locator(`a[href="${profileHref}"]`).first().click();
  }
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(articleTitle)).toBeVisible();

  // Open the article and delete it (click the first matching article link)
  await page.getByText(articleTitle).first().click();
  const deleteBtn = page
    .getByRole("button", { name: "Delete Article" })
    .first();
  await expect(deleteBtn).toBeVisible();
  await deleteBtn.click();

  // after deletion, the article title should no longer be visible on the profile
  // re-open profile via top nav href
  const topNavProfile2 = page
    .locator(`nav a.nav-link[href="${profileHref}"]`)
    .first();
  if ((await topNavProfile2.count()) > 0) {
    await topNavProfile2.click();
  } else {
    await page.locator(`a[href="${profileHref}"]`).first().click();
  }
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(articleTitle)).toHaveCount(0);

  // Filter out known benign or environment-specific console errors that are
  // unrelated to test failures (service worker registration on demo site,
  // external resource DNS failures in CI, etc.). Any remaining errors will
  // cause the test to fail.
  const ignorePatterns = [
    /service worker/i,
    /unsupported mime/i,
    /undefinedservice-worker/i,
    /net::ERR_NAME_NOT_RESOLVED/i,
    /Failed to load resource:/i,
  ];
  const relevantErrors = consoleErrors.filter((msg) => {
    return !ignorePatterns.some((rx) => rx.test(msg));
  });

  expect(
    relevantErrors.length,
    `Unexpected console errors:
${relevantErrors.join("\n")}`,
  ).toBe(0);
});
