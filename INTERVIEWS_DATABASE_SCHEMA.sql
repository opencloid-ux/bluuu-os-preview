
-- Guides Interview Analysis Database Schema

-- Guides table with derived data from interviews
CREATE TABLE IF NOT EXISTS guides (
    guide_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    interview_size_kb DECIMAL(5,1),
    languages TEXT[],
    specializations TEXT[],
    team_satisfaction_level VARCHAR(20),
    review_engagement BOOLEAN,
    operational_notes TEXT,
    interviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operational tasks/processes
CREATE TABLE IF NOT EXISTS operational_processes (
    process_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50),
    responsible_roles TEXT[],
    critical_flag BOOLEAN,
    automation_status VARCHAR(50),
    guide_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guest information requirements
CREATE TABLE IF NOT EXISTS guest_requirements (
    requirement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_type VARCHAR(100),
    description TEXT,
    capture_method VARCHAR(100),
    is_critical BOOLEAN,
    guides_aware BOOLEAN,
    implementation_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pain points and issues identified
CREATE TABLE IF NOT EXISTS identified_issues (
    issue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100),
    issue_title VARCHAR(255),
    description TEXT,
    severity VARCHAR(20),
    frequency VARCHAR(20),
    impact_area VARCHAR(100),
    guides_reporting INT,
    proposed_solution TEXT,
    owner VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action items from analysis
CREATE TABLE IF NOT EXISTS action_items (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority VARCHAR(20),
    category VARCHAR(100),
    action_title VARCHAR(255),
    details TEXT,
    owner VARCHAR(100),
    expected_impact TEXT,
    target_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview transcription index
CREATE TABLE IF NOT EXISTS interview_index (
    interview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_name VARCHAR(100),
    file_size_kb DECIMAL(5,1),
    themes TEXT[],
    pain_points TEXT[],
    operational_insights TEXT[],
    recommendations TEXT[],
    transcript_path VARCHAR(255),
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert guides data
INSERT INTO guides (name, interview_size_kb, specializations, team_satisfaction_level, review_engagement) VALUES
('Roby', 9.1, ARRAY['snorkeling', 'safety', 'guest_management'], 'high', true),
('Budi', 8.9, ARRAY['hospitality', 'guest_experience', 'medical_response'], 'high', true),
('Jena', 6.6, ARRAY['operations', 'safety', 'professionalism'], 'high', true),
('Nemo', 6.3, ARRAY['operations', 'communication', 'guest_prep'], 'medium', false),
('Aden', 6.1, ARRAY['snorkeling', 'marine_knowledge'], 'high', false),
('Derrick', 5.4, ARRAY['safety', 'operations'], 'high', false),
('Eric', 5.3, ARRAY['customer_service', 'guest_relations'], 'high', false),
('Nyoman', 5.0, ARRAY['operations', 'safety'], 'high', false),
('Gio', 4.7, ARRAY['guest_management', 'communication'], 'medium', false),
('Aldo', 4.5, ARRAY['operations', 'safety'], 'high', false),
('Gede', 3.6, ARRAY['snorkeling', 'guide'], 'medium', false),
('Dena', 2.2, ARRAY['operations', 'support'], 'high', false),
('Krisna', 2.1, ARRAY['operations', 'guide'], 'high', false);

-- Insert identified issues
INSERT INTO identified_issues (category, issue_title, description, severity, frequency, impact_area, guides_reporting, proposed_solution, owner, status) VALUES
('Guest Information', 'Incomplete swimming experience data', 'Swimming level not consistently captured before trips', 'high', 'frequent', 'safety', 4, 'Add swimming level field to intake form', 'Operations', 'pending'),
('Guest Information', 'Missing physical limitations', 'Physical/mobility restrictions not documented', 'high', 'occasional', 'safety', 3, 'Enhance health questionnaire', 'Operations', 'pending'),
('Operations', 'Equipment failures during tours', 'Motor/mechanical failures disrupt guest experience', 'high', 'occasional', 'revenue', 2, 'Preventive maintenance program', 'Fleet Manager', 'pending'),
('Customer Service', 'Inadequate complaint response', 'Customer service not equipped for upset guests', 'high', 'occasional', 'reputation', 1, 'Empower CS team, improve protocols', 'Customer Service Manager', 'pending'),
('Infrastructure', 'Insufficient office facilities', 'High-season office overcrowding', 'medium', 'seasonal', 'operations', 1, 'Expand office space and facilities', 'Management', 'pending'),
('Guest Experience', 'Unmet wildlife sightings expectations', 'Guests disappointed when Manta/turtles not visible', 'medium', 'frequent', 'satisfaction', 2, 'Set realistic expectations upfront', 'Marketing', 'pending'),
('Guest Experience', 'Water condition complaints', 'Guests complain about water salinity/color', 'low', 'occasional', 'satisfaction', 1, 'Better weather/condition communication', 'Operations', 'pending'),
('Communication', 'Language barriers with guests', 'International guests with limited English', 'medium', 'frequent', 'experience', 2, 'Hire multilingual guides, translated materials', 'HR', 'pending'),
('Team', 'Water condition complaints', 'Team support could be stronger during operations', 'medium', 'occasional', 'operations', 1, 'Regular team sync meetings', 'Management', 'pending');

-- Insert operational processes
INSERT INTO operational_processes (name, description, frequency, responsible_roles, critical_flag, automation_status, guide_feedback) VALUES
('Schedule Checking', 'Check booking schedule day-before trip', 'daily', ARRAY['guide'], true, 'manual', 'Critical for preparation'),
('Guest Briefing at Harbor', 'Welcome guests, explain facilities, safety', 'per_trip', ARRAY['guide'], true, 'manual', 'Sets tone for experience'),
('Safety Equipment Check', 'Verify life jackets, first aid kits before departure', 'per_trip', ARRAY['guide', 'captain'], true, 'manual', 'Essential safety requirement'),
('Swimming Assessment', 'Assess guest swimming levels before snorkeling', 'per_trip', ARRAY['guide'], true, 'manual', 'Enables safe buddy assignments'),
('MOD/Gibran Communication', 'Update management on trip status and issues', 'as_needed', ARRAY['guide'], true, 'manual', 'Required for decision-making'),
('Daily Reporting', 'Submit post-trip report with observations', 'per_trip', ARRAY['guide'], true, 'manual', 'Standard operational procedure'),
('Medical Emergency Response', 'Direct to harbor/clinic if medical emergency', 'as_needed', ARRAY['guide', 'captain'], true, 'manual', 'Critical safety protocol'),
('Route/Spot Selection', 'Choose snorkeling spots based on weather/tide', 'per_trip', ARRAY['guide', 'captain'], true, 'manual', 'Requires real-time decision making');

-- Insert guest requirements
INSERT INTO guest_requirements (requirement_type, description, capture_method, is_critical, guides_aware, implementation_status) VALUES
('swimming_level', 'Guest swimming ability (non-swimmer to diver)', 'form', true, false, 'needs_implementation'),
('physical_limitations', 'Mobility/physical restrictions', 'form', true, false, 'needs_implementation'),
('medical_conditions', 'Allergies, medications, heart conditions', 'form', true, true, 'partial'),
('dietary_restrictions', 'Food allergies and dietary preferences', 'notification', true, true, 'implemented'),
('language_preference', 'Preferred language for guide', 'form', false, false, 'needs_implementation'),
('experience_level', 'Previous snorkeling experience', 'form', true, false, 'needs_implementation'),
('transportation', 'Self-arrival or shuttle pickup', 'notification', true, true, 'implemented'),
('group_composition', 'Family, couples, solo travelers', 'booking', false, false, 'not_tracked');

