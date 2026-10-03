using System.Security.Cryptography;
using System.Text;
using Ecommerce.Application.Common;
using Ecommerce.Application.DTOs;
using Ecommerce.Application.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.ValueObjects;

namespace Ecommerce.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return Result<AuthResponseDto>.Failure("El correo electrónico es obligatorio.");

        if (string.IsNullOrWhiteSpace(dto.Password))
            return Result<AuthResponseDto>.Failure("La contraseña es obligatoria.");

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var users = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return Result<AuthResponseDto>.Failure("El correo electrónico no se encuentra registrado.");
        }

        if (user.IsLocked)
        {
            return Result<AuthResponseDto>.Failure($"Tu cuenta se encuentra bloqueada. Motivo: {user.LockReason ?? "Acceso restringido para pruebas QA."}");
        }

        var inputHash = HashPassword(dto.Password);
        if (user.PasswordHash != inputHash)
        {
            return Result<AuthResponseDto>.Failure("La contraseña ingresada es incorrecta.");
        }

        var token = GenerateSimulatedToken(user);

        return Result<AuthResponseDto>.Success(new AuthResponseDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            token,
            user.DefaultAddress?.Street,
            user.DefaultAddress?.City,
            user.DefaultAddress?.PostalCode,
            user.DefaultAddress?.Country
        ));
    }

    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName) || dto.FullName.Trim().Length < 3)
            return Result<AuthResponseDto>.Failure("El nombre completo debe tener al menos 3 caracteres.");

        if (string.IsNullOrWhiteSpace(dto.Email) || !dto.Email.Contains('@') || !dto.Email.Contains('.'))
            return Result<AuthResponseDto>.Failure("El formato del correo electrónico no es válido.");

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return Result<AuthResponseDto>.Failure("La contraseña debe tener al menos 6 caracteres.");

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var existing = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);
        if (existing.Count > 0)
        {
            return Result<AuthResponseDto>.Failure("El correo electrónico ya se encuentra registrado.");
        }

        Address? defaultAddress = null;
        if (!string.IsNullOrWhiteSpace(dto.Street) && !string.IsNullOrWhiteSpace(dto.City) && !string.IsNullOrWhiteSpace(dto.PostalCode))
        {
            defaultAddress = new Address(dto.Street, dto.City, dto.PostalCode, dto.Country ?? "Argentina");
        }

        var newUser = new User
        {
            FullName = dto.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = HashPassword(dto.Password),
            Role = "Customer",
            IsLocked = false,
            DefaultAddress = defaultAddress
        };

        await _unitOfWork.Users.AddAsync(newUser, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = GenerateSimulatedToken(newUser);

        return Result<AuthResponseDto>.Success(new AuthResponseDto(
            newUser.Id,
            newUser.FullName,
            newUser.Email,
            newUser.Role,
            token,
            newUser.DefaultAddress?.Street,
            newUser.DefaultAddress?.City,
            newUser.DefaultAddress?.PostalCode,
            newUser.DefaultAddress?.Country
        ));
    }

    public static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes($"atelier_salt_{password}"));
        return Convert.ToBase64String(bytes);
    }

    private static string GenerateSimulatedToken(User user)
    {
        var raw = $"{user.Id}:{user.Email}:{DateTime.UtcNow.Ticks}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
    }
}
