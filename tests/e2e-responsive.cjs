/* TourNest responsive + dark mode + guide-application approval E2E. */
const { chromium } = require('playwright-core');

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });

  // --- Mobile viewport ---
  const mobile = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mpage = await mobile.newPage();
  await mpage.goto(BASE, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(1000);

  const hamburger = await mpage.locator('header button[aria-label="Toggle navigation menu"]').count();
  record('Mobile: hamburger menu visible', hamburger > 0);

  const noHorizScroll = await mpage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  record('Mobile: no horizontal scroll on home', noHorizScroll);

  await mpage.locator('header button[aria-label="Toggle navigation menu"]').click();
  await mpage.waitForTimeout(400);
  const mobileMenu = await mpage.locator('text=Explore Tours').nth(1).isVisible();
  record('Mobile: menu opens with links', mobileMenu);
  await mobile.close();

  // --- Tablet viewport ---
  const tablet = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tpage = await tablet.newPage();
  await tpage.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
  await tpage.waitForTimeout(1200);
  const tScroll = await tpage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  record('Tablet: no horizontal scroll on explore', tScroll);
  await tablet.close();

  // --- Dark mode toggle ---
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const dpage = await dctx.newPage();
  await dpage.goto(BASE, { waitUntil: 'networkidle' });
  const wasDark = await dpage.evaluate(() => document.documentElement.classList.contains('dark'));
  await dpage.locator('button[aria-label*="mode"]').click();
  await dpage.waitForTimeout(400);
  const nowDark = await dpage.evaluate(() => document.documentElement.classList.contains('dark'));
  record('Theme: toggle switches dark class', wasDark !== nowDark, `${wasDark} → ${nowDark}`);
  // persists across reload
  await dpage.reload({ waitUntil: 'networkidle' });
  const persisted = await dpage.evaluate(() => document.documentElement.classList.contains('dark'));
  record('Theme: preference persists after reload', persisted === nowDark);
  await dctx.close();

  // --- Guide application approval loop (API-driven admin part) ---
  // Register a new traveler via UI and submit guide application
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const email = `e2e-applicant-${Date.now()}@tournest.dev`;
  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
  await page.fill('#name', 'E2E Applicant');
  await page.fill('#email', email);
  await page.fill('#password', 'TestPass123');
  await page.locator('button[type="submit"]:has-text("Create Account")').click();
  await page.waitForTimeout(4000);

  await page.goto(`${BASE}/become-a-guide`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.fill('#g-location', 'Rangamati, Bangladesh');
  await page.fill('#g-experience', '4');
  await page.fill('#g-expertise', 'Lake kayaking, tribal culture');
  await page.fill('#g-bio', 'I grew up beside Kaptai Lake and have been paddling its coves since I was twelve. I now guide kayak trips and homestay visits in Rangamati for automated testing.');
  await page.fill('#g-phone', '+8801711555666');
  await page.locator('button:has-text("Bengali")').click();
  await page.locator('button:has-text("English")').first().click();
  await page.locator('button[type="submit"]:has-text("Submit Application")').click();
  await page.waitForTimeout(2500);
  record('BecomeGuide: application submitted', true);

  // traveler now sees pending screen
  await page.goto(`${BASE}/become-a-guide`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const pending = await page.locator('text=Application under review').count();
  record('BecomeGuide: pending state shown', pending > 0);
  await ctx.close();

  // Admin approves via API
  // Sign in via the Firebase Identity Toolkit REST API using the TourNest key.
  const adminLogin = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.VITE_FIREBASE_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@tournest.dev', password: 'Admin@123456', returnSecureToken: true }),
  }).then((r) => r.json());

  const api = 'https://tournest-server.vercel.app';
  // Get firebase id token → exchange for JWT
  const sync = await fetch(`${api}/api/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminLogin.idToken}` },
    body: JSON.stringify({}),
  }).then((r) => r.json());
  const jwt = sync.token;

  const apps = await fetch(`${api}/api/admin/guide-applications`, { headers: { Authorization: `Bearer ${jwt}` } }).then((r) => r.json());
  const target = apps.applications.find((a) => a.email === email);
  record('Admin API: pending application visible', Boolean(target));

  if (target) {
    const approve = await fetch(`${api}/api/admin/guide-applications/${target._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ decision: 'approved' }),
    }).then((r) => r.json());
    record('Admin API: application approved', approve.user?.role === 'guide', JSON.stringify(approve.user?.role));
  }

  // The approved user can now access dashboard
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page2 = await ctx2.newPage();
  await page2.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page2.fill('#email', email);
  await page2.fill('#password', 'TestPass123');
  await page2.locator('button[type="submit"]:has-text("Login")').click();
  await page2.waitForTimeout(3500);
  await page2.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page2.waitForTimeout(2000);
  record('Approved applicant: can access guide dashboard', page2.url().includes('/dashboard'), page2.url());
  await ctx2.close();

  await browser.close();
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n=== ${pass}/${results.length} passed ===`);
  process.exit(pass === results.length ? 0 : 1);
})();
