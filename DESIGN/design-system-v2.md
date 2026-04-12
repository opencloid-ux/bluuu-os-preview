# BLUUU OS — Design System v2.0

## Базовые CSS переменные

### Тёмная тема (:root)
- bg: #080e14 — основной фон
- sf: #0d1520 — поверхность карточек
- sf2: #111d2c — secondary поверхность
- bdr: rgba(255,255,255,.06) — границы
- p: #14b8c8 — primary акцент (teal)
- ok: #10d984 — успех
- warn: #f6c244 — предупреждение
- err: #f24a4a — ошибка
- txt: #e8f0f8 — основной текст
- txt2: #6b8094 — secondary текст
- txt3: #3d5166 — placeholder/labels

### Светлая тема ([data-theme="light"])
- bg: #f0f4f8
- sf: #ffffff
- sf2: #f8fafc
- p: #0ea5e9
- txt: #0f172a
- txt2: #64748b

## Компоненты
- card / card-accent — карточка с тонкой световой полоской
- badge-ok/warn/err/info/muted — статус бейджи
- sec-label — заголовок секции (11px uppercase)
- kpi-card / kpi-val — KPI блок
- pbar-wrap / pbar — прогресс-бар с glow
- ntab / ntab.active — навигационный таб
- team-row — строка команды
- feed-item — событие в ленте

## Правила
1. БЕЗ эмодзи в заголовках секций
2. Секции: font-size 11px, uppercase, letter-spacing .08em, color var(--txt3)
3. KPI числа: Roboto Mono, 30px, weight 800
4. Границы: rgba(255,255,255,.06) — никаких solid цветных границ
5. Hover: border-color → rgba(20,184,200,.3), transition all .2s
