using Ecommerce.Domain.Entities;

namespace Ecommerce.Domain.Interfaces;

/// <summary>
/// Contrato de Unit of Work para coordinar transacciones atómicas.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    IOrderRepository Orders { get; }
    IRepository<Payment> Payments { get; }
    IRepository<User> Users { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
