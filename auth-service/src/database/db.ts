import { ConnectionFactory } from '../factories/connection.factory';

const connectDB = async () => {
  await ConnectionFactory.createConnection().connect();
};

export default connectDB;
