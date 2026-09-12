import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);
  
  console.log('Clicking Play...');
  await page.click('text="Play"');
  await page.waitForTimeout(3000);

  await browser.close();
})();
