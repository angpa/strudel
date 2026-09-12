import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.type()} - ${msg.text()}`));
  page.on('pageerror', err => console.error(`BROWSER ERROR: ${err}`));

  console.log("Navigating to http://localhost:5173 ...");
  await page.goto('http://localhost:5173');
  
  console.log("Waiting 2 seconds for Strudel to init...");
  await page.waitForTimeout(2000);

  console.log("Checking if globals exist...");
  const globals = await page.evaluate(() => {
    return {
      registerSound: typeof window.registerSound,
      samples: typeof window.samples,
      getAudioContext: typeof window.getAudioContext,
      strudel: typeof window.strudel,
      initDone: !!document.querySelector('strudel-editor')?.editor
    };
  });
  console.log("Globals on window:", globals);

  console.log("Clicking Play button...");
  await page.click('#play');
  
  await page.waitForTimeout(3000); // listen to sounds / errors
  
  await browser.close();
  console.log("Done.");
})();
