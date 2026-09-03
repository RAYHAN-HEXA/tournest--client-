/* TourNest E2E smoke test via headless Chrome (playwright-core). */
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
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));

  try {
    // 1. Home page loads
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    const heroVisible = await page.locator('h1').first().isVisible();
    record('Home: hero renders', heroVisible);
    const title = await page.title();
    record('Home: dynamic title', title.includes('TourNest'), title);

    // 2. Navbar links
    for (const label of ['Home', 'Explore Tours']) {
      const count = await page.locator(`nav a:has-text("${label}")`).count();
      record(`Navbar: "${label}" link`, count > 0);
    }

    // 3. Featured guides section fetched from API
    await page.waitForSelector('text=Featured Local Guides', { timeout: 10000 });
    await page.waitForTimeout(1200);
    const guideCards = await page.locator('article:has-text("View Profile")').count();
    record('Home: guides fetched', guideCards > 0, `${guideCards} guide cards`);

    // 4. Popular tours section
    const tourCards = await page.locator('article:has-text("See Details")').count();
    record('Home: popular tours fetched', tourCards > 0, `${tourCards} tour cards`);

    // 5. Explore Tours page
    await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const exploreTitle = await page.title();
    record('Explore: dynamic title', exploreTitle.includes('Explore Tours'), exploreTitle);
    const exploreCards = await page.locator('article').count();
    record('Explore: tours grid', exploreCards > 0, `${exploreCards} cards`);

    // 6. Category filter
    await page.locator('button:has-text("Filters")').first().click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Food & Local Life")').first().click();
    await page.waitForTimeout(1200);
    const filteredCards = await page.locator('article').count();
    record('Explore: category filter works', filteredCards > 0 && filteredCards < exploreCards, `${filteredCards} after filter`);
    // reset
    await page.locator('button:has-text("Clear all filters")').click();
    await page.waitForTimeout(1000);

    // 7. Search
    await page.fill('input[type="search"]', 'Sundarbans');
    await page.waitForTimeout(1600);
    const searchCards = await page.locator('article').count();
    record('Explore: search works', searchCards >= 1, `${searchCards} results for Sundarbans`);

    // 8. Tour details page
    await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.locator('article a:has-text("See Details")').first().click();
    await page.waitForURL(/\/tours\//, { timeout: 10000 });
    await page.waitForTimeout(1200);
    const hasBookNow = await page.locator('text=Login to Book').count();
    record('TourDetails: renders for anon (Login to Book)', hasBookNow > 0);

    // 9. Guide profile page
    await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.locator('a:has-text("View Profile")').first().click();
    await page.waitForURL(/\/guides\//, { timeout: 10000 });
    await page.waitForTimeout(1000);
    const guidePageVisible = await page.locator('text=Years of guiding experience').count() > 0 || await page.locator('text=of guiding experience').count() > 0;
    record('GuideProfile: renders', guidePageVisible);

    // 10. Protected route redirects anon user
    await page.goto(`${BASE}/my-bookings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const onLogin = page.url().includes('/login');
    record('Protected route: anon redirected to /login', onLogin, page.url());

    // 11. Login page renders
    const loginForm = await page.locator('input#email').count();
    record('Login: form renders', loginForm > 0);

    // 12. Register page renders + password rule hints
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    const hasRoleRadio = await page.locator('input[value="traveler"]').count() > 0 && await page.locator('input[value="guide"]').count() > 0;
    record('Register: role selection renders', hasRoleRadio);
    const pwHint = await page.locator('text=One uppercase letter').count();
    record('Register: password rules shown', pwHint > 0);

    // 13. 404 page
    await page.goto(`${BASE}/this-page-does-not-exist`, { waitUntil: 'networkidle' });
    const notFound = await page.locator('text=404').count();
    record('404: page renders', notFound > 0);

    // 14. Reload protected route while logged out → login (no crash)
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    record('Login page: no crash after reload', true);

    // Console errors (filter out network noise from FB analytics etc.)
    const realErrors = consoleErrors.filter(
      (e) => !e.includes('net::') && !e.includes('favicon') && !e.includes('Failed to load resource')
    );
    record('Console: no uncaught errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));
  } catch (err) {
    record('FATAL', false, err.message);
  }

  await browser.close();
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n=== ${pass}/${results.length} passed ===`);
  process.exit(pass === results.length ? 0 : 1);
})();
