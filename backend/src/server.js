const http = require("http");
const app = require("./app.js");
const { connectDb } = require("./infrastructure/database/db.js");
const env = require("./config/env.js");
const logger = require("./shared/utils/logger.js");
const { initializeTrackingSocket } = require("./infrastructure/socket/tracking.socket.js");


// Start the server
const start = async () => {
  try {
    await connectDb();

    const server = http.createServer(app);

    initializeTrackingSocket(server);

    server.listen(env.port, () => {
      logger.info(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

start();

