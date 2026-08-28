using System.Security.Claims;
using ECommerce.Api.Interfaces;

namespace ECommerce.Api.Services;

public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor
                .HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException(
                    "Kullanýcý kimliði bulunamadý.");
            }

            return userId;
        }
    }

    public string? Role =>
        _httpContextAccessor
            .HttpContext?
            .User
            .FindFirstValue(ClaimTypes.Role);
}
