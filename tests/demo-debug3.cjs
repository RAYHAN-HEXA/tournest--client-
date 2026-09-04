/* Debug: register one guide, capture the POST /api/users body over the wire */
const { chromium } = require('playwright-core');
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await (await browser.newContext()).newPage();

  page.on('request', (r) => {
    if (r.url().endsWith('/api/users') && r.method() === 'POST') {
      console.log('POST body:', r.postData());
    }
  });
  page.on('response', (r) => {
    if (r.url().endsWith('/api/users')) console.log('RESP:', r.status());
  });

  const email = `roleguide.${Date.now()}@tournest.dev`;
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
  await page.fill('#name', 'Role Debug Guide');
  await page.fill('#email', email);
  await page.fill('#password', 'DemoPass123');
  await page.check('input[type="radio"][value="guide"]');
  // confirm the radio actually got checked
  console.log('radio checked:', await page.locator('input[type="radio"][value="guide"]').isChecked());
  await page.locator('button[type="submit"]:has-text("Create Account")').click();
  await page.locator('header button[aria-label="Open profile menu"]').waitFor({ timeout: 25000 });
  await page.waitForTimeout(2000);
  await browser.close();
})();
