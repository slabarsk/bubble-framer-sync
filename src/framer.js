import "dotenv/config";
import { connect } from "framer-api";

const PROJECT_URL = process.env.FRAMER_PROJECT_URL;
const API_KEY = process.env.FRAMER_API_KEY;
const COLLECTION_ID = process.env.FRAMER_COLLECTION_ID;

function slugify(text) {
  if (!text) return "";
  return text.trim().toLowerCase()
    .replace(/›/g, " ")
    .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
    .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
}

function mapProduct(product) {
  const rawImage = product["Kapak Görseli"];
  const image = rawImage && rawImage.startsWith("//")
    ? "https:" + rawImage
    : rawImage && rawImage.startsWith("http")
    ? rawImage
    : null;

  const slug = slugify(product["Kategori Yolu"] || product["Ad"] || product._id);

  const fieldData = {
    bWIhncZqz: { type: "string", value: product["Ad"] || "" },
    zLxYmcPSU: { type: "string", value: product["Açıklaması"] || "" },
  };

  if (image) {
    fieldData.GJ_Ilr9Ru = { type: "image", value: image };
  }

  return { slug, fieldData };
}

export async function upsertItems(products) {
  const framer = await connect(PROJECT_URL, API_KEY);
  try {
    const collection = await framer.getCollection(COLLECTION_ID);
    const existingItems = await collection.getItems();
    const existingSlugs = new Set(existingItems.map(item => item.slug));
    const newItems = products.map(mapProduct).filter(item => !existingSlugs.has(item.slug));

    if (newItems.length === 0) {
      console.log("✅ Eklenecek yeni kategori yok.");
      return;
    }

    await collection.addItems(newItems);
    console.log(`✅ ${newItems.length} yeni kategori eklendi.`);
  } finally {
    await framer.disconnect();
  }
}
