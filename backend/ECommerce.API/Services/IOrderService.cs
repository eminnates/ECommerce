using ECommerce.API.Common;
using ECommerce.API.Dtos;

namespace ECommerce.API.Services;

public interface IOrderService
{
    Task<Result<OrderDto>> CreateAsync(CreateOrderDto dto);
    Task<PagedResult<OrderDto>> GetAllAsync(int page, int pageSize);
    Task<OrderDto?> GetByIdAsync(int id);
}
