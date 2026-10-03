using System.Security.Cryptography;
using System.Text;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(EcommerceDbContext context, ILogger logger)
    {
        try
        {
            await SeedProductsAsync(context, logger);
            await SeedUsersAsync(context, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al inicializar la base de datos con datos de prueba.");
            throw;
        }
    }

    private static async Task SeedProductsAsync(EcommerceDbContext context, ILogger logger)
    {
        if (await context.Products.AnyAsync())
        {
            logger.LogInformation("La base de datos ya contiene productos en catálogo. Omitiendo seed de productos.");
            return;
        }

        logger.LogInformation("Sembrando catálogo inicial de ropa exclusiva...");

        var products = new List<Product>
        {
            new()
            {
                Name = "Blazer Oversize Lana Merino",
                Description = "Confeccionado en fina lana merino italiana con corte sastre contemporáneo, hombros estructurados y forro interno satinado.",
                Price = 185.00m,
                OriginalPrice = 220.00m,
                ImageUrl = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
                Category = "Camperas",
                Stock = 18,
                IsFeatured = true,
                AvailableSizes = new() { "S", "M", "L" },
                AvailableColors = new() { "#111827", "#c5a880" }
            },
            new()
            {
                Name = "Trench Coat Clásico Gabardina",
                Description = "Impermeable clásico con doble abotonadura, solapas anchas y cinturón a juego. Un infaltable de media estación.",
                Price = 240.00m,
                OriginalPrice = null,
                ImageUrl = "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop",
                Category = "Camperas",
                Stock = 12,
                IsFeatured = true,
                AvailableSizes = new() { "XS", "S", "M", "L" },
                AvailableColors = new() { "#d4b996", "#111827" }
            },
            new()
            {
                Name = "Remera Cuello Caja Algodón Pima",
                Description = "Básico de lujo tejido en 100% algodón Pima peruano de fibra extra larga. Tacto ultra suave y caída perfecta.",
                Price = 45.00m,
                OriginalPrice = 55.00m,
                ImageUrl = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
                Category = "Remeras",
                Stock = 45,
                IsFeatured = false,
                AvailableSizes = new() { "XS", "S", "M", "L", "XL" },
                AvailableColors = new() { "#ffffff", "#111827", "#9ca3af" }
            },
            new()
            {
                Name = "Remera Oversize Washed Heavyweight",
                Description = "Algodón peinado pesado de 280 GSM con proceso de lavado ácido y textura vintage minimalista.",
                Price = 52.00m,
                OriginalPrice = null,
                ImageUrl = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
                Category = "Remeras",
                Stock = 30,
                IsFeatured = true,
                AvailableSizes = new() { "S", "M", "L", "XL" },
                AvailableColors = new() { "#374151", "#4b5563" }
            },
            new()
            {
                Name = "Pantalón Wide Leg Sastrería",
                Description = "Pantalón de tiro alto con pinzas frontales pronunciadas y caída fluida. Elegancia sin esfuerzo para el día o la noche.",
                Price = 110.00m,
                OriginalPrice = 135.00m,
                ImageUrl = "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
                Category = "Pantalones",
                Stock = 22,
                IsFeatured = true,
                AvailableSizes = new() { "XS", "S", "M", "L" },
                AvailableColors = new() { "#111827", "#e5e7eb", "#78716c" }
            },
            new()
            {
                Name = "Pantalón Denim Straight Raw Indigo",
                Description = "Denim rígido japonés de orillo selvedge con lavado índigo profundo y costuras cobrizas en contraste.",
                Price = 130.00m,
                OriginalPrice = null,
                ImageUrl = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop",
                Category = "Pantalones",
                Stock = 15,
                IsFeatured = false,
                AvailableSizes = new() { "S", "M", "L", "XL" },
                AvailableColors = new() { "#1e3a8a" }
            },
            new()
            {
                Name = "Vestido Midi Slip en Satén de Seda",
                Description = "Vestido cortado al bies que esculpe la figura, escote recto sutil y breteles finos ajustables.",
                Price = 160.00m,
                OriginalPrice = 195.00m,
                ImageUrl = "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
                Category = "Vestidos",
                Stock = 14,
                IsFeatured = true,
                AvailableSizes = new() { "XS", "S", "M" },
                AvailableColors = new() { "#111827", "#059669", "#b91c1c" }
            },
            new()
            {
                Name = "Vestido Camisero Lino Orgánico",
                Description = "Confeccionado en puro lino europeo transpirable con botones de nácar natural y lazo a la cintura.",
                Price = 145.00m,
                OriginalPrice = null,
                ImageUrl = "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop",
                Category = "Vestidos",
                Stock = 20,
                IsFeatured = false,
                AvailableSizes = new() { "S", "M", "L" },
                AvailableColors = new() { "#f5f5f4", "#d6d3d1" }
            }
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        logger.LogInformation("Catálogo de {Count} prendas sembrado exitosamente.", products.Count);
    }

    private static async Task SeedUsersAsync(EcommerceDbContext context, ILogger logger)
    {
        if (await context.Users.AnyAsync())
        {
            logger.LogInformation("La base de datos ya contiene usuarios. Omitiendo seed de usuarios.");
            return;
        }

        logger.LogInformation("Sembrando usuarios QA predeterminados...");

        var users = new List<User>
        {
            // 1. Usuario estándar válido para pruebas de compra
            new()
            {
                Email = "standard_user@atelier.com",
                FullName = "Sofía Martínez",
                PasswordHash = HashPassword("Secret123!"),
                Role = "Customer",
                IsLocked = false,
                DefaultAddress = new Address("Av. Santa Fe 1234, Piso 3 A", "Buenos Aires", "C1059", "Argentina")
            },
            // 2. Usuario VIP válido
            new()
            {
                Email = "vip_user@atelier.com",
                FullName = "Valentina Rossi",
                PasswordHash = HashPassword("Secret123!"),
                Role = "Customer",
                IsLocked = false,
                DefaultAddress = new Address("Av. Alvear 1890, Penthouse", "Buenos Aires", "C1129", "Argentina")
            },
            // 3. Usuario administrador
            new()
            {
                Email = "admin_user@atelier.com",
                FullName = "Lucas Administrador",
                PasswordHash = HashPassword("AdminPass123!"),
                Role = "Admin",
                IsLocked = false,
                DefaultAddress = new Address("Reconquista 600", "Buenos Aires", "C1003", "Argentina")
            },
            // 4. Usuario bloqueado (para pruebas negativas)
            new()
            {
                Email = "locked_user@atelier.com",
                FullName = "Usuario Bloqueado",
                PasswordHash = HashPassword("Secret123!"),
                Role = "Customer",
                IsLocked = true,
                LockReason = "Cuenta bloqueada por seguridad para pruebas QA tras múltiples intentos fallidos."
            }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        logger.LogInformation("Usuarios QA ({Count}) sembrados exitosamente.", users.Count);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes($"atelier_salt_{password}"));
        return Convert.ToBase64String(bytes);
    }
}
