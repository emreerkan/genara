# Jenerator - A Number Validation & Generation Tool

Modern TypeScript tabanlı Türk kimlik numaraları ve diğer numerik değerler için doğrulama ve üretme aracı.

## Özellikler

- ✅ **TCKN** (TC Kimlik Numarası) - Doğrulama, üretme ve tamamlama
- ✅ **VKN** (Vergi Kimlik Numarası) - Doğrulama, üretme ve tamamlama
- ✅ **IBAN** - Doğrulama, üretme ve tamamlama
- ✅ **Kredi Kartı** - Doğrulama, üretme ve tamamlama (Visa, Mastercard, American Express, Discover, JCB, Diners Club)
- ✅ **IMEI** - Doğrulama, üretme ve tamamlama
- ✅ **ISBN** - Doğrulama, üretme ve tamamlama (ISBN-10 ve ISBN-13 desteği)
- ✅ **EAN/UPC** - Doğrulama, üretme ve tamamlama (EAN-13, EAN-8, UPC-A desteği)

## Kurulum

### NPM'den Global Kurulum (Önerilen)
```bash
npm install -g jenerator
```

### Yerel Geliştirme
```bash
git clone <repo-url>
cd jenerator
npm install
npm run build
npm install -g .
```

## Kullanım

### Komut Satırı Kullanımı

#### Yardım ve Versiyon
```bash
jenerator --help             # Yardım mesajını göster
jenerator -h                 # Yardım mesajı (kısa)
jenerator --version          # Versiyon bilgisini göster
jenerator -v                 # Versiyon bilgisi (kısa)
```

#### Kısa Format (Önerilen)
```bash
# Rastgele üretim
jenerator tckn                          # TCKN üret
jenerator vkn                           # VKN üret

# Çoklu üretim
jenerator tckn 5                        # 5 adet TCKN üret
jenerator vkn 3                         # 3 adet VKN üret
```

#### Akıllı Varsayılan Davranış
```bash
# Otomatik doğrulama (tam uzunluk tespit edilince)
jenerator 12345678950                   # TCKN doğrula (11 haneli)
jenerator 1234567890                    # VKN doğrula (10 haneli)
jenerator -s tckn 12345678950           # Açık servis ile TCKN doğrula

# Otomatik tamamlama (9 haneli prefix tespit edilince)
jenerator -s tckn 123456789             # TCKN tamamla
jenerator -s vkn 123456789              # VKN tamamla
```

#### Açık İşlem Komutları
```bash
# İsteğe bağlı açık format
jenerator -s tckn -a generate           # Açıkça TCKN üret
jenerator -a validate 12345678950       # Açıkça doğrula
jenerator -s tckn -a complete 123456789 # Açıkça tamamla
```

#### Uzun Format
```bash
# Rastgele üretim
jenerator -s tckn                       # TCKN üret
jenerator -s vkn                        # VKN üret

# Çoklu üretim
jenerator -s tckn -c 5                  # 5 adet TCKN üret
jenerator -s vkn -c 3                   # 3 adet VKN üret
```

## Algoritma Detayları

### TCKN Doğrulama Kuralları
- 11 haneli olmalıdır
- Tamamen rakamlardan oluşmalıdır
- İlk rakam 0 olamaz
- Belirli tekrarlayan sayılar geçersizdir (11111111110, 22222222220, vs.)
- Özel matematik formülü ile 10. ve 11. rakamlar doğrulanır

### VKN Doğrulama Kuralları
- 10 haneli olmalıdır
- Tamamen rakamlardan oluşmalıdır
- Özel VKN algoritması ile son rakam doğrulanır

## Özellikler

- ✅ TCKN doğrulama
- ✅ VKN doğrulama  
- ✅ TCKN üretme (prefix ile veya rastgele)
- ✅ VKN üretme (prefix ile veya rastgele)
- ✅ Modern komut satırı arayüzü
- ✅ Ultra kısa format (`jenerator tckn`, `jenerator vkn 5`)
- ✅ Akıllı varsayılan davranış (otomatik işlem tespit)
- ✅ Açık işlem komutları (`--action` / `-a`)
- ✅ Çoklu üretim desteği (`--count` / `-c`)
- ✅ Kısa seçenekler (`-s`, `-c`, `-a`, `-h`, `-v`)
- ✅ TypeScript ile tip güvenliği
- ✅ Factory Pattern mimarisi

## Örnek Kullanımlar

```bash
# Kısa format (en basit)
jenerator tckn                       # TCKN üret
# Çıktı: 12345678950

jenerator vkn 3                      # 3 adet VKN üret
# Çıktı: 
# 1234567895
# 9876543210
# 5555555555

# Akıllı davranış (otomatik tespit)
jenerator 1234567890                 # VKN doğrula (10 haneli tespit)
# Çıktı: 1234567890 ✅

jenerator -s tckn 123456789          # TCKN tamamla (9 haneli prefix tespit)
# Çıktı: 12345678950

# Açık format (tam kontrol)
jenerator -s tckn -a generate        # Açıkça üret
jenerator -a validate 12345678950    # Açıkça doğrula
jenerator -s vkn -a complete 123456789 # Açıkça tamamla
```

## Geliştirici Kullanımı

```bash
# Geliştirme modunda çalıştırma
npm run dev

# TypeScript build
npm run build

# Kod formatı kontrolü
npm run lint

# Kod formatını düzelt
npm run format
```