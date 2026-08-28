using System.Net;
using System.Net.Mail;
using ECommerce.Api.Interfaces;

namespace ECommerce.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendVerificationCodeAsync(
        string email,
        string code,
        CancellationToken cancellationToken)
    {
        var smtpSettings = _configuration.GetSection("Smtp");

        var host = smtpSettings["Host"]
                   ?? throw new InvalidOperationException(
                       "SMTP Host bulunamadı.");

        var port = int.Parse(
            smtpSettings["Port"] ?? "587");

        var username = smtpSettings["Username"]
                       ?? throw new InvalidOperationException(
                           "SMTP Username bulunamadı.");

        var password = smtpSettings["Password"]
                       ?? throw new InvalidOperationException(
                           "SMTP Password bulunamadı.");

        var from = smtpSettings["From"]
                   ?? username;

        using var message = new MailMessage();

        message.From = new MailAddress(from);
        message.To.Add(email);
        message.Subject = "ECommerce doğrulama kodunuz";

        message.Body = $"""
                        Merhaba,

                        Doğrulama kodunuz:

                        {code}

                        Bu kod 5 dakika boyunca geçerlidir.

                        Eğer bu işlemi siz yapmadıysanız bu e-postayı dikkate almayınız.
                        """;

        using var smtpClient = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(
                username,
                password),

            EnableSsl = true
        };

        cancellationToken.ThrowIfCancellationRequested();

        await smtpClient.SendMailAsync(message);
    }
}