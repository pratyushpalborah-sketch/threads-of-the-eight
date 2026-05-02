import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { CRAFTS_SEED } from './lib/data/crafts-seed.js';

const uri = "mongodb://Pratyush_grp:Ha634433634433@ac-tv1ayem-shard-00-00.9gsaam5.mongodb.net:27017,ac-tv1ayem-shard-00-01.9gsaam5.mongodb.net:27017,ac-tv1ayem-shard-00-02.9gsaam5.mongodb.net:27017/northeast_crafts?ssl=true&replicaSet=atlas-tv1ayem-shard-0&authSource=admin&retryWrites=true&w=majority&appName=CRW01";

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to Atlas!");
    const db = client.db('northeast_crafts');
    
    // Drop existing collections to avoid duplicates if they ran it before
    try { await db.collection('crafts').drop(); } catch (e) {}
    try { await db.collection('users').drop(); } catch (e) {}
    
    // Seed crafts
    await db.collection('crafts').insertMany(CRAFTS_SEED);
    console.log(`Seeded ${CRAFTS_SEED.length} crafts.`);
    
    // Seed admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.collection('users').insertOne({
      email: 'admin@necrafts.in',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date()
    });
    console.log("Seeded admin user.");
    
  } catch (err) {
    console.error("Error seeding Atlas:", err);
  } finally {
    await client.close();
    console.log("Done.");
  }
})();
