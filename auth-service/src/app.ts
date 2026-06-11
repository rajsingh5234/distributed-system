import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import router from './routes';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(
  express.static(path.join(__dirname, '..', 'public'), { dotfiles: 'allow' })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(router);

app.use(errorHandler);

export default app;
