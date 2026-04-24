import mongoose from 'mongoose';
import { Config } from '.';
import logger from './logger';

const connectDB = async () => {
  await mongoose.connect(Config.MONGO_URI as string);
  logger.info('Connected to MongoDB');
};

export default connectDB;
