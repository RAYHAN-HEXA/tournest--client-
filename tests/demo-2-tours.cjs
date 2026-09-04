/* TourNest demo-data Phase 2: create 10 tours through Guide Dashboard → Add New Tour UI. */
const { chromium } = require('playwright-core');

const BASE = 'http://localhost:5173';
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const PASS = 'DemoPass123';

const toursByGuide = {
  'kamrul.guide@demo.tournest.dev': [
    {
      title: 'Sundarbans Wildlife Adventure',
      category: 'Nature & Adventure',
      destination: 'Khulna / Sundarbans',
      description:
        'Deep-water cruise through the mangrove heart of the Sundarbans. We track tiger prints on muddy banks at dawn, watch spotted deer herds at Kobadak river junction and visit a floating wood station. Includes boat transport, forest permits, all meals on board and a licensed forest guide for two full days.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80',
      price: 7800, duration: '3 Days / 2 Nights', maxTravelers: 10,
      meetingPoint: 'Khulna Rupsha Launch Terminal',
      availableDate: 21,
    },
    {
      title: 'Historic Khulna City Tour',
      category: 'Cultural & Heritage',
      destination: 'Khulna',
      description:
        'A half-day walk through Khulna colonial-era riverfront, the Rupsha bridges and the old railway quarter. We ride a cycle rickshaw through Khalishpur jute-mill lanes, taste the famous Khulna misti doi at a century-old sweet shop and finish at Baliahdi palace ruins with tea at a local stall. Includes rickshaw fares, sweets tasting and guide fee.',
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
      price: 1100, duration: '5 Hours', maxTravelers: 12,
      meetingPoint: 'Khulna Railway Station main gate',
      availableDate: 9,
    },
  ],
  'shapla.guide@demo.tournest.dev': [
    {
      title: "Cox's Bazar Beach Experience",
      category: 'City & Sightseeing',
      destination: "Cox's Bazar",
      description:
        'Full day along the longest natural sea beach in the world. Sunrise walk from Laboni to Himchari, waterfall stop, parasailing slot for the brave and a Burmese market handicraft session. The evening is reserved for a grilled Rupali fish feast at a beach shack locals queue for. Includes transport between spots, parasailing slot booking help and the seafood dinner.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      price: 2200, duration: '1 Day', maxTravelers: 15,
      meetingPoint: 'Laboni Beach main gate',
      availableDate: 12,
    },
    {
      title: 'Saint Martin Island Escape',
      category: 'Nature & Adventure',
      destination: 'Saint Martin / Teknaf',
      description:
        'Two days on the only coral island of Bangladesh. We cross on the morning ship from Teknaf, snorkel over the eastern reef patch, dry fish market walk and a moonless-night bioluminescent plankton session on the west beach. Night is spent in a beach resort cottage. Includes return ship tickets, snorkel gear, one night cottage stay and all meals.',
      image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80',
      price: 11500, duration: '2 Days / 1 Night', maxTravelers: 8,
      meetingPoint: 'Teknaf ship ghat',
      availableDate: 26,
    },
  ],
  'jahid.guide@demo.tournest.dev': [
    {
      title: 'Dhaka Heritage Walking Tour',
      category: 'Cultural & Heritage',
      destination: 'Old Dhaka',
      description:
        'Three-hour heritage walk through the Mughal-era lanes of Old Dhaka. Star Mosque, Armenian Church, Shankhari Bazar narrow facades and the sadarghat riverfront chaos. I carry a folder of 1900s photographs so you can overlay past on present at every stop. Includes entry donations, bottled water and a printed route map.',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      price: 950, duration: '3 Hours', maxTravelers: 10,
      meetingPoint: 'Bahadur Shah Park entrance',
      availableDate: 6,
    },
    {
      title: 'Old Dhaka Food Tour',
      category: 'Food & Local Life',
      destination: 'Old Dhaka',
      description:
        'An evening crawl through eight food stops that define Dhaka. Starting with borhani and haleem at Chawkbazar, moving to shahi jilapi, nargisi kabab on nan, ending with misti doi at the oldest sweet house in Islampur. All tastings, rickshaw hops between stops and a take-home spice box are included.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      price: 1500, duration: '4 Hours', maxTravelers: 8,
      meetingPoint: 'Chawkbazar crossroads',
      availableDate: 8,
    },
    {
      title: 'Bagerhat Historical Mosque Tour',
      category: 'Cultural & Heritage',
      destination: 'Bagerhat',
      description:
        'UNESCO world heritage day among Khan Jahan Ali monuments. The sixty-dome Shat Gambuj Mosque with its stone carvings, the nine-dome mosque, the sacred tank with marsh crocodiles and the tomb complex. I explain the Bengal sultanate architecture story that binds them. Includes AC transport from Khulna, entry tickets and a Bengali lunch.',
      image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
      price: 2600, duration: '1 Day', maxTravelers: 14,
      meetingPoint: 'Khulna Rail Gate',
      availableDate: 15,
    },
  ],
  'rumana.guide@demo.tournest.dev': [
    {
      title: 'Sylhet Tea Garden Tour',
      category: 'Nature & Adventure',
      destination: 'Sreemangal / Sylhet',
      description:
        'Tea-capital day: pluck leaves beside garden workers in a Sreemangal estate, walk the factory floor to see withering-rolling-fermentation, taste the legendary seven-layer tea at Nilkantha and finish at Madhabpur lake ringed by tea hills. Includes garden entry, factory tour, tea-tasting and lakeside lunch pack.',
      image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=1200&q=80',
      price: 1900, duration: '1 Day', maxTravelers: 12,
      meetingPoint: 'Sreemangal Railway Station',
      availableDate: 11,
    },
    {
      title: 'Rangamati Lake Adventure',
      category: 'Nature & Adventure',
      destination: 'Rangamati',
      description:
        'Boat day on Kaptai lake among drowned green hills. We island-hop to a Chakma village, swim at a waterfall cove, cross the hanging bridge and eat fresh lake fish curry at a stilt restaurant. Includes full-day boat with boatman, hill-tracks permit assistance, life jackets and the fish lunch.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      price: 3400, duration: '1 Day', maxTravelers: 10,
      meetingPoint: 'Rangamati Reserve Bazar jetty',
      availableDate: 18,
    },
    {
      title: 'Bandarban Hill Trek',
      category: 'Nature & Adventure',
      destination: 'Bandarban',
      description:
        'Two-day trek to Chimbuk hill range through Mru and Tripura villages, sleeping in a bamboo cottage on a ridge. Day two climbs to a waterfall pool for a swim before descending through jum fields. Includes trekking permits, village homestay, porter support, all meals and trekking pole rental.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      price: 5900, duration: '2 Days / 1 Night', maxTravelers: 8,
      meetingPoint: 'Bandarban Bus Terminal',
      availableDate: 24,
    },
  ],
};

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
  await page.waitForResponse((r) => r.url().endsWith('/api/users') && r.status() === 200, { timeout: 15000 }).catch(() => {});
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  let created = 0;

  for (const [email, tours] of Object.entries(toursByGuide)) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    try {
      await login(page, email);

      for (const t of tours) {
        const d = new Date();
        d.setDate(d.getDate() + t.availableDate);
        const dateStr = d.toISOString().slice(0, 10);

        await page.goto(`${BASE}/dashboard/add-tour`, { waitUntil: 'networkidle' });
        await page.fill('#t-title', t.title);
        await page.selectOption('#t-category', t.category);
        await page.fill('#t-destination', t.destination);
        await page.fill('#t-description', t.description);
        await page.fill('#t-image', t.image);
        await page.fill('#t-price', String(t.price));
        await page.fill('#t-duration', t.duration);
        await page.fill('#t-max', String(t.maxTravelers));
        await page.fill('#t-meeting', t.meetingPoint);
        await page.fill('#t-date', dateStr);
        await page.locator('button[type="submit"]:has-text("Publish Tour")').click();

        // Success = redirect to dashboard with the toast.
        const toast = page.locator('text=Tour published').first();
        const redirected = await page.waitForURL('**/dashboard', { timeout: 20000 }).then(() => true).catch(() => false);
        const toastSeen = await toast.isVisible({ timeout: 4000 }).catch(() => false);
        record(`Tour "${t.title}" published`, redirected && toastSeen, redirected ? 'on dashboard' : `url=${page.url()}`);
        if (redirected) created++;

        // Verify on Explore Tours (first page should contain it — newest sort).
        await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1200);
        const card = page.locator('article', { hasText: t.title }).first();
        const visible = (await card.count()) > 0;
        record(`  ↳ visible in Explore Tours`, visible);

        // Open details page via the card's See Details button, verify data.
        if (visible) {
          await card.locator('a:has-text("See Details")').click();
          await page.waitForURL('**/tours/**', { timeout: 15000 });
          await page.waitForTimeout(1500);
          const detailOk =
            (await page.locator(`h1:has-text("${t.title}")`).count()) > 0 &&
            (await page.locator(`text=${t.destination}`).first().isVisible().catch(() => false));
          const guideCard = await page.locator('text=Your guide').count();
          record(`  ↳ details page renders`, detailOk && guideCard > 0);
        }

        if (errors.length) {
          record(`  ↳ console error on ${t.title}`, false, errors[0]);
          errors.length = 0;
        }
      }
    } catch (err) {
      record(`${email} tour flow`, false, err.message.slice(0, 140));
    } finally {
      await ctx.close();
    }
  }

  await browser.close();
  console.log(`\nTours created via UI: ${created}/10`);
  const failed = results.filter((r) => !r).length;
  console.log(`=== Phase 2: ${results.length - failed}/${results.length} passed ===`);
  process.exitCode = failed ? 1 : 0;
})();
