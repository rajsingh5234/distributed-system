import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}`, quiet: true });

export const Config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  DB_TYPE: process.env.DB_TYPE,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
};
