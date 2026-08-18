/**
 * Enhanced Health Check Endpoint
 * Transportation Management System
 * 
 * Add this to your backend routes to provide comprehensive health monitoring
 */

const { query: dbQuery } = require('../src/infrastructure/database/db');
const redis = require('../src/infrastructure/redis/redis');

/**
 * Detailed health check with component status
 */
const healthCheck = async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    components: {},
    version: process.env.npm_package_version || '1.0.0'
  };

  try {
    // Check Database
    try {
      const dbStart = Date.now();
      const result = await dbQuery('SELECT NOW() as current_time, version() as pg_version');
      const dbTime = Date.now() - dbStart;
      
      health.components.database = {
        status: 'healthy',
        responseTime: `${dbTime}ms`,
        version: result.rows[0].pg_version.split(' ')[1] || 'unknown',
        timestamp: result.rows[0].current_time
      };
    } catch (dbError) {
      health.status = 'unhealthy';
      health.components.database = {
        status: 'unhealthy',
        error: dbError.message
      };
    }

    // Check Redis
    try {
      const redisStart = Date.now();
      await redis.ping();
      const redisTime = Date.now() - redisStart;
      
      health.components.redis = {
        status: 'healthy',
        responseTime: `${redisTime}ms`
      };
    } catch (redisError) {
      health.status = 'degraded'; // Redis is optional, so degraded not unhealthy
      health.components.redis = {
        status: 'unhealthy',
        error: redisError.message
      };
    }

    // Memory Usage
    const memUsage = process.memoryUsage();
    health.components.memory = {
      status: 'healthy',
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    };

    // Add response time
    health.responseTime = `${Date.now() - startTime}ms`;

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503;

    return res.status(statusCode).json({
      success: health.status !== 'unhealthy',
      data: health
    });

  } catch (error) {
    return res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Simple readiness check for Kubernetes/Docker
 */
const readinessCheck = async (req, res) => {
  try {
    // Just check if database is reachable
    await dbQuery('SELECT 1');
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
};

/**
 * Simple liveness check for Kubernetes/Docker
 */
const livenessCheck = (req, res) => {
  // Just check if server is running
  res.status(200).json({ alive: true });
};

/**
 * Get application metrics
 */
const getMetrics = async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    // Get database stats if available
    try {
      const dbStats = await dbQuery(`
        SELECT 
          (SELECT count(*) FROM users) as total_users,
          (SELECT count(*) FROM trips WHERE status = 'active') as active_trips,
          (SELECT count(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
          (SELECT pg_database_size(current_database())) as db_size
      `);
      
      metrics.database = {
        ...dbStats.rows[0],
        db_size: `${Math.round(dbStats.rows[0].db_size / 1024 / 1024)}MB`
      };
    } catch (err) {
      // Ignore if queries fail
    }

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  healthCheck,
  readinessCheck,
  livenessCheck,
  getMetrics
};

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Add to your Express routes (e.g., in app.js):
 * 
 *    const { healthCheck, readinessCheck, livenessCheck, getMetrics } = require('./health-check');
 *    
 *    app.get('/health', healthCheck);
 *    app.get('/health/ready', readinessCheck);
 *    app.get('/health/live', livenessCheck);
 *    app.get('/metrics', getMetrics);
 * 
 * 2. Configure in Render:
 *    - Health Check Path: /health
 *    - Health Check Timeout: 30 seconds
 * 
 * 3. Test locally:
 * 
 *    curl http://localhost:5002/health
 *    curl http://localhost:5002/health/ready
 *    curl http://localhost:5002/health/live
 *    curl http://localhost:5002/metrics
 * 
 * 5. Expected responses:
 * 
 *    /health - Detailed status of all components
 *    /health/ready - Simple { ready: true } or 503
 *    /health/live - Simple { alive: true }
 *    /metrics - Application and database metrics
 */
