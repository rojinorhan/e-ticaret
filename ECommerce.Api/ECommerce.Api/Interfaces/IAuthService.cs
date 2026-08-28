using ECommerce.Api.DTOs.Auth;

namespace ECommerce.Api.Interfaces;

public interface IAuthService
{
    Task<string> RegisterAsync(
        RegisterDto dto,
        CancellationToken cancellationToken);

    Task<string> LoginAsync(
        LoginDto dto,
        CancellationToken cancellationToken);

    Task<string> VerifyEmailCodeAsync(
        VerifyEmailCodeDto dto,
        CancellationToken cancellationToken);
    
    
    Task<string> ForgotPasswordAsync(
        ForgotPasswordDto dto,
        CancellationToken cancellationToken);

    Task<string> ResetPasswordAsync(
        ResetPasswordDto dto,
        CancellationToken cancellationToken);
}