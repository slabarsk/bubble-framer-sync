import "dotenv/config";
import { connect } from "framer-api";

const framer = await connect(process.env.FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY);
const collection = await framer.getCollection(process.env.FRAMER_COLLECTION_ID);
const items = await collection.getItems();
console.log("Mevcut item sayısı:", items.length);
console.log("İlk 3:", items.slice(0,3).map(i => ({ id: i.id, slug: i.slug })));
await framer.disconnect();
