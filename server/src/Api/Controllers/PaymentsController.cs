using Ecommerce.Application.DTOs;
using Ecommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PaymentsController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IOrderService orderService, ILogger<PaymentsController> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Procesa el cobro seguro de una orden con el token provisto por la pasarela de pagos.
    /// Cambia el estado de la orden de Pending a Paid si es aprobado.
    /// </summary>
    [HttpPost("process")]
    [ProducesResponseType(typeof(PaymentResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PaymentResultDto>> ProcessPayment([FromBody] ProcessPaymentDto dto, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Procesando pago para Orden ID: {OrderId}", dto.OrderId);

        var result = await _orderService.ProcessPaymentAsync(dto, cancellationToken);
        if (!result.IsSuccess)
        {
            _logger.LogWarning("Pago no completado para Orden ID: {OrderId}. Razón: {Error}", dto.OrderId, result.Error);
            return StatusCode(StatusCodes.Status422UnprocessableEntity, new
            {
                isSuccess = false,
                error = result.Error,
                message = "La transacción no pudo completarse. Por favor revisa los datos de tu tarjeta o intenta con otro medio de pago."
            });
        }

        return Ok(result.Value);
    }
}
