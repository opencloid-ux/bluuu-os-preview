# BLUUU OS — Архитектура автоматизации: Aline
**Роль:** GR Manager — OTA Availability, Dynamic Pricing, Review Management  
**Источники:** интервью PDF 06.04.2026 + анализ 1.1M строк Kommo CRM + FINAL_ANALYSIS.md

---

## Кто такая Aline в системе

Aline — **единственная точка управления revenue через OTA**. Вручную управляет availability на 9 платформах + сайте. Принимает сигналы от MOD → закрывает/открывает. Также: ответы на отзывы, сбор tour reports от гидов, ведение daily stats. Если Aline недоступна → менеджеры закрывают платформы сами, но не все и не всегда правильно.

**Главная боль:** 9 OTA управляются вручную. В пиковый день — 8-20 операций close/open. Viator: 10-15 сек на каждую операцию (ожидание кода подтверждения). Итого: 2-4 часа/день чистой механики.

---

## Текущий день Aline (8 шагов вручную)

| Шаг | Действие | Время |
|-----|----------|-------|
| 1 | Проверка числа букингов в calendar → запись в daily stat | 15 мин |
| 2 | Проверка availability вручную по спредшиту | 20 мин |
| 3 | Закрытие лодок в OTA если забронированы | 20-60 мин |
| 4 | Проверка нужно ли менять тир цен | 10 мин |
| 5 | Проверка + ответ на ревью: Google, Viator, GYG, Klook, Airbnb | 30-60 мин |
| 6 | Добавление числа гид-ревью в stat | 10 мин |
| 7 | Сигнал от MOD → close availability private boat в OTA | по ситуации |
| 8 | Проверка tour reports от гидов → добавление в stat | 20 мин |
| + | Раз в неделю: weekly expenses | 30 мин |

---

## Архитектура автоматизации

### Модуль 1: OTA Channel Manager (центральный)

**Это самая важная автоматизация для Aline — подтверждена всеми тремя: Aline, Дима, Эдвард.**

```
[Single Availability Engine — Odoo]
         ↓
[Channel Manager Layer]
  ├── Viator API → sync availability в реальном времени
  ├── Klook API → sync
  ├── GetYourGuide API → sync
  ├── Airbnb API → sync
  ├── ClicksBoat API → sync
  ├── Headout API → sync
  ├── Ctrip/Trip.com API → sync
  ├── GetMyBoat API → sync
  └── bluuu.tours + nusapenida.one → sync
         ↓
Логика автоматического закрытия:
  [Букинг поступил на любой платформе]
  → Odoo вычитает pax из capacity лодки
  → Если лодка заполнена (capacity = 0) → close на ВСЕХ платформах сразу
  → Если частично заполнена → обновить availability count на всех
         ↓
Логика открытия:
  [Отмена на любой платформе]
  → Odoo возвращает места
  → Открывает на всех платформах автоматически
```

**Результат:**
- Виatar: 10-15 сек × 20 операций/день = **3-5 мин** вместо **3-5 часов**
- Ошибки (пропустила платформу, неверная дата) = **ноль**
- Aline видит статус всех платформ в одном dashboard — ничего не вводит, только контролирует

**Luxury Escape:** уже auto-close за 3 дня → оставить как есть, не трогать.

---

### Модуль 2: Dynamic Pricing Engine

**Проблема:** цены меняются в голове Карима, Aline вручную обновляет на каждой платформе.

```
[Pricing Rules Engine — Odoo/Config]:
  Admin (Карим) устанавливает правила:
  ├── Base price по тирам (Essential/Comfort/Premium)
  ├── Tier-up триггеры:
  │   → Заполненность лодки > 50% за 7 дней до → Tier 2 цена
  │   → Заполненность > 80% за 3 дня → Tier 3 цена
  │   → Заполненность < 30% за 2 дня → Flash discount
  ├── Seasonal multipliers (high/low season)
  └── OTA commission adjustment per platform
         ↓
При изменении цены на сайте/в системе:
  → Автоматически пушится на все OTA через API
  → Aline получает уведомление: «Prices updated on all 9 platforms»
  → Не нужно заходить в каждую OTA отдельно
```

**Dashboard цен для Aline:**
```
[Pricing Dashboard]
Тур: Nusa Penida Shared — Apr 15
├── Текущий тир: Tier 2 (заполнено 67%)
├── Цена: 850K IDR
├── Активно на: ✅ Viator ✅ Klook ✅ GYG ✅ Airbnb ✅ ClicksBoat...
├── Следующий триггер: при 80% → Tier 3 (950K IDR)
└── Прогноз заполнения: 89% (на основе исторических данных)
```

---

### Модуль 3: Review Management Hub

**Сейчас:** Aline заходит вручную в 5 разных OTA-кабинетов, использует ChatGPT для ответов.

```
[Review Aggregator]
  ├── Google My Business API
  ├── Viator Reviews API
  ├── GetYourGuide Reviews API
  ├── Klook Reviews API
  └── Airbnb Reviews API
         ↓
[Single Review Queue — по приоритету]:
  🔴 1-2 звезды → срочно (SLA: 4 часа)
  🟡 3 звезды → обычный (SLA: 24 часа)
  🟢 4-5 звезд → по возможности (SLA: 72 часа)
         ↓
[AI Draft Response]:
  → AI анализирует текст отзыва → определяет боль
  → Находит лид в Odoo (по дате тура + имени) → подтягивает данные
  → Генерирует персонализированный ответ:
    - Addressing the specific complaint
    - Factual clarification (если жалоба неверна)
    - Apology (если обоснована)
    - Resolution offered
  → Aline review + edit + submit одной кнопкой
         ↓
[Status per review]:
  New → Draft Ready → Edited → Published
  или: New → Lead Found → Refund Offered → Resolved
```

**Refund-for-review tracker:**
- Каждый случай: платформа, дата, сумма, итог
- Месячный отчёт Кариму: «сколько потратили на покупку удаления»

---

### Модуль 4: Tour Reports Dashboard

**Проблема:** Aline вручную проверяет tour reports от гидов — кто сдал, кто нет.

```
[Guide Trip Report System]:
  Гид заполняет форму в BLUUU app после тура:
  ├── Обязательные поля (нельзя пропустить)
  ├── Прикрепляет фото (борт, гости, точки маршрута)
  └── Submit → автоматически в систему
         ↓
[Aline Dashboard]:
  [07 апр 2026 — Tour Reports]
  ✅ SD Boat — Nemo (submitted 17:23)
  ✅ Jayanadi — Sandy (submitted 16:45)
  ❌ MY Darling — Aldo (NOT submitted — deadline: 18:00)
  → Auto-reminder Aldo в 17:30
  → Alert Geebran если не сдал к 19:00
         ↓
Aline добавляет count в daily stat — автоматически (не вручную)
```

---

### Модуль 5: Daily Stats Auto-Collection

**Проблема:** Aline вручную считает и записывает daily stats из разных мест.

```
[Auto Daily Stats (00:01 ежедневно)]:
  ├── Total bookings today (из Odoo)
  ├── Bookings by platform (Viator/Klook/GYG/Airbnb/Direct/других)
  ├── Total pax (из Odoo)
  ├── Revenue by tour type (shared/private/Essential/Comfort/Premium)
  ├── Reviews received today (из агрегатора)
  ├── Guide reviews count (из агрегатора)
  ├── Cancellations + причины (из Respond.io)
  └── Availability status на 7 дней вперёд
         ↓
Aline получает готовый daily stat report в 08:00 → review → подтвердить → отправить Кариму
```

---

### Модуль 6: Private Boat Auto-Close в OTA

**Желаемая фича из интервью Aline:**

```
Private boat бронируется на сайте bluuu.tours:
  → Webhook от сайта → Odoo
  → Odoo → Channel Manager
  → Автоматически закрывает эту лодку на эту дату на ВСЕХ OTA
  → Aline получает уведомление: «SD Boat Apr 15 — closed on all platforms»
  → Не нужно ждать сигнала от MOD
```

---

## Приоритизированный роадмап

| # | Фича | Сложность | Impact | Когда |
|---|------|-----------|--------|-------|
| 1 | OTA Channel Manager (API sync) | High | 🔴 Критично | Sprint 1 |
| 2 | Private boat auto-close | Medium | 🔴 Критично | Sprint 1 |
| 3 | Review Aggregator + AI Draft | Medium | 🟠 Высокий | Sprint 2 |
| 4 | Dynamic Pricing Engine | High | 🟠 Высокий | Sprint 2 |
| 5 | Tour Reports Dashboard | Medium | 🟠 Высокий | Sprint 2 |
| 6 | Daily Stats Auto-Collection | Low | 🟡 Средний | Sprint 2 |
| 7 | Refund-for-review tracker | Low | 🟡 Средний | Sprint 3 |

---

## Ключевые интеграции

- **Odoo** → source of truth (availability, pricing, bookings)
- **Channel Manager** → синхронизация всех 9 OTA
- **OTA APIs:** Viator Partner API, Klook Supplier API, GYG Supplier API, Airbnb Host API, ClicksBoat, Headout, Ctrip, GetMyBoat
- **Google My Business API** → отзывы
- **Xendit/Stripe** → платежи

---

**Итоговая экономия времени Aline:** с ~4 часов/день механики → 30 мин контроля + review.

---

*Источники: интервью Aline PDF 06.04.2026 + MEMORY.md + FINAL_ANALYSIS.md*
