namespace ECommerce.API.Dtos;

public record OrderItemDto(int Id, int ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal LineTotal);

public record CreateOrderItemDto(int ProductId, int Quantity);
