# Playwright UI Test Plan — demo.learnwebdriverio.com

## Overview

Purpose: Provide a complete, actionable Playwright UI test plan to cover the demo site at
https://demo.learnwebdriverio.com/, focusing on end-to-end user journeys, edge cases, validation and
stability. This plan is written assuming a fresh browser state for each scenario.

Note about access: I don't have live browsing access from this environment to fingerprint exact
element selectors on the site. This plan intentionally uses robust selector strategies (data-testid
/ role / text / ARIA) and describes how to finalize selectors after site exploration. If you want, I
can next visit the site (or you can share a DOM snapshot) to convert these to exact selectors and
generate runnable Playwright tests.

## What I'll deliver next

- A set of prioritized test scenarios (happy paths + edge cases)
- For each scenario: title, preconditions, numbered steps, expected results, success/failure
  criteria
- Playwright-specific guidance: test structure, fixtures, selectors, test data strategy, retries and
  flakiness mitigations
- Example Playwright test skeletons and recommended file layout

## Assumptions

- Each test runs in a clean browser context (no prior cookies/localStorage unless scenario seeds
  them).
- The site supports basic e-commerce flows (product listing, product details, cart, checkout) and
  user authentication — if a page / feature is missing, skip that scenario or mark as N/A.
- The environment under test is reachable at https://demo.learnwebdriverio.com/.
- Tests will be executed with Playwright (Node) using the default test runner.

## Test contract (short)

- Inputs: user interactions (clicks, typing), test data (users, products), network conditions
  (optional)
- Outputs: UI state, API responses observed via UI, persisted artifacts (orders), messages and
  validations
- Error modes: form validation errors, server failures, network timeouts, stale elements
- Success: UI reflects correct state transitions, persistence confirmed where relevant, no uncaught
  errors in console

## Primary user journeys (critical paths)

1. Browse product catalog -> view product details -> add to cart -> view cart -> update quantity ->
   remove item
2. Search and filter catalog -> find product -> add to cart
3. Register new user -> login -> place an order via checkout -> view order history
4. Login as existing user -> persistent cart across sessions
5. Guest checkout (if supported) -> place order
6. Error flows: invalid form input, payment rejection (if simulated), API failure handling

## Page / component inventory (to validate during exploration)

- Homepage / Catalog (product cards, categories, search box, sort, filters)
- Product details page (images, price, description, add-to-cart, variant selection)
- Cart page / mini-cart (items list, quantity controls, remove item, subtotal)
- Checkout page (shipping address form, payment form or simulation, place order)
- Authentication (signup, login, logout, forgot-password)
- Account area (profile, order history) — may be optional
- Global UI: header, footer, navigation links, responsive breakpoints
- Notifications, toasts, modal dialogs

## Test data strategy

- Use seeded test users (recommended): one valid user, one user with no orders, one locked/invalid
  user
- Use product fixture with at least: SKU, name, price, available quantity, attributes (size/color)
- For checkout: use a representative address dataset (valid and invalid addresses)
- For payment: if real gateway isn't used, rely on simulated success/failure test endpoints or UI
  toggles

## Selector strategy and stability

- Prefer `data-testid` or `data-test` attributes; if absent, use accessible queries (role, name) and
  visible text.
- Avoid brittle selectors (auto-generated class names). Use relative selectors (e.g., product card
  by its accessible name then find its Add button)
- Example robust patterns:
  - page.getByRole('button', { name: /add to cart/i })
  - page.getByLabel('Email')
  - page.locator('[data-testid="product-card"]').nth(0)

## Test organization (Playwright layout)

Suggested project structure:

- tests/
  - catalog/
    - browse.spec.ts
    - search-and-filter.spec.ts
  - cart/
    - cart-actions.spec.ts
  - auth/
    - register-login.spec.ts
  - checkout/
    - checkout-guest.spec.ts
    - checkout-registered.spec.ts
  - accessibility/
    - a11y.spec.ts
- fixtures/
  - users.ts
  - products.ts
- playwright.config.ts
- package.json
- README.md

## Test suites and priorities

Priority 1 (smoke, run on every push):

- Browse catalog (list visible, product cards clickable)
- Add to cart and cart summary
- Checkout happy path (guest or registered)
- Login/logout

Priority 2 (regression):

- Search and filtering
- Quantity update and remove item
- Persistent cart across sessions
- Signup and profile update

Priority 3 (edge, exploratory):

- Error handling for failed API calls
- Accessibility checks
- Responsive layout and small-screen behavior
- Data-driven tests for several product types

## Scenarios (detailed)

Each scenario below assumes a fresh browser context unless noted.

### 1. Browse catalog - product cards visible

Assumption: Homepage lists products.

Steps:

1. Navigate to the homepage `/`.
2. Wait for product list to load.
3. Inspect the first product card for image, title, price, and Add to Cart button.

Expected results:

- Product list is visible and contains at least one product card.
- Each product card shows an image, name, and price.
- Add to Cart control is present and enabled.

Success criteria: Test passes if elements exist and are interactable within an acceptable timeout.

Failure conditions: No products shown, missing key elements, or Add to Cart disabled.

---

### 2. View product details

Assumption: Clicking a product goes to a product detail page.

Steps:

1. From the catalog, click the first product name or image.
2. Wait for navigation to product detail page.
3. Verify product title, price, description, image gallery, and Add to Cart.

Expected results:

- URL includes a product identifier.
- All product attributes display correctly.
- The Add to Cart button is present.

Success: details match the catalog preview for that product.

Failure: mismatch in title/price or missing elements.

---

### 3. Add to cart and verify cart summary

Steps:

1. On a product detail page, click Add to Cart.
2. Open the cart (click cart icon or navigate to `/cart`).
3. Verify the product appears with correct price and quantity 1.
4. Verify subtotal equals product price.

Expected:

- Cart lists the product and shows correct totals.
- Quantity controls available (increase/decrease) and Remove control present.

Edge checks:

- Add the same product twice and verify quantity increments and totals update.

Failure: wrong totals, duplicates shown as separate lines (unless design says otherwise).

---

### 4. Update cart quantities and remove item

Steps:

1. In cart, increase quantity to 2; verify subtotal doubles (price \* 2).
2. Decrease quantity back to 1; verify subtotal changes accordingly.
3. Remove item; verify cart is empty and a "Your cart is empty" message appears.

Expected:

- Quantity changes update totals immediately or after UI confirm.
- Remove action clears item and updates counters.

Edge: setting quantity to more than available stock should show an error or capped value.

---

### 5. Search and filter results

Assumption: Site provides a search input and category/attribute filters.

Steps:

1. Enter a known product name into search input and submit.
2. Verify results include the product and unrelated products are not shown.
3. Apply a filter (e.g., price range, category) and verify results change accordingly.

Expected:

- Search returns relevant results quickly.
- Filter state is visible and applied; breadcrumbs or pills show active filters.

Failure: Search returns zero results for known product or filters are ignored.

---

### 6. Register new user (happy path)

Assumption: Registration page available.

Steps:

1. Navigate to Sign Up page.
2. Fill required fields (email, password, name) with valid values.
3. Submit the form.
4. Verify the site logs in the user or shows a success message; optionally check account page.

Expected:

- Registration succeeds and account/profile page accessible.
- Session cookie or localStorage token set.

Negative tests:

- Submit invalid email -> show validation message.
- Submit weak password -> show strength validation.

---

### 7. Login / Logout flow

Steps:

1. Navigate to Login page.
2. Enter valid credentials and submit.
3. Verify successful login (user name in header, access to account pages).
4. Logout and verify session cleared and user returned to public view.

Expected:

- Proper session management and UI state changes.

Failure: Protected pages accessible while logged out.

---

### 8. Checkout flow (registered user)

Assumption: User is logged in and has items in cart.

Steps:

1. Go to cart and click Checkout.
2. Fill shipping address form with valid data.
3. Choose shipping method if applicable.
4. Provide payment details (use test card or simulation mode).
5. Confirm and place order.
6. Verify order confirmation page and an order ID visible.
7. Visit order history and verify the new order is listed.

Expected:

- Order is created and visible in confirmation and order history.
- Cart is cleared after successful checkout.

Edge: Payment fails -> user sees clear error and cart remains intact.

---

### 9. Guest checkout (if supported)

Steps:

1. Without logging in, add item to cart and proceed to checkout.
2. Enter shipping and payment info and place order.

Expected:

- Order confirmation succeeds and may ask to create account later.

Failure: Checkout blocked unless logged in when guest checkout expected.

---

### 10. Error handling: server 500 / network failures

Steps:

1. Simulate API failure for product list or cart (via test hook, intercept or network throttle).
2. Load the page or trigger the failing operation.

Expected:

- User-friendly error messages appear.
- UI recovers or offers retry.

Failure: uncaught JavaScript errors, blank screens.

---

### 11. Accessibility smoke

Steps:

1. Run an automated a11y check (axe-core via Playwright) on key pages: home, product, cart,
   checkout.
2. Verify no critical violations (color contrast, missing form labels, focus order).

Expected:

- No critical violations; any violations documented for dev.

---

### 12. Responsive layout checks

Steps:

1. Run catalog and checkout flows on viewport sizes: 375x812 (mobile), 768x1024 (tablet), 1366x768
   (desktop).
2. Verify navigation, cart, and checkout usable at each breakpoint.

Expected:

- No broken layouts, essential controls accessible.

---

### 13. Security-like inputs (XSS/invalid input)

Steps:

1. Enter script tags or long payloads into text fields (name, address, search) and submit where
   applicable.

Expected:

- Input treated as data; output escaped or sanitized; no script execution.

Failure: alert dialogs or DOM injection observed.

---

## Playwright-specific test guidance

- Use Playwright Test runner with fixtures for users and product seeds.
- Use test.beforeEach to ensure a fresh state and optionally seed data via API calls.
- Use request fixtures (playwright.request) to create users or orders quickly where appropriate.
- Prefer `page.getByRole` / `page.getByLabel` / `page.getByTestId` queries.
- Use `expect(locator).toHaveText()` and `toHaveCount()` for assertions; use timeouts where network
  may be slow.
- Mark flaky network-dependent tests with `test.fixme` or `test.skip` when run in unstable
  environments.
- Use `page.waitForResponse` or route interception to assert backend calls for critical actions (add
  to cart, place order).

Retries and concurrency:

- Enable `retries: 1-2` in CI to reduce flakiness.
- Run stable smoke tests in serial if they depend on shared state; use parallelization for isolated
  tests.

CI recommendation:

- Run Priority 1 suite on each PR and run full suites nightly.
- Capture traces for failed tests (`TRACE` mode) and screenshots on failure.

## Example Playwright test skeleton (TypeScript)

```ts
import { test, expect } from '@playwright/test';

test('browse catalog displays products', async ({ page }) => {
  await page.goto('https://demo.learnwebdriverio.com/');
  const cards = page.getByTestId?.('product-card') ?? page.locator('.product-card');
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCountGreaterThan(0);
});
```

Note: Replace `getByTestId('product-card')` with the actual attribute once the site is inspected.

## Example: seeding via API (pseudo)

- Create a `tests/helpers/api.ts` that uses Playwright's APIRequestContext to POST test users and
  products.
- Call those helpers in `test.beforeEach` or in a dedicated `seed` step before the suite.

## Failure diagnostics and observability

- On failure, collect a screenshot, DOM snapshot, browser console logs, and Playwright trace.
- Attach these artifacts to CI job output for debugging.

## Performance and non-functional checks

- Basic metric: measure time to interactive for homepage and product page and fail if > threshold
  (example: 3s on CI network)
- Use `page.metrics()` (where possible) or simple timers around `page.goto` and
  `page.waitForLoadState('networkidle')`.

## Test data cleanup

- Provide cleanup hooks in API helpers to remove test users/orders created during tests.
- Use distinct unique prefixes for test user emails (e.g., `pwtest+{timestamp}@example.com`).

## Next steps / How I can help further

- I can open the live site and convert the abstract selectors into exact Playwright locators and
  generate runnable tests.
- I can scaffold a Playwright project (files, config, a few runnable tests) in this repo and run
  them locally/CI.

If you'd like me to proceed with generating actual Playwright test files and wiring them into a
`package.json` + `playwright.config.ts`, tell me to continue and whether you want TypeScript or
JavaScript. Also indicate if I should attempt to visit the live site to extract selectors now (I
don't have browser access in this environment unless you enable such tooling or provide a DOM
snapshot).

---

## Short completion summary

- Created a comprehensive Playwright-focused test plan covering critical flows, edge cases, and
  implementation guidance.
- The plan is intentionally selector-agnostic and includes clear instructions for converting to
  stable Playwright locators after site inspection.
