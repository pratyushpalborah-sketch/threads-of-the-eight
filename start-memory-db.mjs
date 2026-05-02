import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { CRAFTS_SEED } from './lib/data/crafts-seed.js';

(async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  console.log(`Memory server running at: ${uri}`);
  
  // Update .env with the new URI
  let envFile = fs.readFileSync('.env', 'utf8');
  envFile = envFile.replace(/MONGO_URL=.*/g, `MONGO_URL=${uri}`);
  fs.writeFileSync('.env', envFile);
  console.log('Updated .env with new MONGO_URL');
  
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('northeast_crafts');
  
  // Seeding
  await db.collection('crafts').insertMany(CRAFTS_SEED);
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.collection('users').insertOne({
    email: 'admin@necrafts.in',
    password: hashedPassword,
    name: 'Admin',
    role: 'admin',
    createdAt: new Date()
  });

  console.log('Database seeded. Keep this process running.');
})();
