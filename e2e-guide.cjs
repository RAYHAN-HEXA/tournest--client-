/* TourNest guide E2E: login as seeded guide → dashboard → add tour → update → delete. */
const { chromium } = require('playwright-core');

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const email = `e2e-guide-${Date.now()}@tournest.dev`;
const password = 'TestPass123';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));

  try {
    // Register as guide (role radio = guide)
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.fill('#name', 'E2E Guide');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.check('input[value="guide"]');
    await page.locator('button[type="submit"]:has-text("Create Account")').click();
    await page.waitForTimeout(4000);

    // Should be able to open dashboard directly (role=guide at registration)
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    record('GuideDashboard: accessible for guide role', page.url().includes('/dashboard'), page.url());

    // Add tour
    await page.goto(`${BASE}/dashboard/add-tour`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.fill('#t-title', 'E2E Test Tour — Sreemangal Tea Ride');
    await page.selectOption('#t-category', 'Nature & Adventure');
    await page.fill('#t-destination', 'Sreemangal');
    await page.fill('#t-description', 'A scenic bicycle ride through the Sreemangal tea estates with stops at smallholder gardens and a seven-layer tea tasting. Created by automated E2E testing and safe to delete.');
    await page.fill('#t-image', 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=1200&q=80');
    await page.fill('#t-price', '1500');
    await page.fill('#t-duration', '6 Hours');
    await page.fill('#t-max', '8');
    await page.fill('#t-meeting', 'Sreemangal Railway Station');
    await page.locator('button[type="submit"]:has-text("Publish Tour")').click();
    await page.waitForTimeout(2500);

    const backOnDashboard = page.url().endsWith('/dashboard');
    record('AddTour: published and redirected', backOnDashboard, page.url());

    const tourCard = await page.locator('article:has-text("E2E Test Tour")').count();
    record('Dashboard: new tour listed', tourCard > 0);

    // Guide email read-only check happened implicitly; now update tour
    await page.locator('article:has-text("E2E Test Tour") a:has-text("Update")').click();
    await page.waitForTimeout(1500);
    const price = await page.locator('#t-price').inputValue();
    record('UpdateTour: form prefilled', price === '1500', price);
    await page.fill('#t-price', '1800');
    await page.locator('button[type="submit"]:has-text("Save Changes")').click();
    await page.waitForTimeout(2500);
    const updatedCard = await page.locator('article:has-text("৳1,800")').count();
    record('UpdateTour: price changed to 1800', updatedCard > 0);

    // Booking request appears in dashboard table (guide seeded bookings won't, but our traveler booked "Cox" — skip)
    // Delete tour with confirmation modal
    await page.locator('article:has-text("E2E Test Tour") button:has-text("Delete")').click();
    await page.waitForTimeout(500);
    const modal = await page.locator('text=Delete this tour?').count();
    record('DeleteTour: confirmation modal shows', modal > 0);
    await page.locator('button:has-text("Yes, delete")').click();
    await page.waitForTimeout(2000);
    const gone = await page.locator('article:has-text("E2E Test Tour")').count();
    record('DeleteTour: tour removed', gone === 0);

    // Role guard: guide hitting /admin should see access-restricted page
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const restricted = await page.locator('text=Access restricted').count();
    record('Role guard: guide blocked from /admin', restricted > 0);

    const realErrors = consoleErrors.filter((e) => !e.includes('net::') && !e.includes('favicon'));
    record('Console: no uncaught errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));
  } catch (err) {
    record('FATAL', false, err.message);
  }

  await browser.close();
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n=== ${pass}/${results.length} passed ===`);
  process.exit(pass === results.length ? 0 : 1);
})();
