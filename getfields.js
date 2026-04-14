import "dotenv/config";
import { connect } from "framer-api";

const framer = await connect(process.env.FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY);
const collection = await framer.getCollection(process.env.FRAMER_URUNLER_COLLECTION_ID);
const fields = await collection.getFields();
console.log(JSON.stringify(fields.map(f => ({ id: f.id, name: f.name, type: f.type })), null, 2));
await framer.disconnect();
