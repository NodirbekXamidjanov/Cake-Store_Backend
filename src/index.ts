// src/index.ts
import express from "express";
import cors from "cors";
import { connectDB, disconnectDB, getCakesCollection } from "./mongoDb";
import { ObjectId } from "mongodb";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Cake Store API ishlayapti!",
    version: "1.0.0",
    status: "active",
  });
});

// GET - Barcha tortlarni olish
app.get("/cakes", async (req, res) => {
  try {
    const cakesCollection = getCakesCollection();
    const cakes = await cakesCollection.find({}).toArray();
    res.json(cakes);
  } catch (error) {
    console.error("Cakes olishda xato:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// POST - Yangi tort qo'shish
app.post("/cakes/new", async (req, res) => {
  try {
    const cakeData = req.body;
    const cakesCollection = getCakesCollection();
    const result = await cakesCollection.insertOne(cakeData);

    res.status(201).json({
      cake: { _id: result.insertedId, ...cakeData },
    });
  } catch (error) {
    console.error("Cake qo'shishda xato:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// PUT - Tortni yangilash
app.put("/cakes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const cakesCollection = getCakesCollection();

    const result = await cakesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Cake topilmadi" });
    }

    res.json({ message: "Cake yangilandi", data: updateData });
  } catch (error) {
    console.error("Cake yangilashda xato:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// DELETE - Tortni o'chirish
app.delete("/cakes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cakesCollection = getCakesCollection();

    const result = await cakesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Cake topilmadi" });
    }

    res.json({ message: "Cake o'chirildi" });
  } catch (error) {
    console.error("Cake o'chirishda xato:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Server'ni ishga tushirish
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portda ishga tushdi`);
    });
  } catch (error) {
    console.error("❌ Server ishga tushmadi:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏹️  Server to'xtatilmoqda...");
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏹️  Server to'xtatilmoqda...");
  await disconnectDB();
  process.exit(0);
});

startServer();