const { Pool } = require("pg");
const env = require("../../config/env.js");
const logger = require("../../shared/utils/logger.js");

// Build pool config — prefer DATABASE_URL (Neon connection string) if available
const poolConfig = env.pg.databaseUrl
  ? {
      connectionString: env.pg.databaseUrl,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: env.pg.host,
      port: env.pg.port,
      database: env.pg.database,
      user: env.pg.user,
      password: env.pg.password,
      ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,                      // Neon free tier works best with lower max
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  logger.error("Unexpected database pool error", { error: err.message });
});

const query = (sql, params) => pool.query(sql, params);

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const connectDb = async () => {
  const result = await query("SELECT current_database() as db, NOW() as ts");
  logger.info("PostgreSQL connected", {
    host: env.pg.host || "neon (via connection string)",
    database: result.rows[0].db,
    ssl: env.nodeEnv === "production" ? "enabled" : "disabled",
  });
};

module.exports = { pool, query, transaction, connectDb };
