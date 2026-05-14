import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(router);

app.use(errorHandler);

export default app;
