using ECommerce.API.Common;
using ECommerce.API.Data;
using ECommerce.API.Dtos;
using ECommerce.API.Entities;
using ECommerce.API.Services;
using ECommerce.API.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ECommerce.API.Tests;

/// <summary>
/// Sipariş oluşturmanın iki kritik business kuralını doğrular:
/// stok yetmiyorsa sipariş oluşmaz, oluşuyorsa stok tam olarak sipariş adedi kadar düşer.
/// </summary>
[Collection(PostgresCollection.Name)]
public class OrderServiceStockTests(PostgresFixture fixture)
{
    [Fact]
    public async Task YetersizStokVarsa_SiparisOlusturulmaz_VeStokDegismez()
    {
        // Arrange: stoğu 5 olan bir ürün var, 6 adet istenecek.
        var product = await SeedProductAsync(stockQuantity: 5, price: 100.00m);
        var customerName = UniqueCustomerName();

        // Act
        var result = await CreateOrderAsync(customerName, (product.Id, 6));

        // Assert: istek reddedilir (controller ErrorKind.Conflict'i 409'a çevirir).
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorKind.Conflict, result.Error!.Kind);
        Assert.Contains("yeterli stok yok", result.Error.Message);

        // Asıl önemli kısım: hiçbir yan etki kalmamalı, transaction rollback olmalı.
        await using var verify = fixture.CreateContext();

        var stockAfter = await verify.Products
            .Where(p => p.Id == product.Id)
            .Select(p => p.StockQuantity)
            .SingleAsync();
        Assert.Equal(5, stockAfter);

        Assert.False(await verify.Orders.AnyAsync(o => o.CustomerName == customerName));
        Assert.False(await verify.OrderItems.AnyAsync(i => i.ProductId == product.Id));
    }

    [Fact]
    public async Task SiparisOlusturuldugunda_Stoklar_DogruAzaltilir()
    {
        // Arrange: iki farklı üründen sipariş verilir.
        var mouse = await SeedProductAsync(stockQuantity: 10, price: 100.00m);
        var kablo = await SeedProductAsync(stockQuantity: 4, price: 25.50m);
        var customerName = UniqueCustomerName();

        // Act
        var result = await CreateOrderAsync(customerName, (mouse.Id, 3), (kablo.Id, 2));

        // Assert
        Assert.True(result.IsSuccess, result.Error?.Message);

        await using var verify = fixture.CreateContext();

        // Stoklar tam olarak sipariş edilen adet kadar düşmüş olmalı: 10-3=7, 4-2=2.
        var stocks = await verify.Products
            .Where(p => p.Id == mouse.Id || p.Id == kablo.Id)
            .ToDictionaryAsync(p => p.Id, p => p.StockQuantity);
        Assert.Equal(7, stocks[mouse.Id]);
        Assert.Equal(2, stocks[kablo.Id]);

        // Sipariş gerçekten kalıcı olmuş ve fiyatlar client'tan değil üründen kopyalanmış olmalı.
        var order = await verify.Orders
            .Include(o => o.Items)
            .SingleAsync(o => o.CustomerName == customerName);

        Assert.Equal(2, order.Items.Count);
        Assert.Equal(100.00m, order.Items.Single(i => i.ProductId == mouse.Id).UnitPrice);
        Assert.Equal(25.50m, order.Items.Single(i => i.ProductId == kablo.Id).UnitPrice);

        // Toplam da sunucuda hesaplanır: 3 * 100.00 + 2 * 25.50
        Assert.Equal(351.00m, order.TotalAmount);
        Assert.Equal(351.00m, result.Value!.TotalAmount);
    }

    private async Task<Result<OrderDto>> CreateOrderAsync(string customerName, params (int ProductId, int Quantity)[] items)
    {
        // Servis, test verisini hazırlayan/doğrulayan context'lerden bağımsız kendi context'iyle çalışır.
        await using var db = fixture.CreateContext();
        var sut = new OrderService(db, new ProductCacheTag());

        var dto = new CreateOrderDto(
            customerName,
            items.Select(i => new CreateOrderItemDto(i.ProductId, i.Quantity)).ToList());

        return await sut.CreateAsync(dto);
    }

    /// <summary>
    /// Her test kendi ürününü oluşturur; böylece testler seed verisine ve birbirlerine bağımlı olmaz.
    /// </summary>
    private async Task<Product> SeedProductAsync(int stockQuantity, decimal price)
    {
        await using var db = fixture.CreateContext();

        var product = new Product
        {
            StockCode = $"TEST-{Guid.NewGuid():N}"[..20],
            Name = $"Test Ürünü {Guid.NewGuid():N}"[..30],
            Price = price,
            StockQuantity = stockQuantity
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        return product;
    }

    private static string UniqueCustomerName() => $"Test Müşteri {Guid.NewGuid():N}";
}
