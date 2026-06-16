import app from './app';
import { Config } from './config';
import { logger } from './factories/logger.factory';

const startServer = () => {
  const PORT = Config.PORT;

  const server = app.listen(PORT, () => {
    logger.info(`Catalog service is running on port ${PORT}`);
  });

  server.on('error', (error) => {
    logger.error(`Error starting catalog service: ${error.message}`);
    process.exit(1);
  });
};

startServer();
