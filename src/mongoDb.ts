import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI! as string;
const DB_NAME = 'cakes_db';

let db: Db;
let cakesCollection: Collection;

export async function connectDB() {
    try {
        const client = new MongoClient(MONGODB_URI, {
            tls: true,                       // SSL ulanish
            serverSelectionTimeoutMS: 5000,  // 5 sekund kutish
        });

        await client.connect();
        console.log('MongoDB ga ulanish muvaffaqiyatli!');

        db = client.db(DB_NAME);
        cakesCollection = db.collection('cakes');

        return db;
    } catch (error) {
        console.error('MongoDB ulanish xatosi:', error);
        process.exit(1);
    }
}

export function getCakesCollection() {
    return cakesCollection;
}
