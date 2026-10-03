using Ecommerce.Application.DTOs;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;

namespace Ecommerce.Application.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllProductsAsync(string? category = null, CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Product> products;

        if (!string.IsNullOrWhiteSpace(category))
        {
            products = await _unitOfWork.Products.GetByCategoryAsync(category, cancellationToken);
        }
        else
        {
            products = await _unitOfWork.Products.ListAllAsync(cancellationToken);
        }

        return products.Select(MapToDto).ToList();
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        return product == null ? null : MapToDto(product);
    }

    public async Task<IReadOnlyList<string>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Products.GetCategoriesAsync(cancellationToken);
    }

    private static ProductDto MapToDto(Product p) => new(
        p.Id,
        p.Name,
        p.Description,
        p.Price,
        p.OriginalPrice,
        p.ImageUrl,
        p.Category,
        p.Stock,
        p.IsFeatured,
        p.AvailableSizes,
        p.AvailableColors
    );
}
