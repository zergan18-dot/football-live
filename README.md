# ФУТБОЛ LIVE — серверная часть

## Что внутри
- `server.js` — Express-сервер, который обращается к API-Football.
- `public/index.html` — сайт, который показывает реальные матчи.
- `render.yaml` — настройки для Render.
- API-ключ хранится только в переменной окружения `API_FOOTBALL_KEY`, а не в браузере.

## Деплой на Render
1. Создай GitHub-репозиторий и загрузи в него содержимое этой папки.
2. В Render выбери **New + → Blueprint** и подключи репозиторий.
3. Render обнаружит `render.yaml` и создаст веб-сервис.
4. При запросе значения `API_FOOTBALL_KEY` вставь свой ключ в поле Environment.
5. Нажми Deploy. После запуска открой адрес Render.

## Локальный запуск
Требуется Node.js 18 или новее.
```bash
npm install
# macOS/Linux:
API_FOOTBALL_KEY="твой_ключ" npm start
# Windows PowerShell:
$env:API_FOOTBALL_KEY="твой_ключ"; npm start
```
Открой http://localhost:3000

## API сайта
- `GET /api/health` — проверка сервера и наличия ключа.
- `GET /api/fixtures` — ближайшие матчи.
- `GET /api/fixtures?date=2026-10-31` — матчи на дату.
- `GET /api/fixtures?league=39&season=2026` — матчи лиги (пример: Premier League ID 39; доступность зависит от тарифа API-Football).

Важно: бесплатный тариф провайдера может ограничивать число запросов и доступные турниры/сезоны. Не запускай частые автоматические обновления.
