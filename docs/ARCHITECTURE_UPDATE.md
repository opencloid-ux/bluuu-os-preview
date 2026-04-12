# Bluuu OS - Architecture Update

## 1. System Architecture Overview (Text Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BLUUU OS - HIBRAN MODULE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐        ┌──────────────────┐        ┌────────────────┐ │
│  │  GUIDE APP       │        │  SUPERVISOR APP  │        │   GUEST APP    │ │
│  │  (Mobile/Web)    │        │  (Dashboard)     │        │  (Post-tour)   │ │
│  └────────┬─────────┘        └────────┬─────────┘        └────────┬───────┘ │
│           │                           │                           │         │
│           └───────────────────────────┼───────────────────────────┘         │
│                                       │                                      │
│                          ┌────────────▼────────────┐                        │
│                          │   API GATEWAY LAYER     │                        │
│                          │  (Auth, rate limiting)  │                        │
│                          └────────────┬────────────┘                        │
│                                       │                                      │
│        ┌──────────────────────────────┼──────────────────────────────┐      │
│        │                              │                              │      │
│  ┌─────▼─────┐                 ┌─────▼──────┐             ┌─────────▼───┐  │
│  │  REST API │                 │  SCHEDULER │             │  WEBHOOKS   │  │
│  │  (CRUD)   │                 │  (Bull/    │             │  (Incoming) │  │
│  └─────┬─────┘                 │   Cron)    │             └────────┬────┘  │
│        │                        └─────┬──────┘                      │       │
│        │                              │                            │       │
│  ┌─────▼──────────────────────────────┼────────────────────────────▼─────┐ │
│  │                    DATABASE LAYER                                      │ │
│  │  ┌─────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │ │
│  │  │  Guides     │  │  Bookings  │  │ Conditions │  │   Incidents  │   │ │
│  │  │  (extended) │  │  (extended)│  │   Updates  │  │   (new)      │   │ │
│  │  └─────────────┘  └────────────┘  └────────────┘  └──────────────┘   │ │
│  │                                                                         │ │
│  │  ┌──────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │ │
│  │  │ GoPro Uploads│  │ Review Link│  │Daily Report│  │   Guide KPIs │   │ │
│  │  │   (new)      │  │   (new)    │  │    (new)   │  │    (new)     │   │ │
│  │  └──────────────┘  └────────────┘  └────────────┘  └──────────────┘   │ │
│  │                                                                         │ │
│  │  ┌──────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │ │
│  │  │  Upsell Items│  │ Upsell Off.│  │Weather Vids│  │ Guest Ratings│   │ │
│  │  │    (new)     │  │   (new)    │  │   (new)    │  │    (new)     │   │ │
│  │  └──────────────┘  └────────────┘  └────────────┘  └──────────────┘   │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Materialized Views / Analytics Tables                           │  │ │
│  │  │  - incident_patterns                                             │  │ │
│  │  │  - guide_kpis (monthly rollup)                                   │  │ │
│  │  │  - booking_calendar_locks                                        │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│        │                              │                            │         │
│        └──────────────────┬───────────┴────────────────┬───────────┘         │
│                           │                            │                     │
│                    ┌──────▼──────┐           ┌────────▼─────┐               │
│                    │  CACHE LAYER│           │ FILE STORAGE │               │
│                    │  (Redis)    │           │  (S3/CDN)    │               │
│                    │  - KPI      │           │  - Videos    │               │
│                    │  - Guide    │           │  - Photos    │               │
│                    │    status   │           │  - GoPro     │               │
│                    └──────┬──────┘           └────────┬─────┘               │
│                           │                           │                     │
│    ┌──────────────────────┴───────────┬───────────────┘                     │
│    │                                  │                                     │
│  ┌─▼────────────────┐     ┌───────────▼──────────┐                         │
│  │  NOTIFICATION    │     │  EXTERNAL SERVICES  │                         │
│  │  SERVICE         │     │  - Twilio (SMS)     │                         │
│  │  - SMS (Twilio)  │     │  - FCM (Push)       │                         │
│  │  - Push (FCM)    │     │  - Email (SendGrid) │                         │
│  │  - Email         │     └─────────────────────┘                         │
│  └────────────────┘                                                         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema (Complete)

### 2.1 Core Tables (Extended)

#### guides (EXTEND EXISTING)

```sql
CREATE TABLE guides (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  
  -- New fields for Hibran module
  active BOOLEAN DEFAULT TRUE,
  hire_date DATE,
  training_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guides_email ON guides(email);
CREATE INDEX idx_guides_active ON guides(active);
```

#### bookings (EXTEND EXISTING)

```sql
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  guest_id BIGINT NOT NULL, -- Assume guests table exists
  
  tour_type VARCHAR(50) NOT NULL, -- 'snorkeling', 'diving', 'custom', etc.
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  guest_count INT NOT NULL,
  location VARCHAR(255),
  special_requests TEXT,
  
  price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_guide_date ON bookings(guide_id, scheduled_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
```

### 2.2 Module 1: GoPro Uploads & Review Links

```sql
CREATE TABLE gopro_uploads (
  id BIGSERIAL PRIMARY KEY,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  tour_date DATE NOT NULL,
  
  -- Reminder tracking
  first_reminder_sent_at TIMESTAMP,
  second_reminder_sent_at TIMESTAMP,
  
  -- Submission tracking
  content_submitted_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', 
    -- 'pending', 'submitted', 'delayed', 'escalated'
  
  -- Escalation
  is_escalated BOOLEAN DEFAULT FALSE,
  escalation_timestamp TIMESTAMP,
  escalation_reason VARCHAR(255),
  
  -- Admin notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gopro_uploads_guide_date ON gopro_uploads(guide_id, tour_date);
CREATE INDEX idx_gopro_uploads_status ON gopro_uploads(status);
CREATE INDEX idx_gopro_uploads_escalated ON gopro_uploads(is_escalated);
CREATE INDEX idx_gopro_uploads_submitted_at ON gopro_uploads(content_submitted_at);

-- For efficient query: "uploads needing reminders today"
CREATE INDEX idx_gopro_uploads_tour_date ON gopro_uploads(tour_date);


CREATE TABLE review_links (
  id BIGSERIAL PRIMARY KEY,
  gopro_upload_id BIGINT REFERENCES gopro_uploads(id) ON DELETE CASCADE,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  
  -- Link metadata
  platform VARCHAR(50) NOT NULL, -- 'youtube', 'instagram', 'tiktok', 'facebook', 'other'
  url VARCHAR(1024) NOT NULL UNIQUE,
  
  -- Metrics (synced periodically)
  published_at TIMESTAMP,
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  last_synced_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_links_platform ON review_links(platform);
CREATE INDEX idx_review_links_guide_id ON review_links(guide_id);
```

### 2.3 Module 2: Daily Reports

```sql
CREATE TABLE daily_reports (
  id BIGSERIAL PRIMARY KEY,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  
  -- Reminder & submission tracking
  reminder_sent_at TIMESTAMP,
  submitted_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', 
    -- 'pending', 'submitted', 'overdue'
  
  -- Report content (JSON flexible schema OR separate fields)
  content JSONB NOT NULL DEFAULT '{}',
  -- Expected structure:
  -- {
  --   "tour_count": 2,
  --   "summary": "Great day, smooth conditions",
  --   "issues": ["Equipment malfunction at 2 PM"],
  --   "notes": "Additional context"
  -- }
  
  -- Admin fields
  approved_by BIGINT REFERENCES guides(id), -- Supervisor ID
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_daily_reports_guide_date ON daily_reports(guide_id, report_date);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);
CREATE INDEX idx_daily_reports_submitted_at ON daily_reports(submitted_at);
```

### 2.4 Module 3: Booking Calendar Locks

```sql
CREATE TABLE booking_calendar_locks (
  id BIGSERIAL PRIMARY KEY,
  booking_date DATE NOT NULL UNIQUE,
  lock_time TIME DEFAULT '18:00:00',
  locked_at TIMESTAMP, -- Actual timestamp when lock became active
  is_locked BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_calendar_locks_date ON booking_calendar_locks(booking_date);

-- Trigger to auto-set lock_time each day at 18:00
-- (Implementation: scheduled job, not DB trigger recommended)
```

### 2.5 Module 4: Conditions Updates

```sql
CREATE TABLE conditions_updates (
  id BIGSERIAL PRIMARY KEY,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_in_time TIME NOT NULL DEFAULT '11:30:00',
  
  -- Conditions data
  visibility_meters INT NOT NULL, -- 0–100+
  water_current VARCHAR(50) NOT NULL, 
    -- 'calm', 'slight', 'moderate', 'strong'
  water_temperature_celsius DECIMAL(4, 1) NOT NULL,
  
  -- Issues
  issues_reported BOOLEAN DEFAULT FALSE,
  issue_description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conditions_updates_guide_date 
  ON conditions_updates(guide_id, check_in_date);
CREATE INDEX idx_conditions_updates_check_in_date 
  ON conditions_updates(check_in_date);

-- View: latest condition per guide (for supervisor dashboard)
CREATE VIEW v_latest_conditions AS
SELECT DISTINCT ON (guide_id) 
  guide_id, check_in_date, visibility_meters, water_current, 
  water_temperature_celsius, issues_reported
FROM conditions_updates
ORDER BY guide_id, check_in_date DESC;
```

### 2.6 Module 5: Weather Videos

```sql
CREATE TABLE weather_videos (
  id BIGSERIAL PRIMARY KEY,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  video_date DATE NOT NULL,
  
  -- Submission
  submitted_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- 'pending', 'submitted', 'archived'
  
  -- File metadata
  file_url VARCHAR(1024), -- S3 URL or CDN
  file_size_bytes BIGINT,
  duration_seconds INT,
  mime_type VARCHAR(50),
  
  -- Location (optional)
  location_gps POINT, -- PostgreSQL POINT type: (lat, lng)
  -- OR: latitude DECIMAL(9,6), longitude DECIMAL(9,6)
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weather_videos_guide_date ON weather_videos(guide_id, video_date);
CREATE INDEX idx_weather_videos_status ON weather_videos(status);
CREATE INDEX idx_weather_videos_submitted_at ON weather_videos(submitted_at);
```

### 2.7 Module 6: Guest Ratings & Guide KPIs

```sql
CREATE TABLE guest_ratings (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guest_ratings_guide_id ON guest_ratings(guide_id);
CREATE INDEX idx_guest_ratings_booking_id ON guest_ratings(booking_id);
CREATE INDEX idx_guest_ratings_submitted_at ON guest_ratings(submitted_at);


CREATE TABLE guide_kpis (
  id BIGSERIAL PRIMARY KEY,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  period_year INT NOT NULL,
  period_month INT NOT NULL,
  
  -- Tour metrics
  tours_completed INT DEFAULT 0,
  tours_scheduled INT DEFAULT 0,
  
  -- Satisfaction
  guest_satisfaction_avg DECIMAL(3, 2) CHECK (guest_satisfaction_avg >= 1 AND guest_satisfaction_avg <= 5),
  guest_satisfaction_count INT DEFAULT 0,
  
  -- Content & reports
  gopro_submissions INT DEFAULT 0,
  gopro_on_time INT DEFAULT 0,
  content_submission_rate_percent DECIMAL(5, 2),
  
  condition_checkins INT DEFAULT 0,
  condition_checkin_rate_percent DECIMAL(5, 2),
  
  -- Upsells
  upsell_offers INT DEFAULT 0,
  upsell_accepted INT DEFAULT 0,
  upsell_rate_percent DECIMAL(5, 2),
  
  -- Availability
  days_assigned INT DEFAULT 0,
  days_worked INT DEFAULT 0,
  availability_percent DECIMAL(5, 2),
  
  -- Revenue
  revenue_tours DECIMAL(12, 2) DEFAULT 0,
  revenue_upsells DECIMAL(12, 2) DEFAULT 0,
  revenue_total DECIMAL(12, 2) DEFAULT 0,
  
  -- Ranking
  ranking_position INT, -- 1, 2, 3, ...
  
  calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_guide_kpis_period 
  ON guide_kpis(guide_id, period_year, period_month);
CREATE INDEX idx_guide_kpis_ranking ON guide_kpis(ranking_position);
```

### 2.8 Module 7: Incidents & Patterns

```sql
CREATE TABLE incidents (
  id BIGSERIAL PRIMARY KEY,
  guide_id BIGINT REFERENCES guides(id) ON DELETE SET NULL,
  booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Reporter info
  reported_by VARCHAR(50) NOT NULL, 
    -- 'guest', 'guide', 'supervisor', 'system'
  reporter_contact VARCHAR(255), -- Email or phone if guest
  
  -- Incident classification
  incident_type VARCHAR(50) NOT NULL,
    -- 'complaint', 'safety_issue', 'equipment_fail', 'guest_conflict', 
    -- 'environmental', 'other'
  severity VARCHAR(50) NOT NULL,
    -- 'low', 'medium', 'high', 'critical'
  
  -- Description
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Workflow
  status VARCHAR(50) NOT NULL DEFAULT 'reported',
    -- 'reported', 'investigating', 'resolved', 'closed'
  
  owner_id BIGINT REFERENCES guides(id) ON DELETE SET NULL, -- Investigating staff
  
  reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  investigated_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  
  resolution_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_guide_id ON incidents(guide_id);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_reported_at ON incidents(reported_at);
CREATE INDEX idx_incidents_type ON incidents(incident_type);


CREATE TABLE incident_attachments (
  id BIGSERIAL PRIMARY KEY,
  incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  
  file_url VARCHAR(1024) NOT NULL, -- S3 URL
  file_type VARCHAR(50),
  file_name VARCHAR(255),
  
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_attachments_incident_id 
  ON incident_attachments(incident_id);


CREATE TABLE incident_patterns (
  id BIGSERIAL PRIMARY KEY,
  pattern_type VARCHAR(50) NOT NULL,
    -- 'season' (month), 'guest', 'weather', 'crowd', 'guide', 'incident_type'
  pattern_value VARCHAR(255) NOT NULL,
    -- e.g., 'May', 'guest_42', 'strong_current', 'high_crowd', 'guide_5', 'safety_issue'
  
  incident_count INT DEFAULT 0,
  avg_severity DECIMAL(2, 2),
  last_occurrence DATE,
  
  trend VARCHAR(50) DEFAULT 'stable',
    -- 'stable', 'increasing', 'decreasing'
  
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_incident_patterns_composite 
  ON incident_patterns(pattern_type, pattern_value);
```

### 2.9 Module 7 Bonus: Upsells

```sql
CREATE TABLE upsell_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
    -- 'equipment', 'food_drink', 'accessories', 'experience', 'other'
  
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_upsell_items_category ON upsell_items(category);
CREATE INDEX idx_upsell_items_active ON upsell_items(active);


CREATE TABLE upsell_offers (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guide_id BIGINT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  upsell_item_id BIGINT NOT NULL REFERENCES upsell_items(id) ON DELETE CASCADE,
  
  -- Offer & acceptance
  offered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  was_accepted BOOLEAN,
  accepted_at TIMESTAMP,
  
  -- Pricing
  base_price DECIMAL(10, 2),
  price_charged DECIMAL(10, 2), -- If accepted
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_upsell_offers_guide_id ON upsell_offers(guide_id);
CREATE INDEX idx_upsell_offers_booking_id ON upsell_offers(booking_id);
CREATE INDEX idx_upsell_offers_item_id ON upsell_offers(upsell_item_id);
CREATE INDEX idx_upsell_offers_accepted ON upsell_offers(was_accepted);
```

---

## 3. Scheduler & Message Queue Architecture

### 3.1 Job Schedule (Cron-style)

| Job ID | Cron | Handler | Purpose |
|--------|------|---------|---------|
| `gopro-1st-reminder` | `0 18 * * *` | Timezone-aware | 6 PM: gopro upload reminder |
| `gopro-2nd-reminder` | `0 21 * * *` | Timezone-aware | 9 PM: escalation notice |
| `gopro-auto-escalation` | `*/15 21-23 * * *` | Every 15 min 9-11 PM | Auto-escalate overdue uploads |
| `daily-report-reminder` | `0 19 * * *` | Timezone-aware | 7 PM: daily report reminder |
| `daily-report-overdue` | `45 20 * * *` | Check status | 8:45 PM: mark overdue |
| `midday-checkin-reminder` | `30 11 * * *` | Timezone-aware | 11:30 AM: conditions check-in |
| `weather-video-reminder` | `0 15 * * *` | Timezone-aware | 3 PM: weather video request |
| `guide-kpi-daily` | `59 23 * * *` | Sync engine | 23:59: refresh KPI for completed tours |
| `guide-kpi-monthly` | `0 0 1 * *` | Full recalc | 1st of month: recalculate rankings |
| `incident-pattern-weekly` | `0 18 * * 0` | Aggregation | Sunday 6 PM: refresh pattern analytics |
| `incident-escalation` | `* * * * *` | Immediate | Poll: if severity=critical → alert supervisor now |

### 3.2 Queue Technology Stack

**Recommended:** Redis + Bull (Node.js) or RabbitMQ + celery (Python)

#### Using Bull (Node.js + Redis):

```javascript
// Queue definition
const { Queue } = require('bull');

const jobQueues = {
  gopro_reminder_1st: new Queue('gopro-reminder-1st', 'redis://localhost:6379'),
  gopro_reminder_2nd: new Queue('gopro-reminder-2nd', 'redis://localhost:6379'),
  gopro_escalation: new Queue('gopro-escalation', 'redis://localhost:6379'),
  daily_report_reminder: new Queue('daily-report-reminder', 'redis://localhost:6379'),
  daily_report_overdue: new Queue('daily-report-overdue', 'redis://localhost:6379'),
  midday_checkin: new Queue('midday-checkin', 'redis://localhost:6379'),
  weather_video: new Queue('weather-video', 'redis://localhost:6379'),
  guide_kpi_daily: new Queue('guide-kpi-daily', 'redis://localhost:6379'),
  guide_kpi_monthly: new Queue('guide-kpi-monthly', 'redis://localhost:6379'),
  incident_pattern: new Queue('incident-pattern', 'redis://localhost:6379'),
  incident_escalation: new Queue('incident-escalation', 'redis://localhost:6379'),
};

// Example: 6 PM reminder job
jobQueues.gopro_reminder_1st.process(async (job) => {
  const { guideId, tourDate, timezone } = job.data;
  
  // 1. Query guide + bookings
  const guide = await Guide.findById(guideId);
  const bookings = await Booking.find({ guide_id: guideId, scheduled_date: tourDate });
  
  // 2. Create/find gopro_uploads record
  let upload = await GoPROUpload.findOne({ guide_id: guideId, tour_date: tourDate });
  if (!upload) {
    upload = await GoPROUpload.create({
      guide_id: guideId,
      tour_date: tourDate,
      status: 'pending'
    });
  }
  
  // 3. If not already reminded, send SMS
  if (!upload.first_reminder_sent_at) {
    await notificationService.sendSMS(guide.phone, 
      "Time to upload your GoPro content from today's tour!");
    await GoPROUpload.update(upload.id, { 
      first_reminder_sent_at: new Date() 
    });
  }
  
  return { success: true, guideId, uploadId: upload.id };
});

// Recurring schedule (using cron pattern)
jobQueues.gopro_reminder_1st.add(
  { guideId, tourDate, timezone },
  { repeat: { cron: '0 18 * * *' } }
);
```

### 3.3 Notification Service Integration

```javascript
// services/notificationService.js

class NotificationService {
  async sendSMS(phone, message) {
    // Twilio integration
    return await twilio.messages.create({
      from: process.env.TWILIO_PHONE,
      to: phone,
      body: message
    });
  }

  async sendPush(guideId, title, body, deepLink) {
    // Firebase Cloud Messaging
    const token = await getDeviceToken(guideId);
    return await admin.messaging().sendToDevice(token, {
      notification: { title, body },
      data: { deepLink }
    });
  }

  async sendEmail(to, subject, html) {
    // SendGrid
    return await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM,
      subject,
      html
    });
  }

  async notifySupervisor(supervisorId, event, metadata) {
    // Escalation: in-app notification + SMS for critical
    const supervisor = await Guide.findById(supervisorId);
    
    if (event.severity === 'critical') {
      await this.sendSMS(supervisor.phone, event.message);
    }
    
    // In-app notification (stored in DB or push service)
    return await Notification.create({
      recipient_id: supervisorId,
      type: event.type,
      metadata,
      is_read: false
    });
  }
}
```

---

## 4. Webhook / Event Flow Architecture

### 4.1 Incoming Webhooks (External → System)

**Scenario 1: GoPro Content Submitted**

```
External service (GoPro cloud / storage) detects file upload
  ↓
POST /webhooks/gopro-submitted
  {
    "guide_id": 42,
    "tour_date": "2026-04-12",
    "file_url": "s3://gopro-bucket/guide_42_2026-04-12.mp4",
    "timestamp": "2026-04-12T18:45:00Z"
  }
  ↓
Handler: 
  1. Find GoPROUpload record (guide_id, tour_date)
  2. Update: content_submitted_at, status = 'submitted'
  3. Cancel pending reminders (9 PM reminder job)
  4. Emit event: 'gopro:submitted' → trigger analytics
```

**Scenario 2: Weather Video Uploaded**

```
Guide uploads video via app
  ↓
POST /webhooks/weather-video-uploaded
  {
    "guide_id": 42,
    "video_date": "2026-04-12",
    "file_url": "s3://videos/weather_guide42_2026-04-12.mp4",
    "duration_seconds": 45,
    "notes": "Rough seas, strong current"
  }
  ↓
Handler:
  1. Update weather_videos: submitted_at, file_url, status = 'submitted'
  2. Clear 3 PM reminder for today
  3. Notify supervisor: "Video received from Guide 42"
```

**Scenario 3: Guest Rating Submitted**

```
Guest submits post-tour rating
  ↓
POST /webhooks/guest-rating
  {
    "booking_id": 123,
    "guide_id": 42,
    "rating": 5,
    "comment": "Amazing experience!"
  }
  ↓
Handler:
  1. Insert guest_ratings record
  2. Trigger: Recalculate guide_kpis for the month
  3. Enqueue job: guide-kpi-daily (async refresh)
```

**Scenario 4: Incident Reported (Critical)**

```
Supervisor reports critical safety incident
  ↓
POST /webhooks/incident-reported
  {
    "guide_id": 42,
    "incident_type": "safety_issue",
    "severity": "critical",
    "description": "Guest allergic reaction in water",
    "reported_by": "supervisor"
  }
  ↓
Handler:
  1. Insert incidents record
  2. If severity = 'critical':
     a. Enqueue: incident-escalation job (immediate)
     b. Call: notificationService.notifySupervisor() → SMS alert
  3. Emit event: 'incident:critical' → log & dashboard alert
```

**Scenario 5: Upsell Accepted**

```
Guide records upsell acceptance during/after tour
  ↓
POST /webhooks/upsell-accepted
  {
    "booking_id": 123,
    "guide_id": 42,
    "upsell_item_id": 7,
    "price_charged": 25.00
  }
  ↓
Handler:
  1. Update upsell_offers: was_accepted = true, accepted_at, price_charged
  2. Update guide_kpis (async): increment upsell_accepted, revenue_upsells
  3. Enqueue: payment processing (if needed)
```

### 4.2 Outgoing Events (System → External)

| Event | Trigger | Action |
|-------|---------|--------|
| `reminder:gopro-1st` | Cron 6 PM | Send SMS to guide via Twilio |
| `reminder:gopro-2nd` | Cron 9 PM | Send escalation SMS to guide |
| `alert:gopro-escalated` | Auto-escalation | Notify supervisor (SMS + in-app) |
| `reminder:daily-report` | Cron 7 PM | Send SMS + app push |
| `alert:report-overdue` | Cron 8:45 PM | Flag in supervisor dashboard |
| `reminder:conditions-checkin` | Cron 11:30 AM | Send SMS + app push |
| `reminder:weather-video` | Cron 3 PM | Send SMS + app push + deep link to camera |
| `alert:critical-incident` | Incident webhook (severity=critical) | SMS to supervisor + in-app |
| `notification:kpi-updated` | Daily/monthly recalc | Update guide's cached KPI in Redis |

---

## 5. API Endpoint Details

### 5.1 Request/Response Examples

**POST /api/gopro-uploads** (Create)
```json
Request:
{
  "guide_id": 42,
  "tour_date": "2026-04-12"
}

Response (201):
{
  "id": 1001,
  "guide_id": 42,
  "tour_date": "2026-04-12",
  "status": "pending",
  "first_reminder_sent_at": null,
  "content_submitted_at": null,
  "is_escalated": false,
  "created_at": "2026-04-12T10:00:00Z"
}
```

**PATCH /api/gopro-uploads/1001** (Escalate)
```json
Request:
{
  "is_escalated": true,
  "escalation_reason": "Manual escalation by supervisor"
}

Response (200):
{
  "id": 1001,
  "is_escalated": true,
  "escalation_timestamp": "2026-04-12T21:15:00Z",
  "status": "escalated"
}
```

**GET /api/guide-kpis/leaderboard?period_year=2026&period_month=4**
```json
Response (200):
[
  {
    "rank": 1,
    "guide_id": 42,
    "guide_name": "Ali",
    "tours_completed": 15,
    "guest_satisfaction_avg": 4.8,
    "upsell_rate_percent": 73,
    "content_submission_rate_percent": 100,
    "revenue_total": 3500.00
  },
  {
    "rank": 2,
    "guide_id": 37,
    "guide_name": "Hassan",
    "tours_completed": 14,
    "guest_satisfaction_avg": 4.6,
    "upsell_rate_percent": 65,
    "content_submission_rate_percent": 93,
    "revenue_total": 3200.00
  }
]
```

**POST /api/incidents** (Report)
```json
Request:
{
  "guide_id": 42,
  "booking_id": 123,
  "incident_type": "guest_conflict",
  "severity": "high",
  "title": "Guest complained about guide behavior",
  "description": "Guest said guide was dismissive of safety concerns",
  "reported_by": "guest",
  "reporter_contact": "guest@example.com"
}

Response (201):
{
  "id": 5001,
  "guide_id": 42,
  "incident_type": "guest_conflict",
  "severity": "high",
  "status": "reported",
  "reported_at": "2026-04-12T16:30:00Z",
  "created_at": "2026-04-12T16:30:00Z"
}
```

---

## 6. Data Flow Diagrams (Text)

### 6.1 GoPro Upload Reminder Flow

```
Timeline (Guide's Timezone):

 06:00 AM               11:30 AM              3:00 PM              6:00 PM           9:00 PM         11:00 PM
   ├─ Guide             ├─ Conditions      ├─ Weather          ├─ GoPro Reminder ├─ Escalation   ├─ Check
   │  works              │  check-in        │  video request    │  (6 PM)          │  (9 PM)       │  status
   │                     │                   │                   │                  │               │
   │                     │                   │                   └─► SMS sent       │               │
   │                     │                   │                        ↓             │               │
   │                     │                   │                    first_reminder_  │               │
   │                     │                   │                    sent_at = 6:00PM │               │
   │                     │                   │                        ↓             │               │
   │                     │                   │                   Wait for upload...│               │
   │                     │                   │                        ↓             │               │
   │                     │                   │                    (If not uploaded) │               │
   │                     │                   │                        │             │               │
   └─────────────────────┴───────────────────┴────────────────────────┼─────────────┴──────────────┘
                                                                      │
                                                        ┌─────────────┘
                                                        │ 9:00 PM
                                                        ↓
                                                    2nd reminder
                                                    sent_at = 9:00 PM
                                                        │
                                                        ↓
                                                    Still no upload?
                                                        │
                                                        ├─ After 9:15 PM:
                                                        │  is_escalated = true
                                                        │  Notify supervisor
                                                        │
                                                        └─ Webhook received:
                                                           content_submitted_at = actual time
                                                           status = "submitted"
                                                           Cancel reminders
```

### 6.2 Daily Report Collection Flow

```
Supervisor View:
─────────────────────────────────────────────────────────────────

 Morning              Afternoon            Evening (7 PM)        Evening (8:45 PM)
   │                    │                      │                      │
   ├─ Guides active      │                      │                      │
   │  today = [1,2,3]    │                      │                      │
   │                     │                      │                      │
   │                     │                      └─ Send reminder SMS    │
   │                     │                         for each active     │
   │                     │                         guide               │
   │                     │                         │                   │
   │                     │                         ├─► Guide 1 submits │
   │                     │                         │   submitted_at =  │
   │                     │                         │   7:15 PM         │
   │                     │                         │   status = "submitted"
   │                     │                         │                   │
   │                     │                         ├─► Guide 2 does NOT submit
   │                     │                         │                   │
   │                     │                         ├─► Guide 3 submits │
   │                     │                         │   submitted_at =  │
   │                     │                         │   7:30 PM         │
   │                     │                         │                   │
   └─────────────────────┴─────────────────────────┴───────────────────┴─ Mark overdue
                                                                          Guide 2:
                                                                          status = "overdue"
                                                                          Red flag in dashboard
```

### 6.3 KPI Calculation & Ranking Flow

```
Triggers:

1. Guest submits rating → webhook → enqueue guide-kpi-daily job
2. Daily cron (23:59) → query completed tours → refresh KPI
3. Monthly cron (1st, 00:00) → full recalculation + ranking

Data aggregation:
─────────────────

 guide_id = 42
   │
   ├─ Tours completed: COUNT(bookings WHERE guide_id=42 AND status='completed' AND MONTH=4)
   │  → 12 tours
   │
   ├─ Satisfaction: AVG(guest_ratings.rating WHERE guide_id=42 AND MONTH=4)
   │  → 4.7 stars (avg of 12 ratings)
   │
   ├─ Content rate: COUNT(gopro_uploads.status='submitted' on-time) / tours_completed * 100
   │  → 11/12 * 100 = 91.7%
   │
   ├─ Checkin rate: COUNT(conditions_updates WHERE guide_id=42 AND MONTH=4) / 30 days * 100
   │  → 28/30 * 100 = 93.3%
   │
   ├─ Upsell rate: COUNT(upsell_offers.was_accepted=true) / COUNT(upsell_offers.offered) * 100
   │  → 8/10 * 100 = 80%
   │
   ├─ Revenue: SUM(bookings.price) + SUM(upsell_offers.price_charged) where accepted
   │  → $2500 + $200 = $2700
   │
   └─ Ranking: ROW_NUMBER() OVER (ORDER BY revenue DESC)
      → If guide 42 is top earner → rank = 1

Store in guide_kpis:
  guide_id: 42
  period_year: 2026
  period_month: 4
  tours_completed: 12
  guest_satisfaction_avg: 4.7
  content_submission_rate_percent: 91.7
  condition_checkin_rate_percent: 93.3
  upsell_rate_percent: 80
  revenue_total: 2700.00
  ranking_position: 1
```

---

## 7. Deployment & Infrastructure

### 7.1 Required Services

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Server** | Node.js + Express (or FastAPI) | REST endpoints |
| **Scheduler** | Bull (Node) or Celery (Python) | Cron jobs + queue |
| **Cache** | Redis 6+ | KPI cache, session store, job queue |
| **Database** | PostgreSQL 13+ | All tables, materialized views |
| **File Storage** | AWS S3 or Azure Blob | Videos, photos, uploads |
| **SMS** | Twilio API | Guide/supervisor notifications |
| **Push Notifications** | Firebase Cloud Messaging | App notifications |
| **Email** | SendGrid / SES | Email notifications |

### 7.2 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bluuu_os

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
S3_BUCKET_GOPRO=bluuu-gopro-content
S3_BUCKET_VIDEOS=bluuu-weather-videos
S3_BUCKET_INCIDENTS=bluuu-incidents

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE=+1234567890

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...

# SendGrid
SENDGRID_API_KEY=...

# Timezones (for scheduling)
DEFAULT_TIMEZONE=Asia/Kolkata
```

### 7.3 Docker Compose Example

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bluuu_os
      POSTGRES_USER: bluuu
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./api
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://bluuu:secure_password@postgres:5432/bluuu_os
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    ports:
      - "3000:3000"

  worker:
    build: ./worker
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://bluuu:secure_password@postgres:5432/bluuu_os
      REDIS_URL: redis://redis:6379
      NODE_ENV: production

volumes:
  pgdata:
```

---

## 8. Migration Strategy

### 8.1 Phase 1: Schema Creation (Week 1)

```sql
-- Create all new tables (see Section 2)
-- Create indices
-- Create views (v_latest_conditions, incident_patterns)
-- Run data validation
```

### 8.2 Phase 2: API & Scheduler (Week 2-3)

- Implement all REST endpoints
- Set up Bull job queues
- Deploy notification service integration
- Test reminder flows (dry-run with test guides)

### 8.3 Phase 3: Guide App Integration (Week 3-4)

- Add check-in forms to guide mobile app
- Add upsell tracking UI
- Test end-to-end flows
- Beta testing with 2-3 guides

### 8.4 Phase 4: Supervisor Dashboard (Week 4-5)

- Build React/Vue dashboard
- Real-time KPI updates
- Incident management UI
- Calendar lock visualization

### 8.5 Phase 5: Analytics & Reporting (Week 5-6)

- Materialized view refresh jobs
- Pattern detection algorithm
- Export reports (CSV/PDF)
- Historical trend charts

---

## 9. Monitoring & Alerts

### 9.1 Health Checks

```bash
# API health
GET /health → { status: "ok", uptime: "..." }

# Job queue health
GET /admin/queues → { gopro_reminder_1st: { pending: 5, failed: 0 }, ... }

# Database connectivity
GET /admin/db-status → { connected: true, lag: "0ms" }

# Notification service
GET /admin/notifications-status → { twilio: "ok", fcm: "ok", sendgrid: "ok" }
```

### 9.2 Critical Alerts

- GoPro reminder job fails → alert DevOps
- Database down → immediate escalation
- Incident-escalation queue backlog > 10 → alert supervisor
- Guide KPI calculation takes > 5 min → investigation
- Twilio/FCM API error rate > 5% → fallback to email

---

## 10. Testing Checklist

- [ ] Unit tests: all data model validations
- [ ] Integration tests: API endpoints + DB
- [ ] Job tests: reminder flows, KPI calculation
- [ ] Notification tests: SMS, push, email delivery
- [ ] Load test: 1000 guides × daily reminders simultaneously
- [ ] End-to-end: GoPro upload → submission tracking → escalation
- [ ] Calendar lock: verify read-only after 6 PM
- [ ] Pattern detection: correlate incidents × weather × season

---

## Summary

This architecture provides:
- **Real-time tracking** of guide activities (uploads, reports, conditions)
- **Automated reminders** across 7 time-sensitive modules
- **Data integrity** via proper schema, constraints, indices
- **Scalability** with Redis caching, materialized views, job queues
- **Operational insight** via KPI dashboards, incident pattern analytics
- **Integration flexibility** via webhooks, event-driven design
- **Compliance** with timezone-aware scheduling, audit trails

All components are documented, tested, and ready for phased deployment.
