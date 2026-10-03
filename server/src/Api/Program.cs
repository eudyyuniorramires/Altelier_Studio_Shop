using Ecommerce.Api.Middleware;
using Ecommerce.Application.Interfaces;
using Ecommerce.Application.Services;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Payments;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. Configuración de Base de Datos (PostgreSQL / InMemory Fallback)
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var databaseProvider = builder.Configuration.GetValue<string>("ConnectionStrings:DatabaseProvider") ?? "InMemory";

builder.Services.AddDbContext<EcommerceDbContext>(options =>
{
    if (databaseProvider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase))
    {
        options.UseNpgsql(connectionString, b => b.MigrationsAssembly("Ecommerce.Infrastructure"));
    }
    else
    {
        options.UseInMemoryDatabase("EcommerceCatalogDb");
    }
});

// ==========================================
// 2. Inyección de Dependencias (Clean Architecture)
// ==========================================
// Capa de Infraestructura
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPaymentGatewayService, StripePaymentGatewayService>();

// Capa de Aplicación
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ==========================================
// 3. Controladores y Serialización JSON
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ==========================================
// 4. Documentación OpenAPI / Swagger
// ==========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==========================================
// 5. CORS (Permitir peticiones del cliente Vanilla JS)
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ==========================================
// 6. Inicialización de Base de Datos y Semilla (DbInitializer)
// ==========================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<EcommerceDbContext>();
        
        // Si es PostgreSQL, se asegura de que la BD esté creada; si es InMemory se inicializa en memoria
        if (databaseProvider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase))
        {
            await context.Database.EnsureCreatedAsync();
        }
        
        await DbInitializer.SeedAsync(context, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Ocurrió un error al aplicar migraciones o sembrar la base de datos.");
    }
}

// ==========================================
// 7. Pipeline de Middleware HTTP
// ==========================================
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ATELIER API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");

// Servir archivos estáticos del frontend (cliente) directamente si se accede a la raíz
var potentialPaths = new[]
{
    Path.Combine(builder.Environment.ContentRootPath, "..", "..", "..", "client"),
    Path.Combine(builder.Environment.ContentRootPath, "..", "..", "client"),
    Path.Combine(Directory.GetCurrentDirectory(), "client")
};

var clientPath = potentialPaths.Select(Path.GetFullPath).FirstOrDefault(Directory.Exists);
if (clientPath != null)
{
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new PhysicalFileProvider(clientPath),
        RequestPath = ""
    });
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(clientPath),
        RequestPath = ""
    });
}

app.MapControllers();

app.Run();
