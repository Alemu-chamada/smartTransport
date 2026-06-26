-- =============================================================================
-- NEON DATABASE SETUP & MIGRATION FIX
-- Transportation Management System
-- =============================================================================
-- Purpose: Fix migration issues and prepare for production deployment
-- Date: June 15, 2026
-- Database: Neon PostgreSQL
-- =============================================================================

-- ---------------------------------------------------------------------------
-- A. FIX OWNERSHIP & ROLES
-- ---------------------------------------------------------------------------
-- Transfer ownership from missing roles to neondb_owner

-- Fix table ownership
DO $$
DECLAREi
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE IF EXISTS %I OWNER TO neondb_owner', r.tablename);
    END LOOP;
END $$;

-- Fix sequence ownership
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER SEQUENCE IF EXISTS %I OWNER TO neondb_owner', r.sequencename);
    END LOOP;
END $$;

-- Fix view ownership
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER VIEW IF EXISTS %I OWNER TO neondb_owner', r.viewname);
    END LOOP;
END $$;

-- Fix function ownership
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT n.nspname as schema, p.proname as function_name, 
               pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    ) LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I(%s) OWNER TO neondb_owner', 
                          r.schema, r.function_name, r.args);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not change owner for function %.%', r.function_name, r.args;
        END;
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- B. VERIFY EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- EXCLUDE constraints

-- ---------------------------------------------------------------------------
-- C. GRANT PERMISSIONS TO CURRENT USER
-- ---------------------------------------------------------------------------
-- Grant all necessary permissions to neondb_owner (default Neon user)

GRANT USAGE ON SCHEMA public TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO neondb_owner;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON TABLES TO neondb_owner;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON SEQUENCES TO neondb_owner;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON FUNCTIONS TO neondb_owner;

-- ---------------------------------------------------------------------------
-- D. VERIFY CRITICAL TABLES EXIST
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    -- Check critical tables
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        RAISE EXCEPTION 'Critical table "users" is missing!';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trips') THEN
        RAISE EXCEPTION 'Critical table "trips" is missing!';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
        RAISE EXCEPTION 'Critical table "bookings" is missing!';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'otp_codes') THEN
        RAISE EXCEPTION 'Critical table "otp_codes" is missing!';
    END IF;
    
    RAISE NOTICE 'All critical tables exist!';
END $$;

-- ---------------------------------------------------------------------------
-- E. VERIFY SEQUENCES
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    seq_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO seq_count 
    FROM pg_sequences 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Found % sequences in public schema', seq_count;
END $$;

-- ---------------------------------------------------------------------------
-- F. VERIFY FOREIGN KEYS
-- ---------------------------------------------------------------------------
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY 
    tc.table_name;

-- ---------------------------------------------------------------------------
-- G. VERIFY INDEXES
-- ---------------------------------------------------------------------------
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename, indexname;

-- ---------------------------------------------------------------------------
-- H. VERIFY TRIGGERS
-- ---------------------------------------------------------------------------
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM 
    information_schema.triggers
WHERE 
    trigger_schema = 'public'
ORDER BY 
    event_object_table, trigger_name;

-- ---------------------------------------------------------------------------
-- I. VERIFY VIEWS
-- ---------------------------------------------------------------------------
SELECT 
    table_name as view_name,
    view_definition
FROM 
    information_schema.views
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;

-- ---------------------------------------------------------------------------
-- J. VERIFY ENUMS
-- ---------------------------------------------------------------------------
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM 
    pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE 
    n.nspname = 'public'
GROUP BY 
    t.typname
ORDER BY 
    t.typname;

-- ---------------------------------------------------------------------------
-- K. CREATE SYSTEM ADMIN USER (IF NOT EXISTS)
-- ---------------------------------------------------------------------------
-- Create default system admin for production
-- Password: Change this immediately after first login!

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@tms.system') THEN
        INSERT INTO users (
            id,
            email,
            phone,
            password_hash,
            first_name,
            last_name,
            role,
            is_active,
            failed_login_attempts,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'admin@tms.system',
            '+1234567890',
            '$2b$10$YourHashedPasswordHere', -- CHANGE THIS!
            'System',
            'Administrator',
            'system_admin',
            true,
            0,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'System admin user created. Email: admin@tms.system';
        RAISE NOTICE 'IMPORTANT: Change the password immediately!';
    ELSE
        RAISE NOTICE 'System admin user already exists.';
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- L. OPTIMIZATION: ANALYZE TABLES
-- ---------------------------------------------------------------------------
ANALYZE;

-- Success message
SELECT 'Neon database setup completed successfully!' as status;
