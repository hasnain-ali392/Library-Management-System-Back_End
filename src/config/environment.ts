import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoose: {
    url: process.env.MONGO_URI || 'mongodb+srv://hasnainali2717:ali2717@cluster0.ypefl4f.mongodb.net/library_management_system',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    accessExpirationDays: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
