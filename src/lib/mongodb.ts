import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is not defined in environment variables. Falling back to in-memory/localStorage.');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise && uri) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise || (uri ? new MongoClient(uri, options).connect() : Promise.reject('No URI'));
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri || '', options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(dbName = 'stocksense'): Promise<Db | null> {
  try {
    if (!process.env.MONGODB_URI) return null;
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return null;
  }
}
