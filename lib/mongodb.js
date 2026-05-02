import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/';
const dbName = process.env.DB_NAME || 'northeast_crafts';

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
  global._mongoClientPromise = client.connect().catch(err => {
    console.warn("MongoDB connection failed. Running in static fallback mode.", err.message);
    return null;
  });
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const c = await clientPromise;
  if (!c) return null;
  return c.db(dbName);
}

export default clientPromise;
