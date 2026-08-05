using ECommerce.API.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ECommerce.API.Tests.Infrastructure;

/// <summary>
/// Testler gerçek bir PostgreSQL veritabanına karşı çalışır: OrderService.CreateAsync transaction ve
/// ham SQL (FOR UPDATE) kullandığı için InMemory provider bu akışı çalıştıramaz.
/// Şema, uygulamanın kendi migration'larıyla kurulur; böylece check constraint'ler de testte geçerlidir.
/// </summary>
public class PostgresFixture : IAsyncLifetime
{
    private const string FallbackConnectionString =
        "Host=localhost;Port=5432;Database=ecommerce_test;Username=postgres;Password=1234";

    private static string ConnectionString =>
        Environment.GetEnvironmentVariable("TEST_DB_CONNECTION") ?? FallbackConnectionString;

    public async Task InitializeAsync()
    {
        await using var db = CreateContext();

        await db.Database.EnsureDeletedAsync();
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await using var db = CreateContext();
        await db.Database.EnsureDeletedAsync();
    }

    /// <summary>
    /// Her çağrıda yeni bir context döner. Assert'ler mutlaka taze bir context ile yapılmalı:
    /// aksi halde EF'in change tracker'ı, DB'ye hiç yazılmamış bellek içi değeri okutup testi yanıltabilir.
    /// </summary>
    public AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        return new AppDbContext(options);
    }
}

[CollectionDefinition(Name)]
public class PostgresCollection : ICollectionFixture<PostgresFixture>
{
    public const string Name = "postgres";
}
