import "dotenv/config";
import { connect } from "framer-api";

const PROJECT_URL = process.env.FRAMER_PROJECT_URL;
const API_KEY = process.env.FRAMER_API_KEY;
const COLLECTION_ID = process.env.FRAMER_COLLECTION_ID;

function slugify(text) {
  if (!text) return "";
  return text.trim().toLowerCase()
    .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
    .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
}

function makePath(text) {
  if (!text) return "";
  return text.split("›").map(s => slugify(s.trim())).join("/");
}

function makeSlug(text) {
  return makePath(text).replace(/\//g, "-");
}

function makeParentPath(yol) {
  const segments = yol.split("›").map(s => s.trim()).filter(Boolean);
  if (segments.length <= 1) return "";
  return segments.slice(0, -1).map(s => slugify(s)).join("/");
}

function mapProduct(product) {
  const rawImage = product["Kapak Görseli"];
  const image = rawImage && rawImage.startsWith("//")
    ? "https:" + rawImage
    : rawImage && rawImage.startsWith("http")
    ? rawImage
    : null;

  const ad = product["Ad"] || "";
  const yol = product["Kategori Yolu"] || ad;
  const slug = makeSlug(yol);
  const path = makePath(yol);
  const parentPath = makeParentPath(yol);

  const fieldData = {
    bWIhncZqz: { type: "string", value: ad },
    zLxYmcPSU: { type: "string", value: product["Açıklaması"] || "" },
    GcUwYrXYY: { type: "string", value: path },
    NF8Od17Pb: { type: "string", value: parentPath },
  };

  if (image) fieldData.GJ_Ilr9Ru = { type: "image", value: image };
  return { slug, fieldData };
}

export async function upsertItems(products) {
  // Mevcut item ID map'i çek (slug → nodeId)
  const framer = await connect(PROJECT_URL, API_KEY);
  let existingMap;
  try {
    const collection = await framer.getCollection(COLLECTION_ID);
    const existingItems = await collection.getItems();
    existingMap = new Map(existingItems.map(item => [item.slug, item.id]));
  } finally {
    await framer.disconnect();
  }

  const toAdd = [];
  const toUpdate = []; // { id, fieldData }

  for (const product of products) {
    const mapped = mapProduct(product);
    if (!mapped.slug) continue;
    if (existingMap.has(mapped.slug)) {
      toUpdate.push({ id: existingMap.get(mapped.slug), fieldData: mapped.fieldData });
    } else {
      toAdd.push(mapped);
    }
  }

  // Yeni ekle
  if (toAdd.length > 0) {
    const framer = await connect(PROJECT_URL, API_KEY);
    try {
      const collection = await framer.getCollection(COLLECTION_ID);
      await collection.addItems(toAdd);
      console.log(`✅ ${toAdd.length} yeni kategori eklendi.`);
    } finally {
      await framer.disconnect();
    }
  }

  // Güncelle — her batch'te yeni bağlantı + item'ları yeniden çek
  if (toUpdate.length > 0) {
    const batchSize = 10;
    for (let i = 0; i < toUpdate.length; i += batchSize) {
      const batch = toUpdate.slice(i, i + batchSize);
      const framer = await connect(PROJECT_URL, API_KEY);
      try {
        const collection = await framer.getCollection(COLLECTION_ID);
        const freshItems = await collection.getItems();
        const freshMap = new Map(freshItems.map(item => [item.id, item]));
        for (const { id, fieldData } of batch) {
          const item = freshMap.get(id);
          if (item) await item.setAttributes({ fieldData });
        }
      } finally {
        await framer.disconnect();
      }
      console.log(`  ✓ ${Math.min(i + batchSize, toUpdate.length)} / ${toUpdate.length} güncellendi`);
      await new Promise(r => setTimeout(r, 1000));
    }
    console.log(`✅ ${toUpdate.length} kategori güncellendi.`);
  }

  if (toAdd.length === 0 && toUpdate.length === 0) {
    console.log("✅ Değişiklik yok.");
  }
}
