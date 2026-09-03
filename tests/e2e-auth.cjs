/* TourNest authenticated E2E: register → book → my-bookings → reload persistence → guide flows. */
const { chromium } = require('playwright-core');

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const email = `e2e-traveler-${Date.now()}@tournest.dev`;
const password = 'TestPass123';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));

  try {
    // 1. Register a new traveler
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.fill('#name', 'E2E Traveler');
    await page.fill('#email', email);
    await page.fill('#password', password);
    // password hint should go green
    const greenRule = await page.locator('li.text-emerald-600, li:has-text("At least 6 characters")').first().getAttribute('class');
    record('Register: live password feedback', greenRule?.includes('emerald'), greenRule || '');
    await page.locator('button[type="submit"]:has-text("Create Account")').click();
    await page.waitForTimeout(4000);
    const avatarVisible = await page.locator('header button[aria-label="Open profile menu"]').count();
    record('Register: account created & avatar shown', avatarVisible > 0);

    // 2. Protected route access + reload persistence
    await page.goto(`${BASE}/my-bookings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const stayedOnBookings = page.url().includes('/my-bookings');
    record('MyBookings: accessible when logged in', stayedOnBookings, page.url());

    // empty state first
    const emptyState = await page.locator('text=No bookings yet').count();
    record('MyBookings: empty state shows', emptyState > 0);

    // 3. Reload → still authenticated (no redirect to /login)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const stillOnBookings = page.url().includes('/my-bookings');
    record('MyBookings: persists after reload', stillOnBookings, page.url());

    // 4. Book a tour end-to-end
    await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // search for a cheap tour
    await page.fill('input[type="search"]', 'Cox');
    await page.waitForTimeout(1600);
    await page.locator('article a:has-text("See Details")').first().click();
    await page.waitForURL(/\/tours\//, { timeout: 10000 });
    await page.waitForTimeout(1500);
    const bookBtn = page.locator('button:has-text("Book Now")');
    record('TourDetails: Book Now visible when logged in', (await bookBtn.count()) > 0);
    await bookBtn.click();
    await page.waitForTimeout(600);

    // modal open: check read-only email
    const emailVal = await page.locator('#bk-email').inputValue();
    record('BookingModal: email read-only & prefilled', emailVal === email, emailVal);

    // dynamic total: pick 3 travelers
    await page.selectOption('#bk-travelers', '3');
    await page.waitForTimeout(300);
    const confirmLabel = await page.locator('button:has-text("Confirm")').textContent();
    const hasTotal = confirmLabel.includes('৳3,600'); // 1200 × 3
    record('BookingModal: dynamic total (1200×3=3600)', hasTotal, confirmLabel.trim());

    await page.fill('#bk-phone', '+8801711999888');
    await page.fill('#bk-request', 'Vegetarian snacks please');
    await page.locator('button:has-text("Confirm")').click();
    await page.waitForTimeout(2500);
    const toast = await page.locator('text=Booking confirmed').count();
    record('Booking: success toast', toast > 0);

    // 5. Booking appears in My Bookings
    await page.goto(`${BASE}/my-bookings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const row = await page.locator('tr:has-text("Cox")').count();
    record('MyBookings: new booking listed', row > 0, `${row} matching rows`);
    const statusBadge = await page.locator('tr:has-text("Cox") span:has-text("Pending")').count();
    record('MyBookings: status pending', statusBadge > 0);

    // 6. View details modal
    await page.locator('tr:has-text("Cox") button[title="View details"]').click();
    await page.waitForTimeout(500);
    const detailVisible = await page.locator('text=Booking details').count();
    record('MyBookings: details modal opens', detailVisible > 0);
    const specialReq = await page.locator('td:has-text("Vegetarian snacks please"), dd:has-text("Vegetarian snacks please")').count();
    record('MyBookings: special request stored', specialReq > 0);
    await page.locator('button:has-text("Close")').click();

    // 7. Overbooking guard UI: try to book more than seats left
    // (Cox tour max=15, fine) — instead test date validation: date after availability blocked
    // Skip UI-level; API-level already covered.

    // 8. Cancel booking
    await page.locator('tr:has-text("Cox") button[title="Cancel booking"]').click();
    await page.waitForTimeout(400);
    const confirmCancel = await page.locator('button:has-text("Yes, cancel it")').count();
    record('Cancel: confirmation modal shows', confirmCancel > 0);
    await page.locator('button:has-text("Yes, cancel it")').click();
    await page.waitForTimeout(2000);
    const cancelled = await page.locator('tr:has-text("Cox") span:has-text("Cancelled")').count();
    record('Cancel: status updated to Cancelled', cancelled > 0);

    // 9. Navbar now shows authenticated links
    for (const label of ['My Bookings', 'Become a Guide']) {
      const count = await page.locator(`nav a:has-text("${label}")`).count();
      record(`Navbar (auth): "${label}" link`, count > 0);
    }

    // 10. Become a Guide page
    await page.goto(`${BASE}/become-a-guide`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const form = await page.locator('#g-location').count();
    record('BecomeGuide: form renders', form > 0);

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
