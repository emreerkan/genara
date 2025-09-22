# Genara - Number Validation & Generation Tool

[![CI/CD Pipeline](https://github.com/emreerkan/genara/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/emreerkan/genara/actions)
[![codecov](https://codecov.io/gh/emreerkan/genara/branch/main/graph/badge.svg)](https://codecov.io/gh/emreerkan/genara)
[![npm version](https://badge.fury.io/js/genara.svg)](https://badge.fury.io/js/genara)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Modern TypeScript tabanlı Türk kimlik numaraları ve uluslararası standartlar için kapsamlı doğrulama, üretme ve tamamlama aracı.

## 🚀 Özellikler

- ✅ **TCKN** (TC Kimlik Numarası) - Türk kimlik numarası algoritması
- ✅ **VKN** (Vergi Kimlik Numarası) - Türk vergi numarası doğrulaması
- ✅ **IBAN** - Türk IBAN doğrulaması ve üretimi
- ✅ **Kredi Kartı** - Luhn algoritması ile kart doğrulaması (Visa, Mastercard, Amex, Discover, JCB, Diners)
- ✅ **IMEI** - Cihaz kimlik numarası doğrulaması
- ✅ **ISBN** - Kitap kimlik numarası (ISBN-10 ve ISBN-13)
- ✅ **EAN/UPC** - Barkod doğrulaması (EAN-13, EAN-8, UPC-A)

## 📊 Test Kapsamı

Bu proje %100 test kapsamı ile kapsamlı bir test süitine sahiptir:

- **440 test** 8 farklı test dosyasında
- **Otomatik CI/CD** GitHub Actions ile
- **Kod kalitesi** kontrolü ve güvenlik denetimi
- **Kapsamlı algoritma testleri** her servis için

## 📦 Kurulum

### NPM'den Kurulum
```bash
# Global kurulum (CLI kullanımı için)
npm install -g genara

# Proje bağımlılığı olarak
npm install genara
```

### Geliştirici Kurulumu
```bash
git clone https://github.com/emreerkan/genara.git
cd genara
npm install
npm run build
```

## 🚀 Hızlı Başlangıç

### Komut Satırı Kullanımı
```bash
# Rastgele numara üretme
genara tckn                           # TCKN üret
genara vkn 5                          # 5 adet VKN üret
genara iban                           # IBAN üret

# Doğrulama
genara 12345678950                    # Otomatik servis tespit
genara -s tckn 12345678950            # TCKN olarak doğrula

# Tamamlama
genara -a complete -s vkn 123456789   # 9 haneli değeri tamamla
```

### Programmatik Kullanım
```typescript
import { ServiceFactory, TcknService } from 'genara';

// Direkt servis kullanımı
const tcknService = new TcknService();
const isValid = tcknService.validate('12345678950');
const newTckn = tcknService.generate();

// Factory pattern ile
const service = ServiceFactory.getService('tckn');
const completed = service.complete('123456789');
```

## 📖 API Dokümantasyonu

### Temel Arayüz

Tüm servisler `NumberService` arayüzünü uygular:

```typescript
interface NumberService {
  getName(): string;
  getExpectedLength(): number | [number, number];
  validate(input: string): boolean;
  generate(): string;
  complete(partial: string): string;
}
```

### Servis Detayları

#### 🇹🇷 TCKN (Türkiye Cumhuriyeti Kimlik Numarası)
```typescript
import { TcknService } from 'genara';

const service = new TcknService();

// Doğrulama
service.validate('12345678950');        // boolean

// Üretme  
service.generate();                     // string (11 haneli)

// Tamamlama
service.complete('123456789');          // 9 haneli prefix'ten tam TCKN
```

**Algoritma Kuralları:**
- 11 haneli olmalı
- İlk hane 0 olamaz
- Tekrarlayan diziler geçersiz (11111111110, vb.)
- Özel matematik formülü ile doğrulama

#### 🇹🇷 VKN (Vergi Kimlik Numarası)
```typescript
import { VknService } from 'genara';

const service = new VknService();
service.validate('1234567890');         // boolean
service.generate();                     // string (10 haneli)
service.complete('123456789');          // 9 haneli prefix'ten tam VKN
```

#### 🏦 IBAN (International Bank Account Number)
```typescript
import { IbanService } from 'genara';

const service = new IbanService();
service.validate('TR55 0001 0085 1181 0251 4836 13');  // boolean
service.generate();                     // TR ile başlayan formatlanmış IBAN
service.complete('TR55');               // Kısmi IBAN'ı tamamla
```

#### 💳 Kredi Kartı
```typescript
import { CreditCardService } from 'genara';

const service = new CreditCardService();
service.validate('4532 0151 1283 0366');               // boolean (Luhn algoritması)
service.generate();                                     // Rastgele geçerli kart
service.generateWithOptions({ cardType: 'visa' });     // Belirli kart türü
service.complete('4532');                               // Visa prefix'ini tamamla

// Desteklenen kart türleri
const types = ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'diners'];
```

#### 📱 IMEI (International Mobile Equipment Identity)
```typescript
import { ImeiService } from 'genara';

const service = new ImeiService();
service.validate('12 345678 901234 5');    // boolean (Luhn + TAC kontrolü)
service.generate();                         // Gerçek TAC kodlu IMEI
service.complete('123456');                 // TAC prefix'ini tamamla
```

#### 📚 ISBN (International Standard Book Number)
```typescript
import { IsbnService } from 'genara';

const service = new IsbnService();
service.validate('978-3-16-148410-0');      // ISBN-13
service.validate('0-306-40615-2');          // ISBN-10
service.generate();                         // ISBN-10 veya ISBN-13
service.complete('978-3-16');               // Kısmi ISBN'i tamamla
```

#### 🏷️ EAN/UPC (European/Universal Product Code)
```typescript
import { EanService } from 'genara';

const service = new EanService();
service.validate('1 234567 890123');        // EAN-13
service.validate('12345670');               // EAN-8
service.validate('036000291452');           // UPC-A
service.generate();                         // EAN-13/EAN-8/UPC-A
service.complete('123456');                 // Kısmi kodu tamamla
```

### ServiceFactory

Dinamik servis yönetimi için:

```typescript
import { ServiceFactory, ServiceType } from 'genara';

// Servis alma
const service = ServiceFactory.getService('tckn');
const service2 = ServiceFactory.getService(ServiceType.CREDIT_CARD);

// Mevcut servisler
const services = ServiceFactory.getAvailableServices();
// ['tckn', 'vkn', 'iban', 'creditcard', 'imei', 'isbn', 'ean']

// Takma adlar
const aliases = ServiceFactory.getServiceAliases();
// { tckn: 'tckn', upc: 'ean', ... }

// Otomatik tespit
const detected = ServiceFactory.detectServiceType('12345678950');
// 'tckn' (11 haneli sayı için)

const possible = ServiceFactory.detectPossibleServiceTypes('1234567890');
// ['vkn', 'isbn'] (10 haneli için birden fazla olasılık)
```

## 🧪 Test ve Kalite

### Test Kapsamı
```bash
npm test                    # Tüm testleri çalıştır
npm run test:coverage       # Coverage raporu ile
npm run test:watch          # İzleme modunda
```

**Mevcut Test Durumu:**
- ✅ **440 test** toplamda
- ✅ **100%** statement coverage
- ✅ **100%** branch coverage
- ✅ **100%** function coverage

### Kod Kalitesi
```bash
npm run lint               # TypeScript tip kontrolü
npm run type-check         # Sadece tip kontrolü
npm run format             # Kod formatlaması
```

### CI/CD Pipeline
- ✅ GitHub Actions ile otomatik test
- ✅ Codecov entegrasyonu
- ✅ Multi-version Node.js desteği (16.x, 18.x, 20.x)
- ✅ Güvenlik denetimi
- ✅ Tag tabanlı yayın iş akışı (npm + GitHub Release)

## 🚀 Yayınlama

Yeni bir sürüm yayınlamak için kısa akış:

1. `package.json` içindeki versiyonu güncelleyin.
2. Değişiklikleri test edin ve doğrulamak için `npm run release:prepare` ve `npm run release:dry-run` komutlarını çalıştırın.
3. `git tag vX.Y.Z` ile yeni bir tag oluşturup `git push origin vX.Y.Z` komutuyla gönderin.
4. Tag push edildiğinde **Release** GitHub Actions iş akışı otomatik olarak test, build, npm publish ve GitHub Release adımlarını yürütür.
5. Manuel tetikleme isterseniz Actions sekmesindeki **Release** iş akışını `workflow_dispatch` ile çalıştırabilir ve istediğiniz etiketi girebilirsiniz.

> ⚠️ NPM'e yayınlamak için depoda `NPM_TOKEN` gizli anahtarının tanımlı olması gerekir; aksi halde iş akışı yalnızca GitHub Release oluşturur.

## 💻 Komut Satırı Kullanımı

### Temel Komutlar
```bash
# Yardım ve bilgi
genara --help              # Yardım mesajı
genara --version           # Versiyon bilgisi

# Hızlı üretim
genara tckn               # TCKN üret
genara vkn 5              # 5 adet VKN üret
genara iban               # IBAN üret

# Doğrulama
genara 12345678950            # Otomatik servis tespit
genara -s tckn 12345678950    # Belirli servis ile

# Tamamlama
genara -s tckn -a complete 123456789  # TCKN olarak tamamla
```

### Gelişmiş Özellikler
```bash
# Çoklu üretim
genara creditcard -c 3          # 3 kredi kartı
genara isbn --count 10          # 10 ISBN

## 🏗️ Proje Mimarisi

### Dizin Yapısı
```
src/
├── interfaces/              # TypeScript interfaces
│   ├── NumberService.ts     # Ana servis interface'i
│   └── ServiceTypes.ts      # Servis türleri ve takma adları
├── services/               # Servis implementasyonları
│   ├── tckn/              # TCKN servisi
│   ├── vkn/               # VKN servisi
│   ├── iban/              # IBAN servisi
│   ├── creditcard/        # Kredi kartı servisi
│   ├── imei/              # IMEI servisi
│   ├── isbn/              # ISBN servisi
│   └── ean/               # EAN/UPC servisi
├── factory/               # Factory pattern
│   └── ServiceFactory.ts
├── cli/                   # Komut satırı arayüzü
│   └── index.ts
└── index.ts               # Ana kütüphane export'u
```

### Tasarım Desenleri
- **Factory Pattern**: Dinamik servis oluşturma
- **Strategy Pattern**: Farklı doğrulama algoritmaları
- **Interface Segregation**: Temiz API tasarımı
- **Single Responsibility**: Her servis tek görevden sorumlu

## 🔧 Geliştirme

### Geliştirme Ortamı Kurulumu
```bash
git clone https://github.com/emreerkan/genara.git
cd genara
npm install
npm run build
```

### Geliştirme Komutları
```bash
npm run dev              # Geliştirme modunda çalıştır
npm run build            # TypeScript derle
npm run clean            # Build dosyalarını temizle
npm test                 # Testleri çalıştır
npm run test:watch       # Test izleme modu
npm run test:coverage    # Coverage raporu
npm run lint             # Tip kontrolü
npm run format           # Kod formatlaması
```

### Yeni Servis Ekleme
1. `src/services/yourservice/` dizini oluştur
2. `NumberService` interface'ini uygula
3. `ServiceTypes.ts`'ye servis tipini ekle
4. `ServiceFactory.ts`'ye servis mapping'i ekle
5. Kapsamlı testler yaz
6. Dokümantasyonu güncelle

Detaylı rehber için [CONTRIBUTING.md](./CONTRIBUTING.md) dosyasına bakın.

## 📊 Performance & Benchmarks

### Test Performansı
- **TCKN Doğrulama**: ~0.001ms per operation
- **Kredi Kartı Üretimi**: ~0.002ms per operation  
- **IBAN Doğrulaması**: ~0.003ms per operation
- **Toplu İşlemler**: 10,000 işlem <100ms

### Bellek Kullanımı
- Minimum heap: ~15MB
- Service instance'ları singleton pattern ile optimize edilmiş
- Zero external dependencies production'da

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için:

1. **Fork** yapın
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Test** yazın ve çalıştırın
4. **Commit** yapın (`git commit -m 'feat: add amazing feature'`)
5. **Push** yapın (`git push origin feature/amazing-feature`)
6. **Pull Request** açın

### Katkıda Bulunma Kuralları
- ✅ Tüm testler geçmeli (%80+ coverage)
- ✅ TypeScript tip güvenliği
- ✅ Conventional commit mesajları
- ✅ Dokümantasyon güncellemeleri
- ✅ Code review süreci

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim & Destek

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/emreerkan/genara/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/emreerkan/genara/discussions)

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldızlamayı unutmayın! ⭐**

Made with ❤️ in Turkey 🇹🇷

</div>
