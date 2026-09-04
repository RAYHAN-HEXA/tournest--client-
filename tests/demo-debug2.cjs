/* Debug the login fallback for a leftover account */
const { chromium } = require('playwright-core');
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await (await browser.newContext()).newPage();
  const logs = [];
  page.on('response', (r) => { if (r.url().includes('localhost:5000')) logs.push(`RESP: ${r.status()} ${r.url()}`); });
  page.on('pageerror', (e) => logs.push(`PAGEERROR: ${e.message}`));

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('#email', 'kamrul.guide@demo.tournest.dev');
  await page.fill('#password', 'DemoPass123');
  await page.locator('button[type="submit"]:has-text("Login")').click();
  await page.waitForTimeout(7000);

  console.log('URL:', page.url());
  const toasts = await page.locator('text=/Welcome|Wrong|No account|failed/i').allTextContents().catch(() => []);
  console.log('TOASTS:', toasts);
  console.log(logs.join('\n') || '(no api calls)');
  await browser.close();
})();
