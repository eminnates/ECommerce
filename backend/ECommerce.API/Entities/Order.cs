namespace ECommerce.API.Entities;

public class Order
{
    public int Id { get; set; }

    public required string CustomerName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // oluşturulurken hesaplanıp yazılır
    public decimal TotalAmount { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
