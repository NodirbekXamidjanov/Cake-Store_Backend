// src/mongoDb.ts
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER
const dbName = process.env.MONGODB_DBNAME;

if (!username || !password || !cluster) {
  throw new Error("MongoDB credentials topilmadi! Environment variables'ni tekshiring.");
}

// Connection URI
const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;

// Client yaratish
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});

let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  try {
    if (db) {
      console.log("MongoDB allaqachon ulangan");
      return db;
    }

    console.log("MongoDB'ga ulanmoqda...");
    await client.connect();
    
    // Ulanishni tekshirish
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB'ga muvaffaqiyatli ulandi! ✅");
    
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("MongoDB ulanish xatosi:", error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await client.close();
    db = null;
    console.log("MongoDB'dan uzildi");
  } catch (error) {
    console.error("MongoDB uzilish xatosi:", error);
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error("Database'ga avval ulanish kerak!");
  }
  return db;
}

// Collection'larni olish funksiyalari
export function getCakesCollection(): Collection {
  return getDB().collection('cakes');
}

export function getOrdersCollection(): Collection {
  return getDB().collection('orders');
}

export function getUsersCollection(): Collection {
  return getDB().collection('users');
}

// Agar boshqa collection'lar kerak bo'lsa:
export function getCollection(collectionName: string): Collection {
  return getDB().collection(collectionName);
}