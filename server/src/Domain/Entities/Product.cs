using Ecommerce.Domain.Common;

namespace Ecommerce.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Stock { get; set; }
    public bool IsFeatured { get; set; }
    
    // Tallas disponibles (ej. ["XS", "S", "M", "L", "XL"])
    public List<string> AvailableSizes { get; set; } = new();
    
    // Colores disponibles en formato hex o nombre (ej. ["#111827", "#f3f4f6", "#c5a880"])
    public List<string> AvailableColors { get; set; } = new();

    public bool HasStock(int quantity = 1) => Stock >= quantity;

    public void ReduceStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("La cantidad debe ser mayor a 0.", nameof(quantity));

        if (!HasStock(quantity))
            throw new InvalidOperationException($"Stock insuficiente para el producto '{Name}'. Disponible: {Stock}");

        Stock -= quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RestoreStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("La cantidad debe ser mayor a 0.", nameof(quantity));

        Stock += quantity;
        UpdatedAt = DateTime.UtcNow;
    }
}
