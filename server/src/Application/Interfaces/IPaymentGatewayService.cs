using Ecommerce.Application.DTOs;

namespace Ecommerce.Application.Interfaces;

public interface IPaymentGatewayService
{
    Task<PaymentResultDto> ChargeAsync(
        decimal amount,
        string currency,
        string paymentToken,
        string customerEmail,
        string description,
        CancellationToken cancellationToken = default
    );
}
