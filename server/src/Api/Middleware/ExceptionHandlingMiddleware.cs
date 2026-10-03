using System.Net;
using System.Text.Json;
using Ecommerce.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Excepción no controlada durante el procesamiento de la petición: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var problemDetails = exception switch
        {
            NotFoundException notFound => new ProblemDetails
            {
                Status = (int)HttpStatusCode.NotFound,
                Title = "Recurso no encontrado",
                Detail = notFound.Message,
                Instance = context.Request.Path
            },
            ValidationException validation => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Error de validación",
                Detail = validation.Message,
                Instance = context.Request.Path,
                Extensions = { ["errors"] = validation.Errors }
            },
            PaymentFailedException paymentFailed => new ProblemDetails
            {
                Status = (int)HttpStatusCode.UnprocessableEntity,
                Title = "Fallo en la transacción de pago",
                Detail = paymentFailed.Message,
                Instance = context.Request.Path,
                Extensions = { ["declineCode"] = paymentFailed.DeclineCode }
            },
            ArgumentException argEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Parámetro inválido",
                Detail = argEx.Message,
                Instance = context.Request.Path
            },
            InvalidOperationException invOpEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Operación no válida",
                Detail = invOpEx.Message,
                Instance = context.Request.Path
            },
            _ => new ProblemDetails
            {
                Status = (int)HttpStatusCode.InternalServerError,
                Title = "Error interno del servidor",
                Detail = "Ha ocurrido un error inesperado al procesar la solicitud.",
                Instance = context.Request.Path
            }
        };

        context.Response.StatusCode = problemDetails.Status ?? (int)HttpStatusCode.InternalServerError;

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
