namespace ECommerce.Api.Interfaces;

public interface IEmailService
{
    Task SendVerificationCodeAsync(
        string email,
        string code,
        CancellationToken cancellationToken);
}