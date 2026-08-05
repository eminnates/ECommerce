using ECommerce.API.Common;
using ECommerce.API.Data;
using ECommerce.API.Dtos;
using ECommerce.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services;

public class OrderService(AppDbContext db, ProductCacheTag productCacheTag) : IOrderService
{
    public async Task<Result<OrderDto>> CreateAsync(CreateOrderDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CustomerName))
            return Result<OrderDto>.Fail(ErrorKind.Validation, "CustomerName zorunludur.");

        if (dto.Items is null || dto.Items.Count == 0)
            return Result<OrderDto>.Fail(ErrorKind.Validation, "Sipariş en az bir kalem içermelidir.");

        if (dto.Items.Any(i => i.Quantity <= 0))
            return Result<OrderDto>.Fail(ErrorKind.Validation, "Kalem adedi 0'dan büyük olmalıdır.");

        // Aynı ürün birden fazla kalemde geldiyse tek satıra indirir
        var requestedQuantities = dto.Items
            .GroupBy(i => i.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));

        var productIds = requestedQuantities.Keys.OrderBy(id => id).ToArray();

        // Stok kontrolü ve sipariş oluşturma tek bir transaction içinde yapılır.
        await using var tx = await db.Database.BeginTransactionAsync();

        // Aynı anda gelen isteklerdeki potansiyel deadlocku önlemek için ürünleri FOR UPDATE ile kilitleriz.
        var products = await db.Products
            .FromSql($"""SELECT * FROM "Products" WHERE "Id" = ANY({productIds}) ORDER BY "Id" FOR UPDATE""")
            .ToListAsync();

        // Olmayan ürünü siparişe eklemeye çalışıyorsa hata döndürür.
        var missingIds = productIds.Except(products.Select(p => p.Id)).ToList();
        if (missingIds.Count > 0)
            return Result<OrderDto>.Fail(ErrorKind.NotFound, $"Ürün bulunamadı: {string.Join(", ", missingIds)}");

        // En sonda stok kontrolü yapılır
        foreach (var product in products)
        {
            var quantity = requestedQuantities[product.Id];
            if (product.StockQuantity < quantity)
                return Result<OrderDto>.Fail(ErrorKind.Conflict,
                    $"'{product.Name}' için yeterli stok yok. İstenen: {quantity}, mevcut: {product.StockQuantity}");
        }

        // Doğrulamalar geçerse sipariş oluşturulur.
        var order = new Order
        {
            CustomerName = dto.CustomerName.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        foreach (var product in products)
        {
            var quantity = requestedQuantities[product.Id];

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = quantity,
                // Fiyat client'tan alınmaz, üründen kopyalanır: sipariş anındaki fiyat burada sabitlenir,
                // ürün sonradan zamlansa da bu siparişin tutarı değişmez.
                UnitPrice = product.Price
            });

            product.StockQuantity -= quantity;
        }

        // Toplam da client'tan gelmez, kopyalanan fiyatlardan hesaplanır.
        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        db.Orders.Add(order);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        // Stoklar değişti, ürün cache'i bayat. Temizlik commit'ten SONRA yapılır: önce yapılsaydı,
        // commit'e kadar araya giren bir okuma cache'i henüz eski olan veriyle doldurabilirdi.
        // Rollback olan siparişte ise buraya hiç gelinmediği için cache boşuna temizlenmez.
        productCacheTag.Invalidate();

        return Result<OrderDto>.Ok((await GetByIdAsync(order.Id))!);
    }

    public async Task<OrderDto?> GetByIdAsync(int id)
    {
        return await ProjectToDto(db.Orders.AsNoTracking().Where(o => o.Id == id))
            .FirstOrDefaultAsync();
    }

    public async Task<PagedResult<OrderDto>> GetAllAsync(int page, int pageSize)
    {
        var query = db.Orders.AsNoTracking();

        var totalCount = await query.CountAsync();

        var items = await ProjectToDto(query
                .OrderByDescending(o => o.Id) // en yeni sipariş başta
                .Skip((page - 1) * pageSize)
                .Take(pageSize))
            .ToListAsync();

        return new PagedResult<OrderDto>(items, page, pageSize, totalCount);
    }

    private static IQueryable<OrderDto> ProjectToDto(IQueryable<Order> query)
    {
        return query.Select(o => new OrderDto(
            o.Id,
            o.CustomerName,
            o.CreatedAt,
            o.TotalAmount,
            // LineTotal entity'de hesaplanan bir property
            o.Items.Select(i => new OrderItemDto(
                i.Id, i.ProductId, i.Product.Name, i.Quantity, i.UnitPrice, i.Quantity * i.UnitPrice)).ToList()));
    }
}
