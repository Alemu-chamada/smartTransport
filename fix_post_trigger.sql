-- Fix post creation trigger to allow system_admin
CREATE OR REPLACE FUNCTION fn_check_post_author_role()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_role          user_role;
    v_prof_status   profile_status_type;
BEGIN
    SELECT role INTO v_role FROM users WHERE id = NEW.author_id;

    IF v_role = 'system_admin' THEN
        RETURN NEW;
    END IF;

    IF v_role <> 'traffic_authority' THEN
        RAISE EXCEPTION
            'Only traffic_authority or system_admin users may create posts. Actual role: %', v_role
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
