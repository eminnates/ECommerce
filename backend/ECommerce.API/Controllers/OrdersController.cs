using ECommerce.API.Common;
using ECommerce.API.Dtos;
using ECommerce.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        var result = await orderService.CreateAsync(dto);

        if (!result.IsSuccess)
            return Problem(detail: result.Error!.Message, statusCode: ToStatusCode(result.Error.Kind));

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var orders = await orderService.GetAllAsync(page, pageSize);
        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await orderService.GetByIdAsync(id);

        return order is null
            ? Problem(detail: $"Sipariş bulunamadı: {id}", statusCode: StatusCodes.Status404NotFound)
            : Ok(order);
    }

    private static int ToStatusCode(ErrorKind kind) => kind switch
    {
        ErrorKind.Validation => StatusCodes.Status400BadRequest,
        ErrorKind.NotFound => StatusCodes.Status404NotFound,
        ErrorKind.Conflict => StatusCodes.Status409Conflict,
        _ => StatusCodes.Status500InternalServerError
    };
}
