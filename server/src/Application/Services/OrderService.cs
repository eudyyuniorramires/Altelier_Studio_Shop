using Ecommerce.Application.Common;
using Ecommerce.Application.DTOs;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.ValueObjects;

namespace Ecommerce.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentGatewayService _paymentGateway;

    public OrderService(IUnitOfWork unitOfWork, IPaymentGatewayService paymentGateway)
    {
        _unitOfWork = unitOfWork;
        _paymentGateway = paymentGateway;
    }

    public async Task<Result<OrderResponseDto>> CreateOrderAsync(CreateOrderDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            return Result<OrderResponseDto>.Failure("El pedido no contiene ninguna prenda.");

        if (string.IsNullOrWhiteSpace(dto.CustomerName))
            return Result<OrderResponseDto>.Failure("El nombre del cliente es obligatorio.");

        if (string.IsNullOrWhiteSpace(dto.CustomerEmail) || !dto.CustomerEmail.Contains('@'))
            return Result<OrderResponseDto>.Failure("El correo electrónico del cliente es inválido.");

        Address address;
        try
        {
            address = new Address(dto.Street, dto.City, dto.PostalCode, dto.Country);
        }
        catch (ArgumentException ex)
        {
            return Result<OrderResponseDto>.Failure(ex.Message);
        }

        var order = new Order
        {
            OrderNumber = Order.GenerateOrderNumber(),
            CustomerName = dto.CustomerName.Trim(),
            CustomerEmail = dto.CustomerEmail.Trim().ToLowerInvariant(),
            ShippingAddress = address,
            Status = OrderStatus.Pending
        };

        decimal total = 0;

        foreach (var itemDto in dto.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(itemDto.ProductId, cancellationToken);
            if (product == null)
                return Result<OrderResponseDto>.Failure($"La prenda con ID '{itemDto.ProductId}' no existe.");

            if (!product.HasStock(itemDto.Quantity))
                return Result<OrderResponseDto>.Failure($"Stock insuficiente para '{product.Name}'. Disponible: {product.Stock}");

            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductImageUrl = product.ImageUrl,
                UnitPrice = product.Price, // Precio fijado desde la base de datos (seguridad)
                Quantity = itemDto.Quantity,
                SelectedSize = itemDto.SelectedSize,
                SelectedColor = itemDto.SelectedColor
            };

            order.Items.Add(orderItem);
            total += orderItem.Subtotal;
        }

        order.TotalAmount = total;

        await _unitOfWork.Orders.AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<OrderResponseDto>.Success(MapToResponseDto(order));
    }

    public async Task<OrderResponseDto?> GetOrderByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Orders.GetWithItemsAsync(id, cancellationToken);
        return order == null ? null : MapToResponseDto(order);
    }

    public async Task<OrderResponseDto?> GetOrderByNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Orders.GetByOrderNumberAsync(orderNumber, cancellationToken);
        return order == null ? null : MapToResponseDto(order);
    }

    public async Task<Result<PaymentResultDto>> ProcessPaymentAsync(ProcessPaymentDto dto, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Orders.GetWithItemsAsync(dto.OrderId, cancellationToken);
        if (order == null)
            return Result<PaymentResultDto>.Failure($"Orden '{dto.OrderId}' no encontrada.");

        if (order.Status != OrderStatus.Pending)
            return Result<PaymentResultDto>.Failure($"La orden ya se encuentra en estado '{order.Status}'.");

        // Invocación a la pasarela de pagos (Stripe)
        var gatewayResult = await _paymentGateway.ChargeAsync(
            amount: order.TotalAmount,
            currency: "USD",
            paymentToken: dto.PaymentToken,
            customerEmail: order.CustomerEmail,
            description: $"Pago Orden {order.OrderNumber} - Atelier Studio",
            cancellationToken: cancellationToken
        );

        var payment = new Payment
        {
            OrderId = order.Id,
            TransactionId = gatewayResult.TransactionId,
            Amount = order.TotalAmount,
            Currency = "USD",
            Status = gatewayResult.IsSuccess ? PaymentStatus.Approved : PaymentStatus.Declined,
            CardLast4 = dto.CardLast4,
            ErrorMessage = gatewayResult.ErrorMessage,
            ProcessedAt = DateTime.UtcNow
        };

        await _unitOfWork.Payments.AddAsync(payment, cancellationToken);

        if (gatewayResult.IsSuccess)
        {
            // Transición a Pagada
            order.MarkAsPaid(payment.Id);

            // Reducción efectiva de stock
            foreach (var item in order.Items)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
                if (product != null)
                {
                    product.ReduceStock(item.Quantity);
                    await _unitOfWork.Products.UpdateAsync(product, cancellationToken);
                }
            }

            await _unitOfWork.Orders.UpdateAsync(order, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<PaymentResultDto>.Success(gatewayResult);
        }
        else
        {
            // Tarjeta declinada o error de pasarela: se registra el pago fallido sin cambiar la orden a Pagada
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<PaymentResultDto>.Failure(gatewayResult.ErrorMessage ?? "El pago fue declinado por el emisor.");
        }
    }

    private static OrderResponseDto MapToResponseDto(Order order) => new(
        order.Id,
        order.OrderNumber,
        order.CustomerName,
        order.CustomerEmail,
        order.ShippingAddress.ToString(),
        order.Status.ToString(),
        order.TotalAmount,
        order.CreatedAt,
        order.Items.Select(i => new OrderItemResponseDto(
            i.Id,
            i.ProductId,
            i.ProductName,
            i.ProductImageUrl,
            i.UnitPrice,
            i.Quantity,
            i.SelectedSize,
            i.SelectedColor,
            i.Subtotal
        )).ToList()
    );
}
