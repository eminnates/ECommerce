using ECommerce.API.Data;
using ECommerce.API.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ECommerce.API.Services;

public class ProductService(AppDbContext db, IMemoryCache cache, ProductCacheTag cacheTag) : IProductService
{
    // Asıl tazelik mekanizması sipariş sonrası explicit invalidation; bu süre yalnızca
    // uygulama dışından (örn. DB'ye elle müdahale) gelen değişiklikler için emniyet supabı.
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(60);

    public async Task<PagedResult<ProductDto>> GetAllAsync(string? search, int page, int pageSize) // Pagination
    {
        // Key ile sorgu aynı değeri kullanmalı; sadece key'i trim'lersek " mouse" ile "mouse"
        // farklı sonuç üretip aynı key'i paylaşır. Küçük harfe indirmek güvenli, ILIKE zaten
        // büyük/küçük harf duyarsız — "Mouse" ve "mouse" aynı sonucu verir, key'i paylaşabilirler.
        var normalizedSearch = search?.Trim() ?? string.Empty;
        var cacheKey = $"products:list:{normalizedSearch.ToLowerInvariant()}:{page}:{pageSize}";

        return (await cache.GetOrCreateAsync(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            entry.AddExpirationToken(cacheTag.Token);
            return QueryAllAsync(normalizedSearch, page, pageSize);
        }))!;
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        return await cache.GetOrCreateAsync($"product:{id}", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            entry.AddExpirationToken(cacheTag.Token);
            return QueryByIdAsync(id);
        });
    }

    // Cache'e entity değil DTO yazılır: entity'ler DbContext tarafından track ediliyor ve
    // DbContext scoped; tracked entity'yi singleton cache üzerinden başka bir request'e
    // taşımak hatalı olurdu. DTO'lar immutable record, paylaşımı güvenli.
    private async Task<PagedResult<ProductDto>> QueryAllAsync(string search, int page, int pageSize)
    {
        var query = db.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{search}%") || EF.Functions.ILike(p.StockCode, $"%{search}%"));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto(p.Id, p.StockCode, p.Name, p.Price, p.StockQuantity))
            .ToListAsync();

        return new PagedResult<ProductDto>(items, page, pageSize, totalCount);
    }

    private async Task<ProductDto?> QueryByIdAsync(int id)
    {
        return await db.Products
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductDto(p.Id, p.StockCode, p.Name, p.Price, p.StockQuantity))
            .FirstOrDefaultAsync();
    }
}
