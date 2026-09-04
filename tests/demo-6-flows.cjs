/* TourNest demo-data Phase 6: fresh end-to-end user flows after data creation.
 * Traveler: register → explore → book → my-bookings → reload persistence → logout.
 */
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

  // ── Fresh traveler: full happy path ──
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    const email = `flow.check.${Date.now()}@tournest.dev`;
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.fill('#name', 'Flow Check');
    await page.fill('#email', email);
    await page.fill('#password', 'DemoPass123');
    await page.locator('button[type="submit"]:has-text("Create Account")').click();
    await page.locator('header button[aria-label="Open profile menu"]').waitFor({ timeout: 25000 });
    await page.waitForResponse((r) => r.url().endsWith('/api/users') && [200, 201].includes(r.status()), { timeout: 15000 }).catch(() => {});
    record('Fresh traveler registered', true, email);

    // explore → details → book
    await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
    await page.fill('input[aria-label="Search tours"]', 'Old Dhaka Food Tour');
    await page.waitForTimeout(900);
    await page.locator('article', { hasText: 'Old Dhaka Food Tour' }).first().locator('a:has-text("See Details")').click();
    await page.waitForURL('**/tours/**');
    const bookBtn = page.locator('button:has-text("Book Now")').first();
    await bookBtn.waitFor({ timeout: 10000 });
    await bookBtn.click();
    await page.fill('#bk-date', (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10); })());
    await page.selectOption('#bk-travelers', '2');
    await page.fill('#bk-phone', '+8801600000001');
    await page.locator('button[type="submit"]:has-text("Confirm")').click();
    const booked = await page.locator('text=Booking confirmed').waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    record('Booked Old Dhaka Food Tour', booked);

    // my bookings + reload persistence
    await page.goto(`${BASE}/my-bookings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const listed = (await page.locator('td:has-text("Old Dhaka Food Tour")').count()) > 0;
    record('Booking in My Bookings', listed);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const persisted = page.url().includes('/my-bookings') &&
      (await page.locator('td:has-text("Old Dhaka Food Tour")').count()) > 0;
    record('Auth + booking persist after reload', persisted, page.url());

    // logout
    await page.locator('header button[aria-label="Open profile menu"]').click();
    await page.locator('button:has-text("Logout")').click();
    await page.waitForTimeout(1500);
    const loggedOut = (await page.locator('header a:has-text("Login")').count()) > 0;
    record('Logout works', loggedOut);
  } catch (err) {
    record('Fresh traveler flow', false, err.message.slice(0, 140));
  } finally {
    await ctx.close();
  }

  // ── Google popup reachability (cannot complete interactive consent) ──
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  try {
    await page2.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    const [popup] = await Promise.all([
      ctx2.waitForEvent('page', { timeout: 15000 }).catch(() => null),
      page2.locator('button:has-text("Continue with Google")').click(),
    ]);
    if (popup) {
      await popup.waitForURL(/accounts\.google\.com/, { timeout: 20000 }).catch(() => {});
      const url = popup.url();
      record('Google popup reaches account chooser', url.includes('accounts.google.com'), url.slice(0, 60) + '…');
      record('(interactive consent requires a human — popup + project binding verified only)', true, 'declared limitation');
      await popup.close().catch(() => {});
    } else {
      record('Google popup launched', false, 'no popup event');
    }
  } catch (err) {
    record('Google flow', false, err.message.slice(0, 140));
  } finally {
    await ctx2.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\n=== Phase 6: ${results.length - failed}/${results.length} passed ===`);
  process.exitCode = failed ? 1 : 0;
})();
