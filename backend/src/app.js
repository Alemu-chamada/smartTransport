const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes");
const errorMiddleware = require("./shared/middleware/error.middleware.js");
const logger = require("./shared/utils/logger.js");
const env = require("./config/env.js");

const app = express();

// Configure CORS with environment-based origins
const allowedOrigins = env.allowedOrigins.split(',').map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Handle preflight requests
app.options('*', cors());

// Configure Helmet with relaxed CSP for development
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: { redis: "connected", postgres: "connected" }
  });
});
app.use("/api/v1", routes);

app.use(errorMiddleware);

module.exports = app;
