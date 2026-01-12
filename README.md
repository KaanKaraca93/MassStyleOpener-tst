# Mass Trim Opener - PLM Integration System

PLM'de DocLib'den görsel çekip otomatik ürün oluşturma sistemi.

## 🚀 Kurulum

```bash
npm install
```

## ⚙️ Konfigürasyon

`.env` dosyasında PRD environment ayarları mevcut.

## 🧪 Test

```bash
# DocLib endpoint test
npm test

# Server başlat
npm start

# Development mode (auto-reload)
npm run dev
```

## 📋 Akış

1. **DocLib Data Get**: DocLibId ile doküman verilerini çek
2. **Image Download**: Görseli indir
3. **Product Creation**: PLM'de ürün oluştur
4. **Image Upload**: Görseli ürüne yükle

## 🔑 Environment Variables

- `PLM_ENV`: production
- `PLM_TENANT`: ATJZAMEWEF5P4SNV_PRD
- `PLM_SCHEMA`: FSH2
- `PLM_USER_ID`: 6
