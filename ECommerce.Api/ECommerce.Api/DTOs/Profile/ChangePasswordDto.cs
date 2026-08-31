using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Profile;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "Mevcut şifre zorunludur.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre zorunludur.")]
    [MinLength(
        6,
        ErrorMessage = "Yeni şifre en az 6 karakter olmalıdır.")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre tekrar zorunludur.")]
    [Compare(
        "NewPassword",
        ErrorMessage = "Yeni şifreler eşleşmiyor.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}