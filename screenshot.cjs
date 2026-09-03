const { chromium } = require('playwright-core');
const EXE = '/Users/rayhan/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BASE = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/tmp/shots/home-top.png' });
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/shots/home-mid.png' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/shots/home-bottom.png' });

  await page.goto(`${BASE}/tours`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/shots/explore.png' });

  // tour details
  await page.locator('article a:has-text("See Details")').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/shots/tour-details.png' });

  // login page
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/shots/login.png' });

  // mobile home
  const mpage = await browser.newPage({ viewport: { width: 375, height: 750 } });
  await mpage.goto(BASE, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(1500);
  await mpage.screenshot({ path: '/tmp/shots/mobile-home.png' });

  await browser.close();
  console.log('done');
})();
