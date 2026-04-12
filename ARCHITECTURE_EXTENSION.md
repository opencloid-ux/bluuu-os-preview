# ARCHITECTURE_EXTENSION.md — Bluuu OS Gibran's 7 Modules Integration

**Date:** 12 April 2026  
**Version:** 1.0  
**Purpose:** Extending Bluuu OS with guide management modules  
**Audience:** Backend team, DevOps, architects

---

## 1. System Architecture Overview

### Current Bluuu OS Stack (Reference)
```
┌──────────────────────────────────────────────────────────────────┐
│                         BLUUU OS CORE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   BOOKING SYSTEM   │  │   GUIDE MGT     │  │   TOUR OPS   │  │
│  │ (OTA Integration)  │  │  (Profiles,     │  │ (Scheduling) │  │
│  │                    │  │   Availability) │  │              │  │
│  └────────────────────┘  └─────────────────┘  └──────────────┘  │
│           │                      │                     │           │
│           └──────────────────────┴─────────────────────┘           │
│                                  │                                  │
│                    ┌─────────────▼──────────────┐                 │
│                    │    DATABASE (PostgreSQL)    │                 │
│                    │                             │                 │
│                    │  - tours                    │                 │
│                    │  - guides                   │                 │
│                    │  - bookings                 │                 │
│                    │  - restaurants              │                 │
│                    │  - boats                    │                 │
│                    └─────────────────────────────┘                 │
│                                                                    │
│                    ┌─────────────────────────────┐                │
│                    │   KOMMO CRM API              │                │
│                    │ (Contacts, Deals, Activities)                │
│                    └─────────────────────────────┘                │
│                                                                    │
│                    ┌─────────────────────────────┐                │
│                    │   EXTERNAL INTEGRATIONS      │                │
│                    │ - OTA (Klook, Viator, etc)  │                │
│                    │ - Odoo (Finance/Inventory)  │                │
│                    │ - WhatsApp Bot (Twilio)     │                │
│                    │ - Google Drive (Media)      │                │
│                    │ - Weather API               │                │
│                    └─────────────────────────────┘                │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Extended Architecture with Gibran's Modules

```
┌──────────────────────────────────────────────────────────────────┐
│                    BLUUU OS EXTENDED v2.0                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              GUIDE MANAGEMENT LAYER (NEW)                │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  ┌─────────────────┐  ┌──────────────────┐              │   │
│  │  │  GoPro Tracker  │  │  Daily Reports   │              │   │
│  │  │ (footage, link) │  │  (trip recap)    │              │   │
│  │  └────────┬────────┘  └────────┬─────────┘              │   │
│  │           │                    │                         │   │
│  │  ┌────────▼────────┐  ┌────────▼─────────┐              │   │
│  │  │ Booking Calendar│  │  Midday Checkin  │              │   │
│  │  │ (month overview)│  │ (conditions fix) │              │   │
│  │  └─────────────────┘  └──────────────────┘              │   │
│  │                                                            │   │
│  │  ┌──────────────────┐  ┌──────────────────┐              │   │
│  │  │  Weather Update  │  │   Performance    │              │   │
│  │  │  (3 PM alert)    │  │   Dashboard      │              │   │
│  │  └──────────────────┘  └──────────────────┘              │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────┐               │   │
│  │  │   Complaint/Incident Logging         │               │   │
│  │  │   + Pattern Detection                │               │   │
│  │  └──────────────────────────────────────┘               │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────┐               │   │
│  │  │   Upselling Tracking (BONUS)         │               │   │
│  │  └──────────────────────────────────────┘               │   │
│  │                                                            │   │
│  └──────────┬────────────────────────────────────────────────┘   │
│             │                                                     │
│  ┌──────────▼──────────────────────────────────────────────┐   │
│  │         NOTIFICATION & SCHEDULER ENGINE (NEW)          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  Cron Jobs (10+ schedulers)                         │ │   │
│  │  │  - 06:00 Weather fetch                              │ │   │
│  │  │  - 11:30 Midday checkin reminder                    │ │   │
│  │  │  - 15:00 Afternoon weather + GoPro prompt           │ │   │
│  │  │  - 18:00 GoPro upload reminder (6 PM)               │ │   │
│  │  │  - 19:00 Daily report reminder (7 PM)               │ │   │
│  │  │  - 21:00 Escalation if report not submitted (9 PM)  │ │   │
│  │  │  - 22:00 Review fetch (Google, TripAdvisor, Klook)  │ │   │
│  │  │  - 01:00 Monthly aggregation (if not 1st)           │ │   │
│  │  │  - Daily 10:00 Pattern detection (incidents)        │ │   │
│  │  │  - Monthly 1st 08:00 Performance aggregation        │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  Notification Queue & Delivery (WhatsApp, Email)    │ │   │
│  │  │  - Queue: gopro_notifications, report_reminders, ... │ │   │
│  │  │  - Handlers: Twilio/Kommo API, SMTP, in-app push   │ │   │
│  │  │  - Retry logic: exponential backoff                 │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              DATA ACCESS LAYER (EXTENDED)               │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  PostgreSQL Database (+ 20 new tables):                  │   │
│  │  - gopro_footage, gopro_notifications                   │   │
│  │  - daily_reports, route_points, report_reminders        │   │
│  │  - calendar_metadata                                     │   │
│  │  - daily_checkins, guest_medical_flags                  │   │
│  │  - weather_updates, weather_api_cache                   │   │
│  │  - guide_performance_metrics, guide_review_feedback     │   │
│  │  - incidents, incident_patterns, incident_attachments   │   │
│  │  - upsell_offers                                        │   │
│  │                                                            │   │
│  │  Redis (cache layer):                                    │   │
│  │  - weather_forecast (2h cache)                          │   │
│  │  - guide_availability                                    │   │
│  │  - session cache for dashboards                         │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          EXTERNAL INTEGRATIONS (EXTENDED)               │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  Kommo CRM:                                              │   │
│  │  └─ POST activities (GoPro shared, incident logged)      │   │
│  │  └─ UPDATE guide contact (performance notes)             │   │
│  │                                                            │   │
│  │  WhatsApp API (Twilio):                                  │   │
│  │  └─ Send: reminders, alerts, forms (deep links)         │   │
│  │  └─ Receive: quick replies, form submissions            │   │
│  │                                                            │   │
│  │  Google Drive API:                                       │   │
│  │  └─ Create: GoPro footage folders (auto-named)          │   │
│  │  └─ Check: file status, update shared links             │   │
│  │  └─ Archive: expired video access records               │   │
│  │                                                            │   │
│  │  Weather API (weatherapi.com / openmeteo):              │   │
│  │  └─ GET forecast: swell, wind, visibility              │   │
│  │  └─ Cache: 2-hour TTL                                   │   │
│  │                                                            │   │
│  │  Review APIs (Google Places, TripAdvisor, Klook):       │   │
│  │  └─ GET reviews: parse rating, text, author            │   │
│  │  └─ Extract sentiment & themes (simple keyword match)   │   │
│  │                                                            │   │
│  │  OTA APIs (Klook, Viator, Airbnb):                      │   │
│  │  └─ Sync bookings (already in place)                    │   │
│  │  └─ Update availability based on calendar               │   │
│  │                                                            │   │
│  │  Odoo (if present):                                      │   │
│  │  └─ POST payroll: monthly guide earnings                │   │
│  │  └─ POST inventory: equipment damage/repair costs        │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

                             API LAYER

                    ┌──────────────────────┐
                    │  REST API Endpoints  │
                    │ (40+ new endpoints)  │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Web/Mobile Apps    │
                    │ - Guide App (iOS)    │
                    │ - Gee Dashboard      │
                    │ - MOD Portal         │
                    │ - Dima Incident Log  │
                    └──────────────────────┘
```

---

## 2. Module Message Flow Diagrams

### 2.1 GoPro & Review Link Tracking

```
┌──────────────┐         ┌─────────────────┐         ┌──────────────┐
│   Guide App  │         │  Scheduler (6PM) │        │  WhatsApp API│
│              │         │                 │         │   (Twilio)   │
└──────┬───────┘         └────────┬────────┘         └──────┬───────┘
       │                          │                         │
       │ 1. GoPro footage ready   │                         │
       │ (after tour)             │                         │
       │─────────────────────────>│                         │
       │                          │                         │
       │                          │ 2. At 18:00 GMT+8      │
       │                          │ SELECT footage WHERE    │
       │                          │ filming_status =        │
       │                          │ 'not_shot'/'uploading'  │
       │                          │ FOR TODAY               │
       │                          │                         │
       │                          │ 3. Create reminder      │
       │                          │ notification records    │
       │                          │                         │
       │                          │─────────────────────>  │
       │                          │  Send WhatsApp:        │
       │                          │  "📹 Reminder: GoPro   │
       │                          │   footage upload"      │
       │                          │                         │
       │ 4. Guide uploads video  │                         │
       │    from Google Drive    │                         │
       │─────────────────────────>│                         │
       │                          │                         │
       │                          │ 5. Update status:      │
       │                          │ filming_status =       │
       │                          │ 'uploaded'             │
       │                          │                         │
       ├──────────┐               │                         │
       │ Escalate │ 6. At 21:00   │                         │
       │ if not   │ If still not  │                         │
       │uploaded? │ uploaded:     │                         │
       │<─────────┤ Create 2nd    │                         │
       │          │ reminder      │
       │          │ (9 PM)        │
       │          │─────────────>│
       │          │  Send:       │
       │          │  "⚠️ Escalate│
       │          │   GoPro"     │
       │          │              │
       │          │              │
       ├──────────────┐          │
       │ Gee reviews  │          │
       │ (dashboard)  │          │
       │<─────────────┤          │
       │              │ 7. Approve/
       │              │ reject in UI
       │              │            │
       │──────────────────────────>│
       │ 8. Update status:         │
       │    'pending_review'       │
       │    -> 'published'         │
       │              │ 9. Send   │
       │              │ "GoPro   │
       │              │ ready!   │
       │              │─────────>│
       │              │    via   │
       │              │   email/ │
       │              │   WA to  │
       │              │  guests  │
       │              │          │
       ├─────────────────────────────────────┐
       │ 10. Track: guest_video_access       │
       │ - shared_at = NOW()                 │
       │ - expires_at = NOW() + 30 days      │
       │ - download_count (incremented)      │
       │                                     │
       └─────────────────────────────────────┘
```

### 2.2 Daily Report Reminder

```
┌──────────────┐      ┌────────────────┐      ┌──────────────────┐
│   Tour Ops   │      │  Scheduler     │      │  Guide App / Form│
│              │      │  (19:00 GMT+8) │      │  Submission      │
└──────┬───────┘      └────────┬───────┘      └──────┬───────────┘
       │                       │                     │
       │ 1. Create tour record │                     │
       │ for today             │                     │
       │──────────────────────>│                     │
       │                       │ 2. At 19:00         │
       │                       │ SELECT tours WHERE  │
       │                       │ tour_date = TODAY   │
       │                       │ AND status IN       │
       │                       │ ('active',          │
       │                       │ 'in_progress')      │
       │                       │                     │
       │                       │ 3. FOR EACH tour:   │
       │                       │ CREATE report       │
       │                       │ reminder record     │
       │                       │ sequence=1          │
       │                       │ Send WhatsApp:      │
       │                       │ "📝 Time to report" │
       │                       │ link to form        │
       │                       │                     │
       │                       │────────────────────>│
       │                       │                     │ 4. Guide opens
       │                       │                     │ form (web/app)
       │                       │                     │ Fills:
       │                       │                     │ - Timing
       │                       │                     │ - Route points
       │                       │                     │ - Equipment ✓
       │                       │                     │ - Incidents
       │                       │                     │
       │                       │                     │ 5. SUBMIT
       │                       │                     │ form data
       │                       │                     │
       │                       │<─────────────────────
       │                       │ 6. INSERT daily_
       │                       │ reports record
       │                       │ status='submitted'
       │                       │ submitted_at=NOW()
       │                       │ data_quality_score
       │                       │ = calc(...)
       │                       │
       │                       │ 7. If not submitted │
       │                       │ by 20:00: CREATE   │
       │                       │ reminder seq=2     │
       │                       │ Send escalation    │
       │                       │ "⏰ Report pending"│
       │                       │────────────────────>│
       │                       │                     │
       │                       │ 8. If not submitted │
       │                       │ by 22:00: CREATE   │
       │                       │ reminder seq=3     │
       │                       │ ESCALATE to Gee    │
       │                       │ Mark as 'overdue'  │
       │                       │────────────────────>│
       │                       │                     │
       │                       │ 9. After 23:59:    │
       │                       │ If still pending:  │
       │                       │ - Create incident? │
       │                       │ - Send weekly      │
       │                       │ summary to Gee     │
       │                       │                     │
       └───────────────────────┴─────────────────────┘
```

### 2.3 Booking Calendar + Weather Integration

```
┌──────────────┐      ┌────────────────┐      ┌──────────────────┐
│  Gee Dash    │      │  Scheduler     │      │  Weather API     │
│ (calendar    │      │  (06:00 GMT+8) │      │  (weatherapi.com)│
│  view)       │      │                │      │                  │
└──────┬───────┘      └────────┬───────┘      └──────┬───────────┘
       │                       │                     │
       │ 1. GET /api/calendar  │                     │
       │ ?month=2026-04        │                     │
       │──────────────────────>│                     │
       │                       │ 2. At 06:00         │
       │                       │ FETCH weather for   │
       │                       │ Nusa Penida, next 7 │
       │                       │ days                │
       │                       │─────────────────────>│
       │                       │ 3. GET /forecast    │
       │                       │ Returns: swell_m,   │
       │                       │ wind_knots,         │
       │                       │ condition, etc.     │
       │                       │<─────────────────────
       │                       │                     │
       │                       │ 4. Store in cache   │
       │                       │ (Redis 2h TTL)      │
       │                       │ + DB: weather_api_  │
       │                       │ cache               │
       │                       │                     │
       │ 5. Render calendar    │                     │
       │ with tours colored    │                     │
       │ by weather forecast   │                     │
       │                       │                     │
       │ [Grid view]:          │                     │
       │   Date  | Boats       │                     │
       │ ------  | ---         │                     │
       │ 2026-04 | Shared 01   │                     │
       │ -12     | (Sandy)     │                     │
       │         | ☀️ Calm     │                     │
       │         |             │                     │
       │         | SO5 (Aldo)  │                     │
       │         | ⛅ Choppy   │                     │
       │<───────────────────────                     │
       │                       │                     │
       └───────────────────────┴─────────────────────┘

Click on tour:
       │ 6. Detail popup:      │
       │ [Shared_01] Date Pax  │
       │ Guides: Sandy + Time..│
       │ Route: [points]       │
       │ Weather: ☀️ Calm     │
       │ Forecast: Improving  │
       │ [EDIT] [COPY]         │
       │                       │
       └───────────────────────┘
```

### 2.4 Midday Check-in (11:30 AM)

```
┌──────────────┐      ┌─────────────────┐      ┌─────────────┐
│  On-tour     │      │  Scheduler      │      │  WhatsApp   │
│  (boat GPS)  │      │  (11:30 GMT+8)  │      │   Form      │
└──────┬───────┘      └────────┬────────┘      └──────┬──────┘
       │                       │                      │
       │                       │ 1. At 11:30          │
       │                       │ SELECT tours WHERE   │
       │                       │ departure_time +     │
       │                       │ 3.5-4.5 hours =      │
       │                       │ NOW()                │
       │                       │                      │
       │                       │ 2. FOR EACH tour:    │
       │                       │ CREATE checkin       │
       │                       │ record               │
       │                       │ Send WhatsApp to     │
       │                       │ guides:              │
       │                       │ "🌊 Conditions      │
       │                       │  check?"             │
       │                       │ -> form deep link    │
       │                       │──────────────────────>
       │                       │                      │ 3. Guide opens
       │                       │                      │ conditions form:
       │                       │                      │ - Sea state
       │                       │                      │ - Weather
       │                       │                      │ - Visibility
       │                       │                      │ - Stick to route?
       │                       │                      │ - Guest status?
       │                       │                      │ - Lunch changes?
       │                       │                      │
       │ 4. GPS location       │                      │
       │ (if stuck/changed    │                      │
       │ route)                │                      │
       │─────────────────────────────────────────────>
       │                       │                      │ 5. SUBMIT form
       │                       │<──────────────────────
       │                       │ 6. INSERT/UPDATE     │
       │                       │ daily_checkins:      │
       │                       │ - sea_condition      │
       │                       │ - weather            │
       │                       │ - route_changed?     │
       │                       │ - guest_issues?      │
       │                       │ - issue_severity     │
       │                       │                      │
       │                       │ 7. If issue_severe   │
       │                       │ = 'high':            │
       │                       │ - ESCALATE to Dima   │
       │                       │ - CREATE incident    │
       │                       │ - ALERT: boat needs  │
       │                       │   quick return       │
       │                       │                      │
       │                       │ 8. If route changed: │
       │                       │ - UPDATE tour        │
       │                       │ - NOTIFY restaurant  │
       │                       │   (if lunch affected)│
       │                       │ - NOTIFY Gee:       │
       │                       │   "Route changed"    │
       │                       │                      │
       └───────────────────────┴──────────────────────┘
```

### 2.5 Afternoon Weather Update (3 PM)

```
┌──────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  WhatsApp    │      │  Scheduler      │      │  Weather Cache   │
│  Weather     │      │  (15:00 GMT+8)  │      │  (Redis/DB)      │
│  Form        │      │                 │      │                  │
└──────┬───────┘      └────────┬────────┘      └──────┬───────────┘
       │                       │                     │
       │                       │ 1. At 15:00         │
       │                       │ GET cached weather  │
       │                       │ (fetched at 14:00)  │
       │                       │─────────────────────>
       │                       │ 2. SELECT tours     │
       │                       │ WHERE tour_date =   │
       │                       │ TODAY AND end_time  │
       │                       │ >= NOW() + 2h       │
       │                       │<─────────────────────
       │                       │                     │
       │                       │ 3. FOR EACH tour:   │
       │                       │ CREATE weather_     │
       │                       │ updates record      │
       │                       │ Populate:           │
       │                       │ - current conditions│
       │                       │ - forecast_2h       │
       │                       │ - recommended_route │
       │                       │                     │
       │                       │ 4. Send WhatsApp:   │
       │                       │ "🌞 Weather update" │
       │                       │ Current: Moderate   │
       │                       │ swell 1m, wind 12kt │
       │                       │ Next 2h: improving  │
       │                       │ → form link         │
       │                       │──────────────────────>
       │                       │                     │ 5. Guide opens
       │                       │                     │ weather update:
       │                       │                     │ - See forecast
       │                       │                     │ - See route rec
       │                       │                     │ - GoPro status?
       │                       │                     │   ☐ Collected
       │                       │                     │   ☐ Partial
       │                       │                     │   ☐ Not yet
       │                       │                     │ - SUBMIT
       │                       │                     │
       │                       │<──────────────────────
       │                       │ 6. UPDATE weather_  │
       │                       │ updates:            │
       │                       │ - gopro_status      │
       │                       │ - gopro_confirmed_at│
       │                       │                     │
       │                       │ 7. If gopro NOT     │
       │                       │ collected:          │
       │                       │ - ALERT guide:      │
       │                       │   "Last chance for  │
       │                       │    footage?"        │
       │                       │ - Create incident   │
       │                       │   if overdue (>23:00)
       │                       │                     │
       └───────────────────────┴──────────────────────┘
```

### 2.6 Guide Performance Dashboard

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ Gee Dashboard│      │  Scheduler       │      │  Review APIs     │
│              │      │  (22:00 GMT+8)   │      │  (Google, TA,    │
│              │      │  (Daily fetch)   │      │   Klook)         │
└──────┬───────┘      │                  │      │                  │
       │              │  (01:00 GMT+8)   │      │                  │
       │              │  (if month = 1st)│      │                  │
       │              │                  │      │                  │
       │              └────────┬─────────┘      └──────┬───────────┘
       │                       │                      │
       │ 1. GET /api/guide-    │                      │
       │ performance/monthly   │                      │
       │ ?month=2026-04        │                      │
       │──────────────────────>│                      │
       │                       │ 2. At 22:00 EVERY DAY│
       │                       │ FOR EACH [Google,   │
       │                       │ TripAdvisor, Klook] │
       │                       │─────────────────────>
       │                       │ 3. GET new reviews  │
       │                       │ mentioning guides   │
       │                       │ Extract:            │
       │                       │ - rating            │
       │                       │ - text              │
       │                       │ - date              │
       │                       │<─────────────────────
       │                       │ 4. Parse sentiment: │
       │                       │ - keyword matching  │
       │                       │ - tag extraction    │
       │                       │ 5. INSERT into      │
       │                       │ guide_review_       │
       │                       │ feedback            │
       │                       │ tag_counts JSONB    │
       │                       │                     │
       │                       │ 6. On 1st of month  │
       │                       │ at 08:00:           │
       │                       │ AGGREGATE metrics   │
       │                       │ FOR guide, month:   │
       │                       │ - SUM tours_comp    │
       │                       │ - AVG rating        │
       │                       │ - AVG satisfaction  │
       │                       │ - SUM revenue       │
       │                       │ - CALC commission   │
       │                       │ - RANK guides       │
       │                       │ - ASSIGN awards     │
       │                       │                     │
       │ 7. Render dashboard:  │                     │
       │ [March 2026 Rankings] │                     │
       │ 🥇 Nemo 4.88 28tours  │                     │
       │ 🥈 Budi 4.86 27tours  │                     │
       │ 🥉 Nyoman 4.82 24t..  │                     │
       │                       │                     │
       │ [Click Nemo detail]   │                     │
       │ Rating: 4.88 ⭐       │                     │
       │ Reviews: 35 (+5 vs    │                     │
       │ last month)           │                     │
       │ Tours: 28             │                     │
       │ Satisfaction: 96%     │                     │
       │ Revenue: $9,100       │                     │
       │ Earnings: $2,275      │                     │
       │ Award: March Hero     │                     │
       │ Bonus: $200           │                     │
       │                       │                     │
       │ Feedback themes:      │                     │
       │ + friendly (12), know │                     │
       │ (8), safe (7)         │                     │
       │                       │                     │
       │ Performance by type:  │                     │
       │ Shared: 4.86 (16 tours│                     │
       │ Private: 4.79 (8)     │                     │
       │ Party: 4.84 (4)       │                     │
       │<──────────────────────┤                     │
       │                       │ 8. Email to Gee:    │
       │                       │ "Performance report │
       │                       │ ready for March"    │
       │                       │ [VIEW] [EXPORT CSV] │
       │                       │ [SEND TO TEAM]      │
       │                       │                     │
       └───────────────────────┴──────────────────────┘
```

### 2.7 Complaint/Incident Log + Pattern Detection

```
┌──────────────┐      ┌──────────────────┐      ┌────────────────┐
│ Gee/MOD/Dima │      │  Scheduler       │      │  Incident      │
│ (incident)   │      │  (10:00 GMT+8)   │      │  Database      │
│ Form         │      │                  │      │                │
└──────┬───────┘      └────────┬─────────┘      └────────┬───────┘
       │                       │                        │
       │ 1. New incident       │                        │
       │ reported (OTA,        │                        │
       │ WhatsApp, or form)    │                        │
       │─────────────────────────────────────────────────>
       │                       │ 2. INSERT incidents   │
       │                       │ record:               │
       │                       │ - tour_id             │
       │                       │ - guide_id_primary    │
       │                       │ - incident_type       │
       │                       │ - severity (1-5)      │
       │                       │ - description         │
       │                       │ - time_occurred       │
       │                       │ status='open'         │
       │                       │ resolved_status=null  │
       │                       │                       │
       │                       │ 3. Store attachments  │
       │                       │ (photos, docs)        │
       │                       │ -> incident_          │
       │                       │ attachments           │
       │                       │                       │
       │                       │ 4. At 10:00 DAILY:    │
       │                       │ SCAN incidents from   │
       │                       │ past 30 days          │
       │                       │<───────────────────────
       │                       │ 5. Apply pattern      │
       │                       │ rules:                │
       │                       │ - Same guide + 3+     │
       │                       │   complaints?         │
       │                       │ - Same type + 5+      │
       │                       │   incidents?          │
       │                       │ - Severity trend up?  │
       │                       │ - High incidents +    │
       │                       │   unresolved?         │
       │                       │                       │
       │                       │ 6. If pattern found:  │
       │                       │ - CREATE incident_    │
       │                       │ patterns record       │
       │                       │ - alert_triggered     │
       │                       │ - Send ALERT to Gee:  │
       │                       │ "🚨 5 late-return     │
       │                       │ incidents in 2 weeks  │
       │                       │ from different guides │
       │                       │ → Route timing issue?"│
       │                       │                       │
       │ 7. Gee reviews        │                       │
       │ dashboard:            │                       │
       │ [April Incident Log]  │                       │
       │ Total: 8 (↑ vs 5)     │                       │
       │ High: 2               │                       │
       │ Medium: 3             │                       │
       │ Low: 3                │                       │
       │                       │                       │
       │ Patterns Detected:    │                       │
       │ - Late returns (5)    │                       │
       │ - Seasickness (2)     │                       │
       │                       │                       │
       │ [Click on incident]   │                       │
       │ ────────────────────  │                       │
       │ [Shared_01 complaint] │                       │
       │ Guest: Jane Smith     │                       │
       │ Type: Late return     │                       │
       │ Date: 2026-04-10      │                       │
       │ Guide: Sandy          │                       │
       │ Severity: 2/5         │                       │
       │ Description: "Tour    │                       │
       │ returned 1h late,     │                       │
       │ guest missed flight"  │                       │
       │                       │                       │
       │ Attachments: none     │                       │
       │ Status: open          │                       │
       │ Assigned to: Gee      │                       │
       │                       │                       │
       │ [RESOLVE INCIDENT]    │                       │
       │ ─────────────────────>│                       │
       │ resolution_text:      │                       │
       │ "Compensation: $50    │                       │
       │  voucher. Discussed   │                       │
       │  with Sandy re:       │                       │
       │  route timing"        │                       │
       │                       │ 8. UPDATE incidents   │
       │                       │ resolution_status=    │
       │                       │ 'resolved'            │
       │                       │ compensation_type=    │
       │                       │ 'voucher'             │
       │                       │ compensation_amount=50│
       │                       │                       │
       │ [Assign to Sandy]     │                       │
       │ ─────────────────────>│                       │
       │                       │ 9. CREATE Kommo       │
       │                       │ activity or note:     │
       │                       │ "Incident [ID]        │
       │                       │ resolved"             │
       │<──────────────────────┤                       │
       │ Notification sent     │                       │
       │                       │                       │
       └───────────────────────┴───────────────────────┘
```

---

## 3. Cron Jobs & Scheduling

### 3.1 Daily Scheduler Breakdown

```
GMT+8 Daily Schedule (Bluuu OS Guide Management):

06:00
  ├─ weather_fetch_job()
  │  └─ GET weatherapi.com → swell, wind, visibility
  │  └─ CACHE in Redis (2h TTL)
  │  └─ UPDATE weather_api_cache
  │  └─ Check if any alert conditions (swell > 2.5m)
  │
  └─ otas_sync_job()
     └─ Sync bookings with Viator, Klook, Airbnb
     └─ Check for new/cancelled tours

10:00
  ├─ incident_pattern_detection_job()
  │  └─ SELECT incidents WHERE created_at > NOW() - 30 days
  │  └─ FOR EACH pattern rule: check if threshold met
  │  └─ If pattern: CREATE incident_patterns record + ALERT Gee
  │  └─ Email weekly summary if not sent yet
  │
  └─ calendar_sync_job()
     └─ Verify no double-bookings
     └─ Update weather forecast in calendar_metadata

11:30
  ├─ midday_checkin_reminder_job()
  │  └─ SELECT tours WHERE tour_date = TODAY
  │  │   AND departure_time + 3.5h >= NOW()
  │  │   AND NOT EXISTS (checkin submitted today)
  │  │
  │  └─ FOR EACH tour: 
  │     ├─ CREATE daily_checkins record (scheduled_at = NOW())
  │     ├─ SEND WhatsApp to guide_id_1, guide_id_2
  │     │  Message: "🌊 Quick conditions check → [form link]"
  │     │  Channel: Twilio/Kommo API
  │     │
  │     └─ Set escalation alarm: if not submitted in 30 min → alert

15:00
  ├─ afternoon_weather_update_job()
  │  └─ SELECT tours WHERE tour_date = TODAY
  │  │   AND departure_time + 6h >= NOW() <= 4.5h
  │  │
  │  └─ FOR EACH tour:
  │     ├─ GET cached weather (from 14:00 fetch)
  │     ├─ CREATE weather_updates record
  │     ├─ Generate recommended_route
  │     │
  │     └─ SEND WhatsApp to guides:
  │        Message: "🌞 Afternoon weather: Moderate swell, 
  │                  forecast improving. GoPro status? → [form]"
  │        Attach: weather icon, recommendation
  │
  └─ guide_availability_cache_update_job()
     └─ UPDATE Redis cache: guide availability for next 7 days

18:00
  ├─ gopro_upload_reminder_6pm_job()
  │  └─ SELECT gopro_footage WHERE
  │  │   filmed_at = TODAY
  │  │   AND filming_status IN ('not_shot', 'uploading')
  │  │   AND NOT EXISTS (reminder sent with type='upload_reminder_6pm')
  │  │
  │  └─ FOR EACH footage:
  │     ├─ CREATE gopro_notifications record
  │     │  notification_type = 'upload_reminder_6pm'
  │     │  scheduled_at = NOW()
  │     │
  │     └─ SEND WhatsApp to guide_id_1 + guide_id_2:
  │        Message: "📹 Привет! GoPro footage for [tour] 
  │                  ready for upload? → [upload link]"
  │        delivery_channel = 'whatsapp'
  │        Mark: sent_at = NOW()

19:00
  ├─ daily_report_reminder_7pm_job()
  │  └─ SELECT tours WHERE tour_date = TODAY
  │  │   AND status IN ('active', 'in_progress')
  │  │   AND NOT EXISTS (daily_reports where submitted_at IS NOT NULL)
  │  │
  │  └─ FOR EACH tour:
  │     ├─ CREATE report_reminders record
  │     │  reminder_sequence = 1
  │     │  scheduled_at = NOW()
  │     │
  │     └─ SEND WhatsApp to guide_id_1 + guide_id_2:
  │        Message: "📝 Привет! Time to report your trip 
  │                  [tour details] → [form link]"
  │        Channel: Twilio/Kommo API
  │
  │  └─ Schedule escalation: next reminder at 20:00

20:00
  ├─ daily_report_reminder_8pm_escalation_job()
  │  └─ SELECT tours WHERE:
  │  │   tour_date = TODAY
  │  │   AND daily_reports NOT submitted (submitted_at IS NULL)
  │  │   AND last reminder_sequence = 1 sent > 1 hour ago
  │  │
  │  └─ FOR EACH:
  │     ├─ CREATE report_reminders record
  │     │  reminder_sequence = 2
  │     │
  │     └─ SEND escalation message:
  │        "⏰ Отчёт ещё не заполнен (1 час назад).
  │         Дедлайн: 23:59 сегодня → [form link]"

21:00
  ├─ gopro_upload_reminder_9pm_escalation_job()
  │  └─ SELECT gopro_footage WHERE
  │  │   filmed_at = TODAY
  │  │   AND filming_status IN ('not_shot', 'uploading')
  │  │   AND reminder sequence 1 sent > 3 hours ago
  │  │
  │  └─ FOR EACH:
  │     ├─ CREATE gopro_notifications record
  │     │  notification_type = 'upload_reminder_9pm'
  │     │  scheduled_at = NOW()
  │     │
  │     └─ SEND escalation WhatsApp:
  │        "⚠️ GoPro footage ещё не загружена.
  │         Дедлайн: сегодня 23:59 → [upload link]"
  │
  │     └─ CREATE escalation note in Kommo:
  │        Activity: "GoPro pending" for guide_id

22:00
  ├─ review_fetch_job() — ALL PLATFORMS
  │  │
  │  ├─ google_reviews_fetch()
  │  │  └─ GET Google Places reviews for guide names
  │  │  └─ Parse: rating, text, author, date
  │  │  └─ INSERT guide_review_feedback
  │  │  └─ Extract sentiment + tags
  │  │
  │  ├─ tripadvisor_reviews_fetch()
  │  │  └─ Similar: GET TripAdvisor reviews
  │  │  └─ Filter by Bluuu Tours company ID
  │  │
  │  └─ klook_reviews_fetch()
  │     └─ API: GET reviews from Klook for each booking
  │     └─ Parse + store
  │
  └─ notification_retry_job()
     └─ SELECT gopro_notifications, report_reminders WHERE
     │  delivery_status = 'failed' AND retry_count < 3
     │
     └─ FOR EACH: RETRY send via Twilio/Kommo
        Update: retry_count += 1, sent_at = NOW()

23:59
  └─ daily_report_overdue_check_job()
     └─ SELECT daily_reports WHERE
     │  tour_date = TODAY
     │  AND submitted_at IS NULL
     │  AND status IN ('draft', 'submitted')
     │
     └─ FOR EACH:
        ├─ Mark: status = 'overdue'
        ├─ CREATE escalation note in Kommo
        │
        └─ ALERT Gee:
           "Reports missing from: Sandy, Timpleng
            [Complete pending list]"

00:00
  └─ video_expiry_check_job()
     └─ SELECT guest_video_access WHERE
     │  expires_at <= NOW()
     │
     └─ FOR EACH:
        ├─ Mark: status = 'expired'
        ├─ Archive record
        │
        └─ Send guest email:
           "Your video link [tour] has expired.
            Contact support for reactivation."
```

### 3.2 Monthly Scheduler

```
1st of month at 08:00 GMT+8:

guide_performance_aggregation_job()
  │
  └─ FOR EACH active guide:
     │
     ├─ AGGREGATE metrics from PREVIOUS month:
     │  ├─ COUNT tours_completed (WHERE tour_date IN [prev_month])
     │  ├─ CANCEL tours_cancelled
     │  ├─ AVG average_rating (from all reviews)
     │  ├─ AVG guest_satisfaction (from survey if exists)
     │  ├─ SUM gross_tour_revenue
     │  ├─ CALC guide_payout (commission %)
     │  ├─ CALC bonus (if top performer)
     │  ├─ COUNT medical_incidents, equipment_damage, safety_violations
     │  ├─ CALC vs_previous_month_rating_change
     │  └─ CALC vs_previous_month_reviews_change
     │
     ├─ RANK guides:
     │  ├─ ORDER BY average_rating DESC
     │  ├─ Assign ranking_position (1, 2, 3, ...)
     │  ├─ Assign ranking_tier (top_performer, solid, needs_improvement)
     │  ├─ Assign award_name (if applicable):
     │  │   - "Month Hero" → top performer
     │  │   - "Reliability Champion" → zero no-shows
     │  │   - "Emerging Star" → improvement trend
     │  │   - "Coaching Required" → downward trend
     │  │
     │  └─ INSERT guide_performance_metrics record
     │
     ├─ CREATE Kommo activities:
     │  └─ FOR EACH guide: post activity to guide contact
     │     "Performance update for [month]: Rating [4.85], 
     │      [28 tours], Ranking: [#2]"
     │
     └─ Generate performance report:
        ├─ Top 3 guides
        ├─ Watch list (downward trend)
        ├─ Emerging stars (improvement)
        ├─ Incident summary
        └─ Export PDF + CSV
        └─ SEND EMAIL to Gee:
           "📊 Performance Report — [Month] Ready
            [View Dashboard] [Download PDF]"

Weekly at Monday 09:00 GMT+8:

incident_weekly_summary_job()
  │
  └─ SELECT incidents WHERE created_at > NOW() - 7 days
     │
     ├─ GROUP BY incident_type, severity
     ├─ COUNT per category
     ├─ Identify top patterns
     │
     └─ SEND EMAIL to Gee:
        "📊 Incident Weekly Summary
         
         Total: 8 incidents (↑ vs 5 last week)
         By type:
           - Complaints: 4
           - Medical: 2
           - Equipment: 2
         
         High severity: 2
         Medium: 3
         Low: 3
         
         Top patterns:
           - Late returns (3) → review route timing?
           - Seasickness (2) → check forecast correlation
         
         Open issues: 3 (1 overdue)
         [VIEW DASHBOARD]"
```

---

## 4. API Integration Points

### 4.1 Kommo CRM API

**Endpoint:** `https://[account].kommo.com/api/v4/`

**Calls triggered:**

```
POST /api/v4/contacts/{id}/notes
  When: GoPro shared to guest, incident logged
  Payload: { "note": "GoPro footage shared: [link]", "user_id": 1 }
  
POST /api/v4/contacts/{id}/custom_fields
  When: Guide performance updated, ranking changed
  Payload: { "field_id": 123, "values": [{ "value": "Top Performer" }] }
  
POST /api/v4/contacts/{id}/leads
  When: Upsell offer accepted
  Payload: { "status_id": 456, "custom_fields": [...] }
```

**Webhook handlers (incoming from Kommo):**

```
POST /webhooks/kommo/contact-update
  When: Guide profile edited in Kommo
  Action: Sync to guides table in our DB
  
POST /webhooks/kommo/deal-status-change
  When: Booking status changes in Kommo
  Action: Update tour status, trigger cascade operations
```

### 4.2 WhatsApp API (Twilio)

**Endpoint:** `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/...`

**Calls triggered:**

```
POST /Messages
  When: Any reminder/notification due (GoPro, reports, check-ins, weather)
  Payload: {
    "From": "+62XXXXXXXXXX",
    "To": "{guide_phone}",
    "Body": "📹 GoPro reminder...",
    "MediaUrl": [weather_icon_url]  // optional
  }
  Headers: Authorization: Basic [base64_auth]

GET /Messages/{MessageSid}
  When: Retry failed notifications
  Query: Retrieve delivery status
```

**Webhook handlers (incoming from Twilio):**

```
POST /webhooks/twilio/message-status
  When: Twilio notifies of delivery status (sent/failed)
  Action: UPDATE gopro_notifications.delivery_status, retry_count
  
POST /webhooks/twilio/incoming-message
  When: Guide replies to WhatsApp
  Action: Log response, update notification_status to 'acknowledged'
```

### 4.3 Google Drive API

**Endpoint:** `https://www.googleapis.com/drive/v3/`

**Calls triggered:**

```
POST /files
  When: GoPro footage uploaded, create folder
  Payload: {
    "name": "2026-04-12_Sandy_Timpleng",
    "mimeType": "application/vnd.google-apps.folder",
    "parents": ["root_folder_id"]
  }
  Headers: Authorization: Bearer {access_token}

PATCH /files/{folder_id}
  When: Update folder permissions (share with guest)
  Payload: {
    "shared": true,
    "shareLink": "viewersCanCopyContent=false"
  }

GET /files
  When: Check file count/status in folder
  Query: q='parents in "{folder_id}"'
  Action: Update gopro_footage.file_count, file_names
  
DELETE /files/{file_id}
  When: Archive expired videos (after 30 days)
  Action: Move to trash (compliance)
```

### 4.4 Weather API (weatherapi.com)

**Endpoint:** `https://api.weatherapi.com/v1/`

**Calls triggered:**

```
GET /forecast.json
  When: Daily at 06:00 and 14:00 GMT+8
  Query: {
    "key": "{api_key}",
    "q": "Nusa Penida",
    "days": 7,
    "aqi": "yes"
  }
  Response: Parse swell_m, wind_knots, condition
  Store: weather_api_cache (Redis + DB)
```

### 4.5 Review APIs (Google, TripAdvisor, Klook)

**Endpoints:**

```
Google Places API:
  GET /place/details/{place_id}
  Query: ?fields=reviews,rating,review_count
  Action: Extract guide-specific reviews (parse text)

TripAdvisor API:
  GET /location/{location_id}/reviews
  Query: ?language=en
  Action: Filter by guide name, extract reviews

Klook API:
  GET /bookings/{booking_id}/reviews
  Query: auth token
  Action: Fetch post-tour reviews from booking
```

---

## 5. Data Flow & Integration Logic

### 5.1 Daily Report → Multiple Systems

```
Guide submits daily_reports form (19:00-22:00)
  │
  ├─ DATABASE: INSERT daily_reports record
  │  ├─ tour_id
  │  ├─ guide_id_1, guide_id_2
  │  ├─ route_points (JSONB array)
  │  ├─ equipment_check
  │  ├─ gopro_collected
  │  ├─ data_quality_score = calc()
  │  └─ status = 'submitted'
  │
  ├─ KOMMO: POST activity to guide contact
  │  └─ "Trip report submitted for [tour_date]"
  │
  ├─ CASCADE: Update gopro_footage
  │  ├─ IF gopro_collected = false:
  │  │  └─ flag for escalation (no footage warning)
  │  │
  │  └─ IF gopro_collected = true:
  │     └─ set filming_status = 'uploaded' (expected)
  │
  ├─ CASCADE: Update tour status
  │  └─ IF all route_points filled & timing valid:
  │     └─ mark tour as 'report_complete'
  │
  └─ NOTIFICATION: Gee sees "New report ready for review"
     └─ Dashboard widget: pending_reports count
```

### 5.2 Midday Check-in → Escalation Path

```
Guide submits daily_checkins form (11:30+)
  │
  ├─ DATABASE: INSERT daily_checkins record
  │
  ├─ IF route_changed = true:
  │  ├─ UPDATE tour: recommended_route = new_route
  │  ├─ NOTIFICATION: Gee gets alert
  │  │  └─ "Route changed for [tour]: [reason]"
  │  │
  │  ├─ IF lunch_affected:
  │  │  └─ API: POST to restaurant → "ETA changed to [time]"
  │  │
  │  └─ If new route is coastal/risky:
  │     └─ UPDATE weather_recommendation: "expert_only"
  │
  ├─ IF issue_severity = 'high':
  │  ├─ CREATE incident record (escalation)
  │  ├─ NOTIFICATION: Dima + Gee
  │  │  └─ "🚨 High severity issue reported: [details]"
  │  │
  │  ├─ BOAT ALERT: Driver gets notification
  │  │  └─ "Guest needs medical support, RTB capability ready"
  │  │
  │  └─ CREATE guest_medical_flags record (for future tours)
  │     └─ flag_type, severity, resolution status
  │
  └─ If escalate_required = true:
     └─ Create task: "Follow up post-tour with guest"
```

### 5.3 Incident Log → Pattern Detection → Action

```
Incident created (manual or auto-escalated)
  │
  ├─ DATABASE: INSERT incidents record
  │  ├─ All incident details
  │  ├─ status = 'open'
  │
  ├─ STORE: incident_attachments (photos, docs)
  │
  ├─ KOMMO: POST as deal note/activity
  │
  ├─ NOTIFICATION: Assigned user (Gee/Dima)
  │
  └─ At daily 10:00 pattern_detection_job():
     │
     └─ FOR EACH pattern rule (e.g., "Same guide + 3+ complaints"):
        │
        ├─ Query incidents past 30 days
        ├─ Apply filter_criteria (e.g., incident_type='complaint', guide='Sandy')
        ├─ IF count >= threshold_count (e.g., 3):
        │  │
        │  ├─ CREATE incident_patterns record
        │  │  └─ pattern_name, detected_date, incident_count
        │  │
        │  ├─ alert_triggered = true
        │  │
        │  ├─ SEND EMAIL to Gee:
        │  │  "🚨 PATTERN DETECTED:
        │  │   Guide Sandy: 3+ complaints in past 30 days
        │  │   Types: Late returns (2), Communication (1)
        │  │   → RECOMMENDATION: Coaching session
        │  │   [VIEW ALL INCIDENTS]"
        │  │
        │  └─ UPDATE guide_performance_metrics.ranking_tier
        │     └─ If pattern detected: flag 'needs_improvement' / 'at_risk'
        │
        └─ IF pattern count increases week-over-week:
           └─ ESCALATE priority: trigger weekly summary email immediately
```

---

## 6. Notification Channel Matrix

| Module | Notification Type | Recipient | Channel | Frequency | Retry |
|--------|---|---|---|---|---|
| **GoPro** | Upload reminder 6PM | Guides | WhatsApp | Daily | 3× (exponential backoff) |
| | Upload escalation 9PM | Guides | WhatsApp | Daily (if not sent) | 3× |
| | Published to guest | Guests | Email / WhatsApp | Once | 1× |
| **Daily Report** | Reminder 7PM | Guides | WhatsApp | Daily | 3× |
| | Escalation 8PM | Guides | WhatsApp | Daily | 3× |
| | Escalation 10PM | Guides | WhatsApp | Daily | 3× |
| | Overdue summary | Gee | Email | Daily (23:59+) | 1× |
| **Midday Check-in** | Reminder 11:30 | Guides | WhatsApp | Daily | 3× |
| | High severity escalation | Dima, Gee | Email, Kommo | Immediate | 1× |
| **Weather Update** | Afternoon 3PM | Guides | WhatsApp | Daily | 3× |
| | Severe warning | All team | Email + Kommo | As needed | 1× |
| **Performance** | Monthly report | Gee | Email | Monthly (1st) | 1× |
| | Weekly summary | Gee | Email | Weekly (Monday) | 1× |
| **Incidents** | Immediate escalation | Assigned user | Email, Kommo | Immediate | 1× |
| | Pattern alert | Gee | Email | Daily (10:00) | 1× |
| | Weekly summary | Gee | Email | Weekly (Monday) | 1× |

---

## 7. Error Handling & Retry Logic

```
Notification Delivery Retry Strategy:

INITIAL SEND → delivery_status = 'pending'
  │
  ├─ Success (HTTP 200) → delivery_status = 'sent'
  │
  ├─ Soft Fail (429, 5xx) → 
  │  ├─ retry_count += 1
  │  ├─ scheduled_at = NOW() + EXPONENTIAL_BACKOFF[retry_count]
  │  │  (e.g., 5 min, 15 min, 45 min, 2h, ...)
  │  ├─ delivery_status = 'pending'
  │  └─ Retry at next scheduled check
  │
  └─ Hard Fail (4xx, invalid phone) → 
     ├─ delivery_status = 'failed'
     ├─ error_message = "[exception text]"
     └─ Alert: escalate to Gee if critical reminder (GoPro 9PM, Report 10PM)

DATABASE CONSTRAINT VIOLATIONS:
  - Foreign key constraint → log error, notify dev team
  - Duplicate key → skip (idempotent), continue
  - NULL constraint → validation at API layer, reject early

API TIMEOUT HANDLING:
  - Kommo CRM: timeout = 10s, retry 2×
  - Google Drive: timeout = 30s, use resumable upload for large files
  - Weather API: timeout = 5s, use cached data if failed
  - Twilio: timeout = 15s, mark as 'pending' for next retry

TRANSACTION SAFETY:
  - Each notification: wrapped in transaction
  - If INSERT succeeds but SEND fails → retry loop catches it
  - If SEND succeeds but UPDATE fails → log discrepancy, manual review
```

---

## 8. Deployment & Migration Strategy

### 8.1 Deployment Phases

```
Phase 1: Database Setup (Week 1)
  └─ Run DATABASE_SCHEMA.sql
     ├─ Create 20+ tables
     ├─ Create indices & constraints
     ├─ Create materialized views & functions
     └─ GRANT permissions to app roles

Phase 2: Backend API (Week 2-3)
  └─ Implement 40+ REST endpoints
     ├─ /api/tours/{id}/gopro/footage
     ├─ /api/tours/{id}/daily-report
     ├─ /api/calendar
     ├─ /api/tours/{id}/midday-checkin
     ├─ /api/tours/{id}/weather-update
     ├─ /api/guide-performance/monthly
     ├─ /api/incidents
     └─ /api/upsell-offers
     
Phase 3: Cron Jobs & Scheduler (Week 3-4)
  └─ Implement 10+ scheduler jobs
     ├─ Deploy to APScheduler / node-cron / AWS Lambda
     ├─ Set timezones to GMT+8
     ├─ Test in staging with manual triggering
     └─ Monitor logs for first 1 week in production

Phase 4: Integrations (Week 4-5)
  └─ Connect external APIs
     ├─ Kommo CRM webhooks
     ├─ Twilio WhatsApp
     ├─ Google Drive (auto-folder creation)
     ├─ Weather API caching
     ├─ OTA sync (Klook, Viator)
     └─ Review fetchers (Google Places, TripAdvisor)

Phase 5: Testing & QA (Week 5-6)
  └─ End-to-end testing
     ├─ Trigger notifications manually
     ├─ Verify database records
     ├─ Test error paths (missing phone, API down)
     ├─ Load test scheduler (1000 guides × 10 notifications)
     └─ Security: validate JWT, rate limit, SQL injection

Phase 6: Soft Launch (Week 6-7)
  └─ Enable for 1-2 test guides first
     ├─ Monitor notification delivery
     ├─ Validate data accuracy
     ├─ Get Gee + Dima feedback
     └─ Refine notification timings based on feedback

Phase 7: Full Rollout (Week 7+)
  └─ Enable for all 25 guides
     ├─ Send communication email (new features)
     ├─ Monitor error rates & SLA
     ├─ Support for guide questions
     └─ Iterate based on real-world usage
```

### 8.2 Rollback Plan

```
If critical issue discovered post-deployment:

IMMEDIATE (0-30 min):
  └─ Disable scheduler jobs (set DISABLE_SCHEDULERS=true env var)
  └─ Notification queue: pause all sends
  └─ API: disable non-critical endpoints
  └─ Kommo: disable webhooks

SHORT-TERM (30 min - 4 hours):
  └─ Identify root cause
  └─ Fix in code + test in staging
  └─ If DB issue: check database logs
  └─ If API issue: check application logs

RESTORE:
  └─ Deploy hotfix to production
  └─ Re-enable scheduler jobs
  └─ Restart notification queue
  └─ Monitor for 1 hour
  └─ Post-mortem: what failed, why, how prevent

DATA INTEGRITY:
  └─ All data is written to DB before sending notification
  └─ If send fails, data still in DB (can retry)
  └─ Check gopro_notifications.delivery_status for stuck records
  └─ Manual intervention: mark as 'sent' if notification confirmed via other channel
```

---

## 9. Monitoring & SLA

```
SLA Targets:

Notification Delivery:
  └─ GoPro reminders: 95% within 10 min of scheduled time
  └─ Daily reports: 95% within 10 min of 19:00
  └─ Escalations: 100% within 15 min
  └─ Weather updates: 95% within 15 min of 15:00

Database Performance:
  └─ Query response: <200ms for 95th percentile
  └─ Insert: <50ms for notification records
  └─ Aggregate job: <30s for monthly metrics

API Endpoints:
  └─ GET /api/calendar: <500ms
  └─ POST /api/incidents: <100ms
  └─ GET /api/guide-performance: <1s

Scheduler Reliability:
  └─ Job execution: >99% (only skip if resource exhausted)
  └─ Data integrity: 0 missed notifications (retried)

Monitoring:
  └─ CloudWatch / DataDog metrics
  └─ Alerts if:
    ├─ Notification delivery rate < 90%
    ├─ Database query > 1s
    ├─ Scheduler job takes > 5min
    ├─ API error rate > 1%
    ├─ Disk space < 10% available
```

---

## 10. Summary: Modules at a Glance

| # | Module | Tables | Jobs | Notifications | API Calls (Daily) | Status |
|---|--------|--------|------|---|---|---|
| 1 | GoPro Tracking | 3 | 3 | 5+ | 100-150 | New |
| 2 | Daily Reports | 3 | 3 | 9+ | 80-120 | New |
| 3 | Calendar | 1 | 2 | 0 | 50-100 | New |
| 4 | Midday Checkin | 2 | 1 | 2+ | 60-80 | New |
| 5 | Weather Update | 2 | 2 | 3+ | 50-80 | New |
| 6 | Performance Dashboard | 3 | 2 | 5+ | 0-50 | New |
| 7 | Incidents | 3 | 2 | 10+ | 100-200 | New |
| BONUS | Upselling | 1 | 0 | 0 | 20-50 | New |
| **TOTAL** | | **20+** | **15+** | **34+** | **460-830** | **v1.0** |

---

**Document completed: 12 April 2026**

**Next steps for implementation team:**
1. Review REQUIREMENTS_GIBRAN.md for functional details
2. Execute DATABASE_SCHEMA.sql in PostgreSQL
3. Implement REST API endpoints (can parallelize by module)
4. Deploy cron jobs to scheduler (test in staging first)
5. Configure external integrations (Kommo, Twilio, Google Drive)
6. Run E2E tests → soft launch → full rollout
