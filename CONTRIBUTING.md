# Genara'ya Katkıda Bulunma

Genara'ya katkıda bulunma ilginiz için teşekkürler! Bu belge, katkıda bulunmak
isteyenler için yönergeler ve bilgiler sağlar.

## Geliştirme Ortamı Kurulumu

1. **Depoyu klonlayın:**
   ```bash
   git clone https://github.com/emreerkan/genara.git
   cd genara
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Projeyi derleyin:**
   ```bash
   npm run build
   ```

4. **Testleri çalıştırın:**
   ```bash
   npm test
   ```

## Geliştirme İş Akışı

### Değişiklik Yapmadan Önce

1. **Yeni bir branch oluşturun:**
   ```bash
   git checkout -b feature/your-feature-name
   # veya
   git checkout -b fix/your-bug-fix
   ```

2. **Testlerin geçtiğinden emin olun:**
   ```bash
   npm test
   ```

3. **Kod stilini kontrol edin:**
   ```bash
   npm run lint
   ```

### Değişiklik Yapma

1. **Belirlenen kalıpları takip edin:**
- Tüm yeni kod için TypeScript kullanın
- Factory Pattern mimarisini takip edin
- Kullanıcıya yönelik mesajlar için Türkçe dil kullanın
- Kod yorumları ve dokümantasyon için İngilizce kullanın
- Dış bağımlılıkları minimize edin

2. **Servis Yapısı:**
- Servisler `src/services/` altında ayrı klasörlerde olmalı
- Her servis `NumberService` arayüzünü uygulamalı
- `validate`, `generate` ve `complete` metodlarını uygulayın
- Kapsamlı hata yönetimi dahil edin

3. **Test Gereksinimleri:**
- Tüm yeni işlevsellik için birim testleri yazın
- Test kapsamının %100'de kalmasını sağlayın
- Hem pozitif hem de negatif durumları test edin
- Kritik yollar için performans testleri dahil edin

### Test

1. **Tüm testleri çalıştırın:**
   ```bash
   npm test
   ```

2. **Kapsam ile testleri çalıştırın:**
   ```bash
   npm run test:coverage
   ```

3. **İzleme modunda testleri çalıştırın:**
   ```bash
   npm run test:watch
   ```

4. **Belirli test dosyasını çalıştırın:**
   ```bash
   npm test -- tests/YourService.test.ts
   ```

### Kod Kalitesi

1. **Tip kontrolü:**
   ```bash
   npm run type-check
   ```

2. **Linting:**
   ```bash
   npm run lint
   ```

3. **Formatlama:**
   ```bash
   npm run format
   ```

## Proje Yapısı

```
src/
├── interfaces/          # TypeScript arayüzleri
│   ├── NumberService.ts # Ana servis arayüzü
│   └── ServiceTypes.ts  # Servis türleri ve takma adları
├── services/            # Servis uygulamaları
│   ├── tckn/            # Türk Kimlik Numarası
│   ├── vkn/             # Türk Vergi Numarası
│   ├── iban/            # Türk IBAN
│   ├── creditcard/      # Kredi Kartı doğrulaması
│   ├── imei/            # IMEI doğrulaması
│   ├── isbn/            # ISBN doğrulaması
│   └── ean/             # EAN/UPC doğrulaması
├── factory/             # Factory pattern uygulaması
│   └── ServiceFactory.ts
├── cli/                 # Komut satırı arayüzü
│   └── index.ts
└── index.ts             # Ana kütüphane export'u
tests/                   # Test dosyaları
├── ServiceFactory.test.ts
├── TcknService.test.ts
├── VknService.test.ts
├── IbanService.test.ts
├── CreditCardService.test.ts
├── ImeiService.test.ts
├── IsbnService.test.ts
└── EanService.test.ts
```

## Yeni Servis Ekleme

1. **Servis dizinini oluşturun:**
   ```bash
   mkdir src/services/yourservice
   ```

2. **Servisi uygulayın:**
   ```typescript
   // src/services/yourservice/YourService.ts
   import { NumberService } from '../../interfaces/NumberService';

   export class YourService implements NumberService {
     getName(): string {
       return 'Your Service';
     }

     getExpectedLength(): number | [number, number] {
       return 10; // veya [min, max]
     }

     validate(input: string): boolean {
       // Uygulama
     }

     generate(): string {
       // Uygulama
     }

     complete(partial: string): string {
       // Uygulama
     }
   }
   ```

3. **ServiceFactory'ye ekleyin:**
   - `interfaces/ServiceTypes.ts`'deki `ServiceType` enum'unu güncelleyin
   - `SERVICE_ALIASES`'a takma ad ekleyin
   - `ServiceFactory.ts`'yi servisinizi içerecek şekilde güncelleyin

4. **Kapsamlı testler yazın:**
   ```typescript
   // tests/YourService.test.ts
   import { YourService } from '../src/services/yourservice/YourService';

   describe('YourService', () => {
     // Doğrulama, üretim, tamamlama testleri
     // Sınır durumları ve hata yönetimi dahil edin
   });
   ```

5. **Dokümantasyonu güncelleyin:**
   - README'ye servis açıklaması ekleyin
   - Kullanım örnekleri dahil edin
   - API dokümantasyonunu güncelleyin

## Yayın Süreci

Yeni bir sürüm yayımlamak için aşağıdaki adımları izleyin:

1. **Versiyonu güncelleyin:**
   - `package.json` içindeki `version` alanını semantik versiyonlamaya uygun şekilde artırın.
   - Değişiklikleri commit'lerken açıklayıcı bir mesaj kullanın (örn. `chore: bump version to 1.1.0`).

2. **Sürümü doğrulayın:**
   ```bash
   npm run release:prepare     # Temiz kurulum, lint, test ve build
   npm run release:dry-run     # NPM'e gönderilecek paket içeriğini inceleyin
   ```

3. **GitHub üzerinde yayınlayın:**
   - Yeni bir tag oluşturun: `git tag v1.1.0` (versiyona göre güncelleyin).
   - Tag'i uzak depoya gönderin: `git push origin v1.1.0`.
   - Tag push edildiğinde `.github/workflows/release.yml` iş akışı çalışarak test, build, npm publish ve GitHub Release işlemlerini otomatik olarak yürütür.

4. **Gerekirse manuel çalıştırma:**
   - GitHub Actions sekmesinden **Release** iş akışını `workflow_dispatch` ile tetikleyebilir ve `tag` alanına yayımlamak istediğiniz etiketi (örn. `v1.1.0`) girebilirsiniz.

5. **Gizli anahtarlar:**
   - `NPM_TOKEN` gizli anahtarı ayarlanmamışsa iş akışı `npm publish` adımını atlar ancak Github Release oluşturulur.
   - Token'ı [npmjs.com](https://www.npmjs.com/settings) üzerinden oluşturup depo gizli anahtarlarına (`Settings > Secrets and variables > Actions`) ekleyin.

## Commit Mesajları

[Konvansiyonel commit](https://www.conventionalcommits.org/) formatını kullanın:

- `feat:` yeni özellik
- `fix:` hata düzeltmesi
- `docs:` dokümantasyon değişiklikleri
- `style:` formatlama, eksik noktalı virgül vb.
- `refactor:` ne hata düzelten ne de özellik ekleyen kod değişikliği
- `test:` test ekleme veya güncelleme
- `chore:` build görevleri, paket yöneticisi konfigürasyonları vb. güncelleme

Örnekler:
```
feat: kredi kartı servisi eklendi
fix: TCKN doğrulamasında sınır durumu ele alındı
docs: README yeni örneklerle güncellendi
test: kapsamlı ISBN testleri eklendi
```

## Pull Request Süreci

1. **Branch'inizin güncel olduğundan emin olun:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Tam test paketini çalıştırın:**
   ```bash
   npm test
   npm run test:coverage
   npm run lint
   npm run type-check
   ```

3. **Pull request oluşturun:**
   - Sağlanan PR şablonunu kullanın
   - Değişikliklerin açık bir açıklamasını dahil edin
   - İlgili sorunlara referans verin
   - Uygunsa ekran görüntüleri ekleyin

4. **İnceleme geri bildirimlerini ele alın:**
   - İstenen değişiklikleri yapın
   - Gerekirse testleri güncelleyin
   - CI'ın geçtiğinden emin olun

## Sürüm Süreci

GitHub Actions üzerindeki **Release** iş akışı, `v*` ile başlayan tag push edildiğinde (veya manuel olarak tetiklendiğinde) otomatik devreye girer. İş akışı lint, test, build, npm publish ve GitHub Release adımlarını sırasıyla yürütür. Detaylı adımlar için yukarıdaki **Yayın Süreci** bölümüne bakabilirsiniz.

## Davranış Kuralları

- Saygılı ve kapsayıcı olun
- Yapıcı geri bildirim sağlayın
- Başkalarının öğrenmesine ve gelişmesine yardımcı olun
- Belirlenen kodlama standartlarını takip edin
- Açık, sürdürülebilir kod yazın

## Yardım Alma

- Önce mevcut sorunları ve dokümantasyonu kontrol edin
- Uygun şablonla yeni bir sorun oluşturun
- Mevcut sorunlardaki tartışmalara katılın
- Pull request incelemelerinde sorular sorun

## Takdir

Katkıda bulunanlar şu yerlerde kabul edilecektir:
- README.md katkıda bulunanlar bölümü
- Sürüm notları
- Package.json katkıda bulunanlar alanı

Genara'ya katkıda bulunduğunuz için teşekkürler!
