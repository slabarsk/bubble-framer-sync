import "dotenv/config";
import { connect } from "framer-api";

const PROJECT_URL = process.env.FRAMER_PROJECT_URL;
const API_KEY = process.env.FRAMER_API_KEY;
const COLLECTION_ID = process.env.FRAMER_URUNLER_COLLECTION_ID;
const KATEGORILER_COLLECTION_ID = process.env.FRAMER_COLLECTION_ID;

function slugify(text) {
  if (!text) return "";
  return text.trim().toLowerCase()
    .replace(/›/g, " ")
    .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
    .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
}

function makePath(text) {
  if (!text) return "";
  return text.split("›").map(s => slugify(s.trim())).join("/");
}

function fixImage(raw) {
  if (!raw) return null;
  if (raw.startsWith("//")) return "https:" + raw;
  if (raw.startsWith("http")) return raw;
  return null;
}

async function getFramerKategoriMap() {
  const framer = await connect(PROJECT_URL, API_KEY);
  try {
    const collection = await framer.getCollection(KATEGORILER_COLLECTION_ID);
    const items = await collection.getItems();
    const map = {};
    for (const item of items) map[item.slug] = item.id;
    console.log(`🗂️  Framer'da ${Object.keys(map).length} kategori bulundu.`);
    return map;
  } finally {
    await framer.disconnect();
  }
}

async function getExistingSlugs() {
  const framer = await connect(PROJECT_URL, API_KEY);
  try {
    const collection = await framer.getCollection(COLLECTION_ID);
    const items = await collection.getItems();
    return new Set(items.map(i => i.slug));
  } finally {
    await framer.disconnect();
  }
}

function getKategoriIds(urun, kategoriMap, framerKategoriMap) {
  const kat = kategoriMap[urun["Kategori"] || ""];
  if (!kat) return [];

  const segments = kat.yol.split("›").map(s => s.trim()).filter(Boolean);
  const ids = [];
  for (let i = 1; i <= segments.length; i++) {
    const partial = segments.slice(0, i).join(" › ");
    const slug = slugify(partial);
    const id = framerKategoriMap[slug];
    if (id) ids.push(id);
  }
  return ids;
}

function mapStok(urun, kategoriMap, framerKategoriMap) {
  const ad = urun["Adı"] || urun["Ad"] || "";
  const slug = slugify(ad);
  const image = fixImage(urun["Görseli"]);
  const fiyat = parseFloat(urun["Fiyat Satış"]) || 0;
  const kat = kategoriMap[urun["Kategori"] || ""];
  const kategoriPath = kat ? makePath(kat.yol) : "";
  const kategoriIds = getKategoriIds(urun, kategoriMap, framerKategoriMap);

  const fieldData = {
    CVeOPTNfF: { type: "string", value: ad },
    IF7Awe2Jq: { type: "string", value: urun["SKU"] || "" },
    Lj6LSocrs: { type: "string", value: urun["Marka"] || "" },
    zrQU0HMQT: { type: "number", value: fiyat },
    g5D7z4KNx: { type: "string", value: urun["Birimi (OS)"] || "Adet" },
    wyTWFfR7y: { type: "string", value: kategoriPath },
  };

  if (kategoriIds.length > 0) {
    fieldData.prOFaP8e2 = { type: "multiCollectionReference", value: kategoriIds };
  }

  if (image) fieldData.XUd7Rz_NE = { type: "image", value: image };
  return { slug, fieldData };
}

export async function upsertUrunler(urunler, kategoriMap) {
  console.log("🔍 Framer mevcut sluglar çekiliyor...");
  const existingSlugs = await getExistingSlugs();
  console.log(`📋 Framer'da ${existingSlugs.size} mevcut ürün var.`);

  const framerKategoriMap = await getFramerKategoriMap();

  const seenSlugs = new Set(existingSlugs);
  const toAdd = [];
  let kategorisiz = 0;

  for (const urun of urunler) {
    const mapped = mapStok(urun, kategoriMap, framerKategoriMap);
    if (!mapped.slug) continue;
    if (seenSlugs.has(mapped.slug)) continue;
    seenSlugs.add(mapped.slug);
    if (!mapped.fieldData.prOFaP8e2) kategorisiz++;
    toAdd.push(mapped);
  }

  console.log(`🆕 ${toAdd.length} yeni ürün eklenecek (${kategorisiz} kategorisiz).`);
  if (toAdd.length === 0) { console.log("✅ Eklenecek yeni ürün yok."); return; }

  const batchSize = 25;
  for (let i = 0; i < toAdd.length; i += batchSize) {
    const framer = await connect(PROJECT_URL, API_KEY);
    try {
      const collection = await framer.getCollection(COLLECTION_ID);
      await collection.addItems(toAdd.slice(i, i + batchSize));
    } finally {
      await framer.disconnect();
    }
    console.log(`  ✓ ${Math.min(i + batchSize, toAdd.length)} / ${toAdd.length}`);
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`✅ ${toAdd.length} ürün eklendi.`);
}
