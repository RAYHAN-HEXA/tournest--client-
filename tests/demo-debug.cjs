/* Debug one registration to see the actual failure */
const { chromium } = require('playwright-core');
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await (await browser.newContext()).newPage();
  const logs = [];
  page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`PAGEERROR: ${e.message}`));
  page.on('requestfailed', (r) => logs.push(`REQFAIL: ${r.method()} ${r.url()} — ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.url().includes('tournest-server.vercel.app')) logs.push(`RESP: ${r.status()} ${r.url()}`);
  });

  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
  await page.fill('#name', 'Debug User');
  await page.fill('#email', `debug.${Date.now()}@tournest.dev`);
  await page.fill('#password', 'DemoPass123');
  await page.locator('button[type="submit"]:has-text("Create Account")').click();
  await page.waitForTimeout(6000);

  console.log('URL:', page.url());
  const toasts = await page.locator('[role="status"], .go2072408551, [id^="toast"]').allTextContents().catch(() => []);
  console.log('TOASTS:', toasts);
  console.log('CONSOLE LOGS:\n' + logs.join('\n'));
  await browser.close();
})();
