import { getProducts } from "./bubble.js";
import { upsertItems } from "./framer.js";
import { getStoklar, getKategoriMap } from "./stok.js";
import { upsertUrunler } from "./framer-urunler.js";

export async function syncKategoriler() {
  console.log("🔄 Kategori sync başlıyor...");
  const products = await getProducts();
  console.log(`📦 ${products.length} kategori alındı.`);
  await upsertItems(products);
  console.log("✅ Kategori sync tamamlandı.");
}

export async function syncUrunler() {
  console.log("🔄 Ürün sync başlıyor...");
  const kategoriMap = await getKategoriMap();
  const urunler = await getStoklar();
  await upsertUrunler(urunler, kategoriMap);
  console.log("✅ Ürün sync tamamlandı.");
}

export async function sync() {
  await syncKategoriler();
  await syncUrunler();
}

const arg = process.argv[2];
if (process.argv[1].includes("sync.js")) {
  if (arg === "kategoriler") syncKategoriler();
  else if (arg === "urunler") syncUrunler();
  else sync();
}
