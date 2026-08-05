namespace ECommerce.API.Dtos;

public record OrderDto(int Id, string CustomerName, DateTime CreatedAt, decimal TotalAmount, List<OrderItemDto> Items);

public record CreateOrderDto(string CustomerName, List<CreateOrderItemDto> Items);
