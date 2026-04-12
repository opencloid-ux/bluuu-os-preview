# REQUIREMENTS_GIBRAN.md — 7 новых модулей для Guide Management System

**Дата:** 12 апреля 2026  
**Версия:** 1.0  
**Статус:** Final Specification  
**Источник:** Интервью Geebran (04.04.2026), анализ чатов (154k строк), операционные паттерны  

---

## 📋 Обзор требований

На основе анализа интервью Geebran и операционных чатов Bluuu Tours определены **7 критических модулей** для автоматизации guide management:

| # | Модуль | Пользователь | Назначение | Статус |
|---|--------|---|----------|---------|
| 1 | GoPro & Review Link Tracking | Gee, гиды | Отслеживание видео, ссылок для гостей, напоминания (6PM, 9PM) | New |
| 2 | Daily Report Reminder | Гиды | Автоматическое напоминание о заполнении отчёта (7 PM) | New |
| 3 | Booking Calendar | Gee, MOD | Календарь бронирований с месячной видимостью, маршруты | New |
| 4 | Midday Check-in | Гиды, Gee | Полуденное напоминание обновить условия (11:30 AM) | New |
| 5 | Afternoon Weather Update | Гиды, Gee | Погода и видеорапрос (3 PM) | New |
| 6 | Guide Performance Dashboard | Gee | KPI, рейтинги, ежемесячная статистика | New |
| 7 | Complaint/Incident Log | Gee, Dima | Логирование жалоб и инцидентов, выявление паттернов | New |
| BONUS | Upselling Tracking | Gee, GR | Отслеживание upsell-предложений по гиду | New |

---

## 1. GoPro & Review Link Tracking

### 1.1 Назначение
Централизованное отслеживание GoPro footage для каждого тура, управление ссылками для гостей, напоминания о загрузке и доступности видео.

**Текущая проблема:**
- Каждый день Komang Ryan / Weda вручную собирают footage, создают Google Drive папки, публикуют ссылки в чат
- Ссылки часто неправильные, гости получают сообщения об ошибках
- Нет контроля над тем, когда видео доступно гостю
- Нет трекинга просмотров

### 1.2 Функциональные требования

#### 1.2.1 Логирование видео при check-in
```
При заполнении trip report:
- Гид указывает: видео снято? (да/нет)
- Если снято: кто снимал (1st guide, 2nd guide, обе камеры)
- Указываем статус: ready for upload / pending edit / uploaded
```

#### 1.2.2 Хранилище и ссылки
```
Структура Google Drive:
  GoPro Footage (root)
  ├── 2026-04 (месяц)
  │   ├── 2026-04-12_Sandy_Timpleng (дата_гид1_гид2)
  │   │   ├── RAW footage (если не edited)
  │   │   ├── EDITED (если прошёл обработку)
  │   │   └── SHARED (готовая ссылка для гостя)
  │   └── 2026-04-12_Aldo_Derrick
```

Автоматическое правило:
- Папка создаётся при upload первого файла
- Именование: YYYY-MM-DD_GuideFirstName_GuideSecondName
- Фильтр: исключаем файлы с "._" префиксом (Mac OS artifact)

#### 1.2.3 Уведомления для гидов
```
Напоминание 1 (6 PM):
  "📹 Привет Sandy & Timpleng! GoPro footage для тура [Shared_01_12pax] 
   готов для upload? → LINK_TO_UPLOAD_FORM"
  
Если не uploaded, напоминание 2 (9 PM):
  "⚠️ Напоминание: GoPro footage ещё не загружена. 
   Дедлайн: сегодня 23:59 → LINK_TO_UPLOAD_FORM"
```

**Канал доставки:** WhatsApp Bot или in-app notification (BLUUU Guide App)

#### 1.2.4 Отправка ссылки гостю
```
После проверки видео Gee/MOD одобряет:
- Автоматически отправляется гостям ссылка SHARED папки
- Сообщение шаблон:
  "Здравствуйте! Ваше видео готово 🎥 → [Google Drive Link]
   Ссылка действительна 30 дней. Enjoy!"
```

**Канал:** WhatsApp (через Kommo / в-ап) или email

#### 1.2.5 Трекинг статусов
```
Статусы видео:
- Not Shot (нет съёмки)
- Uploading (загружается)
- Pending Review (ожидает проверки Gee)
- Published (одобрено, ссылка отправлена)
- Expired (старше 30 дней, ссылка неактивна)
- Lost (footage потеряна / повреждена)
```

### 1.3 Data Model

#### Таблица: `gopro_footage`
```sql
CREATE TABLE gopro_footage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  guide_id_1 UUID NOT NULL REFERENCES guides(id),
  guide_id_2 UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Статус съёмки
  filming_status ENUM('not_shot', 'uploading', 'pending_review', 'published', 'expired', 'lost') DEFAULT 'not_shot',
  
  -- Метаданные видео
  google_drive_folder_id VARCHAR(255),
  google_drive_shared_link VARCHAR(500),
  footage_duration_seconds INT,
  file_count INT,
  file_names TEXT[], -- массив имён файлов
  
  -- Timestamps
  shot_at TIMESTAMP,
  uploaded_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Метаданные для отслеживания
  reviewed_by_user_id UUID REFERENCES users(id),
  review_notes TEXT,
  guest_download_count INT DEFAULT 0,
  guest_last_accessed_at TIMESTAMP,
  
  INDEX idx_tour_id (tour_id),
  INDEX idx_guide_id_1 (guide_id_1),
  INDEX idx_filming_status (filming_status),
  INDEX idx_published_at (published_at)
);
```

#### Таблица: `gopro_notifications`
```sql
CREATE TABLE gopro_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  footage_id UUID NOT NULL REFERENCES gopro_footage(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id),
  
  notification_type ENUM('upload_reminder_6pm', 'upload_reminder_9pm', 'published_to_guest') NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  delivery_channel ENUM('whatsapp', 'email', 'in_app') DEFAULT 'whatsapp',
  delivery_status ENUM('pending', 'sent', 'failed', 'undelivered') DEFAULT 'pending',
  
  retry_count INT DEFAULT 0,
  error_message TEXT,
  
  INDEX idx_footage_id (footage_id),
  INDEX idx_guide_id (guide_id),
  INDEX idx_scheduled_at (scheduled_at)
);
```

#### Таблица: `guest_video_access`
```sql
CREATE TABLE guest_video_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  footage_id UUID NOT NULL REFERENCES gopro_footage(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  
  shared_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  download_count INT DEFAULT 0,
  last_accessed_at TIMESTAMP,
  
  INDEX idx_footage_id (footage_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_expires_at (expires_at)
);
```

### 1.4 API Endpoints

```
POST /api/tours/{tour_id}/gopro/footage
  Input: { filming_status, guide_id_1, guide_id_2, shot_at }
  Output: { footage_id, status, next_reminder_scheduled }

GET /api/gopro/footage/{footage_id}
  Output: { tour_id, guides, status, google_drive_link, published_at, guest_downloads }

PUT /api/gopro/footage/{footage_id}/approve
  Input: { reviewed_by_user_id, review_notes, publish_to_guest: boolean }
  Output: { status: 'published', guest_notification_scheduled_at }

GET /api/gopro/footage?status=pending_review&limit=50
  Output: [{ footage_id, tour_info, guides, uploaded_at }] — для Gee dashboard

POST /api/gopro/notifications/schedule
  Cron task: каждый день 18:00 → создаёт напоминания для незагруженного footage

GET /api/gopro/footage/{footage_id}/guest-access
  Output: { shared_at, expires_at, download_count, download_link }
```

### 1.5 Scheduling & Automation

**Reminder Job** — запускается ежедневно в 18:00 GMT+8:
```
SELECT footage WHERE filming_status IN ('not_shot', 'uploading')
  AND tour_date = TODAY
  AND NOT EXISTS (notification WHERE type='upload_reminder_6pm' AND sent_at IS NOT NULL)
  
FOR EACH footage:
  - Create notification record
  - Send WhatsApp to guide_id_1 and guide_id_2 via Twilio/Kommo API
  - Mark as sent
```

**Escalation Job** — 21:00 GMT+8 (если до 18:00 не загружено):
```
SELECT footage WHERE filming_status IN ('not_shot', 'uploading')
  AND tour_date = TODAY
  
FOR EACH:
  - Send 2nd reminder (9 PM) if not yet sent
  - Create escalation note in Kommo: guide_id → "Footage pending"
```

**Expiry Job** — ежедневно в 00:00:
```
SELECT guest_video_access WHERE expires_at < NOW()
  - Update status to 'expired'
  - Send notification to guest: "Your video link has expired"
  - Archive in cold storage (if compliance required)
```

### 1.6 Integration с существующей системой

| Точка интеграции | Действие | Канал |
|---|---|---|
| **Kommo CRM** | При publish: создаёт activity "GoPro shared" с гостем | API call |
| **WhatsApp Bot** | Отправка уведомлений гидам | Twilio / WhatsApp API |
| **Google Drive API** | Автосоздание папок, проверка файлов | v3 API |
| **Booking System** | Fetch tour_id, guest_phone, guide names | SQL join + cache |
| **Trip Report Form** | При submit'е trip report: check если съёмка или нет | Pre-form validation |

---

## 2. Daily Report Reminder

### 2.1 Назначение
Автоматическое напоминание гидам о заполнении ежедневного отчёта о туре (вечерний trip report).

**Текущая проблема:**
- ~25 гидов каждый день пишут trip report вручную в WhatsApp
- Качество варьируется: одни пишут подробно с временами, другие минимум
- MOD тратит время на парсинг и извлечение структурированных данных
- Нет единого формата

### 2.2 Функциональные требования

#### 2.2.1 Напоминание в 7 PM
```
В 19:00 GMT+8 каждого дня тура:
- Отправляем guide_id_1 и guide_id_2 ссылку на форму trip report
- Шаблон сообщения:
  "📝 Привет Sandy! Time to report your trip 
   [Shared_01_12pax on 12-Apr]
   → LINK_TO_TRIP_REPORT_FORM"
```

#### 2.2.2 Структурированная форма
```
Обязательные поля:
1. Tour info (pre-filled, read-only):
   - Date, Boat, Guest count, Tour type

2. Route & Timing (required):
   - Departure time (default: from booking)
   - Point 1: [name] - [time_in] - [time_out]
   - Point 2: [name] - [time_in] - [time_out]
   - ...
   - Return time (default: expected + actual)
   
3. Equipment check (required):
   - Towels: counted ✓
   - Life jackets: counted ✓
   - Snorkel gear: all returned ✓
   - Camera equipment: all accounted ✓

4. Incidents & Notes (optional):
   - Any guest issues? [text]
   - Weather/sea conditions? [text]
   - Safety concerns? [text]
   - Special moments? [text]

5. Photos taken:
   - Checkbox: GoPro footage collected? YES / NO
   - Estimated duration: [minutes]

Форма доступна через:
- Мобильное приложение BLUUU Guide App (preferred)
- WhatsApp deep link → web form
- QR-code на лодке
```

#### 2.2.3 Валидация при submit
```
Before accept:
- Departure time <= Return time? ✓
- All points have timing? ✓
- Equipment check completed? ✓
- Return time filled? ✓

If validation fails:
- Show inline error + highlight missing field
- Don't accept submit until all required fields OK
```

#### 2.2.4 Повторные напоминания
```
Если trip report не заполнен:

Напоминание 2 (20:00):
  "⏰ Sandy, отчёт ещё не заполнен (1 час назад)
   Дедлайн: 23:59 сегодня
   → LINK_TO_FORM"

Напоминание 3 (22:00):
  "⚠️ ВАЖНО: Trip report необходимо заполнить!
   Осталось 2 часа
   → LINK_TO_FORM"

После 23:59:
  - Mark as "Overdue"
  - Create escalation in Kommo: guide → "Report missing"
  - Send to Gee: "Reports pending from: Sandy, Timpleng" + list
```

### 2.3 Data Model

#### Таблица: `daily_reports`
```sql
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  guide_id_1 UUID NOT NULL REFERENCES guides(id),
  guide_id_2 UUID,
  
  -- Timing
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  submitted_by_user_id UUID REFERENCES users(id),
  
  -- Route & Timing
  departure_time TIME,
  return_time TIME,
  route_points JSONB, -- [{ name, time_in, time_out }, ...]
  
  -- Equipment
  towels_count INT,
  life_jackets_count INT,
  snorkel_gear_status ENUM('complete', 'missing_item', 'not_checked'),
  equipment_notes TEXT,
  
  -- Incidents & Notes
  guest_issues_text TEXT,
  weather_conditions_text TEXT,
  safety_concerns_text TEXT,
  special_moments_text TEXT,
  
  -- GoPro
  gopro_collected BOOLEAN,
  estimated_footage_duration INT,
  
  -- Metadata
  status ENUM('draft', 'submitted', 'overdue', 'reviewed') DEFAULT 'draft',
  data_quality_score INT (0-100), -- auto-calculated
  
  INDEX idx_tour_id (tour_id),
  INDEX idx_guide_id_1 (guide_id_1),
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_status (status)
);
```

#### Таблица: `route_points` (denormalization option)
```sql
CREATE TABLE route_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  point_name VARCHAR(255) NOT NULL,
  time_in TIME NOT NULL,
  time_out TIME NOT NULL,
  order_index INT NOT NULL,
  
  notes TEXT,
  
  UNIQUE(daily_report_id, order_index),
  INDEX idx_report_id (daily_report_id)
);
```

#### Таблица: `report_reminders`
```sql
CREATE TABLE report_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id),
  guide_id UUID NOT NULL REFERENCES guides(id),
  
  reminder_sequence INT (1, 2, 3, ...),
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  delivery_status ENUM('pending', 'sent', 'failed', 'acknowledged') DEFAULT 'pending',
  
  retry_count INT DEFAULT 0,
  
  INDEX idx_tour_id (tour_id),
  INDEX idx_guide_id (guide_id),
  INDEX idx_scheduled_at (scheduled_at)
);
```

### 2.4 API Endpoints

```
POST /api/tours/{tour_id}/daily-report
  Input: { guide_id_1, guide_id_2, form_data_json }
  Output: { report_id, status, validation_errors[] }

GET /api/tours/{tour_id}/daily-report
  Output: { tour_id, guide_ids, status, submitted_at, route_points[] }

GET /api/guides/{guide_id}/daily-reports?date=2026-04-12
  Output: [{ report_id, tour_id, status, submitted_at }]

GET /api/daily-reports/pending?limit=50
  Output: [{ tour_id, guide_ids, scheduled_reminder_time, last_reminder_sent }] — для Gee

PUT /api/daily-reports/{report_id}/reviewed
  Input: { reviewed_by_user_id, review_notes }
  Output: { status: 'reviewed', data_quality_score }

POST /api/daily-reports/reminders/schedule
  Cron task: 19:00 GMT+8 каждый день → создаёт напоминания
```

### 2.5 Scheduling & Automation

**Daily Reminder Job** — 19:00 GMT+8:
```
SELECT tours WHERE date = TODAY
  AND status IN ('active', 'in_progress')
  AND NOT EXISTS (daily_report WHERE submitted_at IS NOT NULL)
  
FOR EACH tour WITH guide_id_1, guide_id_2:
  - Create reminder record (sequence=1)
  - Send WhatsApp: "📝 Time to report" + form link
  - Mark sent_at = NOW()
  - Schedule next reminder in 1 hour
```

**Escalation Job** — 20:00 и 22:00 GMT+8:
```
SELECT tours WHERE submitted_at IS NULL
  AND reminder sequence 1 sent > 1 hour ago
  
FOR EACH:
  - Create new reminder (sequence += 1)
  - Send escalation message
  - If sequence >= 3:
    - Mark as 'overdue'
    - Alert Gee: missing reports list
```

---

## 3. Booking Calendar

### 3.1 Назначение
Месячный календарь всех бронирований с детальной информацией (лодки, гиды, маршруты, типы туров, количество гостей).

**Текущая проблема:**
- Расписание лодок и гидов только в голове у Gee
- Нет способа быстро увидеть занятость по неделям/месяцам
- Сложно распланировать отпуска гидов или техническое обслуживание лодок
- Нет синхронизации между OTA-доступностью и фактическими туром

### 3.2 Функциональные требования

#### 3.2.1 Calendar View
```
Grid layout:
  - По горизонтали: дни месяца (1-30)
  - По вертикали: лодки (в порядке приоритета)
  - Каждая клетка: список туров в этот день на этой лодке
  
Клетка содержит:
  [Shared_01] [12 pax] [Sandy + Timpleng] [Shared snorkling]
  [SO5] [8 pax] [Aldo + Derrick] [Private]
  [SD] [20 pax] [Gede + Morgan] [Party boat] 🎉
  
Цветовая кодировка:
  - Зелёный: активное бронирование
  - Жёлтый: условное (pending confirmation)
  - Серый: техническое обслуживание лодки
  - Красный: отмена
  - Белый: доступно
```

#### 3.2.2 Фильтры и представления
```
Filter by:
  - Лодка (single / multi select)
  - Гид (show tours с этим гидом)
  - Тип тура (shared, private, party, special)
  - Статус (active, pending, cancelled, maintenance)
  - Дата (день / неделя / месяц / кастомный диапазон)

Switch view:
  - Calendar (по умолчанию)
  - List (all tours sorted by date)
  - Guide schedule (по гидам)
  - Boat schedule (по лодкам)
```

#### 3.2.3 Detail popup при клике
```
При клике на тур:
  [Shared_01] 2026-04-12 | 12 pax | Shared Snorkeling
  ├─ Boat: Jayanadi (status: OK)
  ├─ Guides: Sandy (Tier 2) + Timpleng (Tier 1)
  ├─ Time: 08:00 - 15:30
  ├─ Route: Nusa Penida > Kelingking > Atuh > Teletubbies
  ├─ Guests: John Doe, Jane Smith, ... (12 total)
  ├─ Lunch: Amarta (13 pax including 1 child)
  ├─ Special notes: 1 snorkeler with asthma, bday cake requested
  ├─ GoPro: Pending upload
  ├─ Trip report: Not submitted
  └─ [EDIT] [CANCEL] [COPY_TO_NEXT_MONTH]
```

#### 3.2.4 Добавление / редактирование тура
```
Quick add modal:
  - Select boat
  - Select date
  - Select guides (from available)
  - Guest count
  - Tour type (pre-fill available types)
  - Special requests
  - [SAVE] → creates in system

Edit existing:
  - All fields editable
  - Validation: guide availability, boat capacity, OTA sync
  - [SAVE] → updates + triggers cascade updates (lunch, retribution, etc.)
```

#### 3.2.5 Маршруты и погода
```
Каждый день в календаре:
  - Иконка погоды (☀️ / ⛅ / 🌊 зависит от forecast)
  - Swell height (если > 1.5m: оранжевый, > 2.5m: красный)
  - Wind knots
  - Recommended route (по умолчанию, но может быть перезаписано)
  
Клик на погоду:
  - Show detailed forecast for the day
  - Recommendation: "OK for all tours" / "Only experienced guides" / "Recommend reschedule"
```

### 3.3 Data Model

Существующие таблицы переиспользуются:
- `tours` (id, boat_id, guide_id_1, guide_id_2, tour_date, tour_type, guest_count, ...)
- `boats` (id, name, capacity, status, ...)
- `guides` (id, name, tier, ...)
- `tour_routes` (id, tour_id, point_name, point_order, ...)

Новая таблица: `calendar_metadata`
```sql
CREATE TABLE calendar_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  
  -- Route & Weather
  recommended_route_points TEXT[], -- ["Nusa Penida", "Kelingking", "Atuh", "Teletubbies"]
  weather_forecast_swell_m DECIMAL(3, 2),
  weather_forecast_wind_knots INT,
  weather_forecast_condition VARCHAR(50), -- "sunny", "cloudy", "rainy", "rough"
  recommended_weather_decision VARCHAR(100), -- "OK for all", "experienced only", "recommend reschedule"
  
  -- Special requests
  bday_cake_requested BOOLEAN DEFAULT FALSE,
  photographer_requested BOOLEAN DEFAULT FALSE,
  dj_requested BOOLEAN DEFAULT FALSE,
  special_dietary_notes TEXT,
  
  -- Lunch coordination
  lunch_venue_id UUID REFERENCES restaurants(id),
  lunch_confirmed_at TIMESTAMP,
  lunch_cancellation_reason TEXT,
  
  -- Retribution
  retribution_billed BOOLEAN DEFAULT FALSE,
  retribution_amount DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_tour_id (tour_id)
);
```

### 3.4 API Endpoints

```
GET /api/calendar?year=2026&month=4&boat_id=[]&guide_id=[]&tour_type=[]
  Output: {
    days: [
      { date: "2026-04-12", tours: [{ tour_id, boat_name, guides, pax, type, status }] },
      ...
    ],
    boats: [{ id, name, capacity }],
    weather: [{ date, swell_m, wind_knots, condition, recommendation }]
  }

GET /api/calendar/tours/{tour_id}/detail
  Output: { full tour info + guides + guests + route + notes }

POST /api/calendar/tours
  Input: { boat_id, date, guide_id_1, guide_id_2, guest_count, tour_type, special_requests }
  Output: { tour_id, status, validation_errors[] }

PUT /api/calendar/tours/{tour_id}
  Input: { field updates }
  Output: { tour_id, updated_fields, cascade_updates: {lunch, retribution, ...} }

GET /api/calendar/weather?date=2026-04-12
  Output: [{ swell_m, wind_knots, condition, recommendation }]

GET /api/calendar/guide-schedule/{guide_id}?year=2026&month=4
  Output: [{ date, tours: [...] }]
```

### 3.5 Scheduling & Automation

**Daily Weather Update** — 06:00 GMT+8:
```
Fetch weather data for next 7 days
  - Integrate with weather API (openmeteo, weatherapi)
  - Update calendar_metadata.weather_forecast_*
  - If swell > 2.5m: create alert for Gee
```

**Calendar Sync with OTA** — hourly:
```
FOR EACH tour:
  - Check if status changed (cancelled externally)
  - Update OTA availability accordingly
  - Prevent overbooking
```

---

## 4. Midday Check-in (11:30 AM)

### 4.1 Назначение
Полуденное напоминание для гидов обновить условия и статус тура в реальном времени (погода, маршрут, количество гостей).

**Текущая проблема:**
- Gee утром объявляет маршрут, но условия меняются в реальном времени (погода, боль гостя и т.д.)
- Гиды отправляют обновления в WhatsApp ad-hoc, информация теряется в чате
- Нет структурированного способа логировать изменения маршрута
- Рестораны и другие системы не узнают об изменениях вовремя

### 4.2 Функциональные требования

#### 4.2.1 Уведомление в 11:30 AM
```
В 11:30 GMT+8 (середина дневного тура):
- Отправляем guide_id_1 и guide_id_2 форму "Conditions Update"
- Шаблон сообщения:
  "🌊 Sandy & Timpleng! Quick conditions check:
   - Sea & weather? [dropdown: calm, choppy, rough, very rough]
   - Sticking to planned route? [yes / change it]
   - All guests OK? [yes / issue]
   → LINK_TO_UPDATE_FORM"
```

#### 4.2.2 Форма условий
```
Обязательные поля:
1. Current time: [display only]
2. Sea conditions: [dropdown]
   - Calm (swell < 0.5m, wind < 5 knots)
   - Slight (swell 0.5-1m, wind 5-10)
   - Moderate (swell 1-1.5m, wind 10-15)
   - Rough (swell 1.5-2m, wind 15-20)
   - Very rough (swell > 2m, wind > 20)

3. Weather: [dropdown]
   - Sunny ☀️
   - Cloudy ⛅
   - Rainy 🌧️
   - Stormy ⛈️

4. Visibility underwater: [dropdown]
   - Excellent (>15m)
   - Good (10-15m)
   - Moderate (5-10m)
   - Poor (<5m)

5. Sticking to planned route? [YES / NO]
   If NO:
   - Current location: [text / GPS pin]
   - New route: [text]
   - Reason: [dropdown: weather, guest issue, time constraint, other]
   - ETA to next point: [time]

6. All guests okay? [YES / ISSUE]
   If ISSUE:
   - Guest issue: [dropdown: seasickness, injury, medical, panic, other]
   - Severity: [low, medium, high]
   - Action taken: [text]
   - Do we need support? [YES / NO → escalate]

7. Any changes to lunch? [YES / NO]
   If YES:
   - Time change: [time picker]
   - Venue change: [select restaurant]
   - Pax change: [number] (e.g., guest cancelled lunch)

8. Special notes: [text area]

[SUBMIT] — validates & sends
```

#### 4.2.3 Cascade updates при submit
```
When form submitted:
1. Log conditions in daily_checkins table
2. Update tour status: route_modified, sea_conditions
3. If route changed:
   - Notify Gee immediately (in-app alert)
   - Update recommended_route in calendar
4. If guest issue:
   - If severity = 'high': create incident log + escalate to Dima
   - If medical: alert boat driver for quick return capability
5. If lunch changes:
   - Auto-notify restaurant (via API)
   - Update guest if arrival time changed
6. Store GPS location if provided
```

### 4.3 Data Model

#### Таблица: `daily_checkins`
```sql
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id),
  
  -- Timing
  scheduled_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP,
  
  -- Conditions
  sea_condition VARCHAR(50) NOT NULL, -- calm, choppy, rough, etc.
  weather_condition VARCHAR(50) NOT NULL, -- sunny, cloudy, rainy, stormy
  visibility_underwater VARCHAR(50), -- excellent, good, moderate, poor
  
  -- Route
  is_sticking_to_route BOOLEAN DEFAULT TRUE,
  route_change_reason VARCHAR(100),
  new_route_points TEXT[],
  current_location_gps POINT,
  eta_next_point TIMESTAMP,
  
  -- Guests
  all_guests_okay BOOLEAN DEFAULT TRUE,
  guest_issue_type VARCHAR(100), -- seasickness, injury, medical, panic, other
  issue_severity VARCHAR(20), -- low, medium, high
  action_taken TEXT,
  escalate_required BOOLEAN DEFAULT FALSE,
  
  -- Lunch changes
  lunch_time_change TIME,
  lunch_venue_change_id UUID REFERENCES restaurants(id),
  lunch_pax_change INT,
  
  -- Metadata
  special_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_tour_id (tour_id),
  INDEX idx_guide_id (guide_id),
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_issue_severity (issue_severity)
);
```

#### Таблица: `guest_medical_flags`
```sql
CREATE TABLE guest_medical_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  tour_id UUID NOT NULL REFERENCES tours(id),
  
  flag_type VARCHAR(100), -- seasickness, allergy, medical_condition, etc.
  severity VARCHAR(20), -- low, medium, high
  
  reported_at TIMESTAMP,
  reported_by_user_id UUID REFERENCES users(id), -- guide or MOD
  
  action_taken TEXT,
  resolved_at TIMESTAMP,
  resolution TEXT,
  
  INDEX idx_tour_id (tour_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_severity (severity)
);
```

### 4.4 API Endpoints

```
POST /api/tours/{tour_id}/midday-checkin
  Input: { guide_id, form_data_json }
  Output: { checkin_id, status, cascade_updates: {route_updated, restaurant_notified, ...} }

GET /api/tours/{tour_id}/midday-checkin
  Output: { checkin_id, conditions, route_info, guest_status, escalation_flag }

GET /api/daily-checkins/pending?limit=50
  Output: [{ tour_id, guide_ids, scheduled_at, submitted_at }] — для Gee

GET /api/daily-checkins/escalations?date=2026-04-12
  Output: [{ checkin_id, tour_id, issue_type, severity, guide_contact }]

POST /api/daily-checkins/{checkin_id}/escalate
  Input: { escalate_to_user_id, priority }
  Output: { escalation_id, notification_sent }
```

### 4.5 Scheduling & Automation

**Midday Reminder Job** — 11:30 GMT+8 каждый день:
```
SELECT tours WHERE tour_date = TODAY
  AND status IN ('active', 'in_progress')
  AND departure_time + 3.5 hours >= NOW() <= departure_time + 4.5 hours
  
FOR EACH tour WITH guide_id_1, guide_id_2:
  - Create checkin record
  - Send WhatsApp: "🌊 Quick conditions check" + form link
  - Schedule escalation alarm if not submitted in 30 min
```

---

## 5. Afternoon Weather Update (3 PM)

### 5.1 Назначение
Полуденный обновок о погоде с запросом на видеоматериал (GoPro). Помогает гидам планировать последние часы тура и напоминает о сборе footage.

**Текущая проблема:**
- Погодный брифинг не структурирован, часто только в чате Gee
- Нет способа узнать, собрал ли гид видео к определённому времени
- Видео часто теряется, если гид забыл загрузить

### 5.2 Функциональные требования

#### 5.2.1 Уведомление в 3 PM
```
В 15:00 GMT+8:
- Отправляем guide_id_1 и guide_id_2 погодный update + form
- Шаблон сообщения:
  "🌞 Sandy & Timpleng! Afternoon weather update:
   - Current sea: Moderate, swell 1m, wind 12 knots
   - Forecast next 2h: improving ☀️
   - Recommended final route: [North coast snorkeling]
   
   📹 Time to wrap up GoPro? → [YES / NO]
   → LINK_TO_WEATHER_FORM"
```

#### 5.2.2 Погодный брифинг
```
При клике на форму:
[Afternoon Weather Update | 2026-04-12 15:00]

Current Conditions:
  ├─ Sea: Moderate chop (1-1.5m swell)
  ├─ Wind: 12 knots NE
  ├─ Visibility: Good (12m underwater)
  ├─ Temperature: 27°C
  └─ UV Index: 8 (high)

Next 2 Hours Forecast:
  ├─ Wind: decreasing to 8 knots
  ├─ Swell: 0.8-1m
  ├─ Rain probability: 20%
  └─ Trend: improving → likely sunny by 4 PM

Recommended final routing:
  🌊 Current location: [Kelingking Beach]
  ✅ Option A: Return to Manta Point (15 min) — visible conditions good
  ⚠️ Option B: Rocky area — rougher, not recommended
  → Current recommendation: [Option A]
  
[ACCEPT RECOMMENDATION] or [CHOOSE DIFFERENT ROUTE]
```

#### 5.2.3 GoPro статус & запрос
```
GoPro Status Check:

Have you collected all footage? [RADIO BUTTONS]
  ☐ Yes, all footage collected & safe
  ☐ Partially collected (specify below)
  ☐ No, haven't started yet
  ☐ Lost / equipment issue

If partial or no:
  - Time to collect? [Yes / No / Send gear to Gee]
  - Last chance? [Yes / No]

[Footage collection is critical for guest experience!]
[CONFIRM FOOTAGE STATUS] → logs in system
```

### 5.3 Data Model

#### Таблица: `weather_updates`
```sql
CREATE TABLE weather_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  
  -- Timing
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  
  -- Current conditions
  sea_condition VARCHAR(50), -- calm, slight, moderate, rough, very rough
  swell_height_m DECIMAL(3, 2),
  wind_knots INT,
  wind_direction VARCHAR(5), -- NE, SW, etc.
  visibility_underwater_m INT,
  temperature_c INT,
  uv_index INT,
  
  -- Forecast
  forecast_wind_knots_next_2h INT,
  forecast_swell_m_next_2h DECIMAL(3, 2),
  forecast_rain_probability INT,
  forecast_condition_next_2h VARCHAR(50),
  
  -- Recommendations
  recommended_route TEXT,
  recommendation_sent_at TIMESTAMP,
  
  -- GoPro status
  gopro_status VARCHAR(50), -- fully_collected, partially_collected, not_started, lost
  gopro_confirmed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_tour_id (tour_id),
  INDEX idx_scheduled_at (scheduled_at)
);
```

#### Таблица: `weather_api_cache`
```sql
CREATE TABLE weather_api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location VARCHAR(255), -- "Nusa Penida" or coordinates
  
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  api_response JSONB, -- полный ответ от weather API
  
  INDEX idx_location_expires (location, expires_at)
);
```

### 5.4 API Endpoints

```
GET /api/weather?location=Nusa_Penida&date=2026-04-12
  Output: {
    current: { swell_m, wind_knots, visibility_m, temp_c, uv_index },
    forecast_2h: { wind_knots, swell_m, rain_prob, condition },
    recommended_route: string
  }

POST /api/tours/{tour_id}/weather-update
  Input: { guide_id, gopro_status, route_choice, notes }
  Output: { update_id, status, recommendation_updated }

GET /api/tours/{tour_id}/weather-update
  Output: { current weather, forecast, recommendations, gopro_status }

POST /api/weather-updates/schedule
  Cron task: 15:00 GMT+8 → creates notifications
```

### 5.5 Scheduling & Automation

**Weather Fetch Job** — 14:00 GMT+8 каждый день:
```
Fetch weather data for Nusa Penida (prime location)
  - From weatherapi.com or openmeteo
  - Cache for 2 hours
  - Calculate next 2h forecast
```

**Weather Reminder Job** — 15:00 GMT+8:
```
SELECT tours WHERE tour_date = TODAY
  AND departure_time + 6 hours >= NOW()
  
FOR EACH tour:
  - Fetch cached weather
  - Generate recommendation
  - Send WhatsApp to guides
  - Create weather_updates record
```

---

## 6. Guide Performance Dashboard

### 6.1 Назначение
Ежемесячный дашборд с KPI гидов, рейтингами по отзывам, количеством туров, доходом. Помогает Gee справедливо распределять туры и выявлять лучших гидов.

**Текущая проблема:**
- Рейтинг гидов составляется вручную Gee (читает отзывы 3-4 раза/месяц)
- Нет автоматического парсинга отзывов из Google, TripAdvisor, Klook
- Нет объективных метрик для распределения туров
- Рейтинг публикуется один раз в месяц вручную в чат

### 6.2 Функциональные требования

#### 6.2.1 Metrics per guide
```
Для каждого гида, за каждый месяц:

1. Отзывы (Reviews)
   ├─ Google: rating, count
   ├─ TripAdvisor: rating, count
   ├─ Klook: rating, count
   ├─ Internal: rating, count (from Dima's notes)
   ├─ Average rating: 4.82 ⭐
   ├─ Total reviews: 142
   ├─ Trend: +5 reviews vs last month
   └─ Key feedback: [positive tags], [negative tags]

2. Tours & Performance
   ├─ Tours completed: 24
   ├─ Tours missed/cancelled: 1
   ├─ No-shows: 0
   ├─ Average tour rating: 4.85
   ├─ On-time performance: 98%
   └─ Guest satisfaction: 96% (based on post-tour survey)

3. Revenue
   ├─ Gross tour revenue: $8,400 (24 tours × avg $350)
   ├─ Guide payout: $2,100 (25% of gross)
   ├─ Bonus (if applicable): +$200 (top performer)
   └─ Total earnings: $2,300

4. Specialization
   ├─ Best suited for: Families, Photography enthusiasts
   ├─ Languages: English, Spanish, Russian
   ├─ Certification: PADI Divemaster, Freediver cert.
   └─ Tour type distribution: Shared 60%, Private 30%, Party 10%

5. Safety & Incidents
   ├─ Guest medical incidents: 0
   ├─ Equipment damage: 0
   ├─ Safety violations: 0
   ├─ Guest complaints: 1 (resolved)
   └─ Incident trend: 0 (clean)
```

#### 6.2.2 Ranking visualization
```
MARCH 2026 Guide Rankings 🏆

🥇 1st Place — Nemo (4.88 ⭐, 28 tours, +5 reviews)
   → Awarded: "March Hero", $200 bonus, priority pick for premium tours
   ✅ Consistent excellence, high volume, guest feedback mentions "knowledgeable & warm"

🥈 2nd Place — Budi (4.86 ⭐, 27 tours, +3 reviews)
   → Awarded: "Reliability Champion", $100 bonus
   ✅ Zero no-shows, excellent timing, families love him

🥉 3rd Place — Nyoman (4.82 ⭐, 24 tours, +2 reviews)
   → Awarded: "Emerging Star", recognition
   ✅ Improving trend, strong with Italian guests

---

4th — Aldo (4.79 ⭐, 22 tours, -1 review)
   ⚠️ Slight downward trend, 1 negative review re: communication

5th — Timpleng (4.76 ⭐, 25 tours, +1 review)
   → Watch: Needs consistency improvement

6th — Sandy (4.71 ⭐, 20 tours, -2 reviews)
   🔴 Red flag: 2 negative reviews this month
   → Action: Coaching session recommended

[VIEW FULL REPORT] [EXPORT PDF] [SEND TO TEAM]
```

#### 6.2.3 Trend analysis
```
Per guide, dashboard shows:
- Monthly evolution (sparkline graph):
  4.85 | ↗ | 4.82 | ↗ | 4.88 ← March
  
- Guest feedback themes (auto-parsed from reviews):
  ✅ Positive: "friendly" (12×), "knowledgeable" (8×), "safe" (7×)
  ❌ Negative: "late" (2×), "didn't explain well" (1×)
  
- Tour type performance:
  Shared tours: 4.86 (16/16 tours) — strength
  Private tours: 4.79 (8/12 tours) — needs work
  Party boats: 4.84 (4/4 tours) — small sample, good
```

#### 6.2.4 Filtering & export
```
Dashboard features:
- Filter by: month, year, guide tier, tour type, language
- Sort by: rating, reviews, tours_completed, earnings, guest_satisfaction
- View: table, cards, charts
- Export: CSV (for payroll), PDF (for team distribution)
- Schedule: auto-generate & publish every 1st day of month
```

### 6.3 Data Model

Existing tables + aggregations:
```sql
-- Aggregation table (updated daily/monthly):
CREATE TABLE guide_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id),
  metric_month DATE NOT NULL, -- 2026-04-01 (first day of month)
  
  -- Reviews aggregation
  total_reviews INT DEFAULT 0,
  average_rating DECIMAL(3, 2),
  google_rating DECIMAL(3, 2),
  google_review_count INT,
  tripadvisor_rating DECIMAL(3, 2),
  tripadvisor_review_count INT,
  klook_rating DECIMAL(3, 2),
  klook_review_count INT,
  internal_rating DECIMAL(3, 2),
  
  -- Tours
  tours_completed INT DEFAULT 0,
  tours_cancelled INT DEFAULT 0,
  no_shows INT DEFAULT 0,
  on_time_performance DECIMAL(5, 2), -- percentage
  average_tour_rating DECIMAL(3, 2),
  guest_satisfaction DECIMAL(5, 2), -- percentage
  
  -- Revenue
  gross_tour_revenue DECIMAL(10, 2),
  guide_payout DECIMAL(10, 2),
  bonus DECIMAL(10, 2),
  total_earnings DECIMAL(10, 2),
  
  -- Safety
  medical_incidents INT DEFAULT 0,
  equipment_damage_incidents INT DEFAULT 0,
  safety_violations INT DEFAULT 0,
  guest_complaints INT DEFAULT 0,
  complaints_resolved INT DEFAULT 0,
  
  -- Ranking
  ranking_position INT,
  ranking_tier VARCHAR(50), -- "top_performer", "solid", "needs_improvement", "at_risk"
  award_name VARCHAR(255), -- "March Hero", "Reliability Champion", etc.
  
  -- Trends
  vs_previous_month_rating_change DECIMAL(3, 2),
  vs_previous_month_reviews_change INT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(guide_id, metric_month),
  INDEX idx_guide_id (guide_id),
  INDEX idx_metric_month (metric_month),
  INDEX idx_ranking_position (ranking_position)
);

-- Review aggregation:
CREATE TABLE guide_review_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id),
  metric_month DATE NOT NULL,
  
  positive_tags TEXT[], -- ["friendly", "knowledgeable", "safe"]
  negative_tags TEXT[], -- ["late", "didn't explain"]
  tag_counts JSONB, -- {"friendly": 12, "knowledgeable": 8}
  
  INDEX idx_guide_metric (guide_id, metric_month)
);

-- Tour type performance:
CREATE TABLE guide_tour_type_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id),
  metric_month DATE NOT NULL,
  tour_type VARCHAR(50), -- "shared", "private", "party"
  
  tours_completed INT,
  average_rating DECIMAL(3, 2),
  guest_satisfaction DECIMAL(5, 2),
  
  INDEX idx_guide_type_month (guide_id, tour_type, metric_month)
);
```

### 6.4 API Endpoints

```
GET /api/guide-performance/monthly?month=2026-04&sort_by=rating
  Output: [
    {
      guide_id, guide_name, tier,
      total_reviews, average_rating,
      tours_completed, guest_satisfaction,
      gross_revenue, guide_payout,
      ranking_position, award,
      vs_previous_month_change
    },
    ...
  ]

GET /api/guide-performance/{guide_id}/detail?month=2026-04
  Output: {
    full metrics (as in 6.2.1),
    trend_sparkline,
    positive_feedback: [tags with counts],
    negative_feedback: [tags with counts],
    tour_type_breakdown
  }

GET /api/guide-performance/ranking?month=2026-04
  Output: {
    top_3: [{rank, guide, rating, award}],
    watch_list: [guides with downward trend],
    emerging_stars: [guides with improvement]
  }

POST /api/guide-performance/aggregate
  Cron task: Monthly (1st of month at 08:00 GMT+8)
  - Aggregate all metrics from previous month
  - Publish to dashboard
  - Send notification to Gee

POST /api/guide-performance/{month}/export
  Input: { format: "csv" | "pdf" }
  Output: file download
```

### 6.5 Scheduling & Automation

**Daily Review Fetch Job** — 22:00 GMT+8:
```
FOR EACH [Google, TripAdvisor, Klook] OTA:
  - Fetch new reviews mentioning guide names
  - Parse rating, text, date
  - Store in guide_reviews table
  - Tag sentiment: positive / neutral / negative
  - Extract feedback themes (via NLP or keyword matching)
```

**Monthly Aggregation Job** — 1st of month at 08:00 GMT+8:
```
FOR EACH active guide:
  - Sum tours_completed from previous month
  - Calculate average_rating from all reviews
  - Sum gross_revenue from all tours
  - Calculate payouts & bonuses
  - Rank guides
  - Determine awards (Hero, Champion, etc.)
  - Generate report
  - Create Kommo activities for each guide (recognition)
  - Send notification to Gee: "Performance report ready"
```

---

## 7. Complaint/Incident Log

### 7.1 Назначение
Централизованная система логирования жалоб от гостей и инцидентов (медицинских, безопасности, оборудования). Помогает выявить паттерны и проактивно улучшить процессы.

**Текущая проблема:**
- Жалобы приходят через разные каналы (OTA, WhatsApp, email)
- Нет единого логирования — информация разбросана
- Невозможно найти, был ли раньше похожий инцидент
- Нет анализа, какой гид часто в жалобах

### 7.2 Функциональные требования

#### 7.2.1 Инцидент типы
```
1. Guest Complaint (OTA review или email)
   - Причина: late return, rude guide, poor equipment, bad route decision
   - Severity: 1-5 (1=minor, 5=serious)
   - Resolution: refund, voucher, apology + free tour

2. Medical Incident
   - Type: seasickness, allergy reaction, injury, panic attack, other
   - Severity: low / medium / high
   - First aid applied? Yes / No
   - Evacuation needed? Yes / No → escalate
   - Follow-up required? Yes / No

3. Safety Violation
   - Type: improper life jacket, safety instruction skipped, reckless speeding, other
   - Severity: low / medium / high
   - Reported by: guide, guest, external inspector
   - Corrective action: retraining, equipment replacement, disciplinary note

4. Equipment Damage / Malfunction
   - Item: boat, snorkel gear, life jacket, camera, other
   - Damage type: broken, malfunction, lost, damaged in storage
   - Severity: low (can work), medium (needs repair), high (out of service)
   - Repair status: pending, in repair, repaired, replacement

5. Environmental Issue
   - Type: poor visibility, dangerous weather, pollution, wildlife hazard
   - Severity: low / medium / high
   - Decision: proceed as planned, modify route, cancel tour
   - Notification sent to guests? Yes / No
```

#### 7.2.2 Форма регистрации инцидента
```
New Incident Form (Gee, MOD, or Dima):

1. Incident Type: [dropdown]
2. Severity: [1-5 scale or low/medium/high]
3. Tour Info:
   - Tour ID (auto-linked)
   - Guide(s) involved
   - Date & time
4. Description: [text area]
   - What happened?
   - Who was affected?
   - Immediate action taken?

5. If Medical/Safety:
   - Guest name & contact
   - Detailed symptoms / injuries
   - First aid administered? Yes / No
   - Professional help called? Yes / No (ambulance, doctor)
   - Hospital admission? Yes / No

6. If Equipment:
   - Item name
   - Damage description
   - Repairable? Yes / No / Replace
   - Estimated cost: $

7. Resolution & Follow-up:
   - Immediate action: [text]
   - Compensation offered: [none / refund / voucher / free tour]
   - Follow-up required: Yes / No
   - Assigned to: [user]

8. Pattern tracking:
   - Similar incidents before? [link to previous if yes]
   - Is this part of a pattern? [auto-suggest based on data]

[SUBMIT] → creates incident record + alerts
```

#### 7.2.3 Pattern detection & alerts
```
System automatically flags:
- Same guide mentioned in 3+ complaints within 3 months → alert to Gee + coaching flag
- Same complaint type (e.g., "late return") from 5+ different guides → process issue (route planning?)
- Increasing trend (more incidents this month vs average) → escalate
- Severity escalation (minor complaints becoming serious) → investigate

Weekly alert to Gee:
  "🚨 Incident Patterns Detected:
   - Afternoon routes running late (5 incidents in past 2 weeks)
   - Possible cause: lunch extensions? Recommend time review.
   - Action: Review route timings with guides."
```

#### 7.2.4 Resolution tracking
```
Each incident gets:
- Resolution status: open, in_progress, resolved, closed
- Resolution date & notes
- Follow-up check: scheduled 1 week after "resolved"
- Guest satisfaction with resolution: survey link

If not resolved within SLA (e.g., 72 hours):
  - Escalate alert: "Incident #123 overdue for resolution"
  - Reassign if stuck
```

### 7.3 Data Model

#### Таблица: `incidents`
```sql
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
  guide_id_primary UUID REFERENCES guides(id),
  guide_id_secondary UUID REFERENCES guides(id),
  
  -- Classification
  incident_type VARCHAR(100) NOT NULL, -- complaint, medical, safety, equipment, environmental
  severity INT CHECK (severity >= 1 AND severity <= 5), -- or ENUM
  
  -- Description
  description TEXT NOT NULL,
  time_occurred TIMESTAMP NOT NULL,
  
  -- Involved parties
  guest_name VARCHAR(255),
  guest_phone VARCHAR(20),
  guest_email VARCHAR(255),
  guest_nationality VARCHAR(50),
  
  -- Medical-specific
  medical_type VARCHAR(100), -- seasickness, injury, allergy, etc.
  medical_first_aid_applied BOOLEAN,
  medical_professional_called BOOLEAN,
  medical_hospitalization BOOLEAN,
  medical_details TEXT,
  
  -- Safety-specific
  safety_reported_by VARCHAR(100), -- guide, guest, inspector
  safety_corrective_action TEXT,
  
  -- Equipment-specific
  equipment_item VARCHAR(255),
  equipment_damage_type VARCHAR(100),
  equipment_repairable BOOLEAN,
  equipment_repair_cost DECIMAL(10, 2),
  equipment_repair_status VARCHAR(50), -- pending, in_repair, repaired, replaced
  
  -- Environmental-specific
  environmental_condition TEXT,
  environmental_decision VARCHAR(100), -- proceed, modify_route, cancel
  guest_notification_sent BOOLEAN,
  
  -- Resolution
  resolution_status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  resolution_date TIMESTAMP,
  resolution_text TEXT,
  compensation_type VARCHAR(50), -- none, refund, voucher, free_tour
  compensation_amount DECIMAL(10, 2),
  
  -- Follow-up
  followup_required BOOLEAN DEFAULT FALSE,
  followup_date TIMESTAMP,
  followup_notes TEXT,
  
  -- Metadata
  reported_by_user_id UUID NOT NULL REFERENCES users(id),
  assigned_to_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_tour_id (tour_id),
  INDEX idx_guide_id_primary (guide_id_primary),
  INDEX idx_severity (severity),
  INDEX idx_resolution_status (resolution_status),
  INDEX idx_time_occurred (time_occurred),
  INDEX idx_incident_type (incident_type)
);
```

#### Таблица: `incident_patterns`
```sql
CREATE TABLE incident_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pattern definition
  pattern_name VARCHAR(255), -- "Late Returns", "Seasick Guests", etc.
  pattern_type VARCHAR(100), -- complaint, medical, safety, equipment, environmental
  
  -- Criteria
  filter_criteria JSONB, -- { "incident_type": "complaint", "reason": "late*" }
  time_window_days INT, -- look back how many days
  threshold_count INT, -- how many incidents = pattern
  
  -- Current status
  detected_date TIMESTAMP,
  incident_count INT,
  severity_average DECIMAL(3, 1),
  affected_guides UUID[], -- which guides involved
  
  -- Alert
  alert_triggered BOOLEAN DEFAULT FALSE,
  alert_date TIMESTAMP,
  alert_sent_to_user_id UUID REFERENCES users(id),
  
  -- Resolution
  root_cause_hypothesis TEXT,
  corrective_action TEXT,
  resolved_date TIMESTAMP,
  
  INDEX idx_pattern_name (pattern_name),
  INDEX idx_detected_date (detected_date),
  INDEX idx_resolved_date (resolved_date)
);
```

#### Таблица: `incident_attachments`
```sql
CREATE TABLE incident_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  
  attachment_type VARCHAR(50), -- photo, document, audio, video
  file_path VARCHAR(500),
  s3_url VARCHAR(500),
  
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_incident_id (incident_id)
);
```

### 7.4 API Endpoints

```
POST /api/incidents
  Input: {
    tour_id, guide_ids, incident_type, severity,
    description, guest_info, [medical/safety/equipment details]
  }
  Output: { incident_id, pattern_detected: boolean, auto_alert_sent: boolean }

GET /api/incidents?filter=open&severity>=3&limit=50
  Output: [{ incident_id, tour_id, guide, type, severity, reported_date, status }]

GET /api/incidents/{incident_id}/detail
  Output: { full incident details, attachments, related_patterns, suggested_actions }

PUT /api/incidents/{incident_id}/resolve
  Input: { resolution_text, compensation_type, followup_required, followup_date }
  Output: { incident_id, status: 'resolved', notification_sent }

GET /api/incident-patterns?timeframe=last_30_days
  Output: [
    { pattern_name, incident_count, severity_avg, affected_guides, root_cause, alert_status },
    ...
  ]

GET /api/incidents/guide-analysis/{guide_id}?month=2026-04
  Output: { total_incidents, by_type, severity_distribution, resolution_rate }

POST /api/incidents/pattern-analysis
  Cron task: Daily at 10:00 GMT+8
  - Scan incidents from past X days
  - Detect patterns
  - Create pattern records
  - Alert if threshold exceeded
```

### 7.5 Scheduling & Automation

**Daily Pattern Detection Job** — 10:00 GMT+8:
```
FOR EACH defined pattern rule:
  SELECT incidents WHERE
    created_at > NOW() - time_window_days
    AND matches filter_criteria
  
  IF count >= threshold_count:
    - Create/update pattern record
    - If not alerted yet:
      - Send alert to Gee with root cause hypothesis
      - Suggest corrective action
      - Create task: "Review {pattern_name}"
```

**Weekly Incident Summary** — Every Monday 09:00 GMT+8:
```
Email to Gee:
  "📊 Incident Summary — Week of {date}
   
   Total incidents: 8 (↑ vs 5 last week)
   By type: Complaints 4, Medical 2, Equipment 2
   Severity: 2×high, 3×medium, 3×low
   
   Top patterns:
   - Late returns (3 incidents) → investigate route timing
   - Seasickness (2 incidents) → seas forecast issue?
   
   Open issues: 3 (1 overdue)
   → [VIEW DASHBOARD]"
```

---

## BONUS: Upselling Tracking per Guide

### Назначение
Отслеживание, какой гид предложил upsell (дополнительные услуги: фотография, DJ, специальные напитки, уроки дайвинга и т.д.) и успешно ли это был продан.

### Requirements

#### Таблица: `upsell_offers`
```sql
CREATE TABLE upsell_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id),
  
  guide_id UUID NOT NULL REFERENCES guides(id),
  
  -- Upsell type
  upsell_type VARCHAR(100), -- "photographer", "dj", "drinks_package", "dive_lesson", "sunset_tour"
  upsell_price DECIMAL(10, 2),
  
  -- Status
  offered_at TIMESTAMP,
  accepted BOOLEAN,
  accepted_at TIMESTAMP,
  
  -- Commission
  guide_commission_percentage INT,
  guide_commission_amount DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_guide_id (guide_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_accepted (accepted),
  INDEX idx_offered_at (offered_at)
);
```

#### API:
```
POST /api/tours/{tour_id}/upsell/offer
  Input: { guide_id, upsell_type, price }
  Output: { offer_id }

POST /api/tours/{tour_id}/upsell/accept
  Input: { offer_id }
  Output: { status: 'accepted', guide_commission }

GET /api/guide-performance/{guide_id}/upselling?month=2026-04
  Output: {
    total_offers: 15,
    accepted: 8 (53% conversion),
    total_commission: $240,
    top_upsell_type: "photographer" (6/8 accepted)
  }
```

---

## Summary Table

| Модуль | Таблицы | Notifications | Automation | API endpoints |
|--------|---------|---|---|---|
| 1. GoPro | gopro_footage, gopro_notifications, guest_video_access | WhatsApp (6PM, 9PM) | Upload reminder, expiry | 5 |
| 2. Daily Report | daily_reports, route_points, report_reminders | WhatsApp (7PM) | Escalation x3 | 6 |
| 3. Booking Calendar | calendar_metadata (extends tours) | — | Weather sync, OTA sync | 7 |
| 4. Midday Check-in | daily_checkins, guest_medical_flags | WhatsApp (11:30 AM) | Escalation if severe | 5 |
| 5. Afternoon Weather | weather_updates, weather_api_cache | WhatsApp (3 PM) | Weather fetch, GoPro prompt | 4 |
| 6. Guide Performance | guide_performance_metrics, guide_review_feedback, guide_tour_type_performance | Email (monthly) | Daily review fetch, monthly aggregation | 4 |
| 7. Complaint Log | incidents, incident_patterns, incident_attachments | Email (weekly) | Daily pattern detection | 6 |
| BONUS: Upselling | upsell_offers | — | — | 3 |
| **TOTAL** | **20+ tables** | **Multiple channels** | **10+ cron jobs** | **40+ endpoints** |

---

## Integration Points with Existing System

### Kommo CRM
- Post GoPro link as activity → guide performance tracking
- Create incident as deal note → incident tracking
- Update guide rating → performance metrics
- Send WhatsApp notifications → via Kommo API

### Odoo (if accounting system)
- Monthly guide payouts from performance metrics
- Invoice restaurant meals from daily_reports
- Track equipment costs from incidents

### WhatsApp Bot (Twilio / Kommo)
- Send all notifications (reminders, alerts)
- Deep links to forms (trip report, checkin, weather)
- Reply handling for quick acknowledgments

### Google Drive API
- Auto-create GoPro folders
- Check file status for footage tracking
- Send shared links to guests

### Weather API (weatherapi.com or openmeteo)
- Fetch swell, wind, visibility
- Cache for month views
- Recommend route changes

### Google/TripAdvisor/Klook APIs
- Daily review fetch for performance metrics
- Guide mention parsing (NLP)
- Rating aggregation

### OTA Management (Viator, Klook, Airbnb)
- Sync calendar with OTA availability
- Prevent double-booking
- Update cancellations

---

**Документация завершена: 12.04.2026**
