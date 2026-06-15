const { Server } = require("socket.io");
const ApiError = require("../../shared/utils/apiError.js");
const { verifyAccessToken } = require("../../shared/utils/jwt.js");
const logger = require("../../shared/utils/logger.js");
const userService = require("../../modules/user/services/user.service.js");
const trackingService = require("../../modules/tracking/services/tracking.service.js");
const env = require("../../config/env.js");

const getSocketToken = (socket) => {
  const authToken = socket.handshake.auth && socket.handshake.auth.token;
  const header = socket.handshake.headers.authorization || "";
  const [scheme, headerToken] = header.split(" ");

  if (authToken) return authToken;
  if (scheme === "Bearer" && headerToken) return headerToken;
  return null;
};

const authenticateSocket = async (socket, next) => {
  try {
    const token = getSocketToken(socket);

    if (!token) {
      throw new ApiError(401, "Socket authentication required.", "UNAUTHORIZED");
    }

    const payload = verifyAccessToken(token);
    const user = await userService.findById(payload.sub);

    if (!user) {
      throw new ApiError(401, "Socket authentication required.", "UNAUTHORIZED");
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

const initializeTrackingSocket = (httpServer) => {
  // Get allowed origins from environment
  const allowedOrigins = env.allowedOrigins.split(',').map(origin => origin.trim());
  
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, testing tools)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`Socket.IO CORS blocked connection from origin: ${origin}`);
          callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    logger.info("Socket connected", {
      socketId: socket.id,
      userId: socket.user.id,
      role: socket.user.role
    });

    socket.on("track:subscribe", async (payload, callback) => {
      try {
        await trackingService.validateTripSubscription({
          user: socket.user,
          tripId: payload && payload.trip_id
        });

        const room = `trip:${payload.trip_id}`;
        socket.join(room);
        if (callback) callback({ ok: true, room });
      } catch (error) {
        if (callback) callback({ ok: false, error: error.message, code: error.code });
      }
    });

    socket.on("location:update", async (payload, callback) => {
      try {
        const location = await trackingService.saveLocationUpdate({
          user: socket.user,
          tripId: payload && payload.trip_id,
          latitude: payload && payload.latitude,
          longitude: payload && payload.longitude
        });

        io.to(`trip:${payload.trip_id}`).emit("location:updated", {
          trip_id: payload.trip_id,
          latitude: location.latitude,
          longitude: location.longitude,
          recorded_at: location.recorded_at
        });

        if (callback) callback({ ok: true });
      } catch (error) {
        if (callback) callback({ ok: false, error: error.message, code: error.code });
      }
    });

    socket.on("disconnect", (reason) => {
      logger.info("Socket disconnected", {
        socketId: socket.id,
        userId: socket.user.id,
        reason
      });
    });
  });

  return io;
};

module.exports = {
  initializeTrackingSocket
};
