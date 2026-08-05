namespace ECommerce.API.Dtos;

public record ProductDto(int Id, string StockCode, string Name, decimal Price, int StockQuantity);

public record CreateProductDto(string StockCode, string Name, decimal Price, int StockQuantity);

public record UpdateProductDto(string Name, decimal Price, int StockQuantity);
