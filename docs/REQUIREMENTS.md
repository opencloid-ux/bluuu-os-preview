# Bluuu OS - Гибран Module Requirements

## Overview

Интеграция системы управления гидом (snorkeling/diving guide management system) с мониторингом контента, производительности и инцидентов. Система построена на 7 основных модулях + бонус upselling tracking.

---

## Module 1: GoPro & Review Link Tracking

### Functional Requirements

**FR1.1** Отправка напоминаний гидам о загрузке контента:
- Первое напоминание: 18:00 (6 PM) - "Пора загружать GoPro"
- Второе напоминание: 21:00 (9 PM) - "Спешка, загрузи контент!"
- Frequency: ежедневно после рабочих часов (если были туры)

**FR1.2** Tracking статуса загрузки:
- Отслеживание временной метки первой загрузки контента
- Статус: pending, submitted, delayed (>9PM), escalated

**FR1.3** Follow-up escalation:
- Если контент не загружен к 21:00 → флаг escalation
- Возможность manual escalation по решению supervisor'а
- Уведомление supervisor'а о задержке

**FR1.4** Review link management:
- Хранение ссылок на пост/видео (YouTube, Instagram, TikTok, etc.)
- Метаданные: платформа, дата публикации, views/likes, URL

### Data Model

**Tables needed:**

```
guides (existing, extend)
├── id (PK)
├── name
├── phone
├── email
├── timezone (for correct reminder scheduling)
└── ...

gopro_uploads
├── id (PK)
├── guide_id (FK → guides)
├── tour_date (DATE, день тура)
├── first_reminder_sent_at (TIMESTAMP)
├── second_reminder_sent_at (TIMESTAMP)
├── content_submitted_at (TIMESTAMP) [nullable]
├── status (ENUM: pending, submitted, delayed, escalated)
├── is_escalated (BOOLEAN)
├── escalation_timestamp (TIMESTAMP) [nullable]
├── notes (TEXT) [supervisor notes]
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

review_links
├── id (PK)
├── gopro_upload_id (FK → gopro_uploads)
├── guide_id (FK → guides)
├── platform (ENUM: youtube, instagram, tiktok, facebook, other)
├── url (VARCHAR, unique)
├── published_at (TIMESTAMP)
├── views_count (INT)
├── likes_count (INT)
├── last_synced_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### API Endpoints

```
POST   /api/gopro-uploads              - Create new upload tracking
GET    /api/gopro-uploads              - List uploads (filter: guide, date, status)
GET    /api/gopro-uploads/:id          - Get upload details
PATCH  /api/gopro-uploads/:id          - Update status, escalate
DELETE /api/gopro-uploads/:id          - Archive

POST   /api/review-links               - Add review link
GET    /api/review-links               - List links (filter: guide, platform)
DELETE /api/review-links/:id           - Remove link
PATCH  /api/review-links/:id/sync      - Manual sync of metrics (views/likes)
```

### Scheduler / Message Queue

- **6 PM reminder job:** Query `gopro_uploads` WHERE `tour_date = TODAY` AND `first_reminder_sent_at IS NULL` → send SMS/push + mark `first_reminder_sent_at`
- **9 PM reminder job:** Query WHERE `content_submitted_at IS NULL` AND `second_reminder_sent_at IS NULL` → send escalation notice + mark `second_reminder_sent_at`
- **Auto-escalation job:** Query WHERE `content_submitted_at IS NULL` AND `second_reminder_sent_at < NOW() - 1 HOUR` → set `is_escalated = true`, notify supervisor

### UI/UX Flow

- **Admin dashboard:** Grid view of all guides' upload status for today/this week
  - Columns: Guide name, Tour date, Submission time, Status (badge), Review links (count), Actions (view, escalate, notes)
  - Color-coding: green (submitted), yellow (pending, <9PM), red (escalated/delayed)
  
- **Guide mobile app:** Simple "Upload" button → redirect to GoPro cloud / local storage
  - Toast: "First reminder: time to upload"
  - Toast: "Final reminder: upload now!"
  
- **Escalation modal:** Supervisor view when escalation triggered
  - Guide info, tour details, submission deadline, ability to add note, manual notify button

---

## Module 2: Daily Report Reminder

### Functional Requirements

**FR2.1** Ежедневное напоминание в 19:00 (7 PM):
- Отправка гидам уведомления о необходимости заполнить daily report
- Отслеживание, заполнен ли report до deadline (обычно 20:30)

**FR2.2** Report submission tracking:
- Статус: pending, submitted, overdue
- Хранение timestamp submission

**FR2.3** Report aggregation:
- View всех reports за день для supervisor
- Поиск/фильтр по гиду, дате

### Data Model

```
daily_reports
├── id (PK)
├── guide_id (FK → guides)
├── report_date (DATE)
├── reminder_sent_at (TIMESTAMP) [19:00]
├── submitted_at (TIMESTAMP) [nullable]
├── status (ENUM: pending, submitted, overdue)
├── content (JSON or TEXT) - report body
│   ├── tour_count (INT)
│   ├── summary (VARCHAR)
│   ├── issues (ARRAY[TEXT])
│   └── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### API Endpoints

```
POST   /api/daily-reports              - Submit report
GET    /api/daily-reports              - List reports (filter: guide, date)
GET    /api/daily-reports/:id          - Get report details
GET    /api/daily-reports/summary      - Aggregated view (supervisor)
```

### Scheduler

- **7 PM job:** Query `guides` + cross-check if `daily_reports` exists for TODAY
  - If not found → create record with `status = pending`, send reminder
  - If exists and `submitted_at IS NULL` → send reminder
- **Overdue job (20:45):** Query WHERE `submitted_at IS NULL` → set `status = overdue`, mark red

---

## Module 3: Booking Data Calendar

### Functional Requirements

**FR3.1** Month-long visibility:
- Отображение всех бронирований на календаре (месячный вид)
- Информация: guide, guest count, tour type, start time, duration

**FR3.2** No refresh after 6 PM:
- Calendar состояние "locked" после 18:00
- Предыдущий день или ранее → read-only
- Сегодня до 18:00 → editable/readable
- Tomorrow+ → editable

**FR3.3** Booking details:
- Быстрый доступ к деталям тура (гость info, location, special requests)

### Data Model

```
bookings (existing, extend if needed)
├── id (PK)
├── guide_id (FK → guides)
├── guest_id (FK → guests)
├── tour_type (ENUM: snorkeling, diving, custom, etc.)
├── scheduled_date (DATE)
├── start_time (TIME)
├── duration_minutes (INT)
├── guest_count (INT)
├── location (VARCHAR)
├── special_requests (TEXT)
├── status (ENUM: confirmed, cancelled, completed)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── locked_at (TIMESTAMP) [auto-set to 18:00 of scheduled_date]

booking_calendar_locks (helper table for efficient querying)
├── id (PK)
├── booking_date (DATE)
├── locked_at (TIMESTAMP) [= DATE 18:00]
├── is_locked (BOOLEAN)
└── created_at (TIMESTAMP)
```

### API Endpoints

```
GET    /api/bookings/calendar          - Get month view (date range query)
GET    /api/bookings/:id               - Get booking details
PATCH  /api/bookings/:id               - Update booking (if unlock_time allows)
GET    /api/bookings/lock-status       - Check if date is locked (before render)
```

### Lock Logic

```sql
-- Is a date locked?
SELECT is_locked FROM booking_calendar_locks 
WHERE booking_date = DATE(NOW())
AND locked_at <= NOW()

-- Or computed: IF TIME(NOW()) >= '18:00' AND DATE(booking_date) <= DATE(NOW()) THEN locked
```

### UI/UX Flow

- **Calendar grid:** 7 rows × 7 columns, each cell = 1 day
  - Cell color: gray (past), blue (today, editable until 18:00), white (future)
  - Each booking = mini card inside cell (guide name, guest count, time, status)
  - Click → modal with full details + edit button (disabled if locked)
  
- **Lock indicator:** Badge "Calendar locked at 6 PM" when approaching deadline
  - Countdown timer visible from 17:30-18:00

---

## Module 4: Midday Check-in (11:30 AM)

### Functional Requirements

**FR4.1** Automated reminder at 11:30 AM:
- Push/SMS notification for guides с active tours today
- Prompt: "How are conditions? Update status now."

**FR4.2** Conditions update form:
- **Snorkeling visibility** (m): 0–100+
- **Current** (strength): calm, slight, moderate, strong
- **Water temperature** (°C): numeric
- **Issues reported** (bool + text): yes → describe

**FR4.3** Historical tracking:
- Сохранение всех updates за day
- Correlation с later incidents/complaints

### Data Model

```
conditions_updates
├── id (PK)
├── guide_id (FK → guides)
├── check_in_date (DATE)
├── check_in_time (TIME) [ideally ~11:30]
├── visibility_meters (INT)
├── water_current (ENUM: calm, slight, moderate, strong)
├── water_temperature_celsius (DECIMAL(4,1))
├── issues_reported (BOOLEAN)
├── issue_description (TEXT) [nullable]
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

INDEX: (guide_id, check_in_date)
```

### API Endpoints

```
POST   /api/conditions-updates         - Submit midday check-in
GET    /api/conditions-updates         - List updates (filter: guide, date range)
GET    /api/conditions-updates/latest  - Last update for each active guide
PATCH  /api/conditions-updates/:id     - Correct/update entry
```

### Scheduler

- **11:30 AM job:** Query guides with bookings on TODAY
  - Send SMS/push with check-in form link
  - Set reminder flag, expect response within 30 min

### UI/UX Flow

- **Guide receives SMS:** "11:30 check-in: tap link to update conditions"
- **Mobile form:** Simple, fast (<20 sec to submit)
  - Visibility: slider or numeric input (preset: 5m, 10m, 15m, 20m, 30m, 50m+)
  - Current: 4-button choice
  - Temp: numeric input (preset: 26°C, 28°C, 29°C, 30°C)
  - Issues: toggle + text area if yes
  - Submit button
  
- **Supervisor view:** Real-time table of conditions from all guides
  - Green checkmark: all reported
  - Yellow: pending (>11:45)
  - Red: not reported by noon

---

## Module 5: Afternoon Weather Update (3 PM)

### Functional Requirements

**FR5.1** Automated reminder at 3 PM (15:00):
- Push notification for guides: "Please provide video of sea conditions"

**FR5.2** Video submission:
- Guides submit video clip (30–60 sec) via app
- Metadata: guide, timestamp, location (gps optional)

**FR5.3** Video archive & playback:
- Accessible by supervisor + marketing team
- Searchable by date, guide, weather conditions

### Data Model

```
weather_videos
├── id (PK)
├── guide_id (FK → guides)
├── video_date (DATE)
├── submitted_at (TIMESTAMP)
├── file_url (VARCHAR, S3 or CDN path)
├── file_size_bytes (INT)
├── duration_seconds (INT)
├── location_gps (POINT or VARCHAR) [nullable]
├── notes (TEXT) [e.g., "rough seas, strong current"]
├── status (ENUM: pending, submitted, archived)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

VIDEO_STORAGE: S3 bucket "bluuu-weather-videos" / similar
  ├── /2026/04/guide-{guide_id}-{date}.mp4
  ├── thumbnails/
  └── ...
```

### API Endpoints

```
POST   /api/weather-videos             - Submit video (multipart form-data)
GET    /api/weather-videos             - List videos (filter: guide, date, status)
GET    /api/weather-videos/:id         - Get video metadata + presigned URL
DELETE /api/weather-videos/:id         - Archive video
```

### Scheduler

- **3 PM job:** Query guides with bookings today → send reminder + video upload link
- **Auto-retention:** Videos older than 6 months → archive to cold storage

### UI/UX Flow

- **Guide receives notification:** "3 PM weather check: record a quick 30-60 sec video of the sea"
- **Mobile upload:** In-app camera or video picker
  - Pre-check: file size < 50 MB, duration 15–120 sec
  - Upload progress bar
  - Success toast: "Video submitted!"
  
- **Supervisor dashboard:** Gallery view
  - Thumbnails + date, guide name, video link
  - Search by date range, guide
  - One-click view (embedded player)

---

## Module 6: Guide Performance Dashboard

### Functional Requirements

**FR6.1** KPI tracking (monthly):
- **Tours completed:** count per guide
- **Guest satisfaction:** avg rating (1–5 stars)
- **Upsell rate:** % of tours with upsells completed
- **Content submission rate:** % of tours with GoPro submitted on time
- **Condition check-in rate:** % of days with midday report submitted
- **Availability:** days worked / days scheduled

**FR6.2** Ranking:
- Leaderboard: top performers (by revenue, tours, satisfaction)
- Peer comparison (privacy: show only team aggregates)

**FR6.3** Historical comparison:
- Month-over-month trends
- YTD performance

### Data Model

```
guide_kpis (materialized view or summary table, refreshed daily/weekly)
├── id (PK)
├── guide_id (FK → guides)
├── period_year (INT)
├── period_month (INT)
├── tours_completed (INT)
├── guest_satisfaction_avg (DECIMAL(3,2)) [1.0–5.0]
├── upsell_rate_percent (DECIMAL(5,2))
├── content_submission_rate_percent (DECIMAL(5,2))
├── condition_checkin_rate_percent (DECIMAL(5,2))
├── availability_percent (DECIMAL(5,2))
├── revenue_total (DECIMAL(10,2))
├── revenue_upsells (DECIMAL(10,2))
├── ranking_position (INT) [1, 2, 3, ...]
├── calculated_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

guest_ratings
├── id (PK)
├── booking_id (FK → bookings)
├── guide_id (FK → guides)
├── rating (INT, 1–5)
├── comment (TEXT)
├── submitted_at (TIMESTAMP)
└── created_at (TIMESTAMP)

-- Upsells tracked separately (see Module 7 Bonus)
```

### Calculation Logic (pseudo-code)

```
FOR each guide, FOR each month:
  tours_completed = COUNT(bookings.id WHERE status = 'completed' AND MONTH = month)
  satisfaction_avg = AVG(guest_ratings.rating) [filter by tours in month]
  
  upsell_rate = COUNT(tours_with_upsells) / tours_completed * 100
  content_rate = COUNT(gopro_uploads.status = 'submitted' on time) / tours_completed * 100
  checkin_rate = COUNT(conditions_updates WHERE check_in_date IN month) / days_in_month * 100
  
  availability = days_assigned / days_in_month * 100
  
  revenue = SUM(bookings.price) + SUM(upsells.amount)
  
  ranking_position = ROW_NUMBER() OVER (ORDER BY revenue DESC) FOR month
```

### API Endpoints

```
GET    /api/guide-kpis                 - List KPIs (filter: guide, period)
GET    /api/guide-kpis/:guide_id       - Single guide detail
GET    /api/guide-kpis/leaderboard     - Top 10 (by revenue, satisfaction, etc.)
GET    /api/guide-kpis/comparison      - Month-over-month trends
GET    /api/guest-ratings              - List ratings (filter: guide, date)
POST   /api/guest-ratings              - Submit post-tour rating
```

### Scheduler

- **Daily (23:59):** Refresh `guide_kpis` summary for yesterday's completed tours
- **Monthly (1st, 00:00):** Full recalculation for prior month

### UI/UX Flow

- **Guide view:** Personal scorecard
  - Big numbers: tours, satisfaction, upsell %, content rate
  - Mini chart: last 3 months trend (line graph)
  - "You ranked #3 this month" badge
  
- **Supervisor/admin view:** Full dashboard
  - Top table: ranking leaderboard (sortable by any KPI)
  - Charts: team aggregates (trends, comparisons)
  - Drill-down: click guide → month detail

---

## Module 7: Complaint/Incident Log

### Functional Requirements

**FR7.1** Logging & categorization:
- Incident type (complaint, safety issue, equipment failure, guest conflict, etc.)
- Severity (low, medium, high, critical)
- Reporter (guest, guide, supervisor)
- Description + photos/attachments

**FR7.2** Pattern tracking:
- Cross-reference with:
  - Season (month)
  - Guest (repeat issues?)
  - Weather conditions (visibility, current, etc.)
  - Crowd level (busy day?)
  - Guide
- Analytics: identify trends (e.g., "rough current → more complaints in May")

**FR7.3** Resolution workflow:
- Status: reported, under_investigation, resolved, closed
- Timeline: reported_at → investigated_at → resolved_at
- Owner assignment

### Data Model

```
incidents
├── id (PK)
├── guide_id (FK → guides) [nullable, if reported by guest]
├── booking_id (FK → bookings) [nullable, link to tour]
├── reported_by (ENUM: guest, guide, supervisor, system)
├── incident_type (ENUM: complaint, safety_issue, equipment_fail, guest_conflict, 
│                         environmental, other)
├── severity (ENUM: low, medium, high, critical)
├── title (VARCHAR)
├── description (TEXT)
├── status (ENUM: reported, investigating, resolved, closed)
├── reported_at (TIMESTAMP)
├── investigated_at (TIMESTAMP) [nullable]
├── resolved_at (TIMESTAMP) [nullable]
├── closed_at (TIMESTAMP) [nullable]
├── owner_id (FK → guides or staff) [who's investigating]
├── resolution_notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

incident_attachments
├── id (PK)
├── incident_id (FK → incidents)
├── file_url (VARCHAR, S3)
├── file_type (VARCHAR, mime type)
├── uploaded_at (TIMESTAMP)
└── created_at (TIMESTAMP)

incident_patterns (materialized view for analytics)
├── id (PK)
├── pattern_type (ENUM: season, guest, weather, crowd, guide, incident_type)
├── pattern_value (VARCHAR, e.g., "May", "guide_42", "strong_current", "high_crowd")
├── incident_count (INT)
├── avg_severity (DECIMAL(2,2))
├── last_occurrence (DATE)
├── trend (ENUM: stable, increasing, decreasing)
├── calculated_at (TIMESTAMP)
```

### API Endpoints

```
POST   /api/incidents                  - Report new incident
GET    /api/incidents                  - List incidents (filter: guide, type, severity, status, date)
GET    /api/incidents/:id              - Get incident details
PATCH  /api/incidents/:id              - Update status, add notes
POST   /api/incidents/:id/attachments  - Upload attachment

GET    /api/incident-patterns          - Get pattern analytics (season, weather, etc.)
GET    /api/incident-patterns/heatmap  - Visual: incidents × season × condition
```

### Scheduler

- **Weekly (Sunday, 18:00):** Recalculate `incident_patterns` view
- **Escalation:** If `severity = critical` → auto-notify supervisor immediately

### UI/UX Flow

- **Incident form (guest/guide):**
  - Type dropdown (complaint, safety, equipment, conflict, other)
  - Severity selector (low → green, high → red)
  - Free-text description
  - Photo upload (optional)
  - Auto-link to tour if submitting post-tour
  
- **Supervisor dashboard:**
  - List view: incident cards, sorted by date/severity
  - Status badges: reported (blue), investigating (yellow), resolved (green), closed (gray)
  - Click card → full timeline + resolution notes
  
- **Analytics view:**
  - Heatmap: rows = months, cols = weather conditions, cells = incident count + severity avg
  - Trend chart: incidents per month, YTD
  - Top issues: type distribution (pie chart)
  - Guidance: "⚠️ Alert: May + strong current = 40% more complaints → check procedures"

---

## Module 7 Bonus: Upselling Tracking

### Functional Requirements

**FR8.1** Per-guide upsell tracking:
- Upsell items: underwater scooters, cocktails, flamingo floats, etc.
- Track: # of tours where upsell offered, # accepted, revenue per type

**FR8.2** Performance metrics:
- Upsell rate: accepted / offered (%)
- Revenue: total from upsells per guide, per period

### Data Model

```
upsell_items (master catalog)
├── id (PK)
├── name (VARCHAR, e.g., "Underwater Scooter")
├── category (ENUM: equipment, food_drink, accessories, experience, other)
├── base_price (DECIMAL(10,2))
├── active (BOOLEAN)
└── created_at (TIMESTAMP)

upsell_offers (tracking individual offers)
├── id (PK)
├── booking_id (FK → bookings)
├── guide_id (FK → guides)
├── upsell_item_id (FK → upsell_items)
├── offered_at (TIMESTAMP)
├── was_accepted (BOOLEAN) [nullable initially, set on acceptance]
├── price_charged (DECIMAL(10,2)) [if accepted]
├── accepted_at (TIMESTAMP) [nullable]
├── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### API Endpoints

```
POST   /api/upsell-offers              - Record upsell offer (during/post tour)
PATCH  /api/upsell-offers/:id          - Mark as accepted + charge
GET    /api/upsell-offers              - List offers (filter: guide, item, period)

GET    /api/upsell-analytics           - Summary KPIs (rates, revenue by type)
GET    /api/upsell-items               - List available upsells (for tour planning)
```

### UI/UX Flow

- **Guide during tour:** Mobile app widget
  - Show available upsells (quick-tap buttons)
  - "Offer scooter to guest?" → tap → record offer + note
  
- **Post-tour settlement:** Simple checkbox list
  - ☐ Scooter ($25, accepted)
  - ☐ Flamingo float ($10, declined)
  - ☐ Cocktail combo ($15, accepted)
  - Tap checkbox to record acceptance/price

---

## Integration Points with Existing Architecture

### Existing Assumptions

1. **Guides table:** Already exists with `id, name, email, phone, timezone`
2. **Bookings table:** Tracks tours (date, time, guide, guests, status)
3. **Authentication:** Role-based (admin, supervisor, guide, guest)
4. **Notification system:** Supports SMS, push, email (Twilio, Firebase Cloud Messaging, etc.)
5. **File storage:** S3 or similar for uploads (GoPro, videos, attachments)

### New Integration Points

| Module | System Integration |
|--------|-------------------|
| **GoPro tracking** | Notification service (SMS 6PM/9PM), file storage (review links), supervisor alerts |
| **Daily reports** | Notification service (7 PM), reporting API |
| **Booking calendar** | Existing bookings table, time-lock logic, read-only gates |
| **Midday check-in** | Notification (11:30), conditions data capture, conditions_updates table |
| **Weather videos** | Notification (3 PM), S3 storage, supervisor gallery view |
| **Performance dashboard** | Guest ratings, KPI aggregation (daily cron), guide ranking |
| **Incident log** | Pattern analytics, escalation (critical incidents), supervisor workflow |
| **Upsell tracking** | Booking data, guide app session, revenue reconciliation |

### Message Queue / Scheduler Architecture

**Jobs needed:**

1. **6 PM reminder** (gopro-upload-1st-reminder)
2. **9 PM reminder** (gopro-upload-2nd-reminder)
3. **Auto-escalation** (gopro-escalation)
4. **7 PM report reminder** (daily-report-reminder)
5. **8:45 PM overdue check** (daily-report-overdue)
6. **11:30 AM check-in** (midday-checkin-reminder)
7. **3 PM weather** (weather-video-reminder)
8. **Daily KPI refresh** (guide-kpi-daily)
9. **Monthly KPI recalc** (guide-kpi-monthly)
10. **Weekly pattern recalc** (incident-pattern-weekly)
11. **Critical incident escalation** (incident-escalation)

**Queue technology:** Recommended: Redis (Bull/BullMQ) or RabbitMQ

**Cron/Scheduler:** Node-cron or APScheduler (Python) for time-based jobs

### Webhook Flows

- **GoPro upload detected** → `POST /webhooks/gopro-submitted` → update `gopro_uploads.content_submitted_at`, cancel reminders
- **Video uploaded** → `POST /webhooks/weather-video-uploaded` → update `weather_videos.status`, clear reminder flag
- **Guest rating submitted** → `POST /webhooks/guest-rating` → update `guest_ratings`, trigger KPI refresh for guide
- **Incident created** → `POST /webhooks/incident-reported` → if severity = critical, trigger escalation job immediately
- **Upsell accepted** → `POST /webhooks/upsell-accepted` → update `upsell_offers.was_accepted`, charge, update guide KPI cache

---

## Summary Table: Modules × Key Tables

| Module | Primary Tables | Key Jobs | Critical Fields |
|--------|---|---|---|
| 1. GoPro tracking | `gopro_uploads`, `review_links` | 6 PM, 9 PM, escalation | `status`, `content_submitted_at`, `is_escalated` |
| 2. Daily reports | `daily_reports` | 7 PM, 8:45 PM | `status`, `submitted_at` |
| 3. Booking calendar | `bookings`, `booking_calendar_locks` | Daily lock update | `scheduled_date`, `locked_at`, `is_locked` |
| 4. Midday check-in | `conditions_updates` | 11:30 AM | `visibility_meters`, `water_current`, `water_temperature_celsius` |
| 5. Weather videos | `weather_videos` | 3 PM | `submitted_at`, `file_url`, `status` |
| 6. Performance KPIs | `guide_kpis`, `guest_ratings` | Daily, monthly | `ranking_position`, `tours_completed`, `satisfaction_avg` |
| 7. Incidents | `incidents`, `incident_attachments`, `incident_patterns` | Weekly, critical escalation | `severity`, `status`, `incident_type` |
| Bonus: Upsells | `upsell_items`, `upsell_offers` | None (real-time) | `was_accepted`, `price_charged` |

---

## Next Steps

See `ARCHITECTURE_UPDATE.md` for detailed schema, message queue setup, and deployment topology.
