# E-Ticaret Sipariş & Stok Uygulaması

Ürün listeleme, arama, sayfalama ve stok kontrollü sipariş oluşturma yapan bir full-stack ECommerce uygulaması.

**Stack:** ASP.NET Core 9 (Web API) · EF Core 9 · PostgreSQL · React 19 + TypeScript + Vite · Tailwind CSS 4

```
React (Vite dev server :5173)
    │  /api/... isteklerini proxy'ler
    ▼
ASP.NET Core Web API (:5100)
    │  Controller → Service → EF Core
    ▼
PostgreSQL
```

| Klasör | İçerik |
|---|---|
| `backend/ECommerce.API` | Web API, servisler, EF Core DbContext, migration'lar |
| `backend/ECommerce.API.Tests` | Sipariş/stok business testleri (xUnit) |
| `frontend` | React + TypeScript arayüz |

---

## Uygulama nasıl çalıştırılır?

**Gereksinimler:** .NET 9 SDK · Node.js 20+ · PostgreSQL 14+

### 1. Veritabanı

Connection string `backend/ECommerce.API/appsettings.Development.json` içinde:

```
Host=localhost;Port=5432;Database=ecommerce;Username=postgres;Password=1234
```

Kendi PostgreSQL kurulumunuz farklıysa bu satırı düzenleyin.
### 2. Backend

```bash
cd backend/ECommerce.API

dotnet tool install --global dotnet-ef

dotnet ef database update

dotnet run
```

API → <http://localhost:5100> · Swagger → <http://localhost:5100/swagger>

> Uygulama açılışta otomatik migration çalıştırmaz; `dotnet ef database update` adımı zorunludur. Örnek ürünler (12 adet) migration'ın seed verisiyle gelir.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Arayüz → <http://localhost:5173>

`.env` dosyası oluşturmanız **gerekmiyor**. Tüm istekler göreli `/api/...` yoluna gider; Vite dev sunucusu bunları backend'e proxy'ler (`vite.config.ts`). Bu sayede tarayıcı açısından same-origin olur ve CORS yapılandırmasına hiç ihtiyaç kalmaz.

### 4. Testler

```bash
cd backend
dotnet test
```

Testler ayrı bir `ecommerce_test` veritabanı oluşturup iş bitince siler; geliştirme veritabanınıza dokunmaz. Farklı bir sunucu için `TEST_DB_CONNECTION` ortam değişkenini kullanabilirsiniz.

---

## API

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/products?search=&page=1&pageSize=10` | Ürün listesi; ada veya stok koduna göre arama |
| `GET` | `/api/products/{id}` | Tek ürün |
| `POST` | `/api/orders` | Sipariş oluşturur (stok kontrollü) |
| `GET` | `/api/orders?page=1&pageSize=10` | Sipariş listesi |
| `GET` | `/api/orders/{id}` | Sipariş detayı |

Tüm hatalar RFC 7807 **ProblemDetails** formatında döner:

| Durum | Kod | Örnek `detail` |
|---|---|---|
| Geçersiz istek | `400` | `Sipariş en az bir kalem içermelidir.` |
| Ürün/sipariş yok | `404` | `Ürün bulunamadı: 9999` |
| **Yetersiz stok** | `409` | `'27 inç Monitör' için yeterli stok yok. İstenen: 9999, mevcut: 25` |

---

## Sorular

### Problemi hangi parçalara ayırdınız?

En temel ayrım **okuma** ile **yazma** arasında: ürün listeleme yan etkisiz ve çok tekrarlanan bir işlem (cache'lenebilir), sipariş oluşturma ise stok düşüren, transaction gerektiren bir işlem burada cache mantığını sadece okuma(read) işlemlerinde eklemem gerekti. Bu ayrım doğrudan koda yansıdı `IProductService` ve `IOrderService` ayrı servisler, cache sistemi yalnızca birincisinde var. Frontend'de de aynı ayrım `features/products` ve `features/orders` klasörleri olarak duruyor.

Sipariş oluşturmanın kendisi de sırayla şu adımlara bölündü: girdi doğrulama → aynı ürünün tekrar eden kalemlerini birleştirme → ürünleri kilitleyerek okuma → stok kontrolü → sipariş yazma ve stok düşürme → cache tazeleme.

### Database modelini neden bu şekilde oluşturdunuz?

Üç tablo: `Product`, `Order`, `OrderItem`.

En önemli karar **`OrderItem.UnitPrice`** alanı. Fiyat, siparişin verildiği andaki değerin kopyası olarak saklanır; ürüne sonradan zam gelse bile geçmiş siparişin tutarı değişmez. Fiyatı `Product` üzerinden join'leyerek okusaydık, geçmiş siparişler zamla birlikte "geriye dönük" değişirdi, tutarlılık açısından kritik bir durum. `Order.TotalAmount` da aynı sebeple hesaplanıp saklanır.

Diğer kararlar:
- `StockCode` üzerinde **unique index** — stok kodu iş dünyasında doğal anahtar, tekrarı hata.
- Para alanlarında `HasPrecision(18,2)` — `float` yerine `decimal`, kuruş kaybı olmasın.
- `OrderItem → Product` ilişkisinde `DeleteBehavior.Restrict` — katalogdan kaldırılan bir ürün, geçmiş siparişleri silmemeli.
- Dört adet **check constraint** (`StockQuantity >= 0`, `Price >= 0`, `Quantity > 0`, `UnitPrice >= 0`). Bunlar uygulama mantığının kopyası değil, son savunma hattı: kodda bir hata olsa bile veritabanı negatif stoğu kabul etmez.

### Kod organizasyonunu neden bu şekilde tercih ettiniz?

Backend: **Controller → Service → `AppDbContext`**.

Repository katmanı **bilerek eklenmedi**. `DbSet<T>` zaten bir repository, `SaveChanges` zaten bir Unit of Work. Bu boyuttaki bir projede üstüne bir katman daha koymak, EF'in `Include`/projection gibi yeteneklerini de sızdırmadan gizleyemediği için net kayıp olurdu.

Servis katmanı HTTP'den habersiz: hata durumunda exception fırlatmak yerine `Result<T>` + `ErrorKind` döner (`Common/Result.cs`). Status code eşlemesi tek bir yerde, `OrdersController.ToStatusCode` içinde yapılır. Böylece business kuralları HTTP'ye bağlanmadan test edilebiliyor.

Frontend: feature-based klasörleme (`features/products`, `features/orders`), paylaşılan parçalar `components/` ve `lib/` altında. Tüm HTTP trafiği tek bir chokepoint'ten geçiyor (`lib/apiClient.ts`) — ProblemDetails ayrıştırma, hata mesajı üretimi ve iptal edilen isteklerin hata sayılmaması tek yerde çözülüyor.

### Sipariş ve stok işlemlerinde veri bütünlüğünü nasıl sağladınız?

Tamamı `Services/OrderService.cs` içindeki `CreateAsync` metodunda:

1. **Tek transaction.** Stok kontrolü, stok düşürme ve sipariş yazma aynı transaction içinde. Herhangi bir adımda hata olursa commit'e hiç gelinmez, `await using` transaction'ı rollback eder.

2. **Pessimistic lock.** Ürünler `SELECT ... FOR UPDATE` ile kilitlenerek okunur. İki kullanıcı aynı anda son ürünü sipariş etmeye çalışırsa, ikincisi birincinin commit'ini bekler ve güncel stoğu görür. Kilit olmasaydı ikisi de "stok var" deyip stoğu eksiye düşürebilirdi (klasik race condition).

3. **Deadlock önleme.** Ürün id'leri sıralanarak kilitlenir. İki sipariş aynı iki ürünü ters sırada kilitlemeye çalışsaydı birbirlerini bekleyip deadlock oluşurdu.

4. **Fiyat ve toplam client'tan alınmaz.** İstek gövdesinde yalnızca `productId` ve `quantity` var. Birim fiyat üründen kopyalanır, toplam sunucuda hesaplanır — client'ın fiyat göndermesi mümkün değil.

5. **Tekrar eden kalemler birleştirilir.** Aynı ürün birden fazla kalemde geldiyse tek satıra toplanır. Aksi halde her kalem stoğa ayrı ayrı bakıp geçer, ama toplamda stok aşılırdı.

6. **Veritabanı constraint'leri.** `StockQuantity >= 0` gibi kısıtlar son savunma hattı olarak durur.
(DDD yapılarını her zaman tercih etmişimdir)

### Cache'i nerede ve neden kullandınız?

Yalnızca ürün **okuma** işlemi sırasında: `ProductService.GetAllAsync` ve `GetByIdAsync`, `IMemoryCache` üzerinden. Ürün listesi çok okunan / az değişen bir veri ve her sayfa yenilemesinde aynı sorgu tekrar ediyor. Sipariş ise **hiçbir zaman** cache'lenmez burada tutarlılık her şeyden önce gelir.

İki ayrıntı önemliydi:

- **Cache'e entity değil DTO yazılır.** Entity'ler scoped `DbContext` tarafından takip ediliyor; takip edilen bir nesneyi singleton cache üzerinden başka bir request'e taşımak hatalı olurdu. DTO'lar immutable `record`, paylaşımı güvenli.
- **Arama terimi normalize edilir** (`trim` + `ToLowerInvariant`) ve key ile sorgu aynı değeri kullanır. Yoksa `" Mouse"` ile `"mouse"` farklı sonuç üretip aynı key'i paylaşabilirdi.

### Stok değiştiğinde cache'i nasıl yönettiniz?

TTL'in dolmasını beklemek yeterli değil — sipariş sonrası kullanıcı stoğu anında güncel görmeli.

`ProductCacheTag` adında bir singleton, bir `CancellationChangeToken` tutuyor. Her ürün cache girdisi bu token'a bağlanıyor (`entry.AddExpirationToken`). Sipariş başarıyla tamamlandığında `Invalidate()` çağrılıyor ve token iptal edilerek **tüm ürün cache girdileri tek hamlede** düşüyor. Sayfa/arama kombinasyonu başına key silmeye çalışmak pratikte imkânsızdı; tag yaklaşımı bunu tek satıra indiriyor.

İki zamanlama detayı:

- **Invalidation commit'ten SONRA yapılır.** Önce yapılsaydı, commit tamamlanana kadar araya giren bir okuma cache'i henüz eski olan veriyle yeniden doldurabilirdi — sonuç, hiç temizlenmemiş olmaktan beterdi.
- **Rollback olan siparişte hiç çağrılmaz**, çünkü o satıra ulaşılmadan dönülür. Boşuna cache temizlenmez.

60 saniyelik TTL ise asıl mekanizma değil; yalnızca uygulama dışından (örneğin veritabanına elle müdahale) gelen değişikliklere karşı emniyet için oluşturulmuş bir yapı.

### Süre nedeniyle tamamlamadığınız veya sadeleştirdiğiniz noktalar nelerdir?

- **Kimlik doğrulama yok.** Müşteri adı arayüzde sorulmuyor, `"Misafir Müşteri"` olarak gönderiliyor. Gerçek bir uygulamada bu alan oturumdan gelirdi.
- **Ürün CRUD endpoint'leri yok.** Katalog yönetimi kapsam dışı bırakıldı; `CreateProductDto`/`UpdateProductDto` tanımları duruyor ama kullanılmıyor. Ürünler migration seed'i ile geliyor.
- **Sipariş iptali/düzenlemesi yok.** Uygulama okuma + oluşturma ile sınırlı. İptal, stoğu geri yükleyen ayrı bir transaction ve sipariş durumu (`Status`) alanı gerektirirdi.
- **`IMemoryCache` tek instance'a bağlı.** Uygulama yatay ölçeklenirse her instance kendi cache'ini tutar ve invalidation diğerlerine ulaşmaz; Redis + pub/sub gerekir.
- **Frontend testi yok.** Sınırlı süre backend'in business kurallarını test etmeye ayrıldı; kritik mantığın tamamı orada. Frontend'de yalnızca `npm run build` içindeki tip kontrolü var.
- **CORS yerine dev proxy.** Backend'de CORS politikası yok; Vite proxy'si yeterli oldu. Frontend ayrı bir origin'den sunulacaksa eklenmeli.
- **Docker yok**, opsiyonel olduğu için atlandı.
- **Yapılandırılmış logging / rate limiting / health check** eklenmedi.

### Hangi AI araçlarını kullandınız?

Testleri yazarken ve Frontend designında **Claude Code**'dan yardım aldım
### AI tarafından üretilen kodları nasıl kontrol ettiniz?

İki şekilde:

**Satır satır okuyarak.** Üretilen her kod gözden geçirildi; anlamadığım veya katılmadığım yerler değiştirildi. Örneğin başlangıçta Yapay Zekanın önerdiği repository katmanı koddaki karmaşıklığı arttıracağından dolayı çıkarıldı. Kodda duran yorumlar da bu okumanın çıktısı; "ne yapıyor" değil, **"neden böyle"** sorusunu cevaplıyorlar (cache invalidation'ın neden commit'ten sonra olduğu, fiyatın neden kopyalandığı gibi).

**Testle sabitleyerek.** Kritik business kuralları için test yazıldı. Daha önemlisi, testlerin gerçekten iş görüp görmediği kontrol edildi: üretim kodundaki stok düşürme satırı ve stok kontrolü **kasten bozulup** testlerin kırmızıya döndüğü görüldü, sonra geri alındı. Geçen bir test, doğru şeyi test ettiğini kendiliğinden kanıtlamıyor.

Ayrıca uygulama sıfırdan bir veritabanıyla ayağa kaldırılıp yetersiz stok (409), geçerli sipariş (201) ve sipariş sonrası stoğun anında güncellenmesi uçtan uca doğrulandı.

### Çalışmaya yaklaşık ne kadar zaman ayırdınız?

Yaklaşık **6 saat** sürdü.

---

## Testler

`backend/ECommerce.API.Tests/OrderServiceStockTests.cs` — iki business senaryosu:

**1. Yetersiz stokta sipariş oluşturulmaz.** Stoğu 5 olan üründen 6 adet istenir. Test yalnızca hata dönmesine bakmaz; **hiçbir yan etki kalmadığını** da doğrular: stok hâlâ 5, ne `Order` ne `OrderItem` yazılmış. Yani transaction'ın gerçekten geri alındığı test edilir.

**2. Sipariş oluşturulduğunda stoklar doğru azaltılır.** İki farklı üründen sipariş verilir (10→7, 4→2). Stokların tam olarak sipariş adedi kadar düştüğü, birim fiyatların üründen kopyalandığı ve toplamın sunucuda doğru hesaplandığı doğrulanır.

Testler gerçek bir PostgreSQL veritabanına karşı çalışır. Sebebi, sipariş akışının transaction ve `SELECT ... FOR UPDATE` kullanması: EF Core'un InMemory provider'ı bunların hiçbirini desteklemiyor. Sahte bir provider'la çalışsalardı, tam da en kritik olan kilitleme ve rollback davranışı test dışında kalırdı.

Doğrulama sırasında her assert **taze bir `DbContext`** ile yapılır — aksi halde EF'in change tracker'ı, veritabanına hiç yazılmamış bellek içi değeri okutup testi yanıltabilirdi.
