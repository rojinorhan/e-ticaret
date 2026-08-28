using ECommerce.Api.Data;
using ECommerce.Api.DTOs.User;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.Id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> UpdateRoleAsync(
        int userId,
        UpdateUserRoleDto dto,
        CancellationToken cancellationToken)
    {
        if (dto.Role != "User" && dto.Role != "Admin")
        {
            throw new ArgumentException(
                "Rol sadece User veya Admin olabilir.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Id == userId,
                cancellationToken);

        if (user is null)
        {
            return false;
        }

        user.Role = dto.Role;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Id == userId,
                cancellationToken);

        if (user is null)
        {
            return false;
        }

        _context.Users.Remove(user);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}