using ECommerce.Api.DTOs.Profile;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(
        IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile(
        CancellationToken cancellationToken)
    {
        var profile =
            await _profileService.GetProfileAsync(
                cancellationToken);

        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        UpdateProfileDto dto,
        CancellationToken cancellationToken)
    {
        var profile =
            await _profileService.UpdateProfileAsync(
                dto,
                cancellationToken);

        return Ok(profile);
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordDto dto,
        CancellationToken cancellationToken)
    {
        await _profileService.ChangePasswordAsync(
            dto,
            cancellationToken);

        return Ok(new
        {
            message = "Şifreniz başarıyla değiştirildi."
        });
    }
}