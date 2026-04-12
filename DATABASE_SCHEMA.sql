-- ============================================================================
-- DATABASE_SCHEMA.sql — Bluuu OS Guide Management System
-- Version: 1.0 (April 2026)
-- Purpose: All tables for Gibran's 7 new modules + bonus upselling
-- ============================================================================

-- ============================================================================
-- 1. GoPro & Review Link Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS gopro_footage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  guide_id_1 UUID NOT NULL REFERENCES guides(id),
  guide_id_2 UUID REFERENCES guides(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Status of filming & uploading
  filming_status VARCHAR(50) NOT NULL DEFAULT 'not_shot' 
    CHECK (filming_status IN ('not_shot', 'uploading', 'pending_review', 'published', 'expired', 'lost')),
  
  -- Google Drive metadata
  google_drive_folder_id VARCHAR(255),
  google_drive_shared_link VARCHAR(500),
  footage_duration_seconds INT,
  file_count INT DEFAULT 0,
  file_names TEXT[],
  
  -- Timestamps
  shot_at TIMESTAMP,
  uploaded_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Review metadata
  reviewed_by_user_id UUID REFERENCES users(id),
  review_notes TEXT,
  guest_download_count INT DEFAULT 0,
  guest_last_accessed_at TIMESTAMP,
  
  -- Indexing
  created_idx BIGINT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM created_at)::bigint) STORED,
  
  CONSTRAINT gopro_footage_guides_check CHECK (
    (guide_id_2 IS NULL AND filming_status IS NOT NULL) OR
    (guide_id_2 IS NOT NULL)
  )
);

CREATE INDEX idx_gopro_tour_id ON gopro_footage(tour_id);
CREATE INDEX idx_gopro_guide_id_1 ON gopro_footage(guide_id_1);
CREATE INDEX idx_gopro_guide_id_2 ON gopro_footage(guide_id_2);
CREATE INDEX idx_gopro_filming_status ON gopro_footage(filming_status);
CREATE INDEX idx_gopro_published_at ON gopro_footage(published_at);
CREATE INDEX idx_gopro_expires_at ON gopro_footage(expires_at);

-- Notifications for GoPro upload reminders
CREATE TABLE IF NOT EXISTS gopro_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  footage_id UUID NOT NULL REFERENCES gopro_footage(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id),
  
  notification_type VARCHAR(50) NOT NULL 
    CHECK (notification_type IN ('upload_reminder_6pm', 'upload_reminder_9pm', 'published_to_guest')),
  
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  delivery_channel VARCHAR(50) DEFAULT 'whatsapp' 
    CHECK (delivery_channel IN ('whatsapp', 'email', 'in_app')),
  delivery_status VARCHAR(50) DEFAULT 'pending' 
    CHECK (delivery_status IN ('pending', 'sent', 'failed', 'undelivered')),
  
  retry_count INT DEFAULT 0 CHECK (retry_count >= 0),
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gopro_notif_footage ON gopro_notifications(footage_id);
CREATE INDEX idx_gopro_notif_guide ON gopro_notifications(guide_id);
CREATE INDEX idx_gopro_notif_scheduled ON gopro_notifications(scheduled_at);
CREATE INDEX idx_gopro_notif_status ON gopro_notifications(delivery_status);

-- Guest access to video links
CREATE TABLE IF NOT EXISTS guest_video_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  footage_id UUID NOT NULL REFERENCES gopro_footage(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  shared_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  download_count INT DEFAULT 0,
  last_accessed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guest_video_footage ON guest_video_access(footage_id);
CREATE INDEX idx_guest_video_booking ON guest_video_access(booking_id);
CREATE INDEX idx_guest_video_expires ON guest_video_access(expires_at);

-- ============================================================================
-- 2. Daily Report Reminder
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  guide_id_1 UUID NOT NULL REFERENCES guides(id),
  guide_id_2 UUID REFERENCES guides(id),
  
  -- Lifecycle
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  submitted_by_user_id UUID REFERENCES users(id),
  
  -- Route & Timing
  departure_time TIME,
  return_time TIME,
  route_points JSONB, -- [{ name, time_in, time_out }, ...]
  actual_departure TIMESTAMP,
  actual_return TIMESTAMP,
  
  -- Equipment Check
  towels_count INT,
  life_jackets_count INT,
  snorkel_gear_status VARCHAR(50) 
    CHECK (snorkel_gear_status IN ('complete', 'missing_item', 'not_checked', 'not_applicable')),
  equipment_notes TEXT,
  
  -- Incident & Notes
  guest_issues_text TEXT,
  weather_conditions_text TEXT,
  safety_concerns_text TEXT,
  special_moments_text TEXT,
  
  -- GoPro
  gopro_collected BOOLEAN,
  estimated_footage_duration INT,
  
  -- Status & Quality
  status VARCHAR(50) DEFAULT 'draft' 
    CHECK (status IN ('draft', 'submitted', 'overdue', 'reviewed')),
  data_quality_score INT CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  
  reviewed_by_user_id UUID REFERENCES users(id),
  review_notes TEXT
);

CREATE INDEX idx_report_tour ON daily_reports(tour_id);
CREATE INDEX idx_report_guide1 ON daily_reports(guide_id_1);
CREATE INDEX idx_report_guide2 ON daily_reports(guide_id_2);
CREATE INDEX idx_report_submitted_at ON daily_reports(submitted_at);
CREATE INDEX idx_report_status ON daily_reports(status);

-- Individual route points (denormalized for easy querying)
CREATE TABLE IF NOT EXISTS route_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  point_name VARCHAR(255) NOT NULL,
  time_in TIME NOT NULL,
  time_out TIME NOT NULL,
  order_index INT NOT NULL,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_report_order UNIQUE(daily_report_id, order_index)
);

CREATE INDEX idx_route_points_report ON route_points(daily_report_id);
CREATE INDEX idx_route_points_order ON route_points(order_index);

-- Reminders for daily report submission
CREATE TABLE IF NOT EXISTS report_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id),
  
  reminder_sequence INT NOT NULL CHECK (reminder_sequence > 0),
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  delivery_status VARCHAR(50) DEFAULT 'pending' 
    CHECK (delivery_status IN ('pending', 'sent', 'failed', 'acknowledged')),
  
  retry_count INT DEFAULT 0 CHECK (retry_count >= 0),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_remind_tour ON report_reminders(tour_id);
CREATE INDEX idx_remind_guide ON report_reminders(guide_id);
CREATE INDEX idx_remind_scheduled ON report_reminders(scheduled_at);

-- ============================================================================
-- 3. Booking Calendar (extends existing tours table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  
  -- Route & Weather
  recommended_route_points TEXT[],
  weather_forecast_swell_m DECIMAL(3, 2),
  weather_forecast_wind_knots INT CHECK (weather_forecast_wind_knots >= 0),
  weather_forecast_condition VARCHAR(50),
  recommended_weather_decision VARCHAR(100),
  
  -- Special requests
  bday_cake_requested BOOLEAN DEFAULT FALSE,
  photographer_requested BOOLEAN DEFAULT FALSE,
  dj_requested BOOLEAN DEFAULT FALSE,
  special_dietary_notes TEXT,
  
  -- Lunch coordination
  lunch_venue_id UUID REFERENCES restaurants(id),
  lunch_confirmed_at TIMESTAMP,
  lunch_cancellation_reason TEXT,
  lunch_guest_count INT,
  
  -- Retribution (extra charges)
  retribution_billed BOOLEAN DEFAULT FALSE,
  retribution_amount DECIMAL(10, 2),
  retribution_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT calendar_unique_tour UNIQUE(tour_id)
);

CREATE INDEX idx_calendar_tour ON calendar_metadata(tour_id);
CREATE INDEX idx_calendar_weather ON calendar_metadata(weather_forecast_condition);

-- ============================================================================
-- 4. Midday Check-in
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id),
  
  -- Timing
  scheduled_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP,
  
  -- Conditions
  sea_condition VARCHAR(50) NOT NULL 
    CHECK (sea_condition IN ('calm', 'choppy', 'rough', 'very_rough', 'unknown')),
  weather_condition VARCHAR(50) NOT NULL 
    CHECK (weather_condition IN ('sunny', 'cloudy', 'rainy', 'stormy', 'unknown')),
  visibility_underwater VARCHAR(50) 
    CHECK (visibility_underwater IN ('excellent', 'good', 'moderate', 'poor', 'unknown')),
  
  -- Route changes
  is_sticking_to_route BOOLEAN DEFAULT TRUE,
  route_change_reason VARCHAR(100),
  new_route_points TEXT[],
  current_location_gps POINT,
  eta_next_point TIMESTAMP,
  
  -- Guest status
  all_guests_okay BOOLEAN DEFAULT TRUE,
  guest_issue_type VARCHAR(100),
  issue_severity VARCHAR(20) CHECK (issue_severity IN ('low', 'medium', 'high')),
  action_taken TEXT,
  escalate_required BOOLEAN DEFAULT FALSE,
  
  -- Lunch changes
  lunch_time_change TIME,
  lunch_venue_change_id UUID REFERENCES restaurants(id),
  lunch_pax_change INT,
  
  -- Notes & metadata
  special_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checkin_tour ON daily_checkins(tour_id);
CREATE INDEX idx_checkin_guide ON daily_checkins(guide_id);
CREATE INDEX idx_checkin_submitted ON daily_checkins(submitted_at);
CREATE INDEX idx_checkin_severity ON daily_checkins(issue_severity);

-- Medical flags for individual guests
CREATE TABLE IF NOT EXISTS guest_medical_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  
  flag_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  
  reported_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reported_by_user_id UUID REFERENCES users(id),
  
  action_taken TEXT,
  resolved_at TIMESTAMP,
  resolution TEXT
);

CREATE INDEX idx_medical_flags_tour ON guest_medical_flags(tour_id);
CREATE INDEX idx_medical_flags_booking ON guest_medical_flags(booking_id);
CREATE INDEX idx_medical_flags_severity ON guest_medical_flags(severity);

-- ============================================================================
-- 5. Afternoon Weather Update
-- ============================================================================

CREATE TABLE IF NOT EXISTS weather_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  
  -- Timing
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  
  -- Current conditions
  sea_condition VARCHAR(50) 
    CHECK (sea_condition IN ('calm', 'slight', 'moderate', 'rough', 'very_rough')),
  swell_height_m DECIMAL(3, 2),
  wind_knots INT CHECK (wind_knots >= 0),
  wind_direction VARCHAR(5),
  visibility_underwater_m INT,
  temperature_c INT,
  uv_index INT,
  
  -- Forecast (next 2 hours)
  forecast_wind_knots_next_2h INT CHECK (forecast_wind_knots_next_2h >= 0),
  forecast_swell_m_next_2h DECIMAL(3, 2),
  forecast_rain_probability INT CHECK (forecast_rain_probability >= 0 AND forecast_rain_probability <= 100),
  forecast_condition_next_2h VARCHAR(50),
  
  -- Recommendations
  recommended_route TEXT,
  recommendation_sent_at TIMESTAMP,
  
  -- GoPro tracking
  gopro_status VARCHAR(50) 
    CHECK (gopro_status IN ('fully_collected', 'partially_collected', 'not_started', 'lost')),
  gopro_confirmed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_weather_tour ON weather_updates(tour_id);
CREATE INDEX idx_weather_scheduled ON weather_updates(scheduled_at);
CREATE INDEX idx_weather_gopro_status ON weather_updates(gopro_status);

-- Cache for weather API responses
CREATE TABLE IF NOT EXISTS weather_api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location VARCHAR(255) NOT NULL,
  
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  api_response JSONB NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_weather_cache_location_expires ON weather_api_cache(location, expires_at);

-- ============================================================================
-- 6. Guide Performance Dashboard
-- ============================================================================

CREATE TABLE IF NOT EXISTS guide_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id),
  metric_month DATE NOT NULL, -- first day of month (e.g., 2026-04-01)
  
  -- Reviews
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
  on_time_performance DECIMAL(5, 2) CHECK (on_time_performance >= 0 AND on_time_performance <= 100),
  average_tour_rating DECIMAL(3, 2),
  guest_satisfaction DECIMAL(5, 2) CHECK (guest_satisfaction >= 0 AND guest_satisfaction <= 100),
  
  -- Revenue
  gross_tour_revenue DECIMAL(10, 2) DEFAULT 0,
  guide_payout DECIMAL(10, 2) DEFAULT 0,
  bonus DECIMAL(10, 2) DEFAULT 0,
  total_earnings DECIMAL(10, 2) GENERATED ALWAYS AS (
    COALESCE(guide_payout, 0) + COALESCE(bonus, 0)
  ) STORED,
  
  -- Safety
  medical_incidents INT DEFAULT 0,
  equipment_damage_incidents INT DEFAULT 0,
  safety_violations INT DEFAULT 0,
  guest_complaints INT DEFAULT 0,
  complaints_resolved INT DEFAULT 0,
  
  -- Ranking
  ranking_position INT,
  ranking_tier VARCHAR(50), -- top_performer, solid, needs_improvement, at_risk
  award_name VARCHAR(255),
  
  -- Trends vs previous month
  vs_previous_month_rating_change DECIMAL(3, 2),
  vs_previous_month_reviews_change INT,
  vs_previous_month_tours_change INT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_guide_metric UNIQUE(guide_id, metric_month)
);

CREATE INDEX idx_perf_guide ON guide_performance_metrics(guide_id);
CREATE INDEX idx_perf_month ON guide_performance_metrics(metric_month);
CREATE INDEX idx_perf_ranking ON guide_performance_metrics(ranking_position);
CREATE INDEX idx_perf_rating ON guide_performance_metrics(average_rating DESC);

-- Review feedback tags
CREATE TABLE IF NOT EXISTS guide_review_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id),
  metric_month DATE NOT NULL,
  
  positive_tags TEXT[],
  negative_tags TEXT[],
  tag_counts JSONB, -- { "friendly": 12, "knowledgeable": 8, "late": 2 }
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_guide_feedback UNIQUE(guide_id, metric_month)
);

CREATE INDEX idx_feedback_guide_month ON guide_review_feedback(guide_id, metric_month);

-- Tour type performance breakdown
CREATE TABLE IF NOT EXISTS guide_tour_type_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id),
  metric_month DATE NOT NULL,
  tour_type VARCHAR(50) NOT NULL,
  
  tours_completed INT DEFAULT 0,
  average_rating DECIMAL(3, 2),
  guest_satisfaction DECIMAL(5, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_guide_type_month UNIQUE(guide_id, tour_type, metric_month)
);

CREATE INDEX idx_tourtype_guide_month ON guide_tour_type_performance(guide_id, metric_month);

-- ============================================================================
-- 7. Complaint/Incident Log
-- ============================================================================

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
  guide_id_primary UUID REFERENCES guides(id),
  guide_id_secondary UUID REFERENCES guides(id),
  
  -- Classification
  incident_type VARCHAR(100) NOT NULL 
    CHECK (incident_type IN ('complaint', 'medical', 'safety', 'equipment', 'environmental')),
  severity INT NOT NULL CHECK (severity >= 1 AND severity <= 5),
  
  -- Description
  description TEXT NOT NULL,
  time_occurred TIMESTAMP NOT NULL,
  
  -- Involved parties
  guest_name VARCHAR(255),
  guest_phone VARCHAR(20),
  guest_email VARCHAR(255),
  guest_nationality VARCHAR(50),
  
  -- Medical-specific
  medical_type VARCHAR(100),
  medical_first_aid_applied BOOLEAN DEFAULT FALSE,
  medical_professional_called BOOLEAN DEFAULT FALSE,
  medical_hospitalization BOOLEAN DEFAULT FALSE,
  medical_details TEXT,
  
  -- Safety-specific
  safety_reported_by VARCHAR(100),
  safety_corrective_action TEXT,
  
  -- Equipment-specific
  equipment_item VARCHAR(255),
  equipment_damage_type VARCHAR(100),
  equipment_repairable BOOLEAN,
  equipment_repair_cost DECIMAL(10, 2),
  equipment_repair_status VARCHAR(50) 
    CHECK (equipment_repair_status IN ('pending', 'in_repair', 'repaired', 'replaced', 'scrapped')),
  
  -- Environmental-specific
  environmental_condition TEXT,
  environmental_decision VARCHAR(100) 
    CHECK (environmental_decision IN ('proceed', 'modify_route', 'cancel')),
  guest_notification_sent BOOLEAN DEFAULT FALSE,
  
  -- Resolution
  resolution_status VARCHAR(50) DEFAULT 'open' 
    CHECK (resolution_status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
  resolution_date TIMESTAMP,
  resolution_text TEXT,
  compensation_type VARCHAR(50) 
    CHECK (compensation_type IN ('none', 'refund', 'voucher', 'free_tour', 'other')),
  compensation_amount DECIMAL(10, 2),
  
  -- Follow-up
  followup_required BOOLEAN DEFAULT FALSE,
  followup_date TIMESTAMP,
  followup_notes TEXT,
  
  -- Metadata
  reported_by_user_id UUID NOT NULL REFERENCES users(id),
  assigned_to_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_incident_tour ON incidents(tour_id);
CREATE INDEX idx_incident_guide_primary ON incidents(guide_id_primary);
CREATE INDEX idx_incident_guide_secondary ON incidents(guide_id_secondary);
CREATE INDEX idx_incident_severity ON incidents(severity);
CREATE INDEX idx_incident_status ON incidents(resolution_status);
CREATE INDEX idx_incident_time ON incidents(time_occurred);
CREATE INDEX idx_incident_type ON incidents(incident_type);

-- Pattern detection
CREATE TABLE IF NOT EXISTS incident_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pattern definition
  pattern_name VARCHAR(255) NOT NULL,
  pattern_type VARCHAR(100) NOT NULL 
    CHECK (pattern_type IN ('complaint', 'medical', 'safety', 'equipment', 'environmental')),
  
  -- Criteria
  filter_criteria JSONB NOT NULL,
  time_window_days INT NOT NULL CHECK (time_window_days > 0),
  threshold_count INT NOT NULL CHECK (threshold_count > 0),
  
  -- Status
  detected_date TIMESTAMP DEFAULT NOW(),
  incident_count INT DEFAULT 0,
  severity_average DECIMAL(3, 1),
  affected_guides UUID[],
  
  -- Alert
  alert_triggered BOOLEAN DEFAULT FALSE,
  alert_date TIMESTAMP,
  alert_sent_to_user_id UUID REFERENCES users(id),
  
  -- Resolution
  root_cause_hypothesis TEXT,
  corrective_action TEXT,
  resolved_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pattern_name ON incident_patterns(pattern_name);
CREATE INDEX idx_pattern_detected ON incident_patterns(detected_date);
CREATE INDEX idx_pattern_alert ON incident_patterns(alert_triggered);

-- Attachments for incidents
CREATE TABLE IF NOT EXISTS incident_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  
  attachment_type VARCHAR(50) NOT NULL 
    CHECK (attachment_type IN ('photo', 'document', 'audio', 'video', 'other')),
  file_path VARCHAR(500),
  s3_url VARCHAR(500),
  
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attachments_incident ON incident_attachments(incident_id);

-- ============================================================================
-- BONUS: Upselling Tracking per Guide
-- ============================================================================

CREATE TABLE IF NOT EXISTS upsell_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id),
  
  guide_id UUID NOT NULL REFERENCES guides(id),
  
  -- Upsell type
  upsell_type VARCHAR(100) NOT NULL,
  upsell_price DECIMAL(10, 2) NOT NULL CHECK (upsell_price >= 0),
  
  -- Status
  offered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP,
  
  -- Commission
  guide_commission_percentage INT CHECK (guide_commission_percentage >= 0 AND guide_commission_percentage <= 100),
  guide_commission_amount DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_upsell_guide ON upsell_offers(guide_id);
CREATE INDEX idx_upsell_booking ON upsell_offers(booking_id);
CREATE INDEX idx_upsell_tour ON upsell_offers(tour_id);
CREATE INDEX idx_upsell_accepted ON upsell_offers(accepted);
CREATE INDEX idx_upsell_offered_at ON upsell_offers(offered_at);

-- ============================================================================
-- MATERIALIZED VIEW: Guide Monthly Performance Summary
-- (Useful for dashboard / exports)
-- ============================================================================

CREATE OR REPLACE VIEW v_guide_performance_current_month AS
SELECT
  g.id AS guide_id,
  g.name AS guide_name,
  g.tier AS guide_tier,
  gpm.metric_month,
  gpm.average_rating,
  gpm.total_reviews,
  gpm.tours_completed,
  gpm.guest_satisfaction,
  gpm.total_earnings,
  gpm.ranking_position,
  gpm.ranking_tier,
  gpm.award_name,
  gpm.vs_previous_month_rating_change,
  gpm.vs_previous_month_reviews_change,
  gpm.vs_previous_month_tours_change
FROM guides g
LEFT JOIN guide_performance_metrics gpm 
  ON g.id = gpm.guide_id 
  AND gpm.metric_month = DATE_TRUNC('month', CURRENT_DATE)::DATE
WHERE g.status = 'active';

-- ============================================================================
-- MATERIALIZED VIEW: Incident Summary by Type
-- ============================================================================

CREATE OR REPLACE VIEW v_incident_summary AS
SELECT
  DATE_TRUNC('day', i.created_at)::DATE AS incident_date,
  i.incident_type,
  i.severity,
  COUNT(*) AS count,
  COUNT(DISTINCT i.guide_id_primary) AS unique_guides,
  COUNT(CASE WHEN i.resolution_status = 'resolved' THEN 1 END) AS resolved_count
FROM incidents i
WHERE i.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', i.created_at)::DATE, i.incident_type, i.severity
ORDER BY incident_date DESC;

-- ============================================================================
-- STORED PROCEDURES & FUNCTIONS
-- ============================================================================

-- Function: Auto-calculate data quality score for daily reports
CREATE OR REPLACE FUNCTION calculate_report_quality_score(
  departure_time_in TIME,
  return_time_in TIME,
  route_points_in JSONB,
  equipment_checked BOOLEAN,
  gopro_collected BOOLEAN
) RETURNS INT AS $$
DECLARE
  score INT := 0;
BEGIN
  -- Base score
  score := 50;
  
  -- Timing: +15 if valid
  IF departure_time_in IS NOT NULL AND return_time_in IS NOT NULL 
     AND departure_time_in < return_time_in THEN
    score := score + 15;
  END IF;
  
  -- Route points: +15 if 3+ points
  IF jsonb_array_length(route_points_in) >= 3 THEN
    score := score + 15;
  END IF;
  
  -- Equipment: +10 if checked
  IF equipment_checked THEN
    score := score + 10;
  END IF;
  
  -- GoPro: +10 if collected
  IF gopro_collected THEN
    score := score + 10;
  END IF;
  
  RETURN LEAST(100, GREATEST(0, score));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Check and flag medical emergencies
CREATE OR REPLACE FUNCTION check_medical_emergency(
  severity_in VARCHAR,
  medical_type_in VARCHAR,
  professional_called_in BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  -- Flag as emergency if high severity + medical type + professional not yet called
  RETURN (severity_in = 'high' AND medical_type_in IS NOT NULL AND NOT professional_called_in);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- GRANT STATEMENTS (Adjust roles as needed)
-- ============================================================================

-- Create roles if they don't exist
DO $$ BEGIN
  CREATE ROLE bluuu_os_app LOGIN PASSWORD 'changeme';
  EXCEPTION WHEN DUPLICATE_OBJECT THEN NULL;
END $$;

DO $$ BEGIN
  CREATE ROLE bluuu_os_read_only LOGIN PASSWORD 'changeme';
  EXCEPTION WHEN DUPLICATE_OBJECT THEN NULL;
END $$;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO bluuu_os_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bluuu_os_read_only;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

/*
MIGRATION HISTORY:
  - 2026-04-12 v1.0: Initial schema creation
    * 20+ tables for 7 modules + bonus
    * Foreign key constraints with CASCADE/RESTRICT
    * Comprehensive indexing
    * Sample materialized views & functions
    
FUTURE MIGRATIONS:
  - Add audit trail table for incident changes
  - Add webhook log table for external API calls
  - Consider partitioning daily_reports by date
  - Consider sharding incidents by tour_id
  - Add data retention policy (archive old records)
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
