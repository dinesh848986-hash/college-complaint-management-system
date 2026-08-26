const mongoose = require('mongoose');

let memoryServer = null;

// Helper to mask credentials in MongoDB URI to prevent leaking in logs
const getMaskedUri = (uri) => {
  if (!uri) return 'undefined';
  try {
    const parsed = new URL(uri);
    const auth = parsed.username || parsed.password ? '***:***@' : '';
    return `${parsed.protocol}//${auth}${parsed.host}${parsed.pathname}`;
  } catch {
    return 'configured-mongodb-cluster';
  }
};

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGODB_URI;

  // In production, MONGODB_URI is strictly required
  if (isProduction && !mongoUri) {
    console.error(
      '[Database Error] FATAL: MONGODB_URI environment variable is required in production mode.'
    );
    process.exit(1);
  }

  const primaryUri = mongoUri || 'mongodb://127.0.0.1:27017/college-complaint-db';

  try {
    // Attempt standard connection
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to database (${getMaskedUri(primaryUri)})`);
    return conn;
  } catch (err) {
    // In production, never fall back to in-memory database
    if (isProduction) {
      console.error(
        `[MongoDB Error] Failed to connect to production database: ${err.message}`
      );
      throw err;
    }

    // In local development / testing, fallback to in-memory database
    console.warn(
      `[MongoDB] Local database connection failed (${err.message}). Starting MongoMemoryServer for development...`
    );
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }
      const memoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected successfully to in-memory database: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] In-memory database startup error:', memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (error) {
    console.error('[MongoDB] Disconnection error:', error.message);
  }
};

module.exports = { connectDB, disconnectDB, getMaskedUri };
