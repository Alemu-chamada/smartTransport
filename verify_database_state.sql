-- Verify the user's role
SELECT id, full_name, email, phone, role, is_active
FROM users
WHERE email = 'aliechame07@gmail.com';

-- Show current post author check function definition
SELECT pg_get_functiondef('fn_check_post_author_role'::regproc);
