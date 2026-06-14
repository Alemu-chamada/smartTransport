const { Pool } = require("pg");
const env = require("./src/config/env.js");

// Connect to database
const pool = new Pool({
  host: env.pg.host,
  port: env.pg.port,
  database: env.pg.database,
  user: env.pg.user,
  password: env.pg.password,
});

async function applyDatabaseFixes() {
  console.log("=== Connecting to database ===");
  const client = await pool.connect();
  try {
    console.log("✅ Connected to database successfully!");

    // 1. First check the user
    console.log("\n=== Checking user aliechame07@gmail.com ===");
    const userResult = await client.query(
      "SELECT id, full_name, email, role, is_active FROM users WHERE email = $1",
      ["aliechame07@gmail.com"]
    );

    if (userResult.rows.length === 0) {
      console.warn("⚠️ User not found!");
    } else {
      const user = userResult.rows[0];
      console.log("User found:", user);

      if (user.role !== "system_admin") {
        console.log("Updating user role to system_admin...");
        await client.query(
          "UPDATE users SET role = $1, last_role_changed_at = NOW() WHERE email = $2",
          ["system_admin", "aliechame07@gmail.com"]
        );
        console.log("✅ User role updated!");
      } else {
        console.log("✅ User already has system_admin role!");
      }
    }

    // 2. Fix the post author check function
    console.log("\n=== Fixing fn_check_post_author_role ===");
    const fixFunctionSql = `
      CREATE OR REPLACE FUNCTION fn_check_post_author_role()
      RETURNS TRIGGER LANGUAGE plpgsql AS $$
      DECLARE
        v_role user_role;
        v_prof_status profile_status_type;
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
        FROM role_profiles
        WHERE user_id = NEW.author_id AND role = 'traffic_authority'
        ORDER BY created_at DESC LIMIT 1;

        IF v_prof_status NOT IN ('COMPLETE', 'VERIFIED') THEN
          RAISE EXCEPTION
            'traffic_authority profile not yet complete. Status: %', v_prof_status
            USING ERRCODE = 'P0004';
        END IF;

        RETURN NEW;
      END;
      $$;
    `;

    await client.query(fixFunctionSql);
    console.log("✅ fn_check_post_author_role fixed!");

    console.log("\n🎉 All fixes applied successfully!");
  } catch (error) {
    console.error("❌ Error applying fixes:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

applyDatabaseFixes();
