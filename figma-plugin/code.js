// ═══════════════════════════════════════════════════════════
//  Flow · Instagram · SMM-шаблоны
//  5 сторис 1080×1920: Анонс, Промо, Отзыв, Цитата, Тренер
//
//  Как запустить:
//  1. Figma Desktop → Plugins → Development
//     → Import Plugin from manifest…
//     → выбери этот manifest.json
//  2. Plugins → Development → Flow · SMM-шаблоны → Run
//  3. Плагин создаёт 5 фреймов на текущей странице.
//
//  Как пользоваться шаблонами:
//  — Слои с ✏️ — редактируй текст / заменяй фото
//  — Слои с ⛔ — не трогай (фон, скримы, эффекты)
//  — Для фото: выдели прямоугольник 📷, правая панель
//    → Fill → нажми на цветной квадрат → Choose image
// ═══════════════════════════════════════════════════════════

(async () => {
  // ── Fonts ──────────────────────────────────────────────
  await Promise.all([
    figma.loadFontAsync({ family: "Playfair Display", style: "Italic" }),
    figma.loadFontAsync({ family: "Jost", style: "Light" }),
    figma.loadFontAsync({ family: "Jost", style: "Regular" }),
    figma.loadFontAsync({ family: "Jost", style: "Medium" }),
    figma.loadFontAsync({ family: "Jost", style: "Bold" }),
  ]);

  const W = 1080, H = 1920, PAD = 92, GAP = 80;

  // ── Colors ─────────────────────────────────────────────
  const C = {
    dark:   { r: 0.098, g: 0.094, b: 0.118 },
    white:  { r: 1,     g: 1,     b: 1     },
    blush:  { r: 1,     g: 0.561, b: 0.847 },
    cta:    { r: 0.031, g: 0.808, b: 0.914 },
    ctaDk:  { r: 0.024, g: 0.133, b: 0.165 },
    gray:   { r: 0.808, g: 0.773, b: 0.851 },
    dim:    { r: 0.612, g: 0.576, b: 0.702 },
    photo:  { r: 0.165, g: 0.157, b: 0.196 },
    pink:   { r: 1,     g: 0.235, b: 0.875 },
    violet: { r: 0.482, g: 0.357, b: 1     },
  };

  // ── Paint helpers ───────────────────────────────────────
  // Solid paint
  const sp = (color, opacity = 1) => [{ type: 'SOLID', color, opacity }];

  // Gradient paint: stops = [[position, r, g, b, a], ...]
  const gp = (stops, transform) => [{
    type: 'GRADIENT_LINEAR',
    gradientStops: stops.map(([pos, r, g, b, a]) =>
      ({ position: pos, color: { r, g, b, a } })),
    gradientTransform: transform,
    opacity: 1,
  }];

  // Gradient transforms (normalized 0–1 bounding-box space)
  // (0,0) = top-left, (1,1) = bottom-right
  const GT_TB   = [[0, 0, 0.5], [1, 0, 0]]; // top → bottom
  const GT_DIAG = [[1, 0, 0],   [1, 0, 0]]; // top-left → bottom-right

  // ── Node helpers ────────────────────────────────────────
  const page = figma.currentPage;
  page.name = "Сторис · Шаблоны";

  function addRect(parent, x, y, w, h, name, fills) {
    const r = figma.createRectangle();
    r.name = name; r.x = x; r.y = y; r.resize(w, h);
    if (fills) r.fills = fills;
    parent.appendChild(r);
    return r;
  }

  async function addTxt(parent, chars, x, y, opts = {}) {
    const fam = opts.fam || "Jost";
    const sty = opts.sty || "Light";
    await figma.loadFontAsync({ family: fam, style: sty });
    const t = figma.createText();
    t.fontName = { family: fam, style: sty };
    t.fontSize = opts.sz || 48;
    t.characters = chars;
    t.x = x; t.y = y;
    if (opts.w !== undefined) {
      t.textAutoResize = "HEIGHT";
      t.resize(opts.w, 200);
    }
    t.fills = sp(opts.clr || C.white);
    t.name = opts.name || chars.slice(0, 40);
    if (opts.align) t.textAlignHorizontal = opts.align;
    parent.appendChild(t);
    return t;
  }

  async function addPill(parent, chars, x, y, w, fillClr, textClr) {
    const f = figma.createFrame();
    f.name = "✏️ Кнопка — меняй текст"; f.resize(w, 88);
    f.x = x; f.y = y; f.cornerRadius = 100;
    f.fills = sp(fillClr);
    await figma.loadFontAsync({ family: "Jost", style: "Bold" });
    const t = figma.createText();
    t.fontName = { family: "Jost", style: "Bold" };
    t.characters = chars; t.fontSize = 42;
    t.textAlignHorizontal = "CENTER";
    t.textAlignVertical = "CENTER";
    t.fills = sp(textClr); t.resize(w, 88); t.textAutoResize = "NONE";
    f.appendChild(t); parent.appendChild(f);
    return f;
  }

  function addPhoto(parent) {
    return addRect(parent, 0, 0, W, H,
      "📷 ФОТО — Fill → нажми превью → Choose image",
      sp(C.photo));
  }

  function addDuo(parent, opacity = 0.35) {
    const r = addRect(parent, 0, 0, W, H, "⛔ Дуотон (не трогать)", []);
    r.fills = gp([
      [0, C.pink.r,   C.pink.g,   C.pink.b,   opacity],
      [1, C.violet.r, C.violet.g, C.violet.b, opacity * 0.85],
    ], GT_DIAG);
    return r;
  }

  function addScrim(parent, fromRatio = 0.34) {
    const y = Math.round(H * fromRatio);
    const r = addRect(parent, 0, y, W, H - y, "⛔ Скрим (не трогать)", []);
    r.fills = gp([
      [0,    C.dark.r, C.dark.g, C.dark.b, 0   ],
      [0.55, C.dark.r, C.dark.g, C.dark.b, 0.60],
      [1,    C.dark.r, C.dark.g, C.dark.b, 0.95],
    ], GT_TB);
    return r;
  }

  function addScrimCenter(parent) {
    return addRect(parent, 0, 0, W, H, "⛔ Скрим-центр (не трогать)", sp(C.dark, 0.52));
  }

  async function addSign(parent) {
    return addTxt(parent, "FLOW", W - 200, 64, {
      sty: "Bold", sz: 40, clr: C.white, name: "⛔ Лого FLOW",
    });
  }

  function makeFrame(name, col) {
    const f = figma.createFrame();
    f.name = name; f.resize(W, H);
    f.x = col * (W + GAP); f.y = 0;
    f.fills = sp(C.dark);
    page.appendChild(f);
    return f;
  }


  // ═══════════════════════════════════════════════════════
  //  01 · АНОНС · фото, текст внизу, голубая кнопка
  // ═══════════════════════════════════════════════════════
  const f1 = makeFrame("01 · Анонс  ✏️ меняй фото и текст", 0);
  addPhoto(f1); addDuo(f1); addScrim(f1);

  await addTxt(f1, "новый поток", PAD, H-830, {
    w: W-PAD*2, sty: "Medium", sz: 42, clr: C.blush,
    name: "✏️ 1. Надшапка (верхняя строка)",
  });
  await addTxt(f1, "stretching", PAD, H-770, {
    w: W-PAD*2, fam: "Playfair Display", sty: "Italic", sz: 160,
    name: "✏️ 2. Заголовок-герой (Playfair Italic)",
  });
  await addTxt(f1, "3 шпагата", PAD, H-530, {
    w: W-PAD*2, sty: "Regular", sz: 60,
    name: "✏️ 3. Подзаголовок",
  });
  await addTxt(f1,
    "мягкая, но глубокая растяжка.\nстарт 20 ноября — успей в первый набор.",
    PAD, H-445, {
      w: W-PAD*2, sz: 44, clr: C.gray,
      name: "✏️ 4. Основной текст",
    });
  await addPill(f1, "записаться", PAD, H-255, 400, C.cta, C.ctaDk);
  await addTxt(f1, "→ ссылка в шапке профиля", PAD, H-143, {
    w: W-PAD*2, sz: 34, clr: C.dim, name: "✏️ 5. Подсказка под кнопкой",
  });
  await addSign(f1);


  // ═══════════════════════════════════════════════════════
  //  02 · ПРОМО · аура, большая цифра скидки
  // ═══════════════════════════════════════════════════════
  const f2 = makeFrame("02 · Промо / акция  ✏️ меняй цифры и условия", 1);

  const a1e = figma.createEllipse();
  a1e.name = "⛔ Аура 1"; a1e.resize(900, 900); a1e.x = -120; a1e.y = 180;
  a1e.fills = sp(C.pink, 0.28);
  a1e.effects = [{ type: "LAYER_BLUR", radius: 220, visible: true }];
  f2.appendChild(a1e);

  const a2e = figma.createEllipse();
  a2e.name = "⛔ Аура 2"; a2e.resize(780, 780); a2e.x = W-460; a2e.y = H-960;
  a2e.fills = sp(C.violet, 0.30);
  a2e.effects = [{ type: "LAYER_BLUR", radius: 200, visible: true }];
  f2.appendChild(a2e);

  await addTxt(f2, "только до 30 ноября", 0, H-960, {
    w: W, sty: "Medium", sz: 44, clr: { r:1, g:0.72, b:0.9 },
    align: "CENTER", name: "✏️ 1. Дедлайн / срок акции",
  });
  await addTxt(f2, "−10%", 0, H-880, {
    w: W, fam: "Playfair Display", sty: "Italic", sz: 380,
    align: "CENTER", name: "✏️ 2. Скидка / главная цифра",
  });
  await addTxt(f2, "на абонемент", 0, H-490, {
    w: W, sty: "Medium", sz: 68,
    align: "CENTER", name: "✏️ 3. На что скидка",
  });
  await addTxt(f2,
    "8 занятий · любое направление · на первую покупку",
    PAD, H-400, {
      w: W-PAD*2, sz: 44, clr: C.gray,
      align: "CENTER", name: "✏️ 4. Условия",
    });
  await addPill(f2, "забрать скидку", (W-480)/2, H-265, 480, C.cta, C.ctaDk);
  await addTxt(f2, "→ пиши «ХОЧУ» в директ", 0, H-150, {
    w: W, sz: 36, clr: C.dim,
    align: "CENTER", name: "✏️ 5. Инструкция (директ / ссылка)",
  });
  await addSign(f2);


  // ═══════════════════════════════════════════════════════
  //  03 · ОТЗЫВ · фото, цитата, аватар
  // ═══════════════════════════════════════════════════════
  const f3 = makeFrame("03 · Отзыв  ✏️ меняй фото, цитату и имя", 2);
  addPhoto(f3); addDuo(f3, 0.25); addScrimCenter(f3);

  await addTxt(f3, "отзыв", PAD, 130, {
    sty: "Medium", sz: 34, clr: C.dim, name: "⛔ Раздел",
  });
  await addTxt(f3, "“", 72, 310, {
    fam: "Playfair Display", sty: "Italic", sz: 220,
    clr: C.blush, name: "⛔ Кавычка",
  });
  await addTxt(f3,
    "пришла, не умея ничего. через 3 месяца — шпагат и стойка на руках. тут правда дают энергию.",
    PAD, 530, {
      w: W-PAD*2, sz: 74, name: "✏️ 1. Цитата (отзыв клиента)",
    });

  const ell = figma.createEllipse();
  ell.name = "📷 Фото клиента (заменить)";
  ell.resize(128, 128); ell.x = PAD; ell.y = H-422;
  ell.fills = sp({ r:0.3, g:0.27, b:0.36 });
  f3.appendChild(ell);

  await addTxt(f3, "Алина", PAD+148, H-414, {
    sty: "Medium", sz: 52, name: "✏️ 2. Имя клиента",
  });
  await addTxt(f3, "★★★★★", PAD+148, H-346, {
    sz: 44, clr: C.blush, name: "⛔ Звёзды",
  });
  await addTxt(f3, "ученица · 6 мес", PAD+148, H-280, {
    sz: 38, clr: C.gray, name: "✏️ 3. Роль и срок",
  });
  await addSign(f3);


  // ═══════════════════════════════════════════════════════
  //  04 · ЦИТАТА · фото, мотивационный текст по центру
  // ═══════════════════════════════════════════════════════
  const f4 = makeFrame("04 · Цитата / мотивация  ✏️ меняй фото и текст", 3);
  addPhoto(f4); addDuo(f4, 0.50); addScrimCenter(f4);

  await addTxt(f4,
    "тренировки,\nкоторые дают\nэнергию",
    PAD, H/2-300, {
      w: W-PAD*2, sz: 108, name: "✏️ 1. Мотивационная цитата",
    });

  const gh = figma.createFrame();
  gh.name = "⛔ Хендл @flow.training.lab";
  gh.resize(440, 76); gh.x = (W-440)/2; gh.y = H/2+230;
  gh.cornerRadius = 100;
  gh.strokes = [{ type: "SOLID", color: C.white }]; gh.strokeWeight = 2;
  gh.fills = sp(C.white, 0.08);
  await figma.loadFontAsync({ family: "Jost", style: "Regular" });
  const ghT = figma.createText();
  ghT.fontName = { family: "Jost", style: "Regular" };
  ghT.characters = "@flow.training.lab"; ghT.fontSize = 36;
  ghT.textAlignHorizontal = "CENTER"; ghT.textAlignVertical = "CENTER";
  ghT.fills = sp(C.white); ghT.resize(440, 76); ghT.textAutoResize = "NONE";
  gh.appendChild(ghT); f4.appendChild(gh);
  await addSign(f4);


  // ═══════════════════════════════════════════════════════
  //  05 · ТРЕНЕР · фото, имя крупно, специализация
  // ═══════════════════════════════════════════════════════
  const f5 = makeFrame("05 · Карточка тренера  ✏️ меняй фото, имя, специализацию", 4);
  addPhoto(f5); addDuo(f5);

  const ss = addRect(f5, 0, H*0.5, W, H*0.5, "⛔ Скрим-мягкий (не трогать)", []);
  ss.fills = gp([
    [0, C.dark.r, C.dark.g, C.dark.b, 0   ],
    [1, C.dark.r, C.dark.g, C.dark.b, 0.78],
  ], GT_TB);

  const ptag = figma.createFrame();
  ptag.name = "⛔ Пилюля «тренер»";
  ptag.resize(240, 74); ptag.x = PAD; ptag.y = H-694;
  ptag.cornerRadius = 100;
  ptag.strokes = [{ type: "SOLID", color: C.blush }]; ptag.strokeWeight = 2;
  ptag.fills = sp(C.blush, 0.12);
  await figma.loadFontAsync({ family: "Jost", style: "Regular" });
  const ptagT = figma.createText();
  ptagT.fontName = { family: "Jost", style: "Regular" };
  ptagT.characters = "тренер"; ptagT.fontSize = 34;
  ptagT.textAlignHorizontal = "CENTER"; ptagT.textAlignVertical = "CENTER";
  ptagT.fills = sp(C.blush); ptagT.resize(240, 74); ptagT.textAutoResize = "NONE";
  ptag.appendChild(ptagT); f5.appendChild(ptag);

  await addTxt(f5, "Настя", PAD, H-590, {
    w: W-PAD*2, sty: "Regular", sz: 260,
    name: "✏️ 1. Имя тренера",
  });
  await addTxt(f5, "акробатика · stretching", PAD, H-298, {
    w: W-PAD*2, sty: "Regular", sz: 52, clr: C.blush,
    name: "✏️ 2. Специализация",
  });
  await addSign(f5);


  // ── Zoom to fit ──────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView([f1, f2, f3, f4, f5]);
  figma.closePlugin("✓ 5 шаблонов сторис создано!");
})();
