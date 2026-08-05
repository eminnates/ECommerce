using ECommerce.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Product>(e =>
        {
            e.HasIndex(p => p.StockCode).IsUnique();
            e.Property(p => p.Price).HasPrecision(18, 2); // Para işlemlerinde detaylı veri burası sayesinde tutulur
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.Property(p => p.StockCode).HasMaxLength(50).IsRequired();
            e.ToTable(t => t.HasCheckConstraint("CK_Product_Price", "\"Price\" >= 0")); // Price is greater than 0 with this constraint
            e.ToTable(t => t.HasCheckConstraint("CK_Product_StockQuantity", "\"StockQuantity\" >= 0")); // Stock is greater than 0 with this constraint
            e.HasData(
                new Product { Id = 1, StockCode = "SKU-001", Name = "Kablosuz Mouse", Price = 249.90m, StockQuantity = 120 },
                new Product { Id = 2, StockCode = "SKU-002", Name = "Mekanik Klavye", Price = 899.50m, StockQuantity = 60 },
                new Product { Id = 3, StockCode = "SKU-003", Name = "27 inç Monitör", Price = 4999.00m, StockQuantity = 25 },
                new Product { Id = 4, StockCode = "SKU-004", Name = "USB-C Hub", Price = 349.00m, StockQuantity = 200 },
                new Product { Id = 5, StockCode = "SKU-005", Name = "Kablosuz Kulaklık", Price = 1299.90m, StockQuantity = 80 },
                new Product { Id = 6, StockCode = "SKU-006", Name = "Laptop Standı", Price = 449.90m, StockQuantity = 140 },
                new Product { Id = 7, StockCode = "SKU-007", Name = "Full HD Webcam", Price = 1149.00m, StockQuantity = 45 },
                new Product { Id = 8, StockCode = "SKU-008", Name = "Geniş Mousepad", Price = 199.50m, StockQuantity = 300 },
                new Product { Id = 9, StockCode = "SKU-009", Name = "Taşınabilir SSD 1TB", Price = 2399.00m, StockQuantity = 35 },
                new Product { Id = 10, StockCode = "SKU-010", Name = "Bluetooth Hoparlör", Price = 1799.90m, StockQuantity = 55 },
                new Product { Id = 11, StockCode = "SKU-011", Name = "Laptop Çantası 15.6\"", Price = 699.00m, StockQuantity = 90 },
                new Product { Id = 12, StockCode = "SKU-012", Name = "Sayısal Tuş Takımı", Price = 549.00m, StockQuantity = 70 }
            );
        });

        mb.Entity<Order>(e =>
        {
            e.Property(o => o.CustomerName).HasMaxLength(200).IsRequired();
            e.Property(o => o.TotalAmount).HasPrecision(18, 2);
        });

        mb.Entity<OrderItem>(e =>
        {
            e.Property(i => i.UnitPrice).HasPrecision(18, 2);
            e.HasOne(i => i.Order)
             .WithMany(o => o.Items)
             .HasForeignKey(i => i.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.Product)
             .WithMany()
             .HasForeignKey(i => i.ProductId)
             .OnDelete(DeleteBehavior.Restrict); // Silinen bir Product'ın geçmişini tutar
            e.ToTable(t => t.HasCheckConstraint("CK_OrderItem_Quantity", "\"Quantity\" > 0")); // OrderItem quantity is greater than 0 with this constraint
            e.ToTable(t => t.HasCheckConstraint("CK_OrderItem_UnitPrice", "\"UnitPrice\" >= 0")); // OrderItem price is greater than 0 with this constraint
        });
    }
}