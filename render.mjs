/* Экспорт всех шаблонов в PNG натуральной величины (1080×1920 и т.п.).
   Установка:  npm init -y && npm i puppeteer
   Запуск:     node render.mjs            // обе темы
               node render.mjs dark        // только тёмная
   Результат:  ./out/<имя>-<тема>.png
*/
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { mkdirSync } from 'fs';

const __dir = dirname(fileURLToPath(import.meta.url));
const PAGES = ['stories.html', 'carousels.html']; // по мере роста кита добавляй сюда posts.html и т.д.
const themes = (process.argv[2] ? [process.argv[2]] : ['dark', 'light']);
mkdirSync(resolve(__dir, 'out'), { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 2000, deviceScaleFactor: 1 });

for (const file of PAGES) {
  await page.goto('file://' + resolve(__dir, file).replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  // нейтрализуем превью-масштаб → натуральная величина; прячем превью-обвязку
  await page.addStyleTag({ content: '.thumb,.stage{zoom:1!important}.bar,.cap,.note{display:none!important}.gallery,.scroll{gap:0;padding:0;overflow:visible!important}.cslide-seam{display:none!important}' });
  const base = file.replace('.html', '');

  for (const theme of themes) {
    await page.evaluate(t => { t === 'light' ? document.body.setAttribute('data-theme', 'light')
                                             : document.body.removeAttribute('data-theme'); }, theme);
    const els = await page.$$('.frame, .cslide');
    let ci = 0;
    for (const f of els) {
      const name = await f.evaluate(el => el.dataset.name || '');
      const fname = name || `${base}-${ci++}`;
      await f.screenshot({ path: resolve(__dir, 'out', `${fname}-${theme}.png`) });
      console.log('✓', `${fname}-${theme}.png`);
    }
  }
}
await browser.close();
