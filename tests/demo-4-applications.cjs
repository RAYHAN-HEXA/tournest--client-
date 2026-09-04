/* TourNest demo-data Phase 4+5: guide applications via Become a Guide UI,
 * then admin approval via /admin UI.
 */
const { chromium } = require('playwright-core');

const BASE = 'http://localhost:5173';
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const PASS = 'DemoPass123';

const applicants = [
  {
    email: 'arif.traveler@demo.tournest.dev',
    location: 'Chattogram, Bangladesh',
    bio: 'Coastal boy from Chattogram. I grew up fishing the Karnaphuli and know every seafood kitchen from Patenga to Sitakunda. My tours focus on port history and hill-tracks day trips.',
    expertise: 'Port history, seafood, hill-tracks logistics',
    experience: 4, languages: ['Bengali', 'English', 'Chakma'],
    cats: ['Nature & Adventure', 'Food & Local Life'],
    phone: '+8801811223344',
  },
  {
    email: 'mim.traveler@demo.tournest.dev',
    location: 'Rajshahi, Bangladesh',
    bio: 'History student at Rajshahi University who has spent four years documenting Puthia temples and the silk trade routes. I lead slow heritage walks with archive photographs.',
    expertise: 'Temple architecture, silk route, archaeology',
    experience: 3, languages: ['Bengali', 'English'],
    cats: ['Cultural & Heritage'],
    phone: '+8801811555667',
  },
  {
    email: 'rakib.traveler@demo.tournest.dev',
    location: 'Khulna, Bangladesh',
    bio: 'River enthusiast from Khulna. I have crewed launches on the Pashur for six years and can read the Sundarbans tide charts better than most captains. Weekend mangrove trips are my specialty.',
    expertise: 'River navigation, tides, mangrove ecology',
    experience: 6, languages: ['Bengali', 'English', 'Hindi'],
    cats: ['Nature & Adventure'],
    phone: '+8801811998877',
  },
];

const results = [];
const record = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('#email', email);
  await page.fill('#password', PASS);
  await page.locator('button[type="submit"]:has-text("Login")').click();
  await page.locator('header button[aria-label="Open profile menu"]').waitFor({ timeout: 25000 });
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });

  // ── Phase 4: submit 3 applications through Become a Guide ──
  for (const a of applicants) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    try {
      await login(page, a.email);
      await page.goto(`${BASE}/become-a-guide`, { waitUntil: 'networkidle' });

      // duplicate-application guard: skip if pending state already shown
      if ((await page.locator('text=Application under review').count()) > 0) {
        record(`Application ${a.email}: already pending (duplicate guard works)`, true);
        continue;
      }

      await page.fill('#g-location', a.location);
      await page.fill('#g-experience', String(a.experience));
      await page.fill('#g-expertise', a.expertise);
      await page.fill('#g-bio', a.bio);
      for (const l of a.languages) await page.locator('button.badge', { hasText: l }).click();
      for (const c of a.cats) await page.locator('button.badge', { hasText: c }).click();
      await page.fill('#g-phone', a.phone);

      // read-only email shows account email
      const roEmail = await page.locator('#g-email').inputValue();
      record(`Application ${a.email}: read-only email = account email`, roEmail === a.email);

      await page.locator('button[type="submit"]:has-text("Submit Application")').click();
      const shown = await page
        .locator('text=Application submitted!')
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      record(`Application ${a.email} submitted`, shown);

      // duplicate submission attempt → must show pending screen, not a second apply
      await page.goto(`${BASE}/become-a-guide`, { waitUntil: 'networkidle' });
      const pending = (await page.locator('text=Application under review').count()) > 0;
      record(`  ↳ re-visit shows pending (no duplicate form)`, pending);
    } catch (err) {
      record(`Application ${a.email}`, false, err.message.slice(0, 120));
    } finally {
      await ctx.close();
    }
  }

  // ── Phase 5: admin approves 2, rejects 1 through /admin UI ──
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  try {
    await login(page, 'admin@tournest.dev');
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Guide Applications")').click();
    await page.waitForTimeout(1500);

    const cards = page.locator('div.card:has(button:has-text("Approve"))');
    const n = await cards.count();
    record('Admin sees ' + n + ' pending applications (incl. 3 demo)', n >= 3);

    // approve arif and mim (locate their cards by email text)
    for (const email of ['arif.traveler@demo.tournest.dev', 'mim.traveler@demo.tournest.dev']) {
      const card = page.locator('div.card', { hasText: email }).first();
      await card.locator('button:has-text("Approve")').click();
      const toast = await page
        .locator('text=approved as guide')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      record(`Admin approved ${email}`, toast);
    }

    // reject rakib
    const rakibCard = page.locator('div.card', { hasText: 'rakib.traveler@demo.tournest.dev' }).first();
    const rejectBtn = rakibCard.locator('button:has-text("Reject")');
    if ((await rejectBtn.count()) > 0) {
      await rejectBtn.click();
      const toast = await page
        .locator('text=application rejected')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      record('Admin rejected rakib', toast);
    }

    // approved guides get dashboard access — verify arif
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page2 = await ctx2.newPage();
    await login(page2, 'arif.traveler@demo.tournest.dev');
    await page2.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page2.waitForTimeout(1500);
    const guideNow = page2.url().includes('/dashboard');
    const navbarHasDash = (await page2.locator('header a:has-text("Guide Dashboard")').count()) > 0;
    record('Approved arif can access Guide Dashboard', guideNow && navbarHasDash, page2.url());
    await ctx2.close();
  } catch (err) {
    record('Admin approval phase', false, err.message.slice(0, 140));
  } finally {
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\n=== Phase 4+5: ${results.length - failed}/${results.length} passed ===`);
  process.exitCode = failed ? 1 : 0;
})();
