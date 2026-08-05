using Microsoft.Extensions.Primitives;

namespace ECommerce.API.Services;

/// <summary>
/// Tüm ürün cache girişlerine bağlanan ortak iptal token'ı.
///
/// IMemoryCache "şu prefix ile başlayan key'leri sil" desteklemiyor; ürün listesi ise
/// search/page/pageSize kombinasyonu kadar ayrı key üretiyor. Bu yüzden her giriş ortak
/// bir token'a bağlanır, stok değiştiğinde Invalidate() ile hepsi tek seferde düşer.
/// </summary>
public class ProductCacheTag
{
    private CancellationTokenSource _cts = new();

    public IChangeToken Token => new CancellationChangeToken(_cts.Token);

    public void Invalidate()
    {
        // Önce yenisiyle değiştir, sonra eskisini iptal et: bu sıra sayesinde
        // iptal anından sonra oluşturulan girişler zaten yeni token'a bağlanır.
        var previous = Interlocked.Exchange(ref _cts, new CancellationTokenSource());
        previous.Cancel();

        // Dispose edilmiyor: token'ı okumuş ama callback'ini henüz kaydetmemiş eşzamanlı
        // bir cache yazımı ObjectDisposedException alabilirdi. CancelAfter kullanmadığımız
        // için iptal edilmiş CancellationTokenSource'un tutunduğu bir kaynak yok, GC topluyor.
    }
}
