import { chromium } from 'file:///C:/Users/A/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const out = [];
const log = (...a) => out.push(a.join(' '));
const base = 'http://localhost:4174';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  // 场景A：分类页 -> 卡片 -> 返回
  await page.goto(base + '/categories.html?cat=mouse', { waitUntil: 'networkidle' });
  log('A1 当前页:', page.url());

  const card = page.locator('a[href^="detail.html"]').first();
  await card.hover();
  await page.waitForTimeout(400);
  await card.click();
  await page.waitForLoadState('networkidle');
  log('A2 点击后URL:', page.url());

  const wcBack = await page.evaluate(() => { try { return sessionStorage.getItem('wc_back'); } catch { return 'ERR'; } });
  const ref = await page.evaluate(() => document.referrer);
  log('A3 wc_back:', wcBack, '| referrer:', ref);

  const hasBtn = await page.locator('#wc-back').count();
  log('A4 返回按钮存在:', hasBtn);
  if (hasBtn) {
    await page.locator('#wc-back').click();
    await page.waitForLoadState('networkidle');
    log('A5 点返回后URL:', page.url());
  }
} catch (e) {
  log('ERROR:', e.message);
}

writeFileSync('.wc-test-cat-result.txt', out.join('\n'), 'utf8');
await browser.close();
