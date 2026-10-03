namespace Ecommerce.Application.DTOs;

public record ProcessPaymentDto(
    Guid OrderId,
    string PaymentToken, // Token seguro generado por Stripe SDK en frontend (o mock token para test)
    string CardLast4
);

public record PaymentResultDto(
    bool IsSuccess,
    string TransactionId,
    string Status,
    string? ErrorMessage,
    string? DeclineCode
);
