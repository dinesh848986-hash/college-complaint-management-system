const { MongoMemoryServer } = require('mongodb-memory-server');

async function download() {
  console.log('Pre-caching MongoDB in-memory binary...');
  const start = Date.now();
  const mongod = await MongoMemoryServer.create();
  console.log(`MongoDB binary ready! Uri: ${mongod.getUri()}`);
  console.log(`Took ${((Date.now() - start) / 1000).toFixed(1)}s`);
  await mongod.stop();
  process.exit(0);
}

download().catch((err) => {
  console.error('Download error:', err);
  process.exit(1);
});
