/* TourNest demo-data Phase 1 (v2): register 4 guides + 6 travelers through the real UI.
 * Waits for the success toast (not URL regex). If Firebase says the email is taken
 * (leftover from an aborted run), falls back to logging in through the UI.
 */
const { chromium } = require('playwright-core');

const BASE = 'http://localhost:5173';
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const guides = [
  { name: 'Kamrul Hasan', email: 'kamrul.guide@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', role: 'guide' },
  { name: 'Shapla Akter', email: 'shapla.guide@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80', role: 'guide' },
  { name: 'Jahid Islam', email: 'jahid.guide@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', role: 'guide' },
  { name: 'Rumana Malik', email: 'rumana.guide@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', role: 'guide' },
];

const travelers = [
  { name: 'Arif Chowdhury', email: 'arif.traveler@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Mim Sultana', email: 'mim.traveler@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80' },
  { name: 'Rakib Mahmud', email: 'rakib.traveler@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tasnim Rahman', email: 'tasnim.traveler@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sajid Khan', email: 'sajid.traveler@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Nadia Haque', email: 'nadia.traveler@demo.tournest.dev', password: 'DemoPass123', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },
];

const results = [];
const record = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });

  // The navbar avatar only renders for an authenticated user — the reliable
  // "logged in" signal (toasts vanish after 3.5s, easy to miss). We additionally
  // wait for the server-sync POST so we never close the page mid-request.
  async function waitForAuth(page, timeout = 25000) {
    try {
      await page.locator('header button[aria-label="Open profile menu"]').waitFor({ state: 'visible', timeout });
      // Wait for the server session-sync to settle (200/201 on POST /api/users).
      const syncFinished = page.waitForResponse(
        (r) => r.url().endsWith('/api/users') && r.request().method() === 'POST' && [200, 201].includes(r.status()),
        { timeout: 15000 }
      );
      await syncFinished.catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  async function register(page, u) {
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.fill('#name', u.name);
    await page.fill('#photoURL', u.photo);
    await page.fill('#email', u.email);
    await page.fill('#password', u.password);
    if (u.role === 'guide') await page.check('input[type="radio"][value="guide"]');
    await page.locator('button[type="submit"]:has-text("Create Account")').click();
    // Either auth succeeds (avatar) or an error toast explains why not.
    const outcome = await Promise.race([
      waitForAuth(page).then((ok) => (ok ? 'registered' : null)),
      page
        .locator('text=/already registered|Login failed|Registration failed|too many/i')
        .first()
        .waitFor({ state: 'visible', timeout: 25000 })
        .then(() => 'email-taken')
        .catch(() => null),
    ]);
    return outcome;
  }

  async function login(page, u) {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#email', u.email);
    await page.fill('#password', u.password);
    await page.locator('button[type="submit"]:has-text("Login")').click();
    return waitForAuth(page);
  }

  for (const u of [...guides, ...travelers]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    try {
      let outcome = await register(page, u);
      let ok = outcome === 'registered';

      if (outcome === 'email-taken') {
        // Leftover Firebase account from the aborted first run → log in via UI.
        record(`${u.email}: firebase leftover → login fallback`, true, 'retrying as login');
        ok = await login(page, u);
      }

      const avatarShown = (await page.locator('header button[aria-label="Open profile menu"]').count()) > 0;
      record(`${u.role === 'guide' ? 'Guide' : 'Traveler'} ${u.email}`, Boolean(ok) && avatarShown, ok ? 'authenticated' : `outcome=${outcome}`);

      if (u.role === 'guide' && avatarShown) {
        await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1200);
        const onDash = page.url().includes('/dashboard');
        record(`  ↳ dashboard access`, onDash, page.url());
      }
      if (errors.length) record(`  ↳ ${u.email} console errors`, false, errors[0]);
    } catch (err) {
      record(`Register ${u.email}`, false, err.message.slice(0, 120));
    } finally {
      await ctx.close();
    }
  }

  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\n=== Phase 1: ${results.length - failed}/${results.length} passed ===`);
  process.exitCode = failed ? 1 : 0;
})();
