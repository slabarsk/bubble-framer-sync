import fs from "fs";

const LAST_SYNC_FILE = ".last-sync";
const TEST_LIMIT = 100; // = null; dersen tümünü çeker

function slugify(text) {
  if (!text) return "";
  return text.trim().toLowerCase()
    .replace(/›/g, " ")
    .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
    .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
}

function getLastSyncDate() {
  try { return fs.readFileSync(LAST_SYNC_FILE, "utf8").trim(); } catch { return null; }
}

function saveLastSyncDate() {
  fs.writeFileSync(LAST_SYNC_FILE, new Date().toISOString());
}

export async function getStoklar() {
  let results = [], cursor = 0;
  const limit = 100;
  const lastSync = getLastSyncDate();
  let constraints = "";

  if (lastSync) {
    console.log(`📅 Son sync: ${lastSync} — sadece değişenler çekiliyor...`);
    const filter = JSON.stringify([
      { key: "Modified Date", constraint_type: "greater than", value: lastSync }
    ]);
    constraints = `&constraints=${encodeURIComponent(filter)}`;
  } else {
    console.log("📦 İlk sync — tüm ürünler çekiliyor...");
  }

  while (true) {
    const url = `${process.env.BUBBLE_STOK_API_URL}?limit=${limit}&cursor=${cursor}${constraints}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.BUBBLE_TOKEN}` } });
    if (!res.ok) throw new Error(`Bubble stok API hatası: ${res.status}`);
    const data = await res.json();
    const batch = data.response.results;
    results = results.concat(batch);
    console.log(`  ✓ ${results.length} ürün`);
    if (TEST_LIMIT && results.length >= TEST_LIMIT) {
      console.log(`⚠️  Test limiti (${TEST_LIMIT}) doldu.`);
      break;
    }
    if (batch.length < limit) break;
    cursor += limit;
  }

  saveLastSyncDate();
  console.log(`✅ Toplam ${results.length} ürün çekildi.`);
  return results;
}

export async function getKategoriMap() {
  let results = [], cursor = 0;
  const limit = 100;
  while (true) {
    const url = `${process.env.BUBBLE_API_URL}?limit=${limit}&cursor=${cursor}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.BUBBLE_TOKEN}` } });
    if (!res.ok) throw new Error(`Bubble kategori API hatası: ${res.status}`);
    const data = await res.json();
    const batch = data.response.results;
    results = results.concat(batch);
    if (batch.length < limit) break;
    cursor += limit;
  }

  const map = {};
  for (const kat of results) {
    if (!kat._id) continue;
    map[kat._id] = {
      ad: kat["Ad"] || "",
      slug: slugify(kat["Kategori Yolu"] || kat["Ad"] || ""),
      yol: kat["Kategori Yolu"] || kat["Ad"] || ""
    };
  }
  console.log(`✅ ${Object.keys(map).length} kategori eşleştirildi.`);
  return map;
}
