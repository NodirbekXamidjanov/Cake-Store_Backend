import cors from "cors";
import express from "express";
import { connectDB, getCakesCollection } from "./mongoDb.ts";
import { type DataType } from "./db.ts";
import { ObjectId } from "mongodb";
import { deleteUploadcareFile } from "./uploadCar.ts";
import { cleanUp } from "./cleanup.ts";

const app = express();
app.use(express.json());
app.use(cors());

setInterval(() => {
	cleanUp()
}, 24 * 60 * 60 * 1000)

// GET - barcha cakes
app.get("/cakes", async (req, res) => {
	try {
		const collection = getCakesCollection();
		const cakes = await collection.find().toArray();
		res.json(cakes);
	} catch (error) {
		res.status(500).json({ error: "Ma'lumotlarni olishda xatolik" });
	}
})

// POST - yangi cake qo'shish
app.post("/cakes/new", async (req, res) => {
	try {
		const newCake: DataType = req.body;

		if (!newCake.name) {
			return res.status(400).json({
				error: "Name majburiy!"
			});
		}

		const collection = getCakesCollection();
		const result = await collection.insertOne(newCake);

		res.status(201).json({
			message: "Cake muvaffaqiyatli qo'shildi!",
			id: result.insertedId,
			cake: newCake
		});
	} catch (error) {
		res.status(500).json({ error: "Server xatosi" });
	}
})

// PUT - cake yangilash
app.put("/cakes/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const collection = getCakesCollection();
		const result = await collection.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: updateData }
		);

		if (result.matchedCount === 0) {
			return res.status(404).json({ error: "Cake topilmadi!" });
		}

		res.json({
			message: "Cake yangilandi!",
			modifiedCount: result.modifiedCount
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Yangilashda xatolik" });
	}
});

// DELETE - cake o'chirish

app.delete("/cakes/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const collection = getCakesCollection();

		const cake = await collection.findOne({ _id: new ObjectId(id) });
		if (!cake) return res.status(404).json({ error: "Cake topilmadi!" });

		// Rasmlarni o'chirish
		if (cake.images && Array.isArray(cake.images)) {
			for (const imageUrl of cake.images) {
				try {
					const match = imageUrl.match(/https:\/\/.*\.ucarecdn\.net\/([^\/]+)\//);
					const uuid = match ? match[1] : null;
					if (uuid) await deleteUploadcareFile(uuid);
				} catch (err) {
					console.error("Uploadcare delete error:", err);
				}
			}
		}

		const result = await collection.deleteOne({ _id: new ObjectId(id) });
		if (result.deletedCount === 0) return res.status(404).json({ error: "Cake topilmadi!" });

		res.json({ message: "Cake va rasmlari muvaffaqiyatli o'chirildi!", id });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server xatosi" });
	}
});



// app.delete("/cakes/:id", async (req, res) => {
// 	try {
// 		const { id } = req.params;

// 		const collection = getCakesCollection();
// 		const result = await collection.deleteOne({ _id: new ObjectId(id) });

// 		if (result.deletedCount === 0) {
// 			return res.status(404).json({
// 				error: "Cake topilmadi!"
// 			});
// 		}



// 		res.json({
// 			message: "Cake o'chirildi!",
// 			id: id
// 		});
// 	} catch (error) {
// 		res.status(500).json({ error: "Server xatosi" });
// 	}
// })
const PORT = 5000;

// Serverni MongoDB ulanishdan keyin ishga tushirish
connectDB().then(() => {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}...`);
	});
});