const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college-complaint-db';

  try {
    // Attempt standard connection with 3000ms timeout
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to primary database at ${primaryUri}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Primary connection failed (${err.message}). Starting MongoMemoryServer fallback...`);
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

module.exports = { connectDB, disconnectDB };
