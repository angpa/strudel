import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  const code = await page.evaluate(() => document.querySelector('strudel-editor').editor.code);
  console.log('CODE IN EDITOR:', code);

  await browser.close();
})();
