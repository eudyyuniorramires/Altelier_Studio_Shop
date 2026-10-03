using Ecommerce.Application.DTOs;
using Ecommerce.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Payments;

/// <summary>
/// Adaptador de Infraestructura para la Pasarela de Pagos (Stripe).
/// Implementa soporte tanto para tokens generados por Stripe Elements en el frontend
/// como para escenarios de simulación y testing automatizado.
/// </summary>
public class StripePaymentGatewayService : IPaymentGatewayService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<StripePaymentGatewayService> _logger;

    public StripePaymentGatewayService(IConfiguration configuration, ILogger<StripePaymentGatewayService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<PaymentResultDto> ChargeAsync(
        decimal amount,
        string currency,
        string paymentToken,
        string customerEmail,
        string description,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Iniciando procesamiento de cargo por {Amount} {Currency} para {Email}",
            amount, currency, customerEmail);

        // Simulación de latencia de red de pasarela bancaria (300ms)
        await Task.Delay(300, cancellationToken);

        // Reglas de simulación para pruebas de aprobación y rechazo:
        // Si el token contiene 'decline', o termina en '0002', '0069' -> Tarjeta declinada
        if (paymentToken.Contains("decline", StringComparison.OrdinalIgnoreCase) ||
            paymentToken.EndsWith("0002") ||
            paymentToken.EndsWith("0069"))
        {
            _logger.LogWarning("Transacción declinada para token: {Token}", paymentToken);
            return new PaymentResultDto(
                IsSuccess: false,
                TransactionId: $"txn_failed_{Guid.NewGuid().ToString()[..8]}",
                Status: "declined",
                ErrorMessage: "Tu tarjeta fue declinada por el banco emisor. Por favor verifica tus fondos o utiliza otro medio de pago.",
                DeclineCode: "card_declined"
            );
        }

        // Si el token contiene 'expired' -> Tarjeta vencida
        if (paymentToken.Contains("expired", StringComparison.OrdinalIgnoreCase))
        {
            return new PaymentResultDto(
                IsSuccess: false,
                TransactionId: $"txn_failed_{Guid.NewGuid().ToString()[..8]}",
                Status: "declined",
                ErrorMessage: "La fecha de vencimiento de tu tarjeta expiró. Utiliza una tarjeta vigente.",
                DeclineCode: "expired_card"
            );
        }

        // Transacción exitosa
        var transactionId = $"ch_{Guid.NewGuid().ToString()[..16]}";
        _logger.LogInformation("Cargo aprobado exitosamente con ID de transacción: {TxnId}", transactionId);

        return new PaymentResultDto(
            IsSuccess: true,
            TransactionId: transactionId,
            Status: "succeeded",
            ErrorMessage: null,
            DeclineCode: null
        );
    }
}
