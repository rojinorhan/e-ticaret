using ECommerce.Api.DTOs.User;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/Admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUserController : ControllerBase
{
    private readonly IUserService _userService;

    public AdminUserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var users = await _userService.GetAllAsync(
            cancellationToken);

        return Ok(users);
    }

    [HttpPut("{id:int}/role")]
    public async Task<IActionResult> UpdateRole(
        int id,
        UpdateUserRoleDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _userService.UpdateRoleAsync(
            id,
            dto,
            cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        await _userService.DeleteAsync(
            id,
            cancellationToken);

        return NoContent();
    }
}