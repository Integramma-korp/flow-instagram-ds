import re, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'C:/Users/nikolay.g/Documents/Claude/Projects/flow_instagram_ds/'

# Canonical bar CSS snippet (inserted/replaced in <style>)
BAR_CSS = """\
  .bar{position:sticky;top:0;z-index:50;display:flex;gap:10px;align-items:center;
       padding:12px 20px;background:#0d0c11;border-bottom:1px solid #2a2832;flex-wrap:wrap;}
  .bar b{color:#fff;font-weight:600;font-size:14px;}
  .bar .sp{flex:1;}
  .bar a{color:#cfccd6;text-decoration:none;font-size:13px;padding:6px 12px;border-radius:9px;border:1px solid transparent;}
  .bar a:hover{background:#211f29;border-color:#3a3744;color:#fff;}
  .bar a.on{background:#211f29;border-color:#3a3744;color:#fff;}
  .bar .sep{width:1px;height:18px;background:#3a3744;flex-shrink:0;margin:0 2px;}
  .bar button{font-family:'Jost',sans-serif;background:#211f29;color:#cfccd6;border:1px solid #3a3744;
       border-radius:9px;padding:6px 12px;font-size:13px;cursor:pointer;}
  .bar button:hover{color:#fff;border-color:#4a4658;}"""

# Nav items: (href, label)  None = separator
NAV = [
    ('stories.html',         'Сторис'),
    ('carousels.html',       'Карусель'),
    ('reels.html',           'Рилзы'),
    ('posts.html',           'Посты'),
    ('highlights.html',      'Хайлайты'),
    ('profile.html',         'Профиль'),
    ('filials.html',         'Филиалы'),
    None,
    ('plan.html',            'План'),
    ('trends.html',          'Тренды'),
    ('conversion-guide.html','Правила'),
    ('type-guide.html',      'Типографика'),
]

LOGO = '<a href="index.html" style="padding:0;border-color:transparent;line-height:0;"><img src="assets/flow-logo-white.svg" alt="Flow" style="height:22px;"></a>'

def nav_html(active_file):
    parts = []
    for item in NAV:
        if item is None:
            parts.append('<span class="sep"></span>')
        else:
            href, label = item
            cls = ' class="on"' if href == active_file else ''
            parts.append(f'<a href="{href}"{cls}>{label}</a>')
    return '\n  '.join(parts)

# Per-file config: (active_file, extra_prefix_after_logo, extra_suffix_before_close)
CONFIGS = {
    'stories':          ('stories.html',         '',                    ''),
    'carousels':        ('carousels.html',        '',
                         '\n  <button id="themeBtn">Тема: тёмная</button>'
                         '\n  <button onclick="document.documentElement.style.setProperty(\'--zoom\',(prompt(\'Масштаб\',\'0.32\')||0.32))">Масштаб</button>'),
    'reels':            ('reels.html',            '',                    ''),
    'filials':          ('filials.html',          '\n  <b>Филиалы · цветовые вариации</b>', ''),
    'trends':           ('trends.html',           '',                    ''),
    'type-guide':       ('type-guide.html',       '',                    ''),
    'plan':             ('plan.html',             '',                    ''),
    'conversion-guide': ('conversion-guide.html', '',                    ''),
    'profile':          ('profile.html',          '',                    ''),
    'highlights':       ('highlights.html',
                         '\n  <b>Flow · Хайлайты</b> <span style="opacity:.6">11 обложек · 1080×1080</span>',
                         '\n  <button id="themeBtn">Тема: тёмная</button>'
                         '\n  <button onclick="document.documentElement.style.setProperty(\'--zoom\',(prompt(\'Масштаб\',\'0.18\')||0.18))">Масштаб</button>'),
    'posts':            ('posts.html',
                         '\n  <b>Flow · Посты</b> <span style="opacity:.6">1080×1080 · 1080×1350</span>',
                         '\n  <button id="themeBtn">Тема: тёмная</button>'
                         '\n  <button onclick="document.documentElement.style.setProperty(\'--zoom\',(prompt(\'Масштаб\',\'0.27\')||0.27))">Масштаб</button>'),
}

for fname, (active, prefix, suffix) in CONFIGS.items():
    path = BASE + fname + '.html'
    with open(path, encoding='utf-8') as f:
        txt = f.read()

    # 1. Replace bar CSS block in <style>
    # Find existing .bar{...} block and replace everything .bar* up through .bar .sep or .bar button
    # Strategy: replace the whole <style> block's .bar rules with canonical
    # Remove old .bar rules
    txt = re.sub(
        r'\n  \.bar\b[^}]*\}[^\n]*',
        '',
        txt,
        flags=re.DOTALL
    )
    # More aggressive: remove all .bar* lines
    txt = re.sub(r'\n[ \t]*\.bar[^\n]*', '', txt)

    # Insert canonical bar CSS before </style>
    txt = txt.replace('</style>', BAR_CSS + '\n</style>', 1)

    # 2. Replace bar HTML
    new_bar = (
        '<div class="bar">\n'
        f'  {LOGO}{prefix}\n'
        '  <span class="sp"></span>\n'
        f'  {nav_html(active)}{suffix}\n'
        '</div>'
    )
    txt = re.sub(
        r'<div class="bar">.*?</div>',
        new_bar,
        txt,
        count=1,
        flags=re.DOTALL
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(txt)
    print(f'OK  {fname}.html')
