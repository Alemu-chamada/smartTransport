/**
 * Production CORS Configuration
 * Transportation Management System
 * 
 * Add this to your Express app.js or create a middleware file
 */

const cors = require('cors');

/**
 * Get allowed origins from environment variable
 * Supports comma-separated list of URLs
 */
const getAllowedOrigins = () => {
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  
  const origins = [];
  
  if (frontendUrl) {
    origins.push(frontendUrl);
  }
  
  if (allowedOrigins) {
    origins.push(...allowedOrigins.split(',').map(url => url.trim()));
  }
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:5173', 'http://localhost:3000');
  }
  
  return [...new Set(origins)]; // Remove duplicates
};

/**
 * CORS Configuration for Express
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Idempotency-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours - preflight cache duration
  optionsSuccessStatus: 200
};

/**
 * Socket.IO CORS Configuration
 */
const socketCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Socket.IO CORS blocked connection from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST']
};

/**
 * Apply CORS middleware to Express app
 * 
 * @example
 * const { applyCorsMiddleware } = require('./cors-config');
 * applyCorsMiddleware(app);
 */
const applyCorsMiddleware = (app) => {
  // Apply CORS middleware globally
  app.use(cors(corsOptions));
  
  // Handle preflight requests
  app.options('*', cors(corsOptions));
  
  console.log('✅ CORS configured with allowed origins:', getAllowedOrigins());
};

module.exports = {
  corsOptions,
  socketCorsOptions,
  applyCorsMiddleware,
  getAllowedOrigins
};

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. In app.js (Express setup):
 * 
 *    const { applyCorsMiddleware } = require('./config/cors-config');
 *    const app = express();
 *    applyCorsMiddleware(app);
 * 
 * 2. In tracking.socket.js (Socket.IO setup):
 * 
 *    const { socketCorsOptions } = require('../../config/cors-config');
 *    const io = new Server(httpServer, { cors: socketCorsOptions });
 * 
 * 3. Environment Variables (Render):
 * 
 *    FRONTEND_URL=https://smart-transport.cyan.vercel.app
 *    ALLOWED_ORIGINS=https://smart-transport.cyan.vercel.app,https://custom-domain.com
 * 
 * 4. For multiple domains:
 * 
 *    ALLOWED_ORIGINS=https://app1.vercel.app,https://app2.vercel.app,https://custom.com
 * 
 * 5. Testing:
 * 
 *    curl -H "Origin: https://tms.vercel.app" \
 *         -H "Access-Control-Request-Method: POST" \
 *         -H "Access-Control-Request-Headers: Content-Type" \
 *         -X OPTIONS \
 *         https://tms-backend.onrender.com/api/v1/auth/login
 * 
 *    Expected: Should return Access-Control-Allow-Origin header
 */
