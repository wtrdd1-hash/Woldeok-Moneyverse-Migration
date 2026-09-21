const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  const viewports = [
    { name: 'desktop_1280', width: 1280, height: 800, isMobile: false },
    { name: 'iphone_14_390', width: 390, height: 844, isMobile: true },
    { name: 'iphone_se_375', width: 375, height: 667, isMobile: true }
  ];

  for (const vp of viewports) {
    const darkCtx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      colorScheme: 'dark',
      ignoreHTTPSErrors: true
    });
    
    await darkCtx.addCookies([
      { name: '__Host-mv_session', value: 'b223c7b3-8557-41a4-bda5-beae91238699', domain: 'easy-scraping.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' },
      { name: 'mv_session', value: 'b223c7b3-8557-41a4-bda5-beae91238699', domain: 'easy-scraping.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }
    ]);

    const darkPage = await darkCtx.newPage();

    // 1. Capture bank in dark mode
    await darkPage.goto('https://easy-scraping.com/bank', { waitUntil: 'networkidle', timeout: 15000 });
    await darkPage.screenshot({ path: `/home/debian/${vp.name}_bank_dark.png`, fullPage: false });
    console.log(`Captured ${vp.name}_bank_dark.png`);

    // 2. Capture work in dark mode
    await darkPage.goto('https://easy-scraping.com/work', { waitUntil: 'networkidle', timeout: 15000 });
    await darkPage.screenshot({ path: `/home/debian/${vp.name}_work_dark.png`, fullPage: false });
    console.log(`Captured ${vp.name}_work_dark.png`);

    // 3. Open work task modal and capture
    try {
      const taskBtn = darkPage.locator('button:has-text("직업 업무 수행"), button:has-text("해당 직업으로 먼저 전직"), button:has-text("전직하기")').first();
      if (await taskBtn.isVisible()) {
        await taskBtn.click();
        await darkPage.waitForTimeout(600);
        await darkPage.screenshot({ path: `/home/debian/${vp.name}_work_modal_dark.png`, fullPage: false });
        console.log(`Captured ${vp.name}_work_modal_dark.png`);
      }
    } catch (e) {
      console.log('Could not open modal:', e.message);
    }

    await darkCtx.close();
  }

  await browser.close();
  console.log('All QA captures completed!');
}

run().catch(console.error);
