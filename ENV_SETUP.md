# Environment Variables Setup

Projeyi çalıştırmak için `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

## .env Dosyası İçeriği

```bash
# PLM Environment Configuration - PRODUCTION
PLM_ENV=production

# PLM PRD Credentials
PLM_TENANT=ATJZAMEWEF5P4SNV_PRD
PLM_SCHEMA=FSH2
PLM_USER_ID=6

# OAuth 2.0 Configuration
PLM_CLIENT_ID=ATJZAMEWEF5P4SNV_PRD~zWbsEgkMBlqdSXoSAXBiM8V1POA0-2Mkn1qkORhxma0
PLM_CLIENT_SECRET=Ll2ehfOJ14uXzyLwR-6BIUmnQNFfhSFRadOzhfzIgK8DBs0x8_AQ3vqbiNrCVOfTyN3_v_Vyf1Yq4WMA7F68hg
PLM_SERVICE_ACCOUNT_KEY=ATJZAMEWEF5P4SNV_PRD#fAzHs-Kdtut0xOXsRx1rnc4kB9icdTJ25HPE65-3-Q0G477cLbXRgPOsL0JjhQCA2VlgbJvK400_9ZaezhMKIQ
PLM_SERVICE_ACCOUNT_SECRET=Bd7aqwQd7K8Xw8uMLffxlNrM8oROajrY18EVpPalakqECxXs5HzFzZoT45JBKtUGZvfacr8bCrgCmgscu71rTA

# API URLs
PLM_TOKEN_URL=https://mingle-sso.eu1.inforcloudsuite.com:443/ATJZAMEWEF5P4SNV_PRD/as/token.oauth2
PLM_BASE_URL=https://mingle-ionapi.eu1.inforcloudsuite.com/ATJZAMEWEF5P4SNV_PRD/FASHIONPLM

# Server Configuration
PORT=5000
```

## .env Dosyası Oluşturma

Proje root dizininde `.env` dosyası oluşturun ve yukarıdaki içeriği kopyalayın.

**Not:** `.env` dosyası `.gitignore`'da olduğu için Git'e commit edilmeyecektir.

## Alternatif

Eğer `.env` dosyası oluşturmak istemiyorsanız, krediler `src/config/config.js` içinde default olarak tanımlıdır ve direkt çalışacaktır.
