import mongoose from 'mongoose';
import { config } from './environment.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoose.url);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};