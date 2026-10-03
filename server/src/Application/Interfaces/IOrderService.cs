using Ecommerce.Application.Common;
using Ecommerce.Application.DTOs;

namespace Ecommerce.Application.Interfaces;

public interface IOrderService
{
    Task<Result<OrderResponseDto>> CreateOrderAsync(CreateOrderDto dto, CancellationToken cancellationToken = default);
    Task<OrderResponseDto?> GetOrderByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrderResponseDto?> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
    Task<Result<PaymentResultDto>> ProcessPaymentAsync(ProcessPaymentDto dto, CancellationToken cancellationToken = default);
}
