// src/mongoDb.ts
import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const username = process.env.MONGODB_USERNAME!;
const password = process.env.MONGODB_PASSWORD!;
const cluster = process.env.MONGODB_CLUSTER || "cluster0.xswhndp.mongodb.net";
const dbName = process.env.MONGODB_DBNAME!

// Connection URI
const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=CakeStore`;

// Client yaratish
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // TLS sozlamalari
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Connection timeout sozlamalari
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