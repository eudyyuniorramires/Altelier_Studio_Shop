using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.ValueObjects;

namespace Ecommerce.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public Address ShippingAddress { get; set; } = new();
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }
    public Guid? PaymentId { get; set; }

    public List<OrderItem> Items { get; set; } = new();
    public Payment? Payment { get; set; }

    public static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpperInvariant()}";
    }

    public void MarkAsPaid(Guid paymentId)
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException($"No se puede pagar una orden en estado {Status}.");

        Status = OrderStatus.Paid;
        PaymentId = paymentId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsCancelled()
    {
        Status = OrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }
}
