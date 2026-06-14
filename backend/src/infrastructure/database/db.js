const { Pool } = require("pg");
const env = require("../../config/env.js");
const logger = require("../../shared/utils/logger.js");

const pool = new Pool({
  host: env.pg.host,
  port: env.pg.port,
  database: env.pg.database,
  user: env.pg.user,
  password: env.pg.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
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
  await query("SELECT 1");
  logger.info("PostgreSQL connected", {
    host: env.pg.host,
    port: env.pg.port,
    database: env.pg.database,
    user: env.pg.user
  });
};

module.exports = {
  pool,
  query,
  transaction,
  connectDb
};
