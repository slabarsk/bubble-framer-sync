# 🔄 Bubble → Framer CMS Sync

Bubble.io veritabanındaki verileri otomatik olarak Framer CMS collection'larına senkronize eden Node.js aracı.

## ✨ Özellikler

- Bubble API'den tüm verileri otomatik sayfalama ile çeker (100'er 100'er)
- Framer CMS'e sadece yeni kayıtları ekler, mevcutların üzerine yazmaz
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
BUBBLE_API_URL=https://your-app.bubbleapps.io/api/1.1/obj/your-collection
BUBBLE_TOKEN=your_bubble_api_token

FRAMER_API_KEY=fr_xxxxxxxxxxxxxxxx
FRAMER_COLLECTION_ID=your_collection_id
FRAMER_PROJECT_URL=https://framer.com/projects/Your-Project--xxxxxxxxxxxx
```

## 🔑 API Key'leri Nereden Alırsın?

### Bubble
- Bubble uygulaması → Settings → API → Generate API Token

### Framer
- Framer projesi → Site Settings → API → Generate API Key
- Collection ID: CMS → İlgili collection'a tıkla → URL'den al

## ▶️ Kullanım

**Manuel sync:**
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

```
bubble-framer-sync/
├── src/
│   ├── bubble.js      # Bubble API'den veri çeker
│   ├── framer.js      # Framer CMS'e veri yazar
│   └── sync.js        # Ana sync mantığı
├── server.js          # Express server (webhook için)
├── .env.example       # Örnek environment dosyası
└── README.md
```

## ⚠️ Önemli Notlar

- İlk çalıştırmada tüm veriler eklenir, sonraki çalıştırmalarda sadece yeni kayıtlar eklenir
- Framer collection field ID'leri `framer.js` içindeki `mapProduct` fonksiyonunda tanımlıdır, kendi field ID'lerinle güncelle