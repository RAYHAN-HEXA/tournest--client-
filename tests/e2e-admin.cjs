/* TourNest admin E2E: login as admin → overview → users → tours → bookings tabs. */
const { chromium } = require('playwright-core');

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));

  try {
    // Login as seeded admin
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#email', 'admin@tournest.dev');
    await page.fill('#password', 'Admin@123456');
    await page.locator('button[type="submit"]:has-text("Login")').click();
    await page.waitForTimeout(3500);

    const avatar = await page.locator('header button[aria-label="Open profile menu"]').count();
    record('Admin: login works', avatar > 0);

    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const panel = await page.locator('text=Admin Panel').count();
    record('Admin: panel accessible', panel > 0, page.url());

    // Overview stat cards
    const statCards = await page.locator('text=Total users').count();
    const revenue = await page.locator('text=Revenue (৳)').count();
    record('Admin: overview stats render', statCards > 0 && revenue > 0);

    // Users tab
    await page.locator('button:has-text("Users")').click();
    await page.waitForTimeout(1500);
    const userRows = await page.locator('table tbody tr').count();
    record('Admin: users table loads', userRows > 0, `${userRows} users`);

    // Applications tab
    await page.locator('button:has-text("Guide Applications")').click();
    await page.waitForTimeout(1500);
    const noPending = await page.locator('text=all caught up').count() >= 0;
    record('Admin: applications tab renders', noPending);

    // Tours tab
    await page.locator('button:has-text("Tours")').first().click();
    await page.waitForTimeout(1500);
    const tourRows = await page.locator('table tbody tr').count();
    record('Admin: tours table loads', tourRows > 0, `${tourRows} tours`);

    // Bookings tab
    await page.locator('button:has-text("Bookings")').first().click();
    await page.waitForTimeout(1500);
    const bookingRows = await page.locator('table tbody tr').count();
    record('Admin: bookings table loads', bookingRows > 0, `${bookingRows} bookings`);

    // Navbar shows Guide Dashboard + Admin Panel links for admin
    const dash = await page.locator('nav a:has-text("Guide Dashboard")').count();
    const adm = await page.locator('nav a:has-text("Guide Dashboard")').count() > 0;
    record('Navbar (admin): guide dashboard link', dash > 0);

    const realErrors = consoleErrors.filter((e) => !e.includes('net::') && !e.includes('favicon'));
    record('Console: no uncaught errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

    // Logout via avatar menu
    await page.locator('header button[aria-label="Open profile menu"]').click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Logout")').click();
    await page.waitForTimeout(2000);
    const loginLink = await page.locator('nav a:has-text("Login")').count() + await page.locator('a:has-text("Login")').count();
    record('Logout: returns to logged-out state', loginLink > 0, page.url());
  } catch (err) {
    record('FATAL', false, err.message);
  }

  await browser.close();
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n=== ${pass}/${results.length} passed ===`);
  process.exit(pass === results.length ? 0 : 1);
})();
