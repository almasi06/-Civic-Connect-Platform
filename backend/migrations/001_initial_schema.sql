-- =============================================================================
-- CivicConnect — Initial Schema
-- Reproducible: applies to any fresh PostgreSQL 16 database.
-- Contains: schema (9 tables) + seed data (3 users, 5 teams).
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'field_worker')),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role) WHERE is_active = true;

-- ---------- TEAMS ----------
CREATE TABLE IF NOT EXISTS teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    department      VARCHAR(20) NOT NULL CHECK (department IN ('roads','electricity','water','waste','community')),
    contact_email   VARCHAR(255) NOT NULL DEFAULT '',
    contact_phone   VARCHAR(50) NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_department ON teams(department);

-- ---------- TEAM WORKERS ----------
CREATE TABLE IF NOT EXISTS team_workers (
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_workers_user ON team_workers(user_id);

-- ---------- REQUESTS ----------
CREATE TABLE IF NOT EXISTS requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number     VARCHAR(20) UNIQUE NOT NULL,
    category            VARCHAR(30) NOT NULL CHECK (category IN (
                            'pothole','traffic_light','waste','streetlight','water_leak',
                            'road_sign','sidewalk','blocked_drain','illegal_dumping',
                            'power_outage','vandalism','other'
                        )),
    description         TEXT NOT NULL DEFAULT '',
    lat                 DECIMAL(10, 8) NOT NULL,
    lng                 DECIMAL(11, 8) NOT NULL,
    photo               TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'submitted'
                            CHECK (status IN ('submitted','assigned','in_progress','resolved','rejected')),
    version             INTEGER NOT NULL DEFAULT 1,
    reporter_device_id  VARCHAR(64) NOT NULL,
    source              VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (source = 'web'),
    sync_state          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (sync_state IN ('pending','synced')),
    assigned_to         UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_name       VARCHAR(255),
    team_leader_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_category ON requests(category);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_device ON requests(reporter_device_id);
CREATE INDEX IF NOT EXISTS idx_requests_assigned ON requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_requests_tracking ON requests(tracking_number);

-- ---------- REQUEST WORKERS ----------
CREATE TABLE IF NOT EXISTS request_workers (
    request_id      UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (request_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_request_workers_user ON request_workers(user_id);

-- ---------- REQUEST HISTORY ----------
CREATE TABLE IF NOT EXISTS request_history (
    id              BIGSERIAL PRIMARY KEY,
    request_id      UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL,
    by_name         VARCHAR(255) NOT NULL,
    note            TEXT,
    photo           TEXT,
    at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_request ON request_history(request_id, at ASC);

-- ---------- NOTIFICATIONS ----------
CREATE TABLE IF NOT EXISTS notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_device_id VARCHAR(64),
    request_id          UUID REFERENCES requests(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    body                TEXT NOT NULL,
    is_read             BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (recipient_id IS NOT NULL OR recipient_device_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_device ON notifications(recipient_device_id, is_read);

-- ---------- AUDIT HISTORY ----------
CREATE TABLE IF NOT EXISTS audit_history (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(20) NOT NULL,
    entity_id       UUID NOT NULL,
    action          VARCHAR(50) NOT NULL,
    actor_id        UUID REFERENCES users(id),
    actor_name      VARCHAR(255),
    before_state    JSONB,
    after_state     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_history(entity_type, entity_id, created_at DESC);

-- ---------- IDEMPOTENCY KEYS ----------
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key             VARCHAR(64) PRIMARY KEY,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    result          JSONB
);

-- =============================================================================
-- SEED DATA (idempotent)
-- =============================================================================

-- Users
INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'admin@tshwane.gov.za',
   '$2a$10$5wjxaOPGuoGeQQDuUC5wIer0JWvZbJGMi/Pof498sQ8rxN0PthaBu',
   'Municipal Administrator',
   'admin',
   true),
  ('22222222-2222-2222-2222-222222222222',
   'worker@tshwane.gov.za',
   '$2a$10$5zwN7mx9irmvBE6htt8vEe7ECKjxlIfl2cJyEJyHvoXrLG71FNs/.',
   'Thabo Mokoena',
   'field_worker',
   true),
  ('33333333-3333-3333-3333-333333333333',
   'worker2@tshwane.gov.za',
   '$2a$10$5zwN7mx9irmvBE6htt8vEe7ECKjxlIfl2cJyEJyHvoXrLG71FNs/.',
   'Lerato Dlamini',
   'field_worker',
   true)
ON CONFLICT (email) DO NOTHING;

-- Teams
INSERT INTO teams (id, name, description, department, contact_email, contact_phone) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Roads & Transport', 'Road maintenance, traffic signals, signs, and sidewalks.', 'roads', 'roads@tshwane.gov.za', ''),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Electricity Services', 'Street lighting and power infrastructure.', 'electricity', 'electricity@tshwane.gov.za', ''),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Water & Sanitation', 'Water leaks, drains, and sanitation infrastructure.', 'water', 'water@tshwane.gov.za', ''),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Waste Management', 'Waste collection and illegal dumping response.', 'waste', 'waste@tshwane.gov.za', ''),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Community Safety', 'Vandalism and community safety reports.', 'community', 'safety@tshwane.gov.za', '')
ON CONFLICT (id) DO NOTHING;

-- Team workers
INSERT INTO team_workers (team_id, user_id) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

COMMIT;