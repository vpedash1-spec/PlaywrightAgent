# Playwright tests for demo.learnwebdriverio.com

This workspace contains a minimal Playwright TypeScript scaffold and a few starter tests targeting https://demo.learnwebdriverio.com/ (the "conduit" demo).

Quick start (Windows PowerShell):

```powershell
npm install
npx playwright install
npx playwright test
```

Notes:
- Tests are written in TypeScript; the `tests/` folder contains simple smoke tests for home, auth pages and article viewing.
- Update selectors in tests to match any site changes. Use `page.getByRole`, `getByLabel` and `getByText` for robust queries.
