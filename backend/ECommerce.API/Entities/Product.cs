namespace ECommerce.API.Entities;

public class Product
{
    public int Id { get; set; }

    // unique StockCode
    public required string StockCode { get; set; }

    public required string Name { get; set; }

    // >= 0
    public decimal Price { get; set; }

    // >= 0
    public int StockQuantity { get; set; }
}
