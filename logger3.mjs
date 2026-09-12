import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  const keys = await page.evaluate(() => {
    const el = document.querySelector('strudel-editor');
    if (!el || !el.editor || !el.editor.repl) return null;
    return Object.keys(el.editor.repl);
  });
  console.log("Repl info:", keys);
  await browser.close();
})();
