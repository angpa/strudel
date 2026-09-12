import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  const keys = await page.evaluate(() => {
    const el = document.querySelector('strudel-editor');
    if (!el) return null;
    return {
      editorKeys: el.editor ? Object.keys(el.editor) : null,
      elKeys: Object.keys(el),
      repl: !!el.repl,
      methods: Object.getOwnPropertyNames(el).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(el)))
    };
  });
  console.log("Editor info:", keys);
  await browser.close();
})();
