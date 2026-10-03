using Ecommerce.Application.DTOs;
using Ecommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Crea una nueva orden de compra en estado Pending a partir de los ítems del carrito.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder([FromBody] CreateOrderDto dto, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Recibida solicitud de orden de compra para cliente: {Email}", dto.CustomerEmail);

        var result = await _orderService.CreateOrderAsync(dto, cancellationToken);
        if (!result.IsSuccess)
        {
            return BadRequest(new { error = result.Error });
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Obtiene los detalles de una orden por su identificador GUID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponseDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderByIdAsync(id, cancellationToken);
        if (order == null)
        {
            return NotFound(new { message = $"Orden '{id}' no encontrada." });
        }
        return Ok(order);
    }

    /// <summary>
    /// Obtiene los detalles de una orden por su número de orden legible (ej: ORD-20260928-ABC123).
    /// </summary>
    [HttpGet("by-number/{orderNumber}")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponseDto>> GetByNumber(string orderNumber, CancellationToken cancellationToken)
    {
        var order = await _orderService.GetOrderByNumberAsync(orderNumber, cancellationToken);
        if (order == null)
        {
            return NotFound(new { message = $"Orden '{orderNumber}' no encontrada." });
        }
        return Ok(order);
    }
}
