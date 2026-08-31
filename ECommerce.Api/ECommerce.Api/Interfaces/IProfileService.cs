using ECommerce.Api.DTOs.Profile;

namespace ECommerce.Api.Interfaces;

public interface IProfileService
{
    Task<ProfileDto> GetProfileAsync(
        CancellationToken cancellationToken);

    Task<ProfileDto> UpdateProfileAsync(
        UpdateProfileDto dto,
        CancellationToken cancellationToken);

    Task ChangePasswordAsync(
        ChangePasswordDto dto,
        CancellationToken cancellationToken);
}