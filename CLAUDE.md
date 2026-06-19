# Инструкции для Claude

## Запуск Python-кода

Никогда не используй `python3 -c "..."` или `py -c "..."` с многострочным кодом — это вызывает запрос разрешения из-за `#` комментариев внутри строки.

Вместо этого всегда записывай код во временный файл и запускай его:

```
# Правильно:
Write code to tools/_temp.py
python3 tools/_temp.py (или py tools/_temp.py)
rm -f tools/_temp.py

# Неправильно:
python3 -c "
import re
# комментарий  <-- вызовет запрос разрешения
..."
```

## Составные команды с cd

Никогда не используй `cd /path && команда` или `cd` на отдельной строке — используй абсолютные пути:

```
# Правильно:
grep "pattern" /c/Users/nikolay.g/Documents/Claude/Projects/flow_instagram_ds/file.html

# Неправильно:
cd "/c/Users/.../flow_instagram_ds" && grep "pattern" file.html
```

## Git-команды

Используй флаг `-C` вместо `cd + git`:

```
# Правильно:
git -C /c/Users/nikolay.g/Documents/Claude/Projects/flow_instagram_ds status

# Неправильно:
cd "/c/Users/.../flow_instagram_ds" && git status
```
