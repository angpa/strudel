import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  const result = await page.evaluate(() => {
    const editor = document.querySelector('strudel-editor').editor;
    if (editor) {
      editor.evaluate();
      return "Evaluated!";
    }
    return "Editor not found";
  });
  console.log('RESULT:', result);
  await page.waitForTimeout(2000);

  await browser.close();
})();
