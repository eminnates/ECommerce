using ECommerce.API.Dtos;

namespace ECommerce.API.Services;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllAsync(string? search, int page, int pageSize);
    Task<ProductDto?> GetByIdAsync(int id);
}
