
using ECommerce.Api.DTOs.Auth;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(
            dto,
            cancellationToken);

        return Ok(new
        {
            message = result
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginDto dto,
        CancellationToken cancellationToken)
    {
        var message = await _authService.LoginAsync(
            dto,
            cancellationToken);

        return Ok(new
        {
            message
        });
    }
    
    [HttpPost("verify")]
    public async Task<IActionResult> Verify(
        VerifyEmailCodeDto dto,
        CancellationToken cancellationToken)
    {
        var token = await _authService.VerifyEmailCodeAsync(
            dto,
            cancellationToken);

        return Ok(new
        {
            token
        });
    }
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordDto dto,
        CancellationToken cancellationToken)
    {
        var message = await _authService.ForgotPasswordAsync(
            dto,
            cancellationToken);

        return Ok(new
        {
            message
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordDto dto,
        CancellationToken cancellationToken)
    {
        var message = await _authService.ResetPasswordAsync(
            dto,
            cancellationToken);

        return Ok(new
        {
            message
        });
    }
}
