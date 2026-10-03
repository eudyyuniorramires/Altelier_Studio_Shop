namespace Ecommerce.Application.DTOs;

public record CreateOrderItemDto(
    Guid ProductId,
    int Quantity,
    string SelectedSize,
    string SelectedColor
);

public record CreateOrderDto(
    string CustomerName,
    string CustomerEmail,
    string Street,
    string City,
    string PostalCode,
    string Country,
    List<CreateOrderItemDto> Items
);

public record OrderItemResponseDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductImageUrl,
    decimal UnitPrice,
    int Quantity,
    string SelectedSize,
    string SelectedColor,
    decimal Subtotal
);

public record OrderResponseDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string CustomerEmail,
    string ShippingAddress,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    List<OrderItemResponseDto> Items
);
