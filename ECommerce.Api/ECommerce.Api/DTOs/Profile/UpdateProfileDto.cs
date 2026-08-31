using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Profile;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    [StringLength(
        50,
        MinimumLength = 2,
        ErrorMessage = "Ad 2-50 karakter arasında olmalıdır.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad alanı zorunludur.")]
    [StringLength(
        50,
        MinimumLength = 2,
        ErrorMessage = "Soyad 2-50 karakter arasında olmalıdır.")]
    public string LastName { get; set; } = string.Empty;
}