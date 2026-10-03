namespace Ecommerce.Application.Common;

public class AppException : Exception
{
    public AppException(string message) : base(message) { }
}

public class NotFoundException : AppException
{
    public NotFoundException(string entityName, object key)
        : base($"Entidad '{entityName}' con clave '{key}' no fue encontrada.") { }
}

public class ValidationException : AppException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(string message) : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("Se produjeron uno o más errores de validación.")
    {
        Errors = errors;
    }
}

public class PaymentFailedException : AppException
{
    public string DeclineCode { get; }

    public PaymentFailedException(string message, string declineCode = "card_declined")
        : base(message)
    {
        DeclineCode = declineCode;
    }
}
