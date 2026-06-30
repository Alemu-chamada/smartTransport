-- ============================================================
-- Migration: Add likes table + extend services table
-- Run on Neon production database
-- ============================================================

-- 1. Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID        NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_likes_post   ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user   ON post_likes(user_id);

-- 2. Comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id  UUID        NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user    ON comment_likes(user_id);

-- 3. Extend services table with new fields
ALTER TABLE services
    ADD COLUMN IF NOT EXISTS phone       VARCHAR(50),
    ADD COLUMN IF NOT EXISTS maps_link   TEXT,
    ADD COLUMN IF NOT EXISTS image_url   TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT;

-- Relax service_type enum to allow hotels (if not already)
-- Check if 'hotel' exists in the enum first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'service_type'::regtype AND enumlabel = 'hotel'
    ) THEN
        ALTER TYPE service_type ADD VALUE 'hotel';
    END IF;
END $$;

SELECT 'Migration complete' as status;
