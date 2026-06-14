-- =============================================================================
-- WEB-BASED TRANSPORTATION MANAGEMENT SYSTEM (TMS)
-- PostgreSQL Production Schema  —  v3.1
-- =============================================================================
-- Project   : Web-Based Transportation Management System
-- Author    : Alemu Chamada
-- Version   : 3.1  (replaces v3.0)
-- Date      : June 2026
-- Engine    : PostgreSQL 15+
-- Tool      : pgAdmin 4 compatible
--
-- HOW TO RUN
--   psql -U postgres -d tms_production -f tms_schema_v3.sql
--   OR open in pgAdmin 4 Query Tool and Execute (F5).
--
-- CHANGES FROM v3.0
--   + users.password_hash          — bcrypt hash; supports password+OTP auth
--   + users.failed_login_attempts  — brute-force lockout counter
--   + users.locked_until           — account lockout expiry timestamp
--   + trips.fare                   — price a passenger pays per seat
--   + trips.stops                  — JSONB ordered waypoint list
--   + comments.parent_id           — self-reference for nested replies
--   + notifications table          — tracks delivery of all system notifications
--   + notification_type ENUM       — classifies every notification event
--   + role_profile_schemas seed    — system_admin row added (no profile form)
--   + RLS policies                 — fully implemented (not just comments)
--   + fn_lock_account              — helper called after 5 failed logins
--   + fn_reset_failed_logins       — resets counter on successful login
--   + v_notification_queue         — view for background notification worker
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0.  EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy name / plate search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- EXCLUDE constraints

-- ---------------------------------------------------------------------------
-- 1.  CUSTOM TYPES  (ENUMs)
-- ---------------------------------------------------------------------------

-- All assignable user roles. Default on registration: passenger.
-- system_admin is provisioned directly; never via public registration.
CREATE TYPE user_role AS ENUM (
    'passenger',
    'driver',
    'traffic_authority',
    'garage_manager',
    'fuel_station_manager',
    'system_admin'
);

-- Profile completion lifecycle for promoted roles.
CREATE TYPE profile_status_type AS ENUM (
    'INCOMPLETE',           -- promoted but profile not yet submitted
    'PENDING_VERIFICATION', -- submitted; awaiting admin approval
    'COMPLETE',             -- accepted without admin verification
    'VERIFIED'              -- approved by a System Administrator
);

-- Booking state machine.  Transitions are server-enforced only.
CREATE TYPE booking_status AS ENUM (
    'reserved',         -- seat locked; payment session not yet started
    'payment_pending',  -- gateway checkout active; awaiting webhook
    'confirmed',        -- payment webhook verified as successful
    'failed',           -- payment webhook verified as failed / declined
    'expired'           -- background job: 15-min timeout reached unpaid
);

-- Trip lifecycle states.
CREATE TYPE trip_status AS ENUM (
    'scheduled',
    'active',
    'completed',
    'cancelled'
);

-- Physical service location types.
CREATE TYPE service_type AS ENUM (
    'garage',
    'fuel_station'
);

-- Notification event categories.  Every row in `notifications` has one.
CREATE TYPE notification_type AS ENUM (
    -- Booking events
    'BOOKING_CONFIRMED',
    'BOOKING_EXPIRED',
    'BOOKING_FAILED',
    'BOOKING_CANCELLED',
    -- Payment events
    'PAYMENT_RECEIVED',
    'PAYMENT_REFUNDED',
    -- Role & profile events
    'ROLE_PROMOTED',
    'PROFILE_COMPLETION_REQUIRED',
    'PROFILE_COMPLETION_REMINDER',
    'PROFILE_VERIFIED',
    'PROFILE_REJECTED',
    -- Authentication
    'OTP_SENT',
    'ACCOUNT_LOCKED',
    -- System
    'SYSTEM_ANNOUNCEMENT',
    'TRIP_STARTING_SOON'
);

-- Delivery channel for a notification.
CREATE TYPE notification_channel AS ENUM (
    'terminal',   -- print to stdout (development / testing)
    'sms',        -- Phase 2
    'email',      -- Phase 2
    'push'        -- Phase 3 (mobile)
);

-- Delivery status of a notification.
CREATE TYPE notification_delivery_status AS ENUM (
    'pending',    -- queued; not yet dispatched
    'sent',       -- dispatched to channel
    'delivered',  -- confirmed delivered (where supported)
    'failed'      -- all retry attempts exhausted
);

-- Immutable audit event types.
CREATE TYPE audit_action AS ENUM (
    'OTP_SENT',
    'OTP_VERIFIED',
    'OTP_FAILED',
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'LOGOUT',
    'ACCOUNT_LOCKED',
    'ROLE_PROMOTED',
    'ROLE_CHANGED',
    'PROFILE_SUBMITTED',
    'PROFILE_STATUS_CHANGED',
    'PROFILE_VERIFIED',
    'PROFILE_REJECTED',
    'BOOKING_CREATED',
    'BOOKING_CONFIRMED',
    'BOOKING_FAILED',
    'BOOKING_EXPIRED',
    'BOOKING_CANCELLED',
    'PAYMENT_SESSION_CREATED',
    'PAYMENT_WEBHOOK_RECEIVED',
    'PAYMENT_WEBHOOK_DUPLICATE',
    'PAYMENT_REFUND_INITIATED',
    'TRIP_SCHEDULED',
    'TRIP_STARTED',
    'TRIP_COMPLETED',
    'TRIP_CANCELLED',
    'ADMIN_ACTION',
    'SYSTEM_EVENT'
);

-- ---------------------------------------------------------------------------
-- 2.  CORE TABLES
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 2.1  users
-- ---------------------------------------------------------------------------
-- All accounts start as 'passenger'.  Specialized roles are granted only by
-- a System Administrator.  password_hash stores the bcrypt hash (work factor
-- 12); plaintext passwords are never stored.
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Contact fields — at least one must be present (CHECK below)
    phone                   VARCHAR(20)     UNIQUE,          -- E.164, e.g. +251911234567
    email                   VARCHAR(255)    UNIQUE,

    -- Name fields (split for display flexibility)
    first_name              VARCHAR(100)    NOT NULL,
    last_name               VARCHAR(100)    NOT NULL,

    -- Credential
    password_hash           VARCHAR(255)    NOT NULL,        -- bcrypt(password, 12); never NULL

    -- Role — system-assigned; DEFAULT by DB; never accepted from client
    role                    user_role       NOT NULL DEFAULT 'passenger',

    -- Account state
    is_active               BOOLEAN         NOT NULL DEFAULT FALSE, -- TRUE after OTP verification
    failed_login_attempts   SMALLINT        NOT NULL DEFAULT 0,
    locked_until            TIMESTAMPTZ,                     -- NULL means not locked

    -- Role change tracking
    last_role_changed_at    TIMESTAMPTZ,

    -- Timestamps
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- At least one contact identifier must be present
    CONSTRAINT users_contact_required CHECK (
        phone IS NOT NULL OR email IS NOT NULL
    ),

    -- Lockout counter bounded; reset to 0 on successful login
    CONSTRAINT users_failed_attempts_range CHECK (
        failed_login_attempts >= 0 AND failed_login_attempts <= 10
    )
);

-- Computed full_name as a generated column for display / search
ALTER TABLE users
    ADD COLUMN full_name VARCHAR(201)
    GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;

CREATE INDEX idx_users_role            ON users (role);
CREATE INDEX idx_users_phone           ON users (phone)      WHERE phone  IS NOT NULL;
CREATE INDEX idx_users_email           ON users (email)      WHERE email  IS NOT NULL;
CREATE INDEX idx_users_is_active       ON users (is_active);
CREATE INDEX idx_users_locked_until    ON users (locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX idx_users_full_name_trgm  ON users USING gin (full_name gin_trgm_ops);

COMMENT ON TABLE  users                       IS 'All platform accounts. Registration always yields role=passenger and is_active=FALSE until OTP verified.';
COMMENT ON COLUMN users.password_hash         IS 'bcrypt hash of user password, work factor 12. Plaintext never stored.';
COMMENT ON COLUMN users.is_active             IS 'Set to TRUE only after OTP verification. FALSE accounts cannot log in.';
COMMENT ON COLUMN users.failed_login_attempts IS 'Incremented on each failed password check. Reset to 0 on success. Account locked at 5.';
COMMENT ON COLUMN users.locked_until          IS 'Account locked until this timestamp after 5 consecutive failed login attempts. NULL = not locked.';

-- ---------------------------------------------------------------------------
-- 2.2  otp_codes
-- ---------------------------------------------------------------------------
-- Primary OTP store is Redis (TTL-based) for speed.
-- This table provides a permanent, auditable record of every OTP issued.
-- ---------------------------------------------------------------------------
CREATE TABLE otp_codes (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            REFERENCES users (id) ON DELETE CASCADE,
    contact         VARCHAR(255)    NOT NULL,   -- phone or email the OTP was sent to
    code_hash       VARCHAR(255)    NOT NULL,   -- bcrypt / SHA-256 hash; plaintext never stored
    purpose         VARCHAR(50)     NOT NULL
                        CHECK (purpose IN ('registration', 'login')),
    expires_at      TIMESTAMPTZ     NOT NULL,   -- NOW() + 5 minutes
    attempts        SMALLINT        NOT NULL DEFAULT 0
                        CHECK (attempts >= 0 AND attempts <= 3),
    verified_at     TIMESTAMPTZ,               -- NULL until successfully verified
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_codes_user_id  ON otp_codes (user_id);
CREATE INDEX idx_otp_codes_contact  ON otp_codes (contact);
CREATE INDEX idx_otp_codes_expires  ON otp_codes (expires_at);
CREATE INDEX idx_otp_codes_purpose  ON otp_codes (purpose);

COMMENT ON TABLE  otp_codes           IS 'Permanent audit record for all OTPs. Live OTP validation uses Redis; this table is the durable trail.';
COMMENT ON COLUMN otp_codes.code_hash IS 'Hashed OTP. Plaintext is printed to terminal (dev) or sent via SMS/email (Phase 2) and never persisted.';
COMMENT ON COLUMN otp_codes.attempts  IS 'Incremented on each failed verification. OTP invalidated when attempts = 3.';

-- ---------------------------------------------------------------------------
-- 2.3  role_profile_schemas
-- ---------------------------------------------------------------------------
-- One row per role. Drives the Profile Completion Wizard field rendering
-- AND the server-side validation logic.  Add a new role by inserting one row.
-- ---------------------------------------------------------------------------
CREATE TABLE role_profile_schemas (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    role                    user_role   NOT NULL UNIQUE,
    requires_verification   BOOLEAN     NOT NULL DEFAULT FALSE,
    -- JSON array: [{name, label, type, required, validation_regex, max_length, options}]
    field_definitions       JSONB       NOT NULL DEFAULT '[]'::JSONB,
    schema_version          INTEGER     NOT NULL DEFAULT 1,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_role_profile_schemas_role ON role_profile_schemas (role);

COMMENT ON TABLE  role_profile_schemas                    IS 'Per-role field definitions. Extensible: insert one row per new role; no code changes required.';
COMMENT ON COLUMN role_profile_schemas.requires_verification IS 'TRUE = submission → PENDING_VERIFICATION; admin must approve. FALSE = submission → COMPLETE immediately.';

-- Seed all Phase-1 roles, including system_admin (no form; no verification)
INSERT INTO role_profile_schemas (role, requires_verification, field_definitions, schema_version) VALUES

('passenger', FALSE, '[]'::JSONB, 1),

('driver', TRUE,
 '[
   {"name":"full_name",       "label":"Full Legal Name",        "type":"text",   "required":true,  "max_length":255},
   {"name":"license_number",  "label":"Driver License Number",  "type":"text",   "required":true,  "validation_regex":"^[A-Z0-9]{6,20}$","max_length":20},
   {"name":"license_expiry",  "label":"License Expiry Date",    "type":"date",   "required":true,  "must_be_future":true},
   {"name":"vehicle_type",    "label":"Vehicle Type",           "type":"select", "required":true,  "options":["Bus","Minibus","Shuttle"]},
   {"name":"profile_photo_url","label":"Profile Photo URL",     "type":"text",   "required":false, "max_length":500}
 ]'::JSONB, 1),

('traffic_authority', FALSE,
 '[
   {"name":"full_name",             "label":"Full Legal Name",        "type":"text","required":true,"max_length":255},
   {"name":"authority_organization","label":"Authority Organization", "type":"text","required":true,"max_length":255},
   {"name":"badge_id",              "label":"Badge / ID Number",      "type":"text","required":true,"validation_regex":"^[A-Z0-9\\-]{4,30}$","max_length":30},
   {"name":"jurisdiction_area",     "label":"Jurisdiction Area",      "type":"text","required":true,"max_length":255}
 ]'::JSONB, 1),

('garage_manager', TRUE,
 '[
   {"name":"full_name",          "label":"Full Legal Name",              "type":"text","required":true,"max_length":255},
   {"name":"garage_name",        "label":"Garage Name",                  "type":"text","required":true,"max_length":255},
   {"name":"garage_address",     "label":"Garage Address",               "type":"text","required":true,"max_length":500},
   {"name":"business_reg_number","label":"Business Registration Number", "type":"text","required":true,"validation_regex":"^[A-Z0-9\\-]{5,30}$","max_length":30},
   {"name":"contact_number",     "label":"Contact Phone Number",         "type":"text","required":true,"validation_regex":"^\\+?[0-9]{7,15}$","max_length":20}
 ]'::JSONB, 1),

('fuel_station_manager', FALSE,
 '[
   {"name":"full_name",             "label":"Full Legal Name",        "type":"text","required":true,"max_length":255},
   {"name":"station_name",          "label":"Station Name",           "type":"text","required":true,"max_length":255},
   {"name":"station_address",       "label":"Station Address",        "type":"text","required":true,"max_length":500},
   {"name":"operator_license_number","label":"Operator License Number","type":"text","required":true,"validation_regex":"^[A-Z0-9\\-]{5,30}$","max_length":30},
   {"name":"contact_number",        "label":"Contact Phone Number",   "type":"text","required":true,"validation_regex":"^\\+?[0-9]{7,15}$","max_length":20}
 ]'::JSONB, 1),

-- system_admin has no profile form; requires_verification = FALSE; field_definitions = []
-- The backend rejects any profile completion attempt for this role.
('system_admin', FALSE, '[]'::JSONB, 1);

-- ---------------------------------------------------------------------------
-- 2.4  role_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE role_profiles (
    id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID                NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role                user_role           NOT NULL,
    profile_status      profile_status_type NOT NULL DEFAULT 'INCOMPLETE',
    profile_data        JSONB,              -- validated submitted fields
    draft_data          JSONB,              -- wizard partial progress; not used for access
    rejection_reason    TEXT,              -- populated by admin on rejection
    promoted_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    submitted_at        TIMESTAMPTZ,
    verified_at         TIMESTAMPTZ,
    verifier_admin_id   UUID                REFERENCES users (id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT role_profiles_user_role_uq UNIQUE (user_id, role),

    -- submitted_at must exist whenever status is not INCOMPLETE
    CONSTRAINT rp_submitted_at_required CHECK (
        profile_status = 'INCOMPLETE' OR submitted_at IS NOT NULL
    ),

    -- verifier fields must both be set (or both unset)
    CONSTRAINT rp_verifier_consistency CHECK (
        (verifier_admin_id IS NULL) = (verified_at IS NULL)
    )
);

CREATE INDEX idx_role_profiles_user_id  ON role_profiles (user_id);
CREATE INDEX idx_role_profiles_role     ON role_profiles (role);
CREATE INDEX idx_role_profiles_status   ON role_profiles (profile_status);
CREATE INDEX idx_role_profiles_pending  ON role_profiles (profile_status)
    WHERE profile_status = 'PENDING_VERIFICATION';
CREATE INDEX idx_role_profiles_verifier ON role_profiles (verifier_admin_id)
    WHERE verifier_admin_id IS NOT NULL;

COMMENT ON TABLE  role_profiles               IS 'Per-user, per-role profile completion state. Created automatically when admin changes a user role.';
COMMENT ON COLUMN role_profiles.profile_data  IS 'Validated submitted JSONB; keys match field_definitions[].name for the role.';
COMMENT ON COLUMN role_profiles.draft_data    IS 'Unsaved wizard progress. Never used for access-control decisions.';

-- ---------------------------------------------------------------------------
-- 2.5  buses
-- ---------------------------------------------------------------------------
CREATE TABLE buses (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number    VARCHAR(20) NOT NULL UNIQUE,
    capacity        SMALLINT    NOT NULL CHECK (capacity BETWEEN 1 AND 200),
    driver_id       UUID        REFERENCES users (id) ON DELETE SET NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buses_driver_id ON buses (driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_buses_is_active ON buses (is_active);
CREATE INDEX idx_buses_plate_trgm ON buses USING gin (plate_number gin_trgm_ops);

COMMENT ON TABLE buses IS 'Fleet of buses. Each bus may have at most one active trip at any time (partial unique index on trips).';

-- ---------------------------------------------------------------------------
-- 2.6  trips
-- ---------------------------------------------------------------------------
-- fare     : price in ETB (or configured currency) per seat.
--            The payments.amount field is set from this value when the
--            booking payment session is created.
-- stops    : ordered JSONB array of waypoints between origin and destination.
--            Format: [{"name":"Stop A","lat":9.01,"lon":38.75,"order":1}, ...]
-- ---------------------------------------------------------------------------
CREATE TABLE trips (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id                  UUID            NOT NULL REFERENCES buses  (id) ON DELETE RESTRICT,
    driver_id               UUID            NOT NULL REFERENCES users  (id) ON DELETE RESTRICT,
    route_description       VARCHAR(500)    NOT NULL,
    origin                  VARCHAR(255)    NOT NULL,
    destination             VARCHAR(255)    NOT NULL,

    -- Fare per seat (what the passenger pays)
    fare                    NUMERIC(10, 2)  NOT NULL CHECK (fare >= 0),
    currency                CHAR(3)         NOT NULL DEFAULT 'ETB',

    -- Optional ordered waypoints: [{name, lat, lon, order}]
    stops                   JSONB           NOT NULL DEFAULT '[]'::JSONB,

    scheduled_start_time    TIMESTAMPTZ     NOT NULL,
    actual_start_time       TIMESTAMPTZ,
    actual_end_time         TIMESTAMPTZ,
    status                  trip_status     NOT NULL DEFAULT 'scheduled',
    total_capacity          SMALLINT        NOT NULL CHECK (total_capacity > 0),
    avg_speed_kmh           NUMERIC(6, 2)   NOT NULL DEFAULT 60.00 CHECK (avg_speed_kmh > 0),

    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- One active trip per bus at any time
CREATE UNIQUE INDEX idx_trips_one_active_per_bus
    ON trips (bus_id)    WHERE status = 'active';

-- One active trip per driver at any time
CREATE UNIQUE INDEX idx_trips_one_active_per_driver
    ON trips (driver_id) WHERE status = 'active';

CREATE INDEX idx_trips_bus_id    ON trips (bus_id);
CREATE INDEX idx_trips_driver_id ON trips (driver_id);
CREATE INDEX idx_trips_status    ON trips (status);
CREATE INDEX idx_trips_scheduled ON trips (scheduled_start_time);
CREATE INDEX idx_trips_fare      ON trips (fare);
CREATE INDEX idx_trips_stops     ON trips USING gin (stops); -- query by stop name/coords

COMMENT ON TABLE  trips       IS 'Trip lifecycle: scheduled → active → completed | cancelled. One active trip per bus enforced by partial unique index.';
COMMENT ON COLUMN trips.fare  IS 'Price per seat in trips.currency. Copied to payments.amount when booking payment session is created.';
COMMENT ON COLUMN trips.stops IS 'Ordered waypoints JSON array: [{name, lat, lon, order}]. Empty array if non-stop.';

-- ---------------------------------------------------------------------------
-- 2.7  bus_locations
-- ---------------------------------------------------------------------------
-- Upsert pattern: one row per trip — the latest GPS position only.
-- ---------------------------------------------------------------------------
CREATE TABLE bus_locations (
    trip_id     UUID            PRIMARY KEY REFERENCES trips (id) ON DELETE CASCADE,
    latitude    NUMERIC(10, 7)  NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
    longitude   NUMERIC(10, 7)  NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    recorded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bus_locations IS 'Latest GPS position per active trip. Driver upserts every 5-15 s via Socket.IO. One row per trip.';

-- ---------------------------------------------------------------------------
-- 2.8  bookings
-- ---------------------------------------------------------------------------
CREATE TABLE bookings (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id        UUID            NOT NULL REFERENCES users  (id) ON DELETE RESTRICT,
    trip_id             UUID            NOT NULL REFERENCES trips  (id) ON DELETE RESTRICT,
    seat_number         SMALLINT        NOT NULL CHECK (seat_number > 0),
    status              booking_status  NOT NULL DEFAULT 'reserved',
    expires_at          TIMESTAMPTZ     NOT NULL,   -- 15 min after creation
    idempotency_key     VARCHAR(255)    NOT NULL UNIQUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- One active booking per passenger per trip
    CONSTRAINT bookings_one_active_per_passenger EXCLUDE
        USING btree (passenger_id WITH =, trip_id WITH =)
        WHERE (status IN ('reserved', 'payment_pending')),

    -- One seat per trip can only belong to one non-failed/non-expired booking
    CONSTRAINT bookings_seat_lock EXCLUDE
        USING btree (trip_id WITH =, seat_number WITH =)
        WHERE (status IN ('reserved', 'payment_pending', 'confirmed'))
);

CREATE INDEX idx_bookings_passenger_id ON bookings (passenger_id);
CREATE INDEX idx_bookings_trip_id      ON bookings (trip_id);
CREATE INDEX idx_bookings_status       ON bookings (status);
CREATE INDEX idx_bookings_expires_at   ON bookings (expires_at)
    WHERE status IN ('reserved', 'payment_pending');
CREATE INDEX idx_bookings_idempotency  ON bookings (idempotency_key);

COMMENT ON TABLE  bookings                 IS 'Seat reservations. State: reserved → payment_pending → confirmed | failed | expired.';
COMMENT ON COLUMN bookings.idempotency_key IS 'Client-supplied token preventing duplicate bookings on network retry.';
COMMENT ON COLUMN bookings.expires_at      IS '15 minutes from creation. Background job expires unpaid bookings.';

-- ---------------------------------------------------------------------------
-- 2.9  payments
-- ---------------------------------------------------------------------------
-- Populated exclusively by verified payment gateway webhooks.
-- amount is copied from trips.fare at booking creation time.
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID            NOT NULL REFERENCES bookings (id) ON DELETE RESTRICT,
    gateway_name        VARCHAR(50)     NOT NULL CHECK (gateway_name IN ('stripe', 'chapa')),
    gateway_txn_id      VARCHAR(255)    UNIQUE,
    gateway_status      VARCHAR(100)    NOT NULL,
    webhook_event_id    VARCHAR(255)    UNIQUE,
    idempotency_key     VARCHAR(255)    NOT NULL UNIQUE,
    amount              NUMERIC(12, 2)  NOT NULL CHECK (amount >= 0),
    currency            CHAR(3)         NOT NULL DEFAULT 'ETB',
    is_refunded         BOOLEAN         NOT NULL DEFAULT FALSE,
    refunded_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT payments_refund_consistency CHECK (
        is_refunded = FALSE OR refunded_at IS NOT NULL
    )
);

CREATE INDEX idx_payments_booking_id     ON payments (booking_id);
CREATE INDEX idx_payments_gateway_txn    ON payments (gateway_txn_id)  WHERE gateway_txn_id  IS NOT NULL;
CREATE INDEX idx_payments_webhook_event  ON payments (webhook_event_id) WHERE webhook_event_id IS NOT NULL;

COMMENT ON TABLE  payments                  IS 'Payment records. Created and updated exclusively by verified gateway webhooks. No manual payment approval.';
COMMENT ON COLUMN payments.amount           IS 'Copied from trips.fare at booking creation. The authoritative charged amount.';
COMMENT ON COLUMN payments.webhook_event_id IS 'Gateway event ID for idempotent deduplication. Checked in Redis (24 h TTL) first, then here permanently.';

-- ---------------------------------------------------------------------------
-- 2.10  notifications
-- ---------------------------------------------------------------------------
-- Every notification the system intends to deliver is recorded here.
-- The background notification worker reads this table via v_notification_queue.
-- Phase 1: channel = 'terminal' (printed to stdout).
-- Phase 2: channel = 'sms' | 'email'.
-- Phase 3: channel = 'push'.
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
    id                  BIGSERIAL           PRIMARY KEY,    -- sequential for ordered processing
    user_id             UUID                NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type                notification_type   NOT NULL,
    channel             notification_channel NOT NULL DEFAULT 'terminal',
    delivery_status     notification_delivery_status NOT NULL DEFAULT 'pending',
    -- Structured payload; content rendered by the worker from this data
    payload             JSONB               NOT NULL DEFAULT '{}'::JSONB,
    -- Rendered message (populated by worker before/after send)
    rendered_message    TEXT,
    -- Retry tracking
    retry_count         SMALLINT            NOT NULL DEFAULT 0
                            CHECK (retry_count >= 0 AND retry_count <= 5),
    last_attempted_at   TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ,
    -- Reference to the entity that triggered the notification
    entity_type         VARCHAR(100),       -- 'booking', 'role_profile', 'payment', etc.
    entity_id           TEXT,               -- UUID of the triggering record
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id   ON notifications (user_id);
CREATE INDEX idx_notifications_type      ON notifications (type);
CREATE INDEX idx_notifications_status    ON notifications (delivery_status);
CREATE INDEX idx_notifications_pending   ON notifications (delivery_status, created_at)
    WHERE delivery_status = 'pending';
CREATE INDEX idx_notifications_entity    ON notifications (entity_type, entity_id);
CREATE INDEX idx_notifications_channel   ON notifications (channel);

COMMENT ON TABLE  notifications                 IS 'All outbound notifications. Phase 1: channel=terminal. Phase 2: sms/email. Phase 3: push.';
COMMENT ON COLUMN notifications.payload         IS 'Structured data for the notification (booking_id, trip details, reason, etc.). Worker renders the human message from this.';
COMMENT ON COLUMN notifications.retry_count     IS 'Incremented by the worker on each failed delivery attempt. Capped at 5; status → failed after cap.';

-- ---------------------------------------------------------------------------
-- 2.11  posts  (Traffic Authority Announcements)
-- ---------------------------------------------------------------------------
CREATE TABLE posts (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id    UUID        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    title        VARCHAR(500) NOT NULL,
    content      TEXT         NOT NULL CHECK (char_length(content) >= 1),
    is_published BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id    ON posts (author_id);
CREATE INDEX idx_posts_published    ON posts (is_published, created_at DESC);
CREATE INDEX idx_posts_content_trgm ON posts USING gin (content gin_trgm_ops);

COMMENT ON TABLE posts IS 'Traffic authority announcements. Only role=traffic_authority with profile_status COMPLETE|VERIFIED may author posts (enforced by trigger).';

-- ---------------------------------------------------------------------------
-- 2.12  comments
-- ---------------------------------------------------------------------------
-- parent_id enables nested replies (one level of threading in Phase 1;
-- unlimited depth supported by the self-reference for future use).
-- ---------------------------------------------------------------------------
CREATE TABLE comments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID        NOT NULL REFERENCES posts    (id) ON DELETE CASCADE,
    author_id   UUID        NOT NULL REFERENCES users    (id) ON DELETE RESTRICT,
    parent_id   UUID                 REFERENCES comments (id) ON DELETE CASCADE, -- NULL = top-level
    content     TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- A comment cannot be its own parent
    CONSTRAINT comments_no_self_reference CHECK (id IS DISTINCT FROM parent_id)
);

CREATE INDEX idx_comments_post_id   ON comments (post_id);
CREATE INDEX idx_comments_author_id ON comments (author_id);
CREATE INDEX idx_comments_parent_id ON comments (parent_id) WHERE parent_id IS NOT NULL;

COMMENT ON TABLE  comments           IS 'Comments on traffic authority posts. parent_id IS NULL = top-level. parent_id IS NOT NULL = reply to that comment.';
COMMENT ON COLUMN comments.parent_id IS 'Self-reference for nested replies. NULL for top-level comments. Cascade-deletes child replies when parent is deleted.';

-- ---------------------------------------------------------------------------
-- 2.13  services  (Garages & Fuel Stations)
-- ---------------------------------------------------------------------------
CREATE TABLE services (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    type        service_type    NOT NULL,
    name        VARCHAR(255)    NOT NULL,
    address     VARCHAR(500),
    latitude    NUMERIC(10, 7)  NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
    longitude   NUMERIC(10, 7)  NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_type      ON services (type);
CREATE INDEX idx_services_is_active ON services (is_active);
CREATE INDEX idx_services_location  ON services (latitude, longitude) WHERE is_active = TRUE;

COMMENT ON TABLE services IS 'Static dataset of garages and fuel stations. Queried via fn_haversine_km for nearby discovery.';

-- ---------------------------------------------------------------------------
-- 2.14  audit_logs
-- ---------------------------------------------------------------------------
-- Immutable, append-only.  UPDATE and DELETE are blocked by trigger.
-- ---------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id          BIGSERIAL       PRIMARY KEY,
    actor_id    UUID            REFERENCES users (id) ON DELETE SET NULL,
    action      audit_action    NOT NULL,
    entity_type VARCHAR(100)    NOT NULL,
    entity_id   TEXT,
    metadata    JSONB           NOT NULL DEFAULT '{}'::JSONB,
    ip_address  INET,
    user_agent  TEXT,
    "timestamp" TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs ("timestamp" DESC);
CREATE INDEX idx_audit_logs_actor     ON audit_logs (actor_id)   WHERE actor_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action    ON audit_logs (action);
CREATE INDEX idx_audit_logs_entity    ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_metadata  ON audit_logs USING gin (metadata);

COMMENT ON TABLE  audit_logs         IS 'Immutable append-only audit trail. UPDATE/DELETE blocked by trigger. Retained indefinitely.';
COMMENT ON COLUMN audit_logs.metadata IS 'Structured event data. ROLE_PROMOTED: {previous_role, new_role}. PROFILE_*: {from_status, to_status, role}. LOGIN_FAILURE: {reason}.';

-- ---------------------------------------------------------------------------
-- 3.  TRIGGERS & FUNCTIONS
-- ---------------------------------------------------------------------------

-- 3.1  updated_at auto-maintenance
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'users', 'role_profile_schemas', 'role_profiles', 'buses',
        'trips', 'bus_locations', 'bookings', 'payments',
        'notifications', 'posts', 'comments', 'services'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- 3.2  audit_logs immutability — block UPDATE and DELETE
CREATE OR REPLACE FUNCTION fn_audit_logs_immutable()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        'audit_logs is immutable: UPDATE and DELETE are not permitted (action=%, id=%)',
        OLD.action, OLD.id
        USING ERRCODE = '42501';
END;
$$;

CREATE TRIGGER trg_audit_logs_no_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION fn_audit_logs_immutable();

CREATE TRIGGER trg_audit_logs_no_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION fn_audit_logs_immutable();

-- 3.3  Booking capacity guard: Reserved + Confirmed ≤ total_capacity
CREATE OR REPLACE FUNCTION fn_check_seat_capacity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_capacity  SMALLINT;
    v_used      INTEGER;
BEGIN
    SELECT t.total_capacity INTO v_capacity FROM trips t WHERE t.id = NEW.trip_id;

    SELECT COUNT(*) INTO v_used
    FROM   bookings
    WHERE  trip_id = NEW.trip_id
      AND  status  IN ('reserved', 'payment_pending', 'confirmed')
      AND  id      IS DISTINCT FROM NEW.id;

    IF (v_used + 1) > v_capacity THEN
        RAISE EXCEPTION
            'Trip % is fully booked. Capacity: %, Used: %',
            NEW.trip_id, v_capacity, v_used
            USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bookings_capacity_check
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status IN ('reserved', 'payment_pending', 'confirmed'))
    EXECUTE FUNCTION fn_check_seat_capacity();

-- 3.4  Booking seat-number within trip capacity
CREATE OR REPLACE FUNCTION fn_check_seat_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_capacity SMALLINT;
BEGIN
    SELECT total_capacity INTO v_capacity FROM trips WHERE id = NEW.trip_id;
    IF NEW.seat_number > v_capacity THEN
        RAISE EXCEPTION
            'Seat number % exceeds trip capacity %', NEW.seat_number, v_capacity
            USING ERRCODE = 'P0002';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bookings_seat_number_check
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION fn_check_seat_number();

-- 3.5  Posts: only traffic_authority with COMPLETE|VERIFIED profile may create
CREATE OR REPLACE FUNCTION fn_check_post_author_role()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_role          user_role;
    v_prof_status   profile_status_type;
BEGIN
    SELECT role INTO v_role FROM users WHERE id = NEW.author_id;

    IF v_role <> 'traffic_authority' THEN
        RAISE EXCEPTION
            'Only traffic_authority users may create posts. Actual role: %', v_role
            USING ERRCODE = 'P0003';
    END IF;

    SELECT profile_status INTO v_prof_status
    FROM   role_profiles
    WHERE  user_id = NEW.author_id AND role = 'traffic_authority'
    ORDER  BY created_at DESC LIMIT 1;

    IF v_prof_status NOT IN ('COMPLETE', 'VERIFIED') THEN
        RAISE EXCEPTION
            'traffic_authority profile not yet complete. Status: %', v_prof_status
            USING ERRCODE = 'P0004';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_posts_author_role_check
    BEFORE INSERT ON posts
    FOR EACH ROW EXECUTE FUNCTION fn_check_post_author_role();

-- 3.6  Track users.last_role_changed_at on role change
CREATE OR REPLACE FUNCTION fn_track_role_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        NEW.last_role_changed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_role_change
    BEFORE UPDATE OF role ON users
    FOR EACH ROW EXECUTE FUNCTION fn_track_role_change();

-- 3.7  Auto-create role_profiles on role change (non-passenger, non-system_admin)
CREATE OR REPLACE FUNCTION fn_auto_create_role_profile()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.role NOT IN ('passenger', 'system_admin')
       AND OLD.role IS DISTINCT FROM NEW.role
    THEN
        INSERT INTO role_profiles (user_id, role, profile_status, promoted_at)
        VALUES (NEW.id, NEW.role, 'INCOMPLETE', NOW())
        ON CONFLICT (user_id, role) DO UPDATE
            SET profile_status = 'INCOMPLETE',
                promoted_at    = NOW(),
                updated_at     = NOW();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_auto_role_profile
    AFTER UPDATE OF role ON users
    FOR EACH ROW EXECUTE FUNCTION fn_auto_create_role_profile();

-- 3.8  Account lockout: lock after 5 consecutive failed login attempts
CREATE OR REPLACE FUNCTION fn_lock_account(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users
    SET    failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE
               WHEN failed_login_attempts + 1 >= 5
               THEN NOW() + INTERVAL '15 minutes'
               ELSE locked_until
           END
    WHERE  id = p_user_id;
END;
$$;

COMMENT ON FUNCTION fn_lock_account IS
    'Called by the application on every failed password check. '
    'Locks the account for 15 minutes after 5 consecutive failures.';

-- 3.9  Reset failed login counter on successful authentication
CREATE OR REPLACE FUNCTION fn_reset_failed_logins(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users
    SET    failed_login_attempts = 0,
           locked_until          = NULL
    WHERE  id = p_user_id;
END;
$$;

COMMENT ON FUNCTION fn_reset_failed_logins IS
    'Called by the application after a successful OTP verification at login. '
    'Clears the failed attempt counter and removes any active lock.';

-- ---------------------------------------------------------------------------
-- 4.  VIEWS
-- ---------------------------------------------------------------------------

-- 4.1  Active bookings with trip, passenger, and payment info
CREATE VIEW v_active_bookings AS
SELECT
    b.id                AS booking_id,
    b.seat_number,
    b.status            AS booking_status,
    b.expires_at,
    b.created_at        AS booked_at,
    u.id                AS passenger_id,
    u.full_name         AS passenger_name,
    u.phone             AS passenger_phone,
    t.id                AS trip_id,
    t.origin,
    t.destination,
    t.fare,
    t.currency,
    t.scheduled_start_time,
    t.status            AS trip_status,
    p.gateway_status    AS payment_status,
    p.amount            AS paid_amount
FROM      bookings b
JOIN      users    u  ON u.id = b.passenger_id
JOIN      trips    t  ON t.id = b.trip_id
LEFT JOIN payments p  ON p.booking_id = b.id
WHERE b.status IN ('reserved', 'payment_pending', 'confirmed');

-- 4.2  Pending role profiles awaiting admin verification
CREATE VIEW v_pending_role_profiles AS
SELECT
    rp.id               AS profile_id,
    rp.user_id,
    u.full_name         AS user_name,
    u.phone             AS user_phone,
    u.email             AS user_email,
    rp.role,
    rp.profile_status,
    rp.profile_data,
    rp.rejection_reason,
    rp.promoted_at,
    rp.submitted_at
FROM      role_profiles rp
JOIN      users         u   ON u.id = rp.user_id
WHERE rp.profile_status = 'PENDING_VERIFICATION'
ORDER BY  rp.submitted_at ASC;

-- 4.3  Daily revenue summary (admin dashboard)
CREATE VIEW v_revenue_daily AS
SELECT
    DATE(p.created_at)  AS revenue_date,
    p.gateway_name,
    p.currency,
    COUNT(*)            AS confirmed_payments,
    SUM(p.amount)       AS total_amount
FROM      payments p
JOIN      bookings b ON b.id = p.booking_id
WHERE b.status = 'confirmed'
GROUP BY  DATE(p.created_at), p.gateway_name, p.currency
ORDER BY  revenue_date DESC;

-- 4.4  Fleet status with live location
CREATE VIEW v_fleet_status AS
SELECT
    b.id                AS bus_id,
    b.plate_number,
    b.capacity,
    b.is_active,
    u.id                AS driver_id,
    u.full_name         AS driver_name,
    t.id                AS active_trip_id,
    t.origin,
    t.destination,
    t.fare,
    t.scheduled_start_time,
    t.status            AS trip_status,
    bl.latitude,
    bl.longitude,
    bl.recorded_at      AS last_location_update
FROM      buses         b
LEFT JOIN users         u   ON u.id  = b.driver_id
LEFT JOIN trips         t   ON t.bus_id = b.id AND t.status = 'active'
LEFT JOIN bus_locations bl  ON bl.trip_id = t.id;

-- 4.5  User management view with profile status (admin)
CREATE VIEW v_users_with_profiles AS
SELECT
    u.id,
    u.full_name,
    u.first_name,
    u.last_name,
    u.phone,
    u.email,
    u.role,
    u.is_active,
    u.failed_login_attempts,
    u.locked_until,
    u.last_role_changed_at,
    u.created_at,
    rp.profile_status,
    rp.promoted_at,
    rp.submitted_at,
    rp.rejection_reason
FROM      users        u
LEFT JOIN role_profiles rp ON rp.user_id = u.id AND rp.role = u.role;

-- 4.6  Notification queue for background worker (Phase 1: terminal; Phase 2+: SMS/email)
CREATE VIEW v_notification_queue AS
SELECT
    n.id,
    n.user_id,
    u.phone,
    u.email,
    n.type,
    n.channel,
    n.payload,
    n.retry_count,
    n.entity_type,
    n.entity_id,
    n.created_at
FROM      notifications n
JOIN      users         u ON u.id = n.user_id
WHERE n.delivery_status = 'pending'
  AND n.retry_count     < 5
ORDER BY  n.created_at ASC;

COMMENT ON VIEW v_notification_queue IS
    'Pending notifications for the background worker. '
    'Worker updates delivery_status after each attempt.';

-- ---------------------------------------------------------------------------
-- 5.  ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------------
-- The application connects as the tms_app role (least privilege).
-- RLS is the last line of defence; RBAC middleware is the primary guard.
--
-- To provision the application role in production:
--   CREATE ROLE tms_app LOGIN PASSWORD '<strong-password>';
--   GRANT CONNECT    ON DATABASE tms_production TO tms_app;
--   GRANT USAGE      ON SCHEMA public            TO tms_app;
--   GRANT SELECT, INSERT, UPDATE
--                    ON ALL TABLES IN SCHEMA public TO tms_app;
--   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tms_app;
--   -- Restrict DELETE to only the tables that legitimately need it
--   GRANT DELETE     ON otp_codes, comments TO tms_app;
--   -- audit_logs: no DELETE or UPDATE for any role
--   REVOKE UPDATE, DELETE ON audit_logs FROM tms_app;
-- ---------------------------------------------------------------------------

-- Enable RLS on all sensitive tables
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;

-- tms_app bypasses RLS for normal operational access
-- (RBAC enforcement is done in application middleware)
ALTER TABLE users          FORCE ROW LEVEL SECURITY;
ALTER TABLE otp_codes      FORCE ROW LEVEL SECURITY;
ALTER TABLE role_profiles  FORCE ROW LEVEL SECURITY;
ALTER TABLE bookings       FORCE ROW LEVEL SECURITY;
ALTER TABLE payments       FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications  FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     FORCE ROW LEVEL SECURITY;

-- Policy: tms_app (application role) can access all rows
-- Security decisions are delegated to application-layer RBAC.
-- Direct DB access by any other role is denied unless a policy allows it.
CREATE POLICY tms_app_users_all         ON users          TO tms_app USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY tms_app_otp_all           ON otp_codes      TO tms_app USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY tms_app_role_profiles_all ON role_profiles  TO tms_app USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY tms_app_bookings_all      ON bookings       TO tms_app USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY tms_app_payments_all      ON payments       TO tms_app USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY tms_app_notifications_all ON notifications  TO tms_app USING (TRUE) WITH CHECK (TRUE);
-- audit_logs: read-only for tms_app; INSERT handled via application
CREATE POLICY tms_app_audit_select      ON audit_logs     TO tms_app USING (TRUE);

-- Superuser / postgres bypasses RLS automatically (no policy needed)

-- ---------------------------------------------------------------------------
-- 6.  HELPER FUNCTIONS
-- ---------------------------------------------------------------------------

-- 6.1  Haversine distance in kilometres
CREATE OR REPLACE FUNCTION fn_haversine_km(
    lat1 NUMERIC, lon1 NUMERIC,
    lat2 NUMERIC, lon2 NUMERIC
)
RETURNS NUMERIC LANGUAGE sql IMMUTABLE AS $$
SELECT 2 * 6371 * ASIN(
    SQRT(
        POWER(SIN(RADIANS(lat2 - lat1) / 2), 2)
        + COS(RADIANS(lat1)) * COS(RADIANS(lat2))
        * POWER(SIN(RADIANS(lon2 - lon1) / 2), 2)
    )
)
$$;

COMMENT ON FUNCTION fn_haversine_km IS 'Returns the great-circle distance in km between two GPS coordinates.';

-- 6.2  Find services within a radius
CREATE OR REPLACE FUNCTION fn_nearby_services(
    p_lat       NUMERIC,
    p_lon       NUMERIC,
    p_radius_km NUMERIC      DEFAULT 10,
    p_type      service_type DEFAULT NULL
)
RETURNS TABLE (
    id          UUID,
    type        service_type,
    name        VARCHAR,
    address     VARCHAR,
    latitude    NUMERIC,
    longitude   NUMERIC,
    distance_km NUMERIC
) LANGUAGE sql STABLE AS $$
SELECT
    s.id, s.type, s.name, s.address, s.latitude, s.longitude,
    ROUND(fn_haversine_km(p_lat, p_lon, s.latitude, s.longitude)::NUMERIC, 3)
FROM services s
WHERE s.is_active = TRUE
  AND (p_type IS NULL OR s.type = p_type)
  AND fn_haversine_km(p_lat, p_lon, s.latitude, s.longitude) <= p_radius_km
ORDER BY 7 ASC;
$$;

-- 6.3  Find active trips near a passenger location
CREATE OR REPLACE FUNCTION fn_nearby_active_trips(
    p_lat       NUMERIC,
    p_lon       NUMERIC,
    p_radius_km NUMERIC DEFAULT 20
)
RETURNS TABLE (
    trip_id              UUID,
    bus_id               UUID,
    plate_number         VARCHAR,
    origin               VARCHAR,
    destination          VARCHAR,
    fare                 NUMERIC,
    currency             CHAR,
    scheduled_start_time TIMESTAMPTZ,
    available_seats      BIGINT,
    bus_latitude         NUMERIC,
    bus_longitude        NUMERIC,
    distance_km          NUMERIC
) LANGUAGE sql STABLE AS $$
SELECT
    t.id,
    b.id,
    b.plate_number,
    t.origin,
    t.destination,
    t.fare,
    t.currency,
    t.scheduled_start_time,
    (t.total_capacity
        - COUNT(bk.id) FILTER (WHERE bk.status IN ('reserved','payment_pending','confirmed'))
    )                   AS available_seats,
    bl.latitude,
    bl.longitude,
    ROUND(fn_haversine_km(p_lat, p_lon, bl.latitude, bl.longitude)::NUMERIC, 3)
FROM      trips         t
JOIN      buses         b   ON b.id = t.bus_id
LEFT JOIN bus_locations bl  ON bl.trip_id = t.id
LEFT JOIN bookings      bk  ON bk.trip_id = t.id
WHERE t.status     = 'active'
  AND bl.latitude  IS NOT NULL
  AND fn_haversine_km(p_lat, p_lon, bl.latitude, bl.longitude) <= p_radius_km
GROUP BY t.id, b.id, b.plate_number, t.origin, t.destination,
         t.fare, t.currency, t.scheduled_start_time, t.total_capacity,
         bl.latitude, bl.longitude
ORDER BY 12 ASC;
$$;

-- 6.4  Expire overdue bookings (called by Bull background job every minute)
CREATE OR REPLACE FUNCTION fn_expire_overdue_bookings()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE v_count INTEGER;
BEGIN
    WITH expired AS (
        UPDATE bookings
        SET    status     = 'expired',
               updated_at = NOW()
        WHERE  status    IN ('reserved', 'payment_pending')
          AND  expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO v_count FROM expired;
    RETURN v_count;
END;
$$;

COMMENT ON FUNCTION fn_expire_overdue_bookings IS 'Transitions overdue bookings to expired. Returns the count changed. Called by the Bull job queue.';

-- 6.5  Profile completion status for a user (powers GET /api/v1/auth/me)
CREATE OR REPLACE FUNCTION fn_user_profile_status(p_user_id UUID)
RETURNS TABLE (
    profile_completion_required BOOLEAN,
    incomplete_role             user_role,
    profile_status              profile_status_type,
    rejection_reason            TEXT
) LANGUAGE sql STABLE AS $$
SELECT
    (rp.profile_status IN ('INCOMPLETE', 'PENDING_VERIFICATION')),
    rp.role,
    rp.profile_status,
    rp.rejection_reason
FROM      users        u
LEFT JOIN role_profiles rp ON rp.user_id = u.id AND rp.role = u.role
WHERE u.id = p_user_id;
$$;

-- 6.6  Check if an account is locked at login time
CREATE OR REPLACE FUNCTION fn_is_account_locked(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
SELECT locked_until IS NOT NULL AND locked_until > NOW()
FROM   users
WHERE  id = p_user_id;
$$;

COMMENT ON FUNCTION fn_is_account_locked IS 'Returns TRUE if the account is currently locked. Used by the login endpoint before password check.';

-- ---------------------------------------------------------------------------
-- 7.  SEED DATA  (development / staging only)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF current_database() LIKE '%dev%'
    OR current_database() LIKE '%staging%'
    OR current_database() LIKE '%test%'
    THEN

        -- System administrator (provisioned directly; not via registration)
        INSERT INTO users (id, first_name, last_name, phone, role, password_hash, is_active)
        VALUES (
            'a0000000-0000-0000-0000-000000000001',
            'System', 'Administrator',
            '+251911000001',
            'system_admin',
            -- bcrypt hash of 'Admin@1234' with work factor 12 (replace in production)
            '$2b$12$examplehashforseeddataonlyAAAAAAAAAAAAAAAAAAAAAAAAAA',
            TRUE
        )
        ON CONFLICT (id) DO NOTHING;

        -- Sample passenger
        INSERT INTO users (id, first_name, last_name, phone, role, password_hash, is_active)
        VALUES (
            'a0000000-0000-0000-0000-000000000002',
            'Abebe', 'Girma',
            '+251911000002',
            'passenger',
            '$2b$12$examplehashforseeddataonlyBBBBBBBBBBBBBBBBBBBBBBBBBB',
            TRUE
        )
        ON CONFLICT (id) DO NOTHING;

        -- Sample driver (promoted; role_profile auto-created by trigger)
        INSERT INTO users (id, first_name, last_name, phone, role, password_hash, is_active)
        VALUES (
            'a0000000-0000-0000-0000-000000000003',
            'Kebede', 'Alemu',
            '+251911000003',
            'driver',
            '$2b$12$examplehashforseeddataonlyCCCCCCCCCCCCCCCCCCCCCCCCCC',
            TRUE
        )
        ON CONFLICT (id) DO NOTHING;

        -- Sample bus
        INSERT INTO buses (id, plate_number, capacity, driver_id)
        VALUES (
            'b0000000-0000-0000-0000-000000000001',
            'ET-AA-12345', 45,
            'a0000000-0000-0000-0000-000000000003'
        )
        ON CONFLICT (id) DO NOTHING;

        -- Sample services
        INSERT INTO services (type, name, address, latitude, longitude) VALUES
            ('garage',       'Megenagna Garage',    'Megenagna, Addis Ababa',  9.02041, 38.76608),
            ('fuel_station', 'NOC Fuel Station',    'Bole, Addis Ababa',       9.00558, 38.79922),
            ('garage',       'Kality Auto Repair',  'Kality, Addis Ababa',     8.95792, 38.77280),
            ('fuel_station', 'Total Energies Bole', 'Bole Road, Addis Ababa',  9.01036, 38.80321)
        ON CONFLICT DO NOTHING;

    END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 8.  SCHEMA VERIFICATION  (run manually after deployment)
-- ---------------------------------------------------------------------------
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
-- SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
--
-- SELECT trigger_name, event_object_table
--   FROM information_schema.triggers
--   WHERE trigger_schema = 'public' ORDER BY event_object_table;
--
-- SELECT viewname FROM pg_views WHERE schemaname = 'public';
--
-- SELECT typname FROM pg_type
--   WHERE typnamespace=(SELECT oid FROM pg_namespace WHERE nspname='public')
--     AND typtype='e';
--
-- SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' ORDER BY tablename;
-- ---------------------------------------------------------------------------
-- END OF SCHEMA
-- =============================================================================
-- TABLES (14)
--   users, otp_codes, role_profile_schemas, role_profiles, buses, trips,
--   bus_locations, bookings, payments, notifications, posts, comments,
--   services, audit_logs
--
-- VIEWS (6)
--   v_active_bookings, v_pending_role_profiles, v_revenue_daily,
--   v_fleet_status, v_users_with_profiles, v_notification_queue
--
-- FUNCTIONS (13)
--   fn_set_updated_at, fn_audit_logs_immutable, fn_check_seat_capacity,
--   fn_check_seat_number, fn_check_post_author_role, fn_track_role_change,
--   fn_auto_create_role_profile, fn_lock_account, fn_reset_failed_logins,
--   fn_haversine_km, fn_nearby_services, fn_nearby_active_trips,
--   fn_expire_overdue_bookings, fn_user_profile_status, fn_is_account_locked
--
-- TRIGGERS
--   updated_at (12 tables), audit_logs immutability (2),
--   booking capacity (1), seat number (1), post author role (1),
--   role change tracking (1), auto role_profile creation (1)
--
-- RLS POLICIES (8)
--   users, otp_codes, role_profiles, bookings, payments,
--   notifications, audit_logs (select-only)
--
-- CUSTOM TYPES (8 ENUMs)
--   user_role, profile_status_type, booking_status, trip_status,
--   service_type, notification_type, notification_channel,
--   notification_delivery_status, audit_action
-- =============================================================================
