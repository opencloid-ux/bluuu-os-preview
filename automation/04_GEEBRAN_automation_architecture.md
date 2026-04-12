# BLUUU OS — Архитектура автоматизации: Geebran
**Роль:** Head of Guides  
**Источники:** интервью 04.04.2026 (аудио 45 мин, EN) + анализ 6 WhatsApp чатов (154K строк, 2023–2026)

---

## Кто такой Geebran в системе

Geebran — **операционный мозг команды гидов**. 33 активных гида + 12 фрилансеров, 4 тира. Каждый день в его голове: кто едет куда, кто на каком тире, какой язык, какая специализация, какая личность (с какими гостями сработается). Расписание строится вручную с учётом 5 переменных. Плюс: анонсы 3 ресторанов, ретрибуция Nusa Penida, трекинг инвойсов — всё вручную.

**Главная боль:** тратит 1.5–2.5 часа/день на чисто механическую работу. Из 154K строк чатов видно: одна и та же информация рассылается в 3 разных чата каждый день.

---

## Ежедневные потери времени Geebran

| Задача | Частота | Чат(ы) | Время/день |
|--------|---------|--------|-----------|
| Анонс обедов Amarta | Каждый день | Daily_Report_Lunch_Amarta | 20 мин |
| Анонс обедов Khamara | Каждый день | DTB_x_Khamara | 10 мин |
| Анонс обедов La Bianca | 2-3 раза/нед | La_Bianca_Lunch_Invoice | 5 мин |
| Анонс ретрибуции NP | Каждый день | Daytrip_tiket_online | 10 мин |
| Подтверждение оплаты ретрибуции | Каждый день | Daytrip_tiket_online | 15 мин |
| Мониторинг check-ins гидов | Каждый день | Daily_Working_Guides | 30 мин |
| Расписание гидов (ручная сборка) | Каждый день | — | 20-40 мин |
| Monthly review compilation | Ежемесячно | — | 60 мин |

**Итого: 1.5–2.5 часа чистой механики каждый день.**

---

## Архитектура автоматизации

### Модуль 1: One-Click Lunch Broadcast

**Это самая болезненная задача из чатов — 200+ раз/месяц одно и то же в 3 места.**

```
[Lunch Broadcast System]:

Данные источник → Odoo (бронирования на сегодня):
  ├── Shared tours: какие лодки, сколько pax
  ├── Private tours: какие лодки, сколько pax
  └── Dietary restrictions из полей бронирования

         ↓

Geebran утром (07:30–08:00):
  → Открывает Lunch Dashboard
  → Видит: список групп + pax сформирован автоматически
  → Добавляет если нужно: bday cake, dry couch, late lunch, buffet/set menu
  → ONE CLICK: «Send to All Restaurants»

         ↓

Система отправляет форматированное сообщение:
  → Amarta (WhatsApp через API): «Selamat pagi team Amarta, lunch update [дата]:...»
  → Khamara (WhatsApp): то же
  → La Bianca (WhatsApp): только если группа идёт туда
  → Формат: идентичный тому что Geebran пишет сейчас вручную

         ↓

При изменениях в течение дня:
  → Отмена группы → кнопка «Cancel [лодка] lunch» → авто-уведомление ресторану
  → Dietary change → edit → re-send
```

**Результат:** 35 мин/день → 5 мин review + 1 клик.

---

### Модуль 2: Ретрибуция Nusa Penida — Автоматизация

**5 шагов вручную каждый день. Из чатов видно: ежедневное давление в 16:00 «closing, please pay».**

```
[Retribusi Auto-Flow]:

Утром (07:00):
  ├── Odoo → список групп с darat-туром на сегодня
  ├── По каждой группе: pax count (взрослые / дети <9 лет бесплатно)
  └── Авто-уведомление офицерам ретрибуции:
      «Halo pak, today's groups for Nusa Penida retribution:
       Group 1: SD Boat, 12 adults + 2 children (9yo - free)
       Group 2: Jayanadi, 14 adults»

Офицеры на месте:
  → Фотографируют тикеты → отправляют в систему (не в чат)

Kassy (Accounting):
  → Видит в dashboard: какие группы, сколько к оплате, статус
  → При оплате через ATIX → авто-подтверждение в систему
  → Geebran видит статус: ✅ Paid / ⏳ Pending / ❌ Error

Конец дня:
  → Офицеры видят в системе что всё оплачено → нет звонков «please close»
  → Geebran не делает вручную переводы
```

**При сбое ATIX:**
→ система → fallback: сгенерировать ready-to-send payment summary для BRI transfer → Kassy копирует и переводит.

---

### Модуль 3: Smart Guide Scheduling

**Проблема:** расписание в голове. 5 переменных: тир + язык + специализация + личность + тип тура.

```
[Guide Scheduling Engine]:

Input (Geebran или система):
  ├── Туры на день: список лодок + тип тура (shared/private/premium)
  ├── Группы: языки гостей (из OTA-данных букинга)
  └── Специальные запросы (manta, photography, french-speaking)

[Algorithm]:
  → Для каждого тура подбирает лучшего доступного гида:
    - Тир совпадает с типом тура
    - Язык: если гость немецкий → гид говорит по-немецки (или хорошо EN)
    - Специализация: если manta tour → гид с manta experience
    - Не стоит на maintenance/sick/requested off
    - Rotation: не одни и те же гиды каждый день на лучших турах
  → Предлагает Geebran расписание

Geebran:
  → Видит предложенное расписание
  → Edit если нужно (Geebran знает нюансы алгоритм не знает)
  → Confirm → расписание уходит гидам автоматически

Гиды:
  → Получают уведомление в BLUUU app: «Tomorrow: SD Boat, Shared Tour, 08:30»
  → Confirm / Report sick
```

**Emergency replacement:**
```
Гид заболел (T-1 день):
  → Сообщает в систему до 21:00
  → Система: показывает Geebran список доступных замен
    (ближайшие к Серангану, тот же тир, доступны завтра)
  → Geebran выбирает → один клик → замена уведомлена
```

---

### Модуль 4: Digital Check-in + Trip Report

**Из анализа Daily_Working_Guides (122K строк): каждый день 25+ гидов пишут вручную «check in complete».**

```
[BLUUU Guide App]:

Утреннее отправление (07:00–08:00):
  Гид открывает app → Check-in форма:
  ├── Лодка (автоподставляется из расписания)
  ├── Фактическое pax count (может отличаться от букинга)
  ├── Фото борта (обязательно)
  └── Dietary confirmations (автосписок из букингов)
  → Submit → обновляет Odoo + уведомляет Geebran + GR

Вечерний trip report (15:00–18:00):
  ├── Маршрут: какие точки посетили (чеклист, не текст)
  ├── Тайминги: время отправления/прибытия на точки
  ├── Инциденты: [None / Guest sick / No manta / Route change / Equipment issue]
  ├── Снаряжение: [Complete / Missing: ____]
  └── Guest count при возвращении
  → Submit → авто в Aline dashboard + Geebran

Geebran видит:
  ✅ SD Boat — Nemo (submitted 17:23)
  ❌ MY Darling — Aldo (NOT submitted)
  → Auto-reminder → если нет к 18:30 → alert Geebran
```

---

### Modуль 5: Guide Performance Dashboard

**Сейчас: Geebran считает отзывы вручную раз в месяц и публикует в чат.**

```
[Auto Performance Dashboard]:

Sources:
  ├── Google Reviews → авто-парсинг упоминания гидов
  ├── Viator/Klook/GYG Reviews → парсинг имён
  ├── Internal trip reports (инциденты)
  └── Punctuality (время check-in vs расписание)

Dashboard (обновляется ежедневно):
  ├── Review count this month (per guide)
  ├── Average rating (если упомянут)
  ├── Trip incidents (per guide)
  └── Punctuality score

Monthly auto-report:
  → Geebran approve → публикуется в Guides group
  → Топ-3 highlighted автоматически
  → Гиды с падением → Geebran видит alert
```

---

### Модуль 6: Lunch Invoice Tracker

**Из La_Bianca чата: инвойс ждал оплату с ноября по январь (2+ месяца). Khamara — поздние отмены без компенсации.**

```
[Vendor Invoice Dashboard]:
  ├── При каждом обеде → система фиксирует: дата, ресторан, pax count
  ├── Ресторан загружает PDF-инвойс → система парсит сумму
  ├── Сверка: pax в системе vs pax в инвойсе → alert если расхождение
  ├── Статусы: Invoice Received / Approved / Paid / Overdue
  └── Auto-alert Kassy если инвойс > 7 дней без оплаты
  
Geebran не занимается: только мониторинг статусов, не ручная сверка.
```

---

### Модуль 7: Cancellation Cascade

**Из чатов: при отмене тура Geebran вручную уведомляет рестораны, ретрибуцию, гидов.**

```
[Event: Tour Cancelled (by MOD / weather / any reason)]
         ↓
Система автоматически:
  1. → Уведомляет ресторан: «[Лодка] lunch cancelled for today»
  2. → Обновляет ретрибуцию: убирает группу из дневного списка
  3. → Уведомляет гидов: «[Тур] cancelled — compensation policy applies»
  4. → Уведомляет гостей (через GR/бот)
  5. → Освобождает availability в OTA
  6. → Триггер: cancellation compensation для гидов (50%/25% по правилу)
  
Geebran: одно нажатие «Cancel Tour» → всё остальное автоматически.
```

---

## Приоритизированный роадмап

| # | Фича | Сложность | Impact | Когда |
|---|------|-----------|--------|-------|
| 1 | One-Click Lunch Broadcast (3 рестораны) | Medium | 🔴 Критично | Sprint 1 |
| 2 | Ретрибуция авто-flow | Medium | 🔴 Критично | Sprint 1 |
| 3 | Digital Check-in + Trip Report (app) | High | 🟠 Высокий | Sprint 2 |
| 4 | Cancellation Cascade | Medium | 🟠 Высокий | Sprint 2 |
| 5 | Smart Guide Scheduling | High | 🟠 Высокий | Sprint 2 |
| 6 | Guide Performance Dashboard | Medium | 🟡 Средний | Sprint 3 |
| 7 | Lunch Invoice Tracker | Low | 🟠 Высокий | Sprint 2 |
| 8 | Emergency Replacement System | Medium | 🟡 Средний | Sprint 3 |

---

## Ключевые интеграции

- **BLUUU Guide App** → мобильное приложение для гидов (check-in, trip report)
- **Odoo** → расписание, бронирования, pax data
- **WhatsApp Business API** → broadcast ресторанам
- **ATIX API** → ретрибуция (или fallback: BRI transfer)
- **Google/OTA Review APIs** → performance tracking

---

**Итоговая экономия:** 1.5–2.5 часа/день → 15-20 мин контроля дашборда.

---

*Источники: geebran_interview_analysis.md + geebran_chats_analysis.md (6 чатов, 154K строк)*
