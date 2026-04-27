import app from './app';
import { Config } from './config';
import { logger } from './factories/logger.factory';
import connectDB from './database/db';

const startServer = async () => {

  try {
    await connectDB();
  } catch (error) {
    logger.error(`Error connecting to database: ${(error as Error).message}`);
    process.exit(1);
  }

  const PORT = Config.PORT;

  const server = app.listen(PORT, () => {
    logger.info(`Auth service is running on port ${PORT}`);
  });

  server.on('error', (error) => {
    logger.error(`Error starting auth service: ${error.message}`);
    process.exit(1);
  });
};

startServer();
