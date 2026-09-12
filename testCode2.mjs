import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  const editorKeys = await page.evaluate(() => Object.keys(document.querySelector('strudel-editor').editor || {}));
  console.log('EDITOR KEYS:', editorKeys);
  const hasEvaluate = await page.evaluate(() => typeof document.querySelector('strudel-editor').editor?.evaluate);
  console.log('HAS EVALUATE:', hasEvaluate);
  await browser.close();
})();
