import { getProducts } from "./bubble.js";
import { upsertItems, removeDeleted } from "./framer.js";

export async function sync() {
  console.log("🔄 Sync başlıyor...");
  const products = await getProducts();
  console.log(`📦 Bubble'dan ${products.length} ürün alındı.`);

  await upsertItems(products);

  // const bubbleIds = products.map((p) => p._id);
  // await removeDeleted(bubbleIds);

  console.log("✅ Sync tamamlandı.");
}

// Direkt çalıştırılırsa (node sync.js)
if (process.argv[1].includes("sync.js")) sync();