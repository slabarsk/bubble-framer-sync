import "dotenv/config";
import { connect } from "framer-api";

const PROJECT_URL = process.env.FRAMER_PROJECT_URL;
const API_KEY = process.env.FRAMER_API_KEY;
const COLLECTION_ID = process.env.FRAMER_COLLECTION_ID;

function mapProduct(product) {
  const rawImage = product["Kapak Görseli"];
  const image = rawImage && rawImage.startsWith("//")
    ? "https:" + rawImage
    : rawImage && rawImage.startsWith("http")
    ? rawImage
    : null;

  const slug = (product["Kategori Yolu"] || product["Ad"] || product._id)
    .trim()
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

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
    
    // Mevcut item'ları çek
    const existingItems = await collection.getItems();
    const existingSlugs = new Set(existingItems.map(item => item.slug));

    // Sadece olmayanları ekle
    const newItems = products.map(mapProduct).filter(item => !existingSlugs.has(item.slug));

    if (newItems.length === 0) {
      console.log("✅ Eklenecek yeni ürün yok.");
      return;
    }

    await collection.addItems(newItems);
    console.log(`✅ ${newItems.length} yeni ürün eklendi, ${products.length - newItems.length} ürün zaten vardı.`);
  } finally {
    await framer.disconnect();
  }
}

export async function removeDeleted(bubbleIds) {
  const framer = await connect(PROJECT_URL, API_KEY);
  try {
    const collection = await framer.getCollection(COLLECTION_ID);
    const existingItems = await collection.getItems();
    const toDelete = existingItems
      .filter(item => !bubbleIds.includes(item.id))
      .map(item => item.id);

    if (toDelete.length === 0) {
      console.log("🗑️ Silinecek ürün yok.");
      return;
    }
    await collection.removeItems(toDelete);
    console.log(`🗑️ ${toDelete.length} ürün silindi.`);
  } finally {
    await framer.disconnect();
  }
}