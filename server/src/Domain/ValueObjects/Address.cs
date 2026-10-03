namespace Ecommerce.Domain.ValueObjects;

/// <summary>
/// Objeto de Valor inmutable para representar direcciones de entrega.
/// </summary>
public record Address
{
    public string Street { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public string Country { get; init; } = "Argentina";

    public Address() { }

    public Address(string street, string city, string postalCode, string country = "Argentina")
    {
        if (string.IsNullOrWhiteSpace(street))
            throw new ArgumentException("La dirección de la calle es obligatoria.", nameof(street));

        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("La ciudad es obligatoria.", nameof(city));

        if (string.IsNullOrWhiteSpace(postalCode))
            throw new ArgumentException("El código postal es obligatorio.", nameof(postalCode));

        Street = street.Trim();
        City = city.Trim();
        PostalCode = postalCode.Trim();
        Country = string.IsNullOrWhiteSpace(country) ? "Argentina" : country.Trim();
    }

    public override string ToString() => $"{Street}, {City} ({PostalCode}), {Country}";
}
