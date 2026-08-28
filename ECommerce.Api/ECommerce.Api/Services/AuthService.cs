using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Auth;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.Api.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthService(
        ApplicationDbContext context,
        IConfiguration configuration,
        IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<string> RegisterAsync(
        RegisterDto dto,
        CancellationToken cancellationToken)
    {
        var emailExists = await _context.Users
            .AnyAsync(
                u => u.Email == dto.Email,
                cancellationToken);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "Bu email adresi zaten kayıtlı.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(
            dto.Password);

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = passwordHash,
            Role = "User"
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync(
            cancellationToken);

        var code = Random.Shared.Next(
            100000,
            1000000).ToString();

        var verificationCode = new EmailVerificationCode
        {
            UserId = user.Id,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            IsUsed = false
        };

        _context.EmailVerificationCodes.Add(
            verificationCode);

        await _context.SaveChangesAsync(
            cancellationToken);

        await _emailService.SendVerificationCodeAsync(
            user.Email,
            code,
            cancellationToken);

        return "Kayıt başarılı. Email adresinize doğrulama kodu gönderildi.";
    }

    public async Task<string> LoginAsync(
        LoginDto dto,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Email == dto.Email,
                cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Email veya şifre hatalı.");
        }
        
        var passwordValid = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash);

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException(
                "Email veya şifre hatalı.");
        }

        var code = Random.Shared.Next(
            100000,
            1000000).ToString();

        var verificationCode = new EmailVerificationCode
        {
            UserId = user.Id,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            IsUsed = false
        };

        _context.EmailVerificationCodes.Add(
            verificationCode);

        await _context.SaveChangesAsync(
            cancellationToken);

        await _emailService.SendVerificationCodeAsync(
            user.Email,
            code,
            cancellationToken);

        return "Giriş doğrulama kodu email adresinize gönderildi.";
    }

    public async Task<string> VerifyEmailCodeAsync(
        VerifyEmailCodeDto dto,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Email == dto.Email,
                cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Geçersiz doğrulama kodu.");
        }

        var verificationCode = await _context.EmailVerificationCodes
            .Where(x =>
                x.UserId == user.Id &&
                x.Code == dto.Code &&
                !x.IsUsed)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(
                cancellationToken);

        if (verificationCode is null)
        {
            throw new UnauthorizedAccessException(
                "Geçersiz doğrulama kodu.");
        }

        if (verificationCode.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException(
                "Doğrulama kodunun süresi dolmuş.");
        }

        verificationCode.IsUsed = true;
        user.IsEmailVerified = true;

        await _context.SaveChangesAsync(
            cancellationToken);

        return GenerateToken(user);
    }

    
    public async Task<string> ForgotPasswordAsync(
    ForgotPasswordDto dto,
    CancellationToken cancellationToken)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(
            u => u.Email == dto.Email,
            cancellationToken);

    if (user is null)
    {
        throw new UnauthorizedAccessException(
            "Bu email adresi kayıtlı değil.");
    }

    var code = Random.Shared.Next(
        100000,
        1000000).ToString();

    var verificationCode = new EmailVerificationCode
    {
        UserId = user.Id,
        Code = code,
        ExpiresAt = DateTime.UtcNow.AddMinutes(5),
        IsUsed = false
    };

    _context.EmailVerificationCodes.Add(
        verificationCode);

    await _context.SaveChangesAsync(
        cancellationToken);

    await _emailService.SendVerificationCodeAsync(
        user.Email,
        code,
        cancellationToken);

    return "Şifre sıfırlama kodu email adresinize gönderildi.";
}

public async Task<string> ResetPasswordAsync(
    ResetPasswordDto dto,
    CancellationToken cancellationToken)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(
            u => u.Email == dto.Email,
            cancellationToken);

    if (user is null)
    {
        throw new UnauthorizedAccessException(
            "Geçersiz doğrulama kodu.");
    }

    var verificationCode = await _context.EmailVerificationCodes
        .Where(x =>
            x.UserId == user.Id &&
            x.Code == dto.Code &&
            !x.IsUsed)
        .OrderByDescending(x => x.CreatedAt)
        .FirstOrDefaultAsync(
            cancellationToken);

    if (verificationCode is null)
    {
        throw new UnauthorizedAccessException(
            "Geçersiz doğrulama kodu.");
    }

    if (verificationCode.ExpiresAt < DateTime.UtcNow)
    {
        throw new UnauthorizedAccessException(
            "Doğrulama kodunun süresi dolmuş.");
    }

    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(
        dto.NewPassword);

    verificationCode.IsUsed = true;

    await _context.SaveChangesAsync(
        cancellationToken);

    return "Şifreniz başarıyla değiştirildi.";
}
    
    private string GenerateToken(User user)
    {
        var jwtSettings = _configuration
            .GetSection("Jwt");

        var key = jwtSettings["Key"]
                  ?? throw new InvalidOperationException(
                      "JWT Key bulunamadı.");

        var issuer = jwtSettings["Issuer"]
                     ?? throw new InvalidOperationException(
                         "JWT Issuer bulunamadı.");

        var audience = jwtSettings["Audience"]
                       ?? throw new InvalidOperationException(
                           "JWT Audience bulunamadı.");

        var expireMinutes = int.Parse(
            jwtSettings["ExpireMinutes"] ?? "60");

        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()),

            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new(
                ClaimTypes.Email,
                user.Email),

            new(
                ClaimTypes.Name,
                $"{user.FirstName} {user.LastName}"),

            new(
                ClaimTypes.Role,
                user.Role)
        };

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                expireMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}