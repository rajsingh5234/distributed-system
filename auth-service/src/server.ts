import app from './app';
import { Config } from './config';

const startServer = () => {
  const PORT = Config.PORT;

  const server = app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error(`Error starting auth service: ${error.message}`);
    process.exit(1);
  });
};

startServer();
