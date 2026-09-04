/* TourNest demo-data Phase 3: 15+ bookings through the real booking modal UI.
 * Includes repeat bookings on the same tour to verify bookedCount ACCUMULATES.
 */
const { chromium } = require('playwright-core');

const BASE = 'http://localhost:5173';
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const PASS = 'DemoPass123';

const travelers = [
  'arif.traveler@demo.tournest.dev',
  'mim.traveler@demo.tournest.dev',
  'rakib.traveler@demo.tournest.dev',
  'tasnim.traveler@demo.tournest.dev',
  'sajid.traveler@demo.tournest.dev',
  'nadia.traveler@demo.tournest.dev',
];

const results = [];
const record = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  let booked = 0;

  // Booking plan: 16 bookings; two tours get booked 3x, one 2x, others once.
  // [travelerIdx, tourTitle, travelersCount, daysAhead]
  const plan = [
    [0, 'Sundarbans Wildlife Adventure', 2, 12],
    [1, 'Sundarbans Wildlife Adventure', 3, 12],
    [2, 'Sundarbans Wildlife Adventure', 1, 13],
    [0, "Cox's Bazar Beach Experience", 2, 6],
    [3, "Cox's Bazar Beach Experience", 4, 6],
    [4, "Cox's Bazar Beach Experience", 2, 7],
    [1, 'Dhaka Heritage Walking Tour', 2, 4],
    [2, 'Dhaka Heritage Walking Tour', 3, 4],
    [3, 'Saint Martin Island Escape', 2, 20],
    [4, 'Sylhet Tea Garden Tour', 2, 9],
    [5, 'Old Dhaka Food Tour', 3, 5],
    [0, 'Bagerhat Historical Mosque Tour', 2, 10],
    [1, 'Rangamati Lake Adventure', 2, 15],
    [2, 'Bandarban Hill Trek', 2, 19],
    [5, 'Historic Khulna City Tour', 4, 7],
    [3, 'Sundarbans Wildlife Adventure', 2, 13],
  ];

  for (const [tIdx, tourTitle, people, daysAhead] of plan) {
    const email = travelers[tIdx];
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    try {
      // login
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
      await page.fill('#email', email);
      await page.fill('#password', PASS);
      await page.locator('button[type="submit"]:has-text("Login")').click();
      await page.locator('header button[aria-label="Open profile menu"]').waitFor({ timeout: 25000 });

      // find tour via search on Explore
      await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
      await page.fill('input[aria-label="Search tours"]', tourTitle);
      await page.waitForTimeout(900);
      const card = page.locator('article', { hasText: tourTitle }).first();
      await card.locator('a:has-text("See Details")').click();
      await page.waitForURL('**/tours/**', { timeout: 15000 });
      await page.waitForTimeout(1200);

      const bookBtn = page.locator('button:has-text("Book Now")').first();
      await bookBtn.waitFor({ timeout: 10000 });

      // read seats-left from the badge before booking
      const seatsText = await page.locator('text=/seats left/').first().textContent().catch(() => '');
      const seatsBefore = parseInt(seatsText, 10) || null;

      await bookBtn.click();
      await page.locator('#bk-date').waitFor({ timeout: 10000 });

      // booking date
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      await page.fill('#bk-date', d.toISOString().slice(0, 10));
      await page.selectOption('#bk-travelers', String(people));
      await page.fill('#bk-name', email.split('.')[0].replace(/^./, (c) => c.toUpperCase()));
      await page.fill('#bk-phone', `+88017${String(10000000 + booked).slice(0, 8)}`);
      await page.fill('#bk-meeting', 'Hotel lobby please');
      await page.fill('#bk-request', 'Vegetarian meals preferred.');

      await page.locator('button[type="submit"]:has-text("Confirm")').click();
      const success = await page
        .locator('text=Booking confirmed')
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      record(`Booking: ${email.split('.')[0]} × ${tourTitle} (${people}p)`, success);
      if (!success) continue;
      booked++;

      // My Bookings shows it
      await page.goto(`${BASE}/my-bookings`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const listed = (await page.locator(`td:has-text("${tourTitle}")`).count()) > 0;
      record(`  ↳ in My Bookings`, listed);

      // back to details: seat count should have dropped
      await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
      await page.fill('input[aria-label="Search tours"]', tourTitle);
      await page.waitForTimeout(900);
      await page.locator('article', { hasText: tourTitle }).first().locator('a:has-text("See Details")').click();
      await page.waitForTimeout(1500);
      const seatsTextAfter = await page.locator('text=/seats left|Fully booked/').first().textContent().catch(() => '');
      const seatsAfter = parseInt(seatsTextAfter, 10);
      if (seatsBefore !== null && !Number.isNaN(seatsAfter)) {
        record(`  ↳ seats ${seatsBefore} → ${seatsAfter}`, seatsAfter === seatsBefore - people, `-${people} expected`);
      }
    } catch (err) {
      record(`Booking ${email} × ${tourTitle}`, false, err.message.slice(0, 120));
    } finally {
      await ctx.close();
    }
  }

  await browser.close();
  console.log(`\nBookings created via UI: ${booked}/${plan.length}`);
  const failed = results.filter((r) => !r).length;
  console.log(`=== Phase 3: ${results.length - failed}/${results.length} passed ===`);
  process.exitCode = failed ? 1 : 0;
})();
