using Ecommerce.Application.DTOs;
using Ecommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Inicia sesión con correo y contraseña. Soporta escenarios QA (cuentas activas, contraseñas erróneas y cuentas bloqueadas).
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Intento de login para usuario: {Email}", dto.Email);

        var result = await _authService.LoginAsync(dto, cancellationToken);
        if (!result.IsSuccess)
        {
            _logger.LogWarning("Login fallido para {Email}: {Error}", dto.Email, result.Error);

            if (result.Error != null && result.Error.Contains("bloqueada", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    isSuccess = false,
                    error = result.Error,
                    code = "ACCOUNT_LOCKED"
                });
            }

            return StatusCode(StatusCodes.Status401Unauthorized, new
            {
                isSuccess = false,
                error = result.Error,
                code = "INVALID_CREDENTIALS"
            });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Registra un nuevo usuario cliente en el sistema.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Solicitud de registro para correo: {Email}", dto.Email);

        var result = await _authService.RegisterAsync(dto, cancellationToken);
        if (!result.IsSuccess)
        {
            _logger.LogWarning("Registro fallido para {Email}: {Error}", dto.Email, result.Error);
            return BadRequest(new
            {
                isSuccess = false,
                error = result.Error,
                code = "REGISTRATION_FAILED"
            });
        }

        return StatusCode(StatusCodes.Status201Created, result.Value);
    }
}
