using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.User;

public class UpdateUserRoleDto
{
    [Required(ErrorMessage = "Rol zorunludur.")]
    [RegularExpression(
        "^(User|Admin)$",
        ErrorMessage = "Rol sadece User veya Admin olabilir.")]
    public string Role { get; set; } = string.Empty;
}