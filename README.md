# 🔄 Bubble → Framer CMS Sync

Bubble.io veritabanındaki kategoriler ve ürünleri otomatik olarak Framer CMS collection'larına senkronize eden Node.js aracı.

## ✨ Özellikler

- Kategoriler ve ürünleri ayrı ayrı veya birlikte sync eder
- Bubble API'den otomatik sayfalama ile tüm veriyi çeker
- Delta sync: sadece son syncten sonra değişen ürünleri çeker
- Framer'a sadece yeni kayıtları ekler, mevcutları atlar
- Ürünleri tüm ata kategorileriyle (multi-reference) ilişkilendirir
- Express server ile webhook veya zamanlayıcı üzerinden tetiklenebilir

## 📋 Gereksinimler

- Node.js v18+
- Framer projesi (Site Settings → API → API Key)
- Bubble uygulaması (API token ve endpoint)

## 🚀 Kurulum

**1. Repoyu klonla:**
```bash
git clone https://github.com/slabarsk/bubble-framer-sync.git
cd bubble-framer-sync
```

**2. Bağımlılıkları yükle:**
```bash
npm install
```

**3. `.env` dosyasını oluştur:**
```bash
cp .env.example .env
```

**4. `.env` dosyasını doldur:**
```env
BUBBLE_API_URL=https://your-app.bubbleapps.io/api/1.1/obj/kategoriler
BUBBLE_STOK_API_URL=https://your-app.bubbleapps.io/api/1.1/obj/stok
BUBBLE_TOKEN=your_bubble_api_token

FRAMER_API_KEY=fr_xxxxxxxxxxxxxxxx
FRAMER_PROJECT_URL=https://framer.com/projects/Your-Project--xxxxxxxxxxxx
FRAMER_COLLECTION_ID=your_kategoriler_collection_id
FRAMER_URUNLER_COLLECTION_ID=your_urunler_collection_id
```

## 🔑 API Key'leri Nereden Alırsın?

### Bubble
- Bubble uygulaması → Settings → API → Generate API Token

### Framer
- Framer projesi → Site Settings → API → Generate API Key
- Collection ID: CMS → İlgili collection'a tıkla → URL'deki `node=` parametresinden al

## ▶️ Kullanım

**Sadece kategorileri sync et:**
```bash
node src/sync.js kategoriler
```

**Sadece ürünleri sync et:**
```bash
node src/sync.js urunler
```

**Her ikisini birden sync et:**
```bash
node src/sync.js
```

**Server olarak başlat:**
```bash
node server.js
```

Server başladıktan sonra sync tetiklemek için:
```bash
curl -X POST http://localhost:3000/sync-products
```

## 📁 Proje Yapısı
bubble-framer-sync/
├── src/
│   ├── bubble.js          # Kategorileri Bubble'dan çeker
│   ├── framer.js          # Kategorileri Framer'a yazar
│   ├── stok.js            # Ürünleri Bubble'dan çeker + kategori map
│   ├── framer-urunler.js  # Ürünleri Framer'a yazar
│   └── sync.js            # Ana sync (kategoriler / urunler / her ikisi)
├── getfields.js           # Framer collection field ID'lerini listeler
├── server.js              # Express server (webhook için)
├── .env.example           # Örnek environment dosyası
├── .last-sync             # Delta sync timestamp (otomatik oluşur, git'e ekleme)
└── README.md


## ⚠️ Önemli Notlar

- İlk çalıştırmada tüm ürünler çekilir, `.last-sync` dosyası oluşur
- Sonraki çalıştırmalarda sadece değişen ürünler çekilir (delta sync)
- `.last-sync` dosyasını silerek tam sync'e zorlayabilirsin
- Framer field ID'leri `framer.js` ve `framer-urunler.js` içinde tanımlıdır
- Field ID'lerini öğrenmek için: `node getfields.js`
- Ürünler kategorilerle multi-reference olarak ilişkilendirilir; ürün alt kategorideyse tüm ata kategorileri de eklenir