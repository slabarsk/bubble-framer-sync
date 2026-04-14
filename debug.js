import "dotenv/config";

// 1. Bir ürünün Kategori ID'sini al
const stokRes = await fetch(`${process.env.BUBBLE_STOK_API_URL}?limit=1`, {
  headers: { Authorization: `Bearer ${process.env.BUBBLE_TOKEN}` }
});
const stok = await stokRes.json();
const urun = stok.response.results[0];
console.log("Ürün Kategori ID:", urun["Kategori"]);

// 2. O ID ile kategoriler endpoint'ini sorgula
const katRes = await fetch(`${process.env.BUBBLE_API_URL}/${urun["Kategori"]}`, {
  headers: { Authorization: `Bearer ${process.env.BUBBLE_TOKEN}` }
});
const kat = await katRes.json();
console.log("Kategori kaydı:", JSON.stringify(kat.response, null, 2));
