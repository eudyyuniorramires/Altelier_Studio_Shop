namespace Ecommerce.Application.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    decimal? OriginalPrice,
    string ImageUrl,
    string Category,
    int Stock,
    bool IsFeatured,
    List<string> AvailableSizes,
    List<string> AvailableColors
);
