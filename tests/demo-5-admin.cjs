/* Phase 5 retry: admin approval flow only, with rate-limit backoff */
const { chromium } = require('playwright-core');
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BASE = 'http://localhost:5173';

const results = [];
const record = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#email', 'admin@tournest.dev');
    await page.fill('#password', 'Admin@123456');
    await page.locator('button[type="submit"]:has-text("Login")').click();

    const avatar = page.locator('header button[aria-label="Open profile menu"]');
    try {
      await avatar.waitFor({ timeout: 12000 });
    } catch {
      console.log('  first attempt failed (rate limit?) — waiting 40s and retrying');
      await page.waitForTimeout(40000);
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
      await page.fill('#email', 'admin@tournest.dev');
      await page.fill('#password', 'Admin@123456');
      await page.locator('button[type="submit"]:has-text("Login")').click();
      await avatar.waitFor({ timeout: 15000 });
    }

    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Guide Applications")').click();
    await page.waitForTimeout(1500);

    const cards = page.locator('div.card:has(button:has-text("Approve"))');
    const n = await cards.count();
    record('Pending applications visible', n >= 3, n + ' cards');

    for (const [email, decision] of [
      ['arif.traveler@demo.tournest.dev', 'Approve'],
      ['mim.traveler@demo.tournest.dev', 'Approve'],
      ['rakib.traveler@demo.tournest.dev', 'Reject'],
    ]) {
      const card = page.locator('div.card', { hasText: email }).first();
      const btn = card.locator(`button:has-text("${decision}")`);
      if ((await btn.count()) === 0) {
        record(`${email} ${decision}`, false, 'button not found — already processed?');
        continue;
      }
      await btn.click();
      const toast = await page
        .locator('text=/approved as guide|application rejected/')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      record(`Admin ${decision.toLowerCase()} ${email}`, toast);
    }

    // approved guide can now access the dashboard
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page2.fill('#email', 'arif.traveler@demo.tournest.dev');
    await page2.fill('#password', 'DemoPass123');
    await page2.locator('button[type="submit"]:has-text("Login")').click();
    await page2.locator('header button[aria-label="Open profile menu"]').waitFor({ timeout: 20000 });
    await page2.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    const ok = page2.url().includes('/dashboard') &&
      (await page2.locator('h1:has-text("Guide Dashboard")').count()) > 0;
    record('Approved arif accesses Guide Dashboard', ok, page2.url());
    await ctx2.close();
  } catch (err) {
    record('Admin flow', false, err.message.slice(0, 140));
  } finally {
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\n=== Phase 5: ${results.length - failed}/${results.length} passed ===`);
  process.exitCode = failed ? 1 : 0;
})();
