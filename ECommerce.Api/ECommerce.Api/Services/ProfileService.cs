using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Profile;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class ProfileService : IProfileService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContext _userContext;

    public ProfileService(
        ApplicationDbContext context,
        IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<ProfileDto> GetProfileAsync(
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.Id == userId,
                cancellationToken);

        if (user is null)
        {
            throw new KeyNotFoundException(
                "Kullanıcı bulunamadı.");
        }

        return MapToDto(user);
    }

    public async Task<ProfileDto> UpdateProfileAsync(
        UpdateProfileDto dto,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var user = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Id == userId,
                cancellationToken);

        if (user is null)
        {
            throw new KeyNotFoundException(
                "Kullanıcı bulunamadı.");
        }

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();

        await _context.SaveChangesAsync(
            cancellationToken);

        return MapToDto(user);
    }

    public async Task ChangePasswordAsync(
        ChangePasswordDto dto,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var user = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Id == userId,
                cancellationToken);

        if (user is null)
        {
            throw new KeyNotFoundException(
                "Kullanıcı bulunamadı.");
        }

        var currentPasswordValid =
            BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                user.PasswordHash);

        if (!currentPasswordValid)
        {
            throw new UnauthorizedAccessException(
                "Mevcut şifreniz hatalı.");
        }

        var samePassword =
            BCrypt.Net.BCrypt.Verify(
                dto.NewPassword,
                user.PasswordHash);

        if (samePassword)
        {
            throw new InvalidOperationException(
                "Yeni şifreniz mevcut şifreniz ile aynı olamaz.");
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                dto.NewPassword);

        await _context.SaveChangesAsync(
            cancellationToken);
    }

    private static ProfileDto MapToDto(
        Data.Entities.User user)
    {
        return new ProfileDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }
}