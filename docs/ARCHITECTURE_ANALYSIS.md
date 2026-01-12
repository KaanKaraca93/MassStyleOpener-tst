# Mimari Analiz: Hiyerarşi Verisi Yönetimi

## 🎯 Gerekli Veriler

### DocLib API'den Gelen Veriler (Real-time)
- ✅ `BrandId`: 5
- ✅ `SeasonId`: 5
- ✅ `ProductSubSubCategoryId`: 20

### Hiyerarşiden Türetilmesi Gereken Veriler
- ❓ `DivisionId`: 4 (BrandId + SubSubCategoryId → Division)
- ❓ `CategoryId`: 12 (BrandId + SubSubCategoryId → Category)
- ❓ `SubCategoryId`: 6 (BrandId + SubSubCategoryId → SubCategory)
- ❓ `UserDefinedField2Id`: 87 (BrandId + SubSubCategoryId → CustomField)

---

## 🏗️ Yaklaşım 1: Scheduled Cache (Günlük Hiyerarşi Sync)

### Mimari
```
┌─────────────────────────────────────────┐
│   Heroku Scheduler (Addon - FREE)      │
│   Her gün 1 kez çalışır                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Sync Job (scheduled endpoint)        │
│   - PLM'den hiyerarşi verisi çek        │
│   - Memory/File cache'e kaydet          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Cache (In-Memory veya JSON File)     │
│   {                                     │
│     "5-20": {                          │
│       "DivisionId": 4,                 │
│       "CategoryId": 12,                │
│       "SubCategoryId": 6               │
│     }                                   │
│   }                                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Request Handler                       │
│   - DocLib data çek                     │
│   - Cache'den hiyerarşi map et          │
│   - Style oluştur                       │
└─────────────────────────────────────────┘
```

### Avantajlar ✅
1. **Performans**: Her istekte hiyerarşi API çağrısı yok
2. **API Limit**: PLM API call'ları azalır
3. **Response Time**: ~2-3 saniye daha hızlı
4. **Heroku Scheduler**: FREE addon (daily job için yeterli)

### Dezavantajlar ❌
1. **Heroku Eco Dyno Sleep**: 30 dk inactivity sonrası uyur
   - İlk istek cold start: ~10-15 saniye
   - Cache memory'de ise uyanınca kaybolur
2. **File System Ephemeral**: Dyno restart olunca cache kaybolur
3. **Cache Staleness**: Güncel olmayan veri riski (24 saat eski olabilir)
4. **Complexity**: Cache invalidation, sync logic

### Heroku Eco Dyno ile Uygunluk
- ⚠️ **Sleep Mode Sorunu**: Cache memory'de ise kaybolur
- ✅ **Çözüm**: Cache'i dosya sistemine yaz (`/tmp/hierarchy-cache.json`)
- ⚠️ **Risk**: Dyno restart'ta dosya kaybolur (her deploy'da)

---

## 🏗️ Yaklaşım 2: Real-time Hiyerarşi Lookup (Her İstekte)

### Mimari
```
┌─────────────────────────────────────────┐
│   Request Handler                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   1. DocLib Data Fetch                  │
│      GET DocLibId=16                    │
│      Response: BrandId, SubSubCat, etc. │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   2. Hierarchy Lookup (PLM View API)    │
│      GET Hierarchy by BrandId + SubSub  │
│      Response: Division, Cat, SubCat    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   3. Style Creation                     │
│      POST pdm/api/pdm/style/v2/save    │
└─────────────────────────────────────────┘
```

### Avantajlar ✅
1. **Basitlik**: Tek bir akış, cache yok
2. **Always Fresh**: Her zaman güncel hiyerarşi
3. **Stateless**: Dyno sleep/restart'tan etkilenmez
4. **Maintainability**: Az kod, az bug
5. **Heroku Eco Uyumlu**: Sleep mode ile sorunsuz çalışır

### Dezavantajlar ❌
1. **Performans**: Her istekte +1 API call (+1-2 saniye)
2. **API Calls**: 100 istek = 300 API call (DocLib + Hierarchy + Style)
3. **Response Time**: Ortalama 5-7 saniye (vs. 3-4 saniye cached)

---

## 🔍 Heroku Eco Dyno Analizi

### Eco Dyno Özellikleri
- **Fiyat**: $5/month
- **RAM**: 512 MB
- **CPU**: Shared
- **Sleep**: 30 dakika inactivity sonrası
- **Concurrency**: 1 web process, ama Node.js async olduğu için multiple requests

### Concurrent Request Handling

**Senaryo**: 100 istek toplu gelir, sırayla ama overlap olabilir

#### Node.js Express Davranışı:
```javascript
// Express single-threaded ama async
// Event loop ile multiple requests handle eder

Request 1: ─────[API Call]─────────────[Response]
Request 2:   ─────[API Call]─────────────[Response]
Request 3:     ─────[API Call]─────────────[Response]
...
Request 100:                  ─────[API Call]─────[Response]
```

**Eco Dyno ile:**
- ✅ Aynı anda 10-20 request handle edebilir (I/O bound)
- ✅ Heroku otomatik queue'ya alır (max connection pool)
- ⚠️ 100 request aynı anda gelirse:
  - İlk 10-20'si paralel işlenir
  - Geri kalanı Heroku router queue'sunda bekler
  - Timeout: 30 saniye (Heroku H12 error)

### Memory Kullanımı Tahmini

**Yaklaşım 1 (Scheduled Cache):**
```
Base Node.js: ~50 MB
Express: ~20 MB
Cache (JSON): ~1-5 MB (hiyerarşi verisi)
Active Requests (10x): ~10 MB
TOTAL: ~80-85 MB
```
✅ 512 MB'a sığar

**Yaklaşım 2 (Real-time):**
```
Base Node.js: ~50 MB
Express: ~20 MB
Active Requests (10x): ~10 MB
TOTAL: ~80 MB
```
✅ 512 MB'a sığar

---

## 💰 Maliyet Analizi

### Yaklaşım 1 (Scheduled Cache)
| Bileşen | Maliyet | Notlar |
|---------|---------|--------|
| Eco Dyno | $5/month | Web server |
| Heroku Scheduler | FREE | Günlük sync job |
| **TOPLAM** | **$5/month** | |

**Ek Maliyet Riski:**
- ❌ Cache File System Ephemeral → Deploy'da cache kaybolur
- ❌ Her deploy sonrası manuel sync gerekebilir

### Yaklaşım 2 (Real-time)
| Bileşen | Maliyet | Notlar |
|---------|---------|--------|
| Eco Dyno | $5/month | Web server |
| **TOPLAM** | **$5/month** | |

**Ek Benefit:**
- ✅ Basit deployment
- ✅ Zero maintenance overhead

---

## ⚡ Performans Karşılaştırması

### Yaklaşım 1 (Cached)
```
Request → DocLib (1.5s) → Cache Lookup (0.01s) → Style Create (1.5s) → Response
TOTAL: ~3 saniye

100 Request (Sequential): ~300 saniye = 5 dakika
100 Request (10x Parallel): ~30 saniye
```

### Yaklaşım 2 (Real-time)
```
Request → DocLib (1.5s) → Hierarchy (1.5s) → Style Create (1.5s) → Response
TOTAL: ~4.5 saniye

100 Request (Sequential): ~450 saniye = 7.5 dakika
100 Request (10x Parallel): ~45 saniye
```

**Fark**: Request başına +1.5 saniye

---

## 🎯 ÖNERİ: Hybrid Yaklaşım

**En İyi Çözüm:**

```javascript
// In-Memory Cache with Lazy Loading + TTL

class HierarchyService {
    constructor() {
        this.cache = new Map(); // Memory cache
        this.ttl = 24 * 60 * 60 * 1000; // 24 hours
    }
    
    async getHierarchy(brandId, subSubCategoryId) {
        const key = `${brandId}-${subSubCategoryId}`;
        const cached = this.cache.get(key);
        
        // Cache hit ve fresh ise
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            console.log('✅ Cache HIT');
            return cached.data;
        }
        
        // Cache miss veya stale ise
        console.log('❌ Cache MISS - Fetching from API');
        const data = await this.fetchFromPLM(brandId, subSubCategoryId);
        
        // Cache'e kaydet
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        return data;
    }
}
```

### Hybrid Yaklaşımın Avantajları ✅
1. **İlk İstek**: Real-time fetch (4.5s)
2. **Sonraki İstekler (24h içinde)**: Cache'den (3s)
3. **100 Toplu İstek**: 
   - İlk 1-2 unique hierarchy: 4.5s (fetch)
   - Geri kalan 98-99: 3s (cached)
4. **Dyno Sleep**: Cache kaybolur ama sorun değil, ilk istek yeniden fetch eder
5. **Zero Maintenance**: Scheduled job yok
6. **Always Eventually Fresh**: 24h TTL

### Kullanım Senaryosu için Mükemmel
- ✅ "Birkaç haftada bir toplu istek" → Her toplu işlemde cache warm olur
- ✅ Aynı Brand+SubSubCategory çok tekrar ediyorsa → Huge performance gain
- ✅ Eco Dyno sleep → Sorun değil, ilk request yeniden fetch eder

---

## 📊 Karar Matrisi

| Kriter | Yaklaşım 1 (Scheduled) | Yaklaşım 2 (Real-time) | Hybrid (ÖNERİ) |
|--------|------------------------|------------------------|----------------|
| **Performans** | ⭐⭐⭐⭐⭐ (3s) | ⭐⭐⭐ (4.5s) | ⭐⭐⭐⭐⭐ (3s cached) |
| **Basitlik** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Maliyet** | ⭐⭐⭐⭐⭐ ($5) | ⭐⭐⭐⭐⭐ ($5) | ⭐⭐⭐⭐⭐ ($5) |
| **Eco Uyum** | ⭐⭐ (cache loss) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Freshness** | ⭐⭐⭐ (24h stale) | ⭐⭐⭐⭐⭐ (always) | ⭐⭐⭐⭐⭐ (24h TTL) |
| **Maintenance** | ⭐⭐ (sync job) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Toplam** | ⭐⭐⭐ (14/30) | ⭐⭐⭐⭐⭐ (27/30) | ⭐⭐⭐⭐⭐ (28/30) |

---

## ✅ SONUÇ VE ÖNERİ

### 🏆 Hybrid Yaklaşım (In-Memory Cache + Lazy Load)

**Neden?**
1. ✅ **Performans**: Cache hit'te 3s, miss'te 4.5s
2. ✅ **Basitlik**: Scheduled job yok, tek akış
3. ✅ **Eco Dyno Uyumlu**: Sleep mode'dan etkilenmez
4. ✅ **Maliyet**: $5/month (ek maliyet yok)
5. ✅ **Maintenance**: Zero overhead
6. ✅ **Freshness**: 24h TTL ile reasonable
7. ✅ **Kullanım Senaryosu**: Toplu isteklerde cache warm olur

**Implementasyon:**
```javascript
// 1. In-memory cache with TTL
// 2. Lazy loading (first request fetches, others use cache)
// 3. Automatic cache eviction after 24h
// 4. No scheduled jobs
```

### 🎯 Aksiyon Planı

1. **Hybrid HierarchyService oluştur** (in-memory cache + lazy load)
2. **Style creation endpoint** ekle
3. **Test**: 100 sequential request ile performans ölç
4. **Monitor**: Heroku metrics ile memory/response time izle
5. **Optimize**: Gerekirse cache TTL ayarla

---

Hybrid yaklaşım ile devam edelim mi? 🚀
