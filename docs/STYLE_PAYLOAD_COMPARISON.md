# Style Payload Karşılaştırması

## 🔍 Gönderdiğimiz Payload vs. Orijinal

### ✅ GÖNDERDIĞIMIZ ALANLAR:

| Field Name | Bizim Değer | Tip | Kaynak |
|------------|-------------|-----|--------|
| `key` | "0" | String | Sabit |
| `userId` | 6 | Number | Config |
| `notificationMessageKey` | "CREATED_STYLE_OVERVIEW" | String | Sabit |
| `BrandId` | "5" | String | DocLib |
| `DivisionId` | "4" | String | Hierarchy |
| `CategoryId` | "12" | String | Hierarchy |
| `SeasonId` | "5" | String | DocLib |
| `SubCategoryId` | "6" | String | Hierarchy |
| `ProductSubSubCategoryId` | "20" | String | DocLib |
| `UserDefinedField2Id` | "87" | String | Hierarchy |
| `CreateId` | 6 | Number | Config |
| `AcqCode` | 1 | Number | Sabit |
| `IsFfPhantom` | 1 | Number | Sabit |
| `IsNosItem` | 1 | Number | Sabit |
| `IsModified` | 1 | Number | Sabit |
| `SizeCodeAndName` | "" | String | Sabit |
| `Original_Name` | "" | String | Sabit |
| `Original_Description` | "" | String | Sabit |
| `StyleCode` | null | null | Auto |
| `Name` | null | null | Auto |
| `Description` | "Auto-created from..." | String | Custom |
| `modifyId` | "6" | String | Config |
| `locale` | "en-US" | String | Sabit |
| `isGenAiGenerated` | false | Boolean | Sabit |
| `Schema` | "FSH2" | String | Config |

---

## ❌ EKSİK OLABILECEK ALANLAR (Orijinal Payload'da Var):

### 1. Null/Boş Alanlar (Orijinalde Var):
```json
{
  "fieldName": "UserDefinedField13Ids",
  "value": null
},
{
  "fieldName": "cc4fdbe7-c46e-41e7-8047-29793bccfdd0",
  "value": null
},
{
  "fieldName": "MaterialCode",
  "value": null
},
{
  "fieldName": "UserDefinedField1Id",
  "value": null
},
{
  "fieldName": "UserDefinedField3Id",
  "value": null
},
{
  "fieldName": "df0b43c1-a3eb-41ed-a223-12775e76dac6",
  "value": null
},
{
  "fieldName": "UserDefinedField9Ids",
  "value": null
},
{
  "fieldName": "bf0a0a00-25e1-450c-8b79-e824994cdfcc",
  "value": null
},
{
  "fieldName": "MarketField5Id",
  "value": null
},
{
  "fieldName": "UserDefinedField7Id",
  "value": null
},
{
  "fieldName": "UserDefinedField5Id",
  "value": null
},
{
  "fieldName": "0e41ca5e-d812-47e5-8b5b-3e018294683b",
  "value": null
},
// ... ve daha fazla GUID alanlar
```

### 2. Settings Field (Büyük JSON String):
```json
{
  "settings": {
    "key": "bomdetails",
    "value": "{\"decimalCount\":{\"qty\":2},\"colorFormat\":{\"type\":\"3\",\"withPitch\":true},\"autoCascadeDataToBOM\":...}"
  }
}
```

---

## 🔧 POTANSİYEL SORUNLAR:

### 1. **Settings Eksik**
Orijinal payload'da büyük bir `settings` objesi var. Bu StyleCode generation için gerekli olabilir.

### 2. **GUID Alanları Eksik**
Orijinalde birçok GUID field name var (custom fields), bunlar eksik.

### 3. **FieldValue Formatları**
- Bazı değerler string, bazıları number
- `key` = "0" (string) ama `CreateId` = 6 (number)

### 4. **Null Fields**
Orijinalde `fieldName: null, value: null` olan alanlar var, biz hiç göndermedik.

---

## 🎯 ÖNERİLER:

### Çözüm 1: Settings Ekle
```json
{
  "settings": {
    "key": "bomdetails",
    "value": "{\"decimalCount\":{\"qty\":2},\"colorFormat\":{\"type\":\"3\",\"withPitch\":true},\"autoCascadeDataToBOM\":{\"autoCascadeMaterial\":{\"isActive\":true,\"fields\":{\"Code\":true,\"Name\":true,\"Description\":true,\"Notes\":true,\"MainCategoryId\":true,\"ComponentCategoryGroupId\":true,\"CategoryId\":true,\"Image\":true,\"Placement\":true,\"Composition\":true,\"FreeFieldCert\":true,\"IsCriticalMaterial\":true,\"IsChemicalWarning\":true,\"Status\":true,\"Supplier\":\"false\",\"QuantityUOM\":true,\"WastePercent\":true,\"CurrencyId\":true,\"PurchasePrice\":true,\"Construction\":true,\"Weight\":true,\"WeightUOMId\":true,\"Finish\":true,\"UserDefinedField1\":true,\"UserDefinedField2\":true,\"UserDefinedField3\":true,\"UserDefinedField4\":true,\"UserDefinedField12\":true,\"UserDefinedField13\":true,\"FreeField1\":true,\"FreeField2\":true,\"FreeField3\":true}},\"autoCascadeTrim\":{\"isActive\":true,\"fields\":{\"Code\":true,\"Name\":true,\"Description\":true,\"Notes\":true,\"MainCategoryId\":true,\"ComponentCategoryGroupId\":true,\"CategoryId\":true,\"Image\":true,\"Placement\":true,\"Composition\":true,\"FreeFieldCert\":true,\"IsCriticalMaterial\":true,\"IsChemicalWarning\":true,\"Status\":true,\"Supplier\":\"false\",\"QuantityUOM\":true,\"WastePercent\":true,\"CurrencyId\":true,\"PurchasePrice\":true,\"Construction\":true,\"Weight\":true,\"WeightUOMId\":true,\"Finish\":true,\"UserDefinedField1\":true,\"UserDefinedField2\":true,\"UserDefinedField3\":true,\"UserDefinedField4\":true,\"UserDefinedField12\":true,\"UserDefinedField13\":true,\"FreeField1\":true,\"FreeField2\":true,\"FreeField3\":true}},\"autoCascadeStyle\":{\"isActive\":false,\"fields\":{\"CategoryId\":false,\"SubCategoryId\":false,\"ProductSubSubCategoryId\":false,\"CostPrice\":false,\"Description\":false,\"FreeField1\":false,\"FreeField2\":false,\"FreeField3\":false,\"Image\":false,\"Name\":false,\"Notes\":false,\"Code\":false,\"PurchasePrice\":false,\"UOMId\":false,\"Status\":false,\"SupplierId\":\"false\",\"UserDefinedField1\":false,\"UserDefinedField2\":false,\"UserDefinedField3\":false,\"UserDefinedField4\":false,\"UserDefinedField12\":false,\"UserDefinedField13\":false,\"CurrencyId\":false}},\"enableAutoCascade\":true},\"calculations\":[]}"
  }
}
```

### Çözüm 2: Tüm Null Alanları Ekle
Orijinaldeki tüm null fieldları da payload'a ekle.

### Çözüm 3: ModifyId Format
`modifyId` hem top-level'da hem de fieldValues içinde olmalı mı?

---

## 📝 TEST İÇİN:

1. **Settings ekle** → Test et
2. **Null fields ekle** → Test et
3. **GUID fields ekle** → Test et
4. **Tüm orijinal alanları ekle** → Test et

---

## 🔍 HANGİ ALANLARI EKLEYEYİM?

Orijinal payload'unuzda hangi alanlar vardı? Paylaşırsanız birebir karşılaştırma yapalım.
