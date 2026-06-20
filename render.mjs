/* Экспорт всех шаблонов в PNG натуральной величины.
   Установка:  npm init -y && npm i puppeteer
   Запуск:     node render.mjs            — тёмная + светлая
               node render.mjs dark       — только тёмная
   Результат:  ./out/<имя>-<тема>.png
   Сервер:     должен работать на localhost:5577 (python -m http.server 5577)
*/
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:5577';
const OUT  = resolve(__dir, 'downloads');
mkdirSync(OUT, { recursive: true });

const ALL_THEMES = ['dark', 'light'];

// страницы → какие элементы рендерить, темы
const PAGES = [
  { file: 'stories.html',    sel: '.frame',    themes: process.argv[2] ? [process.argv[2]] : ALL_THEMES },
  { file: 'carousels.html',  sel: '.cslide',   themes: process.argv[2] ? [process.argv[2]] : ALL_THEMES },
  { file: 'posts.html',      sel: '.frame',    themes: process.argv[2] ? [process.argv[2]] : ALL_THEMES },
  { file: 'highlights.html', sel: '.hl-cover', themes: ['dark'] }, // бренд-иконки — только тёмные
];

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 2000, deviceScaleFactor: 1 });

for (const { file, sel, themes } of PAGES) {
  const url = `${BASE}/${file}`;
  console.log(`\n📄 ${file}`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluateHandle('document.fonts.ready');

  // убираем превью-масштаб и UI-обвязку, показываем элементы в натуральную величину
  await page.addStyleTag({ content: `
    .stage{zoom:1!important;transform:none!important;}
    .bar,.cap,.note,.sec,.studio-nav,.st-head{display:none!important;}
    .gallery{gap:0!important;padding:0!important;flex-wrap:nowrap!important;overflow:visible!important;}
    .cslide-seam{display:none!important;}
  `});

  for (const theme of themes) {
    // установить тему
    await page.evaluate((t) => {
      const el = document.documentElement;
      t === 'dark'
        ? el.removeAttribute('data-theme')
        : el.setAttribute('data-theme', t);
    }, theme);

    const els = await page.$$(sel);
    if (!els.length) {
      console.log(`  ⚠ нет элементов "${sel}" в ${file}`);
      continue;
    }

    let idx = 0;
    for (const el of els) {
      const name = await el.evaluate(e => e.dataset.name || e.dataset.hl || '');
      const slug = name || `${file.replace('.html','')}-${idx}`;
      const fname = `${slug}-${theme}.png`;
      await el.screenshot({ path: resolve(OUT, fname) });
      console.log(`  ✓ out/${fname}`);
      idx++;
    }
  }
}

await browser.close();
console.log('\n✅ Готово! Файлы в ./out/');
