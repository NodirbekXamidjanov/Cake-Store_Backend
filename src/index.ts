// src/index.ts
import express from "express";
import cors from "cors";
import { connectDB, disconnectDB, getCakesCollection } from "./mongoDb";

const app = express();
const PORT = process.env.PORT || 3000;

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

// Cakes routes
app.get("/api/cakes", async (req, res) => {
  try {
    const cakesCollection = getCakesCollection();
    const cakes = await cakesCollection.find({}).toArray();
    res.json({ success: true, data: cakes });
  } catch (error) {
    console.error("Cakes olishda xato:", error);
    res.status(500).json({ success: false, error: "Server xatosi" });
  }
});

app.get("/api/cakes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cakesCollection = getCakesCollection();
    //@ts-expect-error
    const cake = await cakesCollection.findOne({ _id: id });

    if (!cake) {
      return res.status(404).json({ success: false, error: "Cake topilmadi" });
    }

    res.json({ success: true, data: cake });
  } catch (error) {
    console.error("Cake olishda xato:", error);
    res.status(500).json({ success: false, error: "Server xatosi" });
  }
});

app.post("/api/cakes", async (req, res) => {
  try {
    const cakeData = req.body;
    const cakesCollection = getCakesCollection();
    const result = await cakesCollection.insertOne(cakeData);

    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...cakeData },
    });
  } catch (error) {
    console.error("Cake qo'shishda xato:", error);
    res.status(500).json({ success: false, error: "Server xatosi" });
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
    // Avval MongoDB'ga ulanish
    await connectDB();

    // Keyin server'ni ishga tushirish
    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portda ishga tushdi`);
      console.log(`📍 http://localhost:${PORT}`);
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

// Unhandled rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

startServer();
