namespace Ecommerce.Application.DTOs;

public record LoginDto(
    string Email,
    string Password
);

public record RegisterDto(
    string FullName,
    string Email,
    string Password,
    string? Street,
    string? City,
    string? PostalCode,
    string? Country
);

public record AuthResponseDto(
    Guid UserId,
    string FullName,
    string Email,
    string Role,
    string Token,
    string? Street,
    string? City,
    string? PostalCode,
    string? Country
);
