import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const Config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
};
