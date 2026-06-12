import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
  quiet: true,
});

export const Config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  DB_TYPE: process.env.DB_TYPE,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  JWKS_URI: process.env.JWKS_URI,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_FIRST_NAME: process.env.ADMIN_FIRST_NAME,
  ADMIN_LAST_NAME: process.env.ADMIN_LAST_NAME,
};
