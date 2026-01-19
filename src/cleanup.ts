import { getCakesCollection } from "./mongoDb";

interface UploadcareFile { 
    uuid: string; 
}

interface UploadcareListResponse { 
    results: UploadcareFile[]; 
}

export async function cleanUp() {
    try {
        const authHeader = `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`;

        // MongoDB'dan barcha UUID'larni olish
        const cakes = await getCakesCollection().find({}, { projection: { images: 1 } }).toArray();
        
        const usedUUIDs = new Set<string>();
        for (const cake of cakes) {
            if (cake.images?.length) {
                for (const img of cake.images) {
                    const match = img.match(/\/([a-f0-9-]{36})\//);
                    if (match) usedUUIDs.add(match[1]);
                }
            }
        }

        // Uploadcare'dan barcha fayllarni olish
        const res = await fetch("https://api.uploadcare.com/files/", {
            headers: {
                "Authorization": authHeader,
                "Accept": "application/vnd.uploadcare-v0.7+json"
            }
        });

        if (!res.ok) throw new Error(`Uploadcare error: ${res.status}`);

        const data: UploadcareListResponse = await res.json();
        if (!data.results?.length) return;

        // Orphan'larni topish va o'chirish
        const orphans = data.results.filter(f => !usedUUIDs.has(f.uuid));

        for (const { uuid } of orphans) {
            await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
                method: "DELETE",
                headers: { "Authorization": authHeader }
            });
        }

        console.log(`Tozalandi: ${orphans.length} ta orphan rasm`);

    } catch (err) {
        console.error("Cleanup xatosi:", err);
    }
}