using ECommerce.Api.DTOs.User;

namespace ECommerce.Api.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync(
        CancellationToken cancellationToken);

    Task<bool> UpdateRoleAsync(
        int userId,
        UpdateUserRoleDto dto,
        CancellationToken cancellationToken);

    Task<bool> DeleteAsync(
        int userId,
        CancellationToken cancellationToken);
}