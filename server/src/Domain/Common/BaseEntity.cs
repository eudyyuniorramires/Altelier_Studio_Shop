namespace Ecommerce.Domain.Common;

/// <summary>
/// Clase base para todas las entidades del dominio con identificador único y auditoría básica.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
